// src/modules/donations/services/sub-services/recurring-donation.service.ts
import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { RecurringDonation } from '../entities/recurring-donation.entity';
import { Donor } from '../entities/donor.entity';
import { Donation } from '../entities/donation.entity';
import { Project } from '../../programs/entities/project.entity';
import { Program } from '../../programs/entities/program.entity';
import { CreateRecurringDonationDto } from '../dto/create-recurring-donation.dto';
import { PaymentMethod, RecurringStatus, RecurringFrequency, Currency, DonationType, PaymentStatus } from '../../../config/constants';
import { StripeService } from '../../../shared/services/stripe.service';
import { PaypackService } from '../../../shared/services/paypack.service';
import { plainToInstance } from 'class-transformer';
import { DonorsService } from './donors.service';

@Injectable()
export class RecurringDonationService {
    private readonly logger = new Logger(RecurringDonationService.name);
    private readonly exchangeRates = {
        [Currency.USD]: { [Currency.RWF]: 1300 },
        [Currency.EUR]: { [Currency.RWF]: 1400 },
        [Currency.RWF]: { [Currency.USD]: 1 / 1300, [Currency.EUR]: 1 / 1400 },
    };

    constructor(
        @InjectRepository(RecurringDonation)
        private recurringDonationsRepository: Repository<RecurringDonation>,
        @InjectRepository(Donation)
        private donationsRepository: Repository<Donation>,
        @InjectRepository(Project)
        private projectsRepository: Repository<Project>,
        @InjectRepository(Program)
        private programsRepository: Repository<Program>,
        private stripeService: StripeService,
        private paypackService: PaypackService,
        private donorsService: DonorsService,
    ) {}

    async createRecurringDonation(
        donor: Donor,
        dto: CreateRecurringDonationDto
    ): Promise<RecurringDonation> {
        // Process payment method specific setup
        if (dto.paymentMethod === PaymentMethod.CARD) {
            await this.setupStripeSubscription(donor, dto);
        } else if ([PaymentMethod.MTN_MOBILE_MONEY, PaymentMethod.AIRTEL_MONEY].includes(dto.paymentMethod as any)) {
            this.setupMobileMoneyDetails(dto);
        }

        // Create recurring donation data
        const recurringDonationData: Partial<RecurringDonation> = {
            amount: dto.amount,
            currency: dto.currency,
            frequency: dto.frequency,
            paymentMethod: dto.paymentMethod,
            paymentMethodId: dto.paymentMethodId,
            paymentMethodDetails: (dto as any).paymentMethodDetails,
            subscriptionId: dto.subscriptionId,
            phoneNumber: dto.phoneNumber,
            nextChargeDate: this.calculateNextChargeDate(dto.frequency),
            startDate: dto.startDate || new Date(),
            endDate: dto.endDate,
            sendReminders: dto.sendReminders || false,
            status: RecurringStatus.ACTIVE,
        };

        const recurringDonation = this.recurringDonationsRepository.create(recurringDonationData);
        recurringDonation.donor = donor;

        await this.setProjectAndProgramRelations(recurringDonation, dto);

        return await this.recurringDonationsRepository.save(recurringDonation);
    }

    private async setupStripeSubscription(donor: Donor, dto: CreateRecurringDonationDto): Promise<void> {
        try {
            let stripeCustomerId = donor.stripeCustomerId;

            if (!stripeCustomerId) {
                const customer = await this.stripeService.createCustomer({
                    email: donor.user.email,
                    name: donor.user.fullName,
                    metadata: { donorId: donor.id },
                });
                stripeCustomerId = customer.id;
                donor.stripeCustomerId = stripeCustomerId;
                await this.donorsService['donorsRepository'].save(donor);
            }

            const subscription = await this.stripeService.createSubscription({
                customerId: stripeCustomerId,
                amount: Math.round(dto.amount * 100),
                currency: dto.currency,
                interval: this.mapFrequencyToStripeInterval(dto.frequency),
                metadata: { donorId: donor.id },
            });

            dto.subscriptionId = subscription.id;
            (dto as any).paymentMethodDetails = {
                type: 'card' as const,
                last4: dto.cardDetails?.last4,
                brand: dto.cardDetails?.brand,
                expiryMonth: dto.cardDetails?.expiryMonth,
                expiryYear: dto.cardDetails?.expiryYear,
            };
        } catch (error) {
            this.logger.error('Failed to create Stripe subscription:', error);
            throw new BadRequestException(`Failed to create subscription: ${error.message}`);
        }
    }

