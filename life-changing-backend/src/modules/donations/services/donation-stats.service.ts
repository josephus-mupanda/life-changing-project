// src/modules/donations/services/sub-services/donation-stats.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Donation } from '../entities/donation.entity';
import { RecurringDonation } from '../entities/recurring-donation.entity';
import { PaymentStatus, RecurringStatus, DonationType } from '../../../config/constants';
import { DonationStatsDto, RecurringDonationStatsDto } from '../dto/donation-stats.dto';

@Injectable()
export class DonationStatsService {
    constructor(
        @InjectRepository(Donation)
        private donationsRepository: Repository<Donation>,
        @InjectRepository(RecurringDonation)
        private recurringDonationsRepository: Repository<RecurringDonation>,
    ) {}

    async getDonationStats(): Promise<DonationStatsDto> {
        const totalDonations = await this.donationsRepository.count();

        const totalAmountResult = await this.donationsRepository
            .createQueryBuilder('donation')
            .select('SUM(donation.amount)', 'total')
            .where('donation.paymentStatus = :status', { status: PaymentStatus.COMPLETED })
            .getRawOne();

        const byType = await this.donationsRepository
            .createQueryBuilder('donation')
            .select('donation.donationType', 'type')
            .addSelect('COUNT(*)', 'count')
            .addSelect('SUM(donation.amount)', 'amount')
            .where('donation.paymentStatus = :status', { status: PaymentStatus.COMPLETED })
            .groupBy('donation.donationType')
            .getRawMany();

        const recurringCount = await this.recurringDonationsRepository.count({
            where: { status: RecurringStatus.ACTIVE },
        });

        const byProgram = await this.donationsRepository
            .createQueryBuilder('donation')
            .leftJoin('donation.program', 'program')
            .select('program.name', 'program')
            .addSelect('COUNT(*)', 'count')
            .addSelect('SUM(donation.amount)', 'amount')
            .where('donation.paymentStatus = :status', { status: PaymentStatus.COMPLETED })
            .andWhere('donation.program IS NOT NULL')
            .groupBy('program.name')
            .getRawMany();

        const currentYear = new Date().getFullYear();
        const byMonth = await this.donationsRepository
            .createQueryBuilder('donation')
            .select("TO_CHAR(donation.createdAt, 'YYYY-MM')", 'month')
            .addSelect('COUNT(*)', 'count')
            .addSelect('SUM(donation.amount)', 'amount')
            .where('donation.paymentStatus = :status', { status: PaymentStatus.COMPLETED })
            .andWhere('EXTRACT(YEAR FROM donation.createdAt) = :year', { year: currentYear })
            .groupBy("TO_CHAR(donation.createdAt, 'YYYY-MM')")
            .orderBy('month', 'ASC')
            .getRawMany();

        const averageResult = await this.donationsRepository
            .createQueryBuilder('donation')
            .select('AVG(donation.amount)', 'average')
            .addSelect('donation.donationType', 'type')
            .where('donation.paymentStatus = :status', { status: PaymentStatus.COMPLETED })
            .groupBy('donation.donationType')
            .getRawMany();

        const averages = averageResult.reduce((acc, curr) => {
            acc[curr.type.toLowerCase()] = parseFloat(curr.average) || 0;
            return acc;
        }, {});

        return {
            totalDonations,
            totalAmount: parseFloat(totalAmountResult?.total || '0') || 0,
            recurringDonations: recurringCount,
            byType: byType.map(item => ({
                type: item.type,
                count: parseInt(item.count),
                amount: parseFloat(item.amount)
            })),
            byProgram: byProgram.map(item => ({
                program: item.program,
                count: parseInt(item.count),
                amount: parseFloat(item.amount)
            })),
            byMonth: byMonth.map(item => ({
                month: item.month,
                count: parseInt(item.count),
                amount: parseFloat(item.amount)
            })),
            averageDonation: {
                oneTime: averages[DonationType.ONE_TIME.toLowerCase()] || 0,
                recurring: averages[DonationType.MONTHLY.toLowerCase()] || 0,
                overall: (parseFloat(totalAmountResult?.total || '0') / totalDonations) || 0,
            },
        };
    }

    async getRecurringDonationStats(): Promise<RecurringDonationStatsDto> {
        const totalActive = await this.recurringDonationsRepository.count({ where: { status: RecurringStatus.ACTIVE } });
        const totalPaused = await this.recurringDonationsRepository.count({ where: { status: RecurringStatus.PAUSED } });
        const totalCancelled = await this.recurringDonationsRepository.count({ where: { status: RecurringStatus.CANCELLED } });

        const monthlyRevenue = await this.recurringDonationsRepository
            .createQueryBuilder('recurring')
            .select('SUM(recurring.amount)', 'mrr')
            .where('recurring.status = :status', { status: RecurringStatus.ACTIVE })
            .getRawOne();

        const byFrequency = await this.recurringDonationsRepository
            .createQueryBuilder('recurring')
            .select('recurring.frequency', 'frequency')
            .addSelect('COUNT(*)', 'count')
            .addSelect('SUM(recurring.amount)', 'amount')
            .where('recurring.status = :status', { status: RecurringStatus.ACTIVE })
            .groupBy('recurring.frequency')
            .getRawMany();

        const thirtyDaysLater = new Date();
        thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);

        const upcomingChargesResult = await this.recurringDonationsRepository
            .createQueryBuilder('recurring')
            .select('COUNT(*)', 'count')
            .addSelect('SUM(recurring.amount)', 'amount')
            .where('recurring.status = :status', { status: RecurringStatus.ACTIVE })
            .andWhere('recurring.nextChargeDate BETWEEN :today AND :future', {
                today: new Date(),
                future: thirtyDaysLater,
            })
            .getRawOne();

        return {
            totalActive,
            totalPaused,
            totalCancelled,
            monthlyRecurringRevenue: parseFloat(monthlyRevenue?.mrr || '0') || 0,
            byFrequency: byFrequency.map(item => ({
                frequency: item.frequency,
                count: parseInt(item.count),
                amount: parseFloat(item.amount)
            })),
            upcomingCharges: [{
                count: parseInt(upcomingChargesResult?.count || '0'),
                amount: parseFloat(upcomingChargesResult?.amount || '0'),
            }],
        };
    }
}