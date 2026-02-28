// src/modules/donations/services/donations.service.ts
import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Donation } from '../entities/donation.entity';
import { RecurringDonation } from '../entities/recurring-donation.entity';
import { BaseService } from '../../../shared/services/base.service';
import { PaginationParams, PaginatedResponse } from '../../../shared/interfaces/pagination.interface';
import { ProcessDonationDto } from '../dto/create-donation.dto';
import { PaymentStatus, Currency, PaymentMethod } from '../../../config/constants';
import { DonationStatsDto, RecurringDonationStatsDto } from '../dto/donation-stats.dto';
import { plainToInstance } from 'class-transformer';
import { DonorsService } from './donors.service';
import { CreateRecurringDonationDto, UpdateRecurringDonationDto } from '../dto/create-recurring-donation.dto';

import { DonationProcessingService } from './donation-processing.service';
import { RecurringDonationService } from './recurring-donation.service';
import { DonationStatsService } from './donation-stats.service';
import { DonationReceiptService } from './donation-receipt.service';
import { DonationQueryService } from './donation-query.service';
import { PaypackService } from 'src/shared/services/paypack.service';
import { StripeService } from 'src/shared/services/stripe.service';

@Injectable()
export class DonationsService extends BaseService<Donation> {
    private readonly exchangeRates = {
        [Currency.USD]: { [Currency.RWF]: 1300 },
        [Currency.EUR]: { [Currency.RWF]: 1400 },
        [Currency.RWF]: { [Currency.USD]: 1 / 1300, [Currency.EUR]: 1 / 1400 },
    };

    private readonly logger = new Logger(DonationsService.name);

    constructor(
        @InjectRepository(Donation)
        private donationsRepository: Repository<Donation>,
        @InjectRepository(RecurringDonation)
        private recurringDonationsRepository: Repository<RecurringDonation>,
        @Inject(forwardRef(() => DonorsService))
        private donorsService: DonorsService,

        // Sub-services
        private donationProcessingService: DonationProcessingService,
        private recurringDonationService: RecurringDonationService,
        private donationStatsService: DonationStatsService,
        private donationReceiptService: DonationReceiptService,
        private donationQueryService: DonationQueryService,

        private paypackService: PaypackService,
        private stripeService: StripeService,

    ) {
        super(donationsRepository);
    }

    async processDonation(processDonationDto: ProcessDonationDto, metadata?: any): Promise<Donation> {
        // Validate donor exists
        const donor = await this.donorsService.findOne(processDonationDto.donorId, ['user']);
        if (!donor) {
            throw new NotFoundException('Donor not found');
        }

        // Calculate local amount
        const { localAmount, exchangeRate } = this.calculateLocalAmount(
            processDonationDto.amount,
            processDonationDto.currency
        );

        // Initialize payment details based on payment method
        let initialPaymentDetails: any = { provider: processDonationDto.paymentMethod === PaymentMethod.CARD ? 'stripe' : 'paypack' };
        if (processDonationDto.paymentMethod !== PaymentMethod.CARD && !processDonationDto.phoneNumber) {
            throw new BadRequestException('Phone number is required for mobile money payments');
        }
        if (processDonationDto.paymentMethod !== PaymentMethod.CARD) {
            initialPaymentDetails.phoneNumber = processDonationDto.phoneNumber;
        }

        // Create donation entity
        const donationData: Partial<Donation> = {
            amount: processDonationDto.amount,
            currency: processDonationDto.currency,
            localAmount,
            exchangeRate,
            donationType: processDonationDto.donationType,
            paymentMethod: processDonationDto.paymentMethod,
            paymentStatus: PaymentStatus.PENDING,
            transactionId: this.generateTransactionId(),
            paymentDetails: initialPaymentDetails,
            isAnonymous: processDonationDto.isAnonymous || false,
            donorMessage: processDonationDto.donorMessage,
            metadata: metadata || {
                ipAddress: '127.0.0.1',
                userAgent: 'test-agent',
                paymentGatewayResponse: {},
                taxReceiptEligible: true,
            },
        };

        const donation = this.donationsRepository.create(donationData);
        donation.donor = donor;

        // Set project/program relations
        await this.donationProcessingService.setProjectAndProgramRelations(donation, processDonationDto);

        // Save initial donation
        const savedDonation = await this.donationsRepository.save(donation);

        try {
            // Process payment
            const updatedDonation = await this.donationProcessingService.processDonation(
                donor,
                processDonationDto,
                savedDonation,
                metadata
            );

            // If payment was completed immediately
            if (updatedDonation.paymentStatus === PaymentStatus.COMPLETED) {
                await this.donorsService.updateDonorTotal(donor.id, updatedDonation.amount);
                await this.donationReceiptService.sendReceipt(updatedDonation);
            }

            return plainToInstance(Donation, updatedDonation);

        } catch (error) {
            // Mark donation as failed
            savedDonation.paymentStatus = PaymentStatus.FAILED;
            savedDonation.metadata = { ...savedDonation.metadata, error: error.message };
            await this.donationsRepository.save(savedDonation);

            this.logger.error(`Payment processing failed: ${error.message}`, error.stack);
            throw new BadRequestException(`Payment failed: ${error.message}`);
        }
    }

    async confirmDonation(transactionId: string, paymentDetails: any): Promise<Donation> {
        const donation = await this.donationsRepository.findOne({
            where: { transactionId },
            relations: ['donor', 'donor.user'],
        });

        if (!donation) {
            throw new NotFoundException('Donation not found');
        }

        const updatedDonation = await this.donationProcessingService.confirmDonation(donation, paymentDetails);
        const savedDonation = await this.donationsRepository.save(updatedDonation);

        if (savedDonation.paymentStatus === PaymentStatus.COMPLETED) {
            await this.donorsService.updateDonorTotal(donation.donor.id, donation.amount);
            await this.donationReceiptService.sendReceipt(savedDonation);
        }

        return plainToInstance(Donation, savedDonation);
    }

    async createRecurringDonation(
        donorId: string,
        createRecurringDonationDto: CreateRecurringDonationDto
    ): Promise<RecurringDonation> {
        const donor = await this.donorsService.findOne(donorId, ['user']);
        if (!donor) {
            throw new NotFoundException('Donor not found');
        }

        const savedRecurringDonation = await this.recurringDonationService.createRecurringDonation(
            donor,
            createRecurringDonationDto
        );

        // Update donor's recurring status
        if (!donor.isRecurringDonor) {
            donor.isRecurringDonor = true;
            await this.donorsService['donorsRepository'].save(donor);
        }

        return plainToInstance(RecurringDonation, savedRecurringDonation);
    }

    async processRecurringCharges(): Promise<void> {
        await this.recurringDonationService.processRecurringCharges();
    }

    async cancelRecurringDonation(recurringDonationId: string, reason: string): Promise<RecurringDonation> {
        const recurringDonation = await this.recurringDonationService.findRecurringDonationById(recurringDonationId, ['donor']);
        if (!recurringDonation) {
            throw new NotFoundException('Recurring donation not found');
        }

        const cancelledRecurringDonation = await this.recurringDonationService.cancelRecurringDonation(
            recurringDonation,
            reason
        );

        return plainToInstance(RecurringDonation, cancelledRecurringDonation);
    }

    async updateRecurringDonation(
        recurringDonationId: string,
        updateDto: UpdateRecurringDonationDto
    ): Promise<RecurringDonation> {
        const recurringDonation = await this.recurringDonationService.findRecurringDonationById(recurringDonationId, ['donor']);
        if (!recurringDonation) {
            throw new NotFoundException('Recurring donation not found');
        }

        const updatedRecurringDonation = await this.recurringDonationService.updateRecurringDonation(
            recurringDonation,
            updateDto
        );

        return plainToInstance(RecurringDonation, updatedRecurringDonation);
    }

    async getDonationsByDonor(donorId: string, paginationParams: PaginationParams): Promise<PaginatedResponse<Donation>> {
        return this.donationQueryService.getDonationsByDonor(donorId, paginationParams);
    }

    async getRecurringDonationsByDonor(donorId: string, paginationParams: PaginationParams): Promise<PaginatedResponse<RecurringDonation>> {
        return this.donationQueryService.getRecurringDonationsByDonor(donorId, paginationParams);
    }

    async getDonationsByProgram(programId: string, paginationParams: PaginationParams): Promise<PaginatedResponse<Donation>> {
        return this.donationQueryService.getDonationsByProgram(programId, paginationParams);
    }

    async getDonationsByProject(projectId: string, paginationParams: PaginationParams): Promise<PaginatedResponse<Donation>> {
        return this.donationQueryService.getDonationsByProject(projectId, paginationParams);
    }

    async searchDonations(query: string, paginationParams: PaginationParams): Promise<PaginatedResponse<Donation>> {
        return this.donationQueryService.searchDonations(query, paginationParams);
    }

    async findOne(id: string, relations: string[] = []): Promise<Donation | null> {
        return this.donationQueryService.findOne(id, relations);
    }

    async findRecurringDonationById(id: string, relations: string[] = []): Promise<RecurringDonation | null> {
        return this.recurringDonationService.findRecurringDonationById(id, relations);
    }

    async getDonationStats(): Promise<DonationStatsDto> {
        return this.donationStatsService.getDonationStats();
    }

    async getRecurringDonationStats(): Promise<RecurringDonationStatsDto> {
        return this.donationStatsService.getRecurringDonationStats();
    }

    async findByTransactionId(transactionId: string): Promise<Donation | null> {
        return this.donationsRepository.findOne({
            where: { transactionId },
            relations: ['donor', 'project', 'program']
        });
    }

    async verifyPaymentWithProvider(donation: Donation): Promise<Donation> {
        try {
            if (donation.paymentMethod === PaymentMethod.CARD) {
                // Check with Stripe directly
                const paymentIntent = await this.stripeService.confirmPayment(donation.transactionId);

                if (paymentIntent.status === 'succeeded') {
                    donation.paymentStatus = PaymentStatus.COMPLETED;
                } else if (paymentIntent.status === 'requires_payment_method') {
                    donation.paymentStatus = PaymentStatus.FAILED;
                }

            } else if ([PaymentMethod.MTN_MOBILE_MONEY, PaymentMethod.AIRTEL_MONEY].includes(donation.paymentMethod as any)) {
                // Check with Paypack directly
                try {
                    const verification = await this.paypackService.verifyPayment(donation.transactionId);

                    // The transactions are nested in the response
                    if (verification.transactions && verification.transactions.length > 0) {
                        const transaction = verification.transactions[0];

                        if (transaction.data?.status === 'successful') {
                            donation.paymentStatus = PaymentStatus.COMPLETED;

                            // Update metadata instead of paymentDetails
                            donation.metadata = {
                                ...donation.metadata,
                                paymentGatewayResponse: transaction.data
                            };
                        } else if (transaction.data?.status === 'failed') {
                            donation.paymentStatus = PaymentStatus.FAILED;
                        }
                    }
                } catch (error) {
                    this.logger.error(`Paypack verification error: ${error.message}`);
                }
            }

            // Save updated status
            return await this.donationsRepository.save(donation);

        } catch (error) {
            this.logger.error(`Payment verification failed: ${error.message}`);
            return donation; // Return unchanged
        }
    }

    // Private helper methods (kept in main service as they're utilities)
    private calculateLocalAmount(amount: number, currency: Currency): { localAmount: number; exchangeRate: number } {
        const exchangeRate = this.exchangeRates[currency]?.[Currency.RWF] || 1;
        const localAmount = amount * exchangeRate;
        return {
            localAmount: parseFloat(localAmount.toFixed(2)),
            exchangeRate: parseFloat(exchangeRate.toFixed(4)),
        };
    }

    private generateTransactionId(): string {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 10000);
        const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `TXN-${timestamp}-${random}-${randomStr}`;
    }
}