    private setupMobileMoneyDetails(dto: CreateRecurringDonationDto): void {
        (dto as any).paymentMethodDetails = {
            type: 'mobile_money' as const,
            phoneNumber: dto.phoneNumber!,
            provider: dto.paymentMethod === PaymentMethod.MTN_MOBILE_MONEY ? 'mtn' : 'airtel',
        };
    }

    async processRecurringCharges(): Promise<void> {
        const today = new Date();
        const recurringDonations = await this.recurringDonationsRepository.find({
            where: {
                status: RecurringStatus.ACTIVE,
                nextChargeDate: LessThanOrEqual(today),
            },
            relations: ['donor', 'project', 'program', 'donor.user'],
        });

        this.logger.log(`Processing ${recurringDonations.length} recurring charges`);

        for (const recurringDonation of recurringDonations) {
            try {
                if (recurringDonation.paymentMethodDetails?.type === 'card') {
                    await this.processStripeCharge(recurringDonation);
                } else if (recurringDonation.paymentMethodDetails?.type === 'mobile_money') {
                    await this.processPaypackCharge(recurringDonation);
                }

                await this.updateRecurringDonationAfterCharge(recurringDonation, today);
                this.logger.log(`Successfully processed recurring charge for ${recurringDonation.id}`);
            } catch (error) {
                this.logger.error(`Failed to process recurring charge for ${recurringDonation.id}:`, error);
                throw error;
            }
        }
    }

    private async processStripeCharge(recurringDonation: RecurringDonation): Promise<void> {
        const donation = await this.createDonationFromRecurring(recurringDonation, 'stripe');
        await this.donorsService.updateDonorTotal(recurringDonation.donor.id, recurringDonation.amount);
    }

    private async processPaypackCharge(recurringDonation: RecurringDonation): Promise<void> {
        const phoneNumber = recurringDonation.paymentMethodDetails?.phoneNumber;
        if (!phoneNumber) {
            throw new Error('Phone number not found for mobile money recurring donation');
        }

        const paymentResult = await this.paypackService.initiateMobileMoneyPayment({
            amount: recurringDonation.amount,
            phoneNumber: phoneNumber,
            paymentMethod: recurringDonation.paymentMethodDetails?.provider === 'mtn' 
                ? PaymentMethod.MTN_MOBILE_MONEY 
                : PaymentMethod.AIRTEL_MONEY,
            metadata: { recurringDonationId: recurringDonation.id },
        });

        const donation = await this.createDonationFromRecurring(recurringDonation, 'paypack');
        
        donation.transactionId = paymentResult.transactionId;
        donation.paymentDetails = {
            ...donation.paymentDetails,
            transactionRef: paymentResult.transactionId,
            phoneNumber: phoneNumber,
            provider: 'paypack',
        };
        donation.metadata = {
            ...donation.metadata,
            recurringDonationId: recurringDonation.id,
            paymentGatewayResponse: paymentResult,
        };

        await this.donationsRepository.save(donation);

        if (paymentResult.status === 'successful') {
            await this.donorsService.updateDonorTotal(recurringDonation.donor.id, recurringDonation.amount);
        }
    }

    private async createDonationFromRecurring(
        recurringDonation: RecurringDonation,
        provider: 'stripe' | 'paypack'
    ): Promise<Donation> {
        const exchangeRate = this.exchangeRates[recurringDonation.currency as Currency]?.[Currency.RWF] || 1;
        const localAmount = recurringDonation.amount * exchangeRate;

        const donationData: Partial<Donation> = {
            amount: recurringDonation.amount,
            currency: recurringDonation.currency,
            localAmount: parseFloat(localAmount.toFixed(2)),
            exchangeRate: parseFloat(exchangeRate.toFixed(4)),
            donationType: DonationType.MONTHLY,
            paymentMethod: provider === 'stripe' ? PaymentMethod.CARD : 
                          (recurringDonation.paymentMethodDetails?.provider === 'mtn' 
                            ? PaymentMethod.MTN_MOBILE_MONEY 
                            : PaymentMethod.AIRTEL_MONEY),
            paymentStatus: PaymentStatus.COMPLETED,
            transactionId: this.generateTransactionId(),
            paymentDetails: {
                provider,
                ...recurringDonation.paymentMethodDetails,
            },
            isAnonymous: recurringDonation.donor?.anonymityPreference || false,
            metadata: {
                ipAddress: '127.0.0.1',
                userAgent: 'recurring-charge',
                paymentGatewayResponse: { success: true },
                taxReceiptEligible: true,
                recurringDonationId: recurringDonation.id,
            },
        };

        const donation = this.donationsRepository.create(donationData);
        donation.donor = recurringDonation.donor;
        
        if (recurringDonation.project) donation.project = recurringDonation.project;
        if (recurringDonation.program) donation.program = recurringDonation.program;

        return await this.donationsRepository.save(donation);
    }

    private async updateRecurringDonationAfterCharge(
        recurringDonation: RecurringDonation,
        chargeDate: Date
    ): Promise<void> {
        recurringDonation.nextChargeDate = this.calculateNextChargeDate(
            recurringDonation.frequency,
            recurringDonation.nextChargeDate
        );
        recurringDonation.lastChargedDate = chargeDate;
        recurringDonation.totalCharges += 1;
        recurringDonation.totalAmount = parseFloat(recurringDonation.totalAmount.toString()) + recurringDonation.amount;
        await this.recurringDonationsRepository.save(recurringDonation);
    }

    async cancelRecurringDonation(
        recurringDonation: RecurringDonation,
        reason: string
    ): Promise<RecurringDonation> {
        if (recurringDonation.subscriptionId && recurringDonation.paymentMethodDetails?.type === 'card') {
            try {
                await this.stripeService.cancelSubscription(recurringDonation.subscriptionId);
            } catch (error) {
                this.logger.error(`Failed to cancel Stripe subscription: ${error.message}`);
            }
        }

        recurringDonation.status = RecurringStatus.CANCELLED;
        recurringDonation.cancellationReason = reason;
        recurringDonation.endDate = new Date();

        return await this.recurringDonationsRepository.save(recurringDonation);
    }

    async updateRecurringDonation(
        recurringDonation: RecurringDonation,
        updateDto: any
    ): Promise<RecurringDonation> {
        if (updateDto.frequency && recurringDonation.subscriptionId) {
            this.logger.warn('Frequency update for Stripe subscription may not be reflected in Stripe');
        }
        Object.assign(recurringDonation, updateDto);
        return await this.recurringDonationsRepository.save(recurringDonation);
    }

    async setProjectAndProgramRelations(
        recurringDonation: RecurringDonation,
        dto: CreateRecurringDonationDto
    ): Promise<void> {
        if (dto.projectId) {
            const project = await this.projectsRepository.findOne({ where: { id: dto.projectId } });
            if (project) recurringDonation.project = project;
        }
        if (dto.programId) {
            const program = await this.programsRepository.findOne({ where: { id: dto.programId } });
            if (program) recurringDonation.program = program;
        }
    }

    private calculateNextChargeDate(frequency: RecurringFrequency, fromDate: Date = new Date()): Date {
        const nextDate = new Date(fromDate);
        switch (frequency) {
            case RecurringFrequency.MONTHLY: nextDate.setMonth(nextDate.getMonth() + 1); break;
            case RecurringFrequency.QUARTERLY: nextDate.setMonth(nextDate.getMonth() + 3); break;
            case RecurringFrequency.YEARLY: nextDate.setFullYear(nextDate.getFullYear() + 1); break;
        }
        return nextDate;
    }

    private mapFrequencyToStripeInterval(frequency: RecurringFrequency): 'month' | 'year' {
        switch (frequency) {
            case RecurringFrequency.MONTHLY: return 'month';
            case RecurringFrequency.YEARLY: return 'year';
            default: return 'month';
        }
    }

    private generateTransactionId(): string {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 10000);
        const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `TXN-${timestamp}-${random}-${randomStr}`;
    }

    async findRecurringDonationById(id: string, relations: string[] = []): Promise<RecurringDonation | null> {
        const entity = await this.recurringDonationsRepository.findOne({ where: { id }, relations });
        return entity ? plainToInstance(RecurringDonation, entity) : null;
    }
}