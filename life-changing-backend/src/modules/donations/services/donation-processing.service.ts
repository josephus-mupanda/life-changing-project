// src/modules/donations/services/sub-services/donation-processing.service.ts
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Donation } from '../entities/donation.entity';
import { Donor } from '../entities/donor.entity';
import { Project } from '../../programs/entities/project.entity';
import { Program } from '../../programs/entities/program.entity';
import { ProcessDonationDto } from '../dto/create-donation.dto';
import { PaymentMethod, PaymentStatus } from '../../../config/constants';
import { PaypackService } from '../../../shared/services/paypack.service';
import { StripeService } from '../../../shared/services/stripe.service';
import { Helpers } from '../../../shared/utils/helpers';

@Injectable()
export class DonationProcessingService {
    private readonly logger = new Logger(DonationProcessingService.name);

    constructor(
        @InjectRepository(Donation)
        private donationsRepository: Repository<Donation>,
        @InjectRepository(Project)
        private projectsRepository: Repository<Project>,
        @InjectRepository(Program)
        private programsRepository: Repository<Program>,
        private paypackService: PaypackService,
        private stripeService: StripeService,
        private helpers: Helpers, 
    ) {}

    async processDonation(
        donor: Donor,
        processDonationDto: ProcessDonationDto,
        savedDonation: Donation,
        metadata?: any
    ): Promise<Donation> {
        try {
            let paymentResult;

            if (processDonationDto.paymentMethod === PaymentMethod.CARD) {
                paymentResult = await this.processCardPayment(donor, processDonationDto, savedDonation);
            } else if ([PaymentMethod.MTN_MOBILE_MONEY, PaymentMethod.AIRTEL_MONEY].includes(processDonationDto.paymentMethod as any)) {
                paymentResult = await this.processMobileMoneyPayment(processDonationDto, savedDonation);
            }

            // Update donation with payment results
            savedDonation.metadata = {
                ...savedDonation.metadata,
                paymentGatewayResponse: paymentResult,
            };

            return await this.donationsRepository.save(savedDonation);

        } catch (error) {
            this.logger.error(`Payment processing failed: ${error.message}`, error.stack);
            throw error;
        }
    }

    private async processCardPayment(
        donor: Donor,
        dto: ProcessDonationDto,
        donation: Donation
    ): Promise<any> {
        if (!dto.paymentMethodId) {
            throw new BadRequestException('Payment method ID is required for card payments');
        }

        const paymentResult = await this.stripeService.createPaymentIntent({
            amount: Math.round(dto.amount * 100),
            currency: dto.currency,
            metadata: {
                donationId: donation.id,
                donorId: donor.id,
            },
        });

        donation.paymentDetails = {
            provider: 'stripe',
            paymentIntentId: paymentResult.paymentIntentId,
            clientSecret: paymentResult.clientSecret!,
        };
        donation.transactionId = paymentResult.paymentIntentId;

        if (paymentResult.status === 'succeeded') {
            donation.paymentStatus = PaymentStatus.COMPLETED;
        } else {
            donation.paymentStatus = PaymentStatus.PENDING;
        }

        return paymentResult;
    }

   // src/modules/donations/services/sub-services/donation-processing.service.ts

private async processMobileMoneyPayment(
    dto: ProcessDonationDto,
    donation: Donation
): Promise<any> {
    if (!dto.phoneNumber) {
        throw new BadRequestException('Phone number is required for mobile money payments');
    }

    // Format phone number for Paypack
    let phoneForPaypack = dto.phoneNumber.replace(/\s+/g, '');
    
    // Remove '+' if present
    phoneForPaypack = phoneForPaypack.replace('+', '');
    
    // If it starts with 250, convert to 0 format (Paypack expects local format)
    if (phoneForPaypack.startsWith('250')) {
        phoneForPaypack = '0' + phoneForPaypack.substring(3);
    }
    
    // If it doesn't start with 0, add 0
    if (!phoneForPaypack.startsWith('0')) {
        phoneForPaypack = '0' + phoneForPaypack;
    }

    this.logger.log(`📱 Processing payment of ${dto.amount} RWF to ${phoneForPaypack}`);
 
    const paymentResult = await this.paypackService.initiateMobileMoneyPayment({
        amount: 100,
        phoneNumber: phoneForPaypack,
        paymentMethod: dto.paymentMethod, 
        metadata: {
            donationId: donation.id,
            originalPhoneNumber: dto.phoneNumber,
        },
    });

    donation.paymentDetails = {
        provider: 'paypack',
        transactionRef: paymentResult.transactionId,
        phoneNumber: dto.phoneNumber, // Store original
        provider_type: paymentResult.provider,
    };
    donation.transactionId = paymentResult.transactionId;

    if (paymentResult.status === 'successful') {
        donation.paymentStatus = PaymentStatus.COMPLETED;
    } else if (paymentResult.status === 'pending') {
        donation.paymentStatus = PaymentStatus.PENDING;
    } else {
        donation.paymentStatus = PaymentStatus.FAILED;
    }

    return paymentResult;
}

    async confirmDonation(
        donation: Donation,
        paymentDetails: any
    ): Promise<Donation> {
        if (donation.paymentMethod === PaymentMethod.CARD) {
            await this.confirmCardPayment(donation);
        } else if ([PaymentMethod.MTN_MOBILE_MONEY, PaymentMethod.AIRTEL_MONEY].includes(donation.paymentMethod as any)) {
            await this.confirmMobileMoneyPayment(donation);
        }

        donation.paymentDetails = {
            ...donation.paymentDetails,
            ...paymentDetails,
        };

        return donation;
    }

    private async confirmCardPayment(donation: Donation): Promise<void> {
        try {
            const paymentIntent = await this.stripeService.confirmPayment(donation.transactionId);
            if (paymentIntent.status === 'succeeded') {
                donation.paymentStatus = PaymentStatus.COMPLETED;
            } else if (paymentIntent.status === 'requires_payment_method') {
                donation.paymentStatus = PaymentStatus.FAILED;
            }
        } catch (error) {
            this.logger.error(`Failed to verify Stripe payment: ${error.message}`);
            donation.paymentStatus = PaymentStatus.FAILED;
        }
    }

    private async confirmMobileMoneyPayment(donation: Donation): Promise<void> {
        try {
            const verification = await this.paypackService.verifyPayment(donation.transactionId);
            if (verification.status === 'successful') {
                donation.paymentStatus = PaymentStatus.COMPLETED;
            } else if (verification.status === 'failed') {
                donation.paymentStatus = PaymentStatus.FAILED;
            }
        } catch (error) {
            this.logger.error(`Failed to verify Paypack payment: ${error.message}`);
            donation.paymentStatus = PaymentStatus.FAILED;
        }
    }

    async setProjectAndProgramRelations(donation: Donation, dto: ProcessDonationDto): Promise<void> {
        if (dto.projectId) {
            const project = await this.projectsRepository.findOne({
                where: { id: dto.projectId }
            });
            if (project) {
                donation.project = project;
            }
        }

        if (dto.programId) {
            const program = await this.programsRepository.findOne({
                where: { id: dto.programId }
            });
            if (program) {
                donation.program = program;
            }
        }
    }

    private formatPhoneForPaypack(phone: string): string {
    // Remove all spaces and special characters
    let cleaned = phone.replace(/\s+/g, '').replace(/[+\-()]/g, '');
    
    // Handle different formats
    if (cleaned.startsWith('250')) {
        // International format: 250788123456 -> 0788123456
        return '0' + cleaned.substring(3);
    } else if (cleaned.startsWith('0')) {
        // Local format: 0788123456 -> keep as is
        return cleaned;
    } else if (cleaned.length === 9) {
        // 9 digits without prefix: 788123456 -> 0788123456
        return '0' + cleaned;
    }
    
    // Default: ensure it starts with 0
    return cleaned.startsWith('0') ? cleaned : '0' + cleaned;
}
}