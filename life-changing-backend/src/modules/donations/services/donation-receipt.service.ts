// src/modules/donations/services/sub-services/donation-receipt.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Donation } from '../entities/donation.entity';
import { NotificationService } from '../../notifications/services/notifications.service';
import { DonationReceiptData } from '../interfaces/donation-receipt.interface';
import { Currency, Language, PaymentMethod } from '../../../config/constants';

@Injectable()
export class DonationReceiptService {
    private readonly logger = new Logger(DonationReceiptService.name);

    constructor(
        @InjectRepository(Donation)
        private donationsRepository: Repository<Donation>,
        private notificationService: NotificationService,
    ) {}

    async sendReceipt(donation: Donation): Promise<void> {
        try {
            const donor = donation.donor;
            if (!donor || !donor.user) {
                this.logger.warn('Cannot send receipt: donor or user information missing');
                return;
            }

            donation.receiptNumber = this.generateReceiptNumber(donation);
            donation.receiptSent = true;
            donation.receiptSentAt = new Date();
            await this.donationsRepository.save(donation);

            await this.notificationService.sendDonationReceiptNotification(
                donor.user.id,
                donation.id,
                donation.amount,
                donation.currency,
                donation.project?.name?.en || donation.program?.name?.en || 'LCEO Project',
                donor.user.language || Language.EN
            );

            if (donor.user.email && !donation.isAnonymous) {
                await this.sendEmailReceipt(donation);
            }

            if (donor.user.phone && !donation.isAnonymous) {
                await this.sendSMSReceipt(donation);
            }

            this.logger.log(`Receipt sent for donation ${donation.id}`);
        } catch (error) {
            this.logger.error('Failed to send receipt:', error);
        }
    }

    async sendEmailReceipt(donation: Donation): Promise<void> {
        const donor = donation.donor;
        if (!donor?.user?.email) {
            this.logger.warn('Cannot send email receipt: donor email is missing');
            return;
        }

        const language = donor.user.language || Language.EN;
        const receiptData: DonationReceiptData = {
            receiptNumber: donation.receiptNumber!,
            donationDate: this.formatDate(donation.createdAt, language),
            donorName: donor.user.fullName,
            amount: donation.amount,
            currency: donation.currency,
            localAmount: donation.localAmount,
            localCurrency: Currency.RWF,
            paymentMethod: this.formatPaymentMethod(donation.paymentMethod, language),
            transactionId: donation.transactionId,
            projectName: donation.project?.name?.[language] || donation.program?.name?.[language] ||
                (language === Language.RW ? 'Umushinga wa LCEO' : 'LCEO Project'),
            programName: donation.program?.name?.[language] ||
                (language === Language.RW ? 'Porogaramu ya LCEO' : 'LCEO Program'),
            donorMessage: donation.donorMessage,
            isAnonymous: donation.isAnonymous,
            taxReceiptEligible: donation.metadata?.taxReceiptEligible || false,
            language,
        };

        await this.notificationService.sendDonationReceiptEmail(donor.user.email, receiptData);
    }

    async sendSMSReceipt(donation: Donation): Promise<void> {
        const donor = donation.donor;
        const language = donor.user.language || Language.EN;

        const message = language === Language.RW
            ? `Murakoze donation ya ${donation.amount} ${donation.currency} kuri LCEO. Receipt #${donation.receiptNumber}. Inkunga yawe irimo guhindura ubuzima!`
            : `Thank you for your donation of ${donation.amount} ${donation.currency} to LCEO. Receipt #${donation.receiptNumber}. Your support is changing lives!`;

        await this.notificationService.sendDonationReceiptSMS(donor.user.phone, message);
    }

    async notifyRecurringDonationFailure(recurringDonation: any): Promise<void> {
        try {
            const donor = recurringDonation.donor;
            if (!donor?.user) return;

            await this.notificationService.sendRecurringDonationFailureNotification(
                donor.user.id,
                recurringDonation.amount,
                recurringDonation.currency,
                recurringDonation.frequency,
                donor.user.language || Language.EN
            );

            if (donor.user.email) {
                await this.notificationService.sendRecurringDonationFailedEmail(
                    donor.user.email,
                    donor.user.fullName || 'Valued Donor',
                    recurringDonation.amount,
                    recurringDonation.currency,
                    recurringDonation.frequency,
                    donor.user.language || Language.EN
                );
            }
        } catch (error) {
            this.logger.error('Failed to send recurring donation failure notification:', error);
        }
    }

    private generateReceiptNumber(donation: Donation): string {
        return `REC-${donation.id.substring(0, 8).toUpperCase()}-${Date.now().toString().slice(-6)}`;
    }

    private formatDate(date: Date, language: Language): string {
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric', month: 'long', day: 'numeric'
        };
        const locale = language === Language.RW ? 'rw-RW' : 'en-US';
        return date.toLocaleDateString(locale, options);
    }

    private formatPaymentMethod(paymentMethod: PaymentMethod, language: Language): string {
        const translations = {
            [Language.EN]: {
                [PaymentMethod.CARD]: 'Credit/Debit Card',
                [PaymentMethod.MTN_MOBILE_MONEY]: 'MTN Mobile Money',
                [PaymentMethod.AIRTEL_MONEY]: 'Airtel Money',
                [PaymentMethod.BANK_TRANSFER]: 'Bank Transfer',
            },
            [Language.RW]: {
                [PaymentMethod.CARD]: 'Ikarita y\'inguzanyo',
                [PaymentMethod.MTN_MOBILE_MONEY]: 'MTN Mobile Money',
                [PaymentMethod.AIRTEL_MONEY]: 'Airtel Money',
                [PaymentMethod.BANK_TRANSFER]: 'Koheranyo mu banki',
            }
        };
        return translations[language]?.[paymentMethod] || paymentMethod;
    }
}