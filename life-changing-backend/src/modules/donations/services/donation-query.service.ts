// src/modules/donations/services/sub-services/donation-query.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Donation } from '../entities/donation.entity';
import { RecurringDonation } from '../entities/recurring-donation.entity';
import { PaginationParams, PaginatedResponse } from '../../../shared/interfaces/pagination.interface';
import { BaseService } from '../../../shared/services/base.service';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class DonationQueryService extends BaseService<Donation> {
    constructor(
        @InjectRepository(Donation)
        private donationsRepository: Repository<Donation>,
        @InjectRepository(RecurringDonation)
        private recurringDonationsRepository: Repository<RecurringDonation>,
    ) {
        super(donationsRepository);
    }

    async getDonationsByDonor(donorId: string, paginationParams: PaginationParams): Promise<PaginatedResponse<Donation>> {
        const where: FindOptionsWhere<Donation> = { donor: { id: donorId } };
        const result = await this.paginate(paginationParams, where, ['donor', 'project', 'program']);
        return {
            ...result,
            data: result.data.map(d => plainToInstance(Donation, d))
        };
    }

    async getRecurringDonationsByDonor(donorId: string, paginationParams: PaginationParams): Promise<PaginatedResponse<RecurringDonation>> {
        const page = paginationParams.page || 1;
        const limit = paginationParams.limit || 20;
        const skip = (page - 1) * limit;
        const sortBy = paginationParams.sortBy || 'createdAt';
        const sortOrder = paginationParams.sortOrder || 'DESC';

        const [recurringDonations, total] = await this.recurringDonationsRepository.findAndCount({
            where: { donor: { id: donorId } },
            relations: ['donor', 'project', 'program'],
            order: { [sortBy]: sortOrder },
            skip,
            take: limit,
        });

        const totalPages = Math.ceil(total / limit);

        return {
            data: recurringDonations.map(rd => plainToInstance(RecurringDonation, rd)),
            meta: {
                page,
                limit,
                total,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            },
        };
    }

    async getDonationsByProgram(programId: string, paginationParams: PaginationParams): Promise<PaginatedResponse<Donation>> {
        const where: FindOptionsWhere<Donation> = { program: { id: programId } };
        const result = await this.paginate(paginationParams, where, ['donor', 'program']);
        return {
            ...result,
            data: result.data.map(d => plainToInstance(Donation, d))
        };
    }

    async getDonationsByProject(projectId: string, paginationParams: PaginationParams): Promise<PaginatedResponse<Donation>> {
        const where: FindOptionsWhere<Donation> = { project: { id: projectId } };
        const result = await this.paginate(paginationParams, where, ['donor', 'project']);
        return {
            ...result,
            data: result.data.map(d => plainToInstance(Donation, d))
        };
    }

    async searchDonations(query: string, paginationParams: PaginationParams): Promise<PaginatedResponse<Donation>> {
        const page = paginationParams.page || 1;
        const limit = paginationParams.limit || 20;
        const skip = (page - 1) * limit;
        const sortBy = paginationParams.sortBy || 'createdAt';
        const sortOrder = paginationParams.sortOrder || 'DESC';

        const queryBuilder = this.donationsRepository
            .createQueryBuilder('donation')
            .leftJoinAndSelect('donation.donor', 'donor')
            .leftJoinAndSelect('donation.project', 'project')
            .leftJoinAndSelect('donation.program', 'program')
            .leftJoin('donor.user', 'user')
            .where('LOWER(user.fullName) LIKE LOWER(:query)', { query: `%${query}%` })
            .orWhere('donation.transactionId LIKE :query', { query: `%${query}%` })
            .orWhere('LOWER(project.name) LIKE LOWER(:query)', { query: `%${query}%` })
            .orWhere('LOWER(program.name) LIKE LOWER(:query)', { query: `%${query}%` });

        const total = await queryBuilder.getCount();

        if (sortBy === 'donorName') {
            queryBuilder.orderBy('user.fullName', sortOrder);
        } else if (sortBy === 'projectName') {
            queryBuilder.orderBy('project.name', sortOrder);
        } else if (sortBy === 'programName') {
            queryBuilder.orderBy('program.name', sortOrder);
        } else {
            queryBuilder.orderBy(`donation.${sortBy}`, sortOrder);
        }

        const donations = await queryBuilder.skip(skip).take(limit).getMany();
        const totalPages = Math.ceil(total / limit);

        return {
            data: donations.map(d => plainToInstance(Donation, d)),
            meta: {
                page,
                limit,
                total,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            },
        };
    }

    async findOne(id: string, relations: string[] = []): Promise<Donation | null> {
        const entity = await this.donationsRepository.findOne({ where: { id }, relations });
        return entity ? plainToInstance(Donation, entity) : null;
    }
}