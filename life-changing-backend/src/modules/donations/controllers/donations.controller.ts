import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  NotFoundException,
  ForbiddenException,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { DonationsService } from '../services/donations.service';
import { CreateDonationDto } from '../dto/create-donation.dto';
import { CreateRecurringDonationDto, UpdateRecurringDonationDto, CancelRecurringDonationDto } from '../dto/create-recurring-donation.dto';
import type { PaginationParams } from '../../../shared/interfaces/pagination.interface';
import { DonationStatsDto, RecurringDonationStatsDto } from '../dto/donation-stats.dto';
import { UserType, PaymentStatus, RecurringStatus, PaymentMethod } from '../../../config/constants';
import { Donor } from '../entities/donor.entity';
import { Donation } from '../entities/donation.entity';
import { RecurringDonation } from '../entities/recurring-donation.entity';
import { DonorServiceInterceptor } from '../../../common/interceptors/donor-service.interceptor';
import { CurrentDonor } from '../../../common/decorators/current-donor.decorator';

@ApiTags('donations')
@Controller('donations')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@UseInterceptors(DonorServiceInterceptor)
export class DonationsController {
  constructor(private readonly donationsService: DonationsService) {}

  // ================= PUBLIC / WEBHOOK ROUTES (NO AUTH) FIRST =================
  @Post('webhook/confirm')
  @ApiOperation({ summary: 'Webhook to confirm donation payment' })
  @HttpCode(HttpStatus.OK)
  async confirmDonationWebhook(@Body() body: any) {
    const { transactionId, paymentDetails } = body;
    return this.donationsService.confirmDonation(transactionId, paymentDetails);
  }

  // ================= DONOR-SPECIFIC ROUTES =================
  @Post()
  @Roles(UserType.DONOR )
  @ApiOperation({ summary: 'Make a donation' })
  @ApiResponse({ status: 201, description: 'Donation processed successfully' })
  async createDonation(
    @CurrentDonor() donor: Donor,
    @Req() req,
    @Body() createDonationDto: CreateDonationDto
  ) {
    // Validate payment method requirements
    this.validatePaymentMethod(createDonationDto);

    const processDonationDto = {
      ...createDonationDto,
      donorId: donor.id,
    };

    // Get metadata from request
    const metadata = {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    };

    return this.donationsService.processDonation(processDonationDto, metadata);
  }

  @Post('recurring')
  @Roles(UserType.DONOR)
  @ApiOperation({ summary: 'Create a recurring donation' })
  @ApiResponse({ status: 201, description: 'Recurring donation created' })
  async createRecurringDonation(
    @CurrentDonor() donor: Donor,
    @Body() createRecurringDonationDto: CreateRecurringDonationDto
  ) {
    return this.donationsService.createRecurringDonation(
      donor.id,
      createRecurringDonationDto
    );
  }

  @Get('my-donations')
  @Roles(UserType.DONOR, UserType.ADMIN)
  @ApiOperation({ summary: 'Get my donations' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false })
  async getMyDonations(
    @CurrentDonor() donor: Donor,
    @Query() paginationParams: PaginationParams
  ) {
    return this.donationsService.getDonationsByDonor(donor.id, paginationParams);
  }

  @Get('my-recurring')
  @Roles(UserType.DONOR, UserType.ADMIN)
  @ApiOperation({ summary: 'Get my recurring donations' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getMyRecurringDonations(
    @CurrentDonor() donor: Donor,
    @Query() paginationParams: PaginationParams
  ) {
    return this.donationsService.getRecurringDonationsByDonor(donor.id, paginationParams);
  }

  // ================= ADMIN STATS ROUTES =================
  @Get('stats')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: 'Get donation statistics' })
  @ApiResponse({ status: 200, type: DonationStatsDto })
  async getDonationStats(): Promise<DonationStatsDto> {
    return this.donationsService.getDonationStats();
  }

  @Get('recurring-stats')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: 'Get recurring donation statistics' })
  @ApiResponse({ status: 200, type: RecurringDonationStatsDto })
  async getRecurringDonationStats(): Promise<RecurringDonationStatsDto> {
    return this.donationsService.getRecurringDonationStats();
  }

  // ================= ADMIN SEARCH ROUTES =================
  @Get('search')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: 'Search donations' })
  @ApiQuery({ name: 'q', required: true, description: 'Search query' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async searchDonations(
    @Query('q') query: string,
    @Query() paginationParams: PaginationParams
  ) {
    return this.donationsService.searchDonations(query, paginationParams);
  }

@Get('transaction/:transactionId')
@ApiOperation({ summary: 'Check donation status' })
async checkDonationStatus(@Param('transactionId') transactionId: string) {
  const donation = await this.donationsService.findByTransactionId(transactionId);
  
  if (!donation) {
    throw new NotFoundException('Donation not found');
  }
  
  // If still pending, check with payment provider directly
  if (donation.paymentStatus === PaymentStatus.PENDING) {
    await this.donationsService.verifyPaymentWithProvider(donation);
    // Refresh donation after verification
    return this.donationsService.findByTransactionId(transactionId);
  }
  
  return donation;
}
  @Get('program/:programId')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: 'Get donations by program' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getDonationsByProgram(
    @Param('programId') programId: string,
    @Query() paginationParams: PaginationParams
  ) {
    return this.donationsService.getDonationsByProgram(programId, paginationParams);
  }

  @Get('project/:projectId')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: 'Get donations by project' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getDonationsByProject(
    @Param('projectId') projectId: string,
    @Query() paginationParams: PaginationParams
  ) {
    return this.donationsService.getDonationsByProject(projectId, paginationParams);
  }

  @Get('status/:status')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: 'Get donations by payment status' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getDonationsByStatus(
    @Param('status') status: PaymentStatus,
    @Query() paginationParams: PaginationParams
  ) {
    const where = { paymentStatus: status };
    return this.donationsService.paginate(paginationParams, where, ['donor', 'project', 'program']);
  }

  // ================= RECURRING DONATION PARAM ROUTES =================
  @Get('recurring/:id')
  @Roles(UserType.DONOR, UserType.ADMIN)
  @ApiOperation({ summary: 'Get recurring donation by ID' })
  async getRecurringDonationById(
    @Param('id') id: string,
    @CurrentDonor() donor: Donor
  ) {
    await this.checkRecurringDonationOwnership(id, donor.id);
    return this.donationsService.findRecurringDonationById(id, ['donor', 'project', 'program']);
  }

  @Put('recurring/:id')
  @Roles(UserType.DONOR, UserType.ADMIN)
  @ApiOperation({ summary: 'Update recurring donation' })
  async updateRecurringDonation(
    @Param('id') id: string,
    @Body() updateDto: UpdateRecurringDonationDto,
    @CurrentDonor() donor: Donor
  ) {
    await this.checkRecurringDonationOwnership(id, donor.id);
    return this.donationsService.updateRecurringDonation(id, updateDto);
  }

  @Post('recurring/:id/cancel')
  @Roles(UserType.DONOR)
  @ApiOperation({ summary: 'Cancel recurring donation' })
  async cancelRecurringDonation(
    @Param('id') id: string,
    @Body() cancelDto: CancelRecurringDonationDto,
    @CurrentDonor() donor: Donor
  ) {
    await this.checkRecurringDonationOwnership(id, donor.id);
    return this.donationsService.cancelRecurringDonation(id, cancelDto.reason);
  }

  // ================= ADMIN PROCESS ROUTE =================
  @Post('process-recurring')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: 'Process pending recurring charges (admin only)' })
  async processRecurringCharges() {
    await this.donationsService.processRecurringCharges();
    return { message: 'Recurring charges processed successfully' };
  }

  // ================= GENERIC DONATION PARAM ROUTES LAST =================
  @Get(':id')
  @Roles(UserType.DONOR, UserType.ADMIN)
  @ApiOperation({ summary: 'Get donation by ID' })
  async getDonationById(
    @Param('id') id: string,
    @CurrentDonor() donor: Donor
  ) {
    await this.checkDonationOwnership(id, donor.id);
    return this.donationsService.findOne(id, ['donor', 'project', 'program']);
  }

  @Delete(':id')
  @Roles(UserType.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete donation (admin only)' })
  async deleteDonation(@Param('id') id: string) {
    await this.donationsService.delete(id);
  }

  /**
   * Validate payment method requirements
   */
  private validatePaymentMethod(createDonationDto: CreateDonationDto): void {
    const { paymentMethod, paymentMethodId } = createDonationDto;

    if (paymentMethod === PaymentMethod.CARD && !paymentMethodId) {
      throw new NotFoundException('Payment method ID is required for card payments');
    }
  }

  /**
   * Check if donation belongs to donor
   */
  private async checkDonationOwnership(donationId: string, donorId: string): Promise<void> {
    const donation = await this.donationsService.findOne(donationId, ['donor']);
    
    if (!donation) {
      throw new NotFoundException('Donation not found');
    }
    
    if (donation.donor.id !== donorId) {
      throw new ForbiddenException('You do not have permission to access this donation');
    }
  }

  /**
   * Check if recurring donation belongs to donor
   */
  private async checkRecurringDonationOwnership(recurringDonationId: string, donorId: string): Promise<void> {
    const recurringDonation = await this.donationsService.findRecurringDonationById(recurringDonationId, ['donor']);
    
    if (!recurringDonation) {
      throw new NotFoundException('Recurring donation not found');
    }
    
    if (recurringDonation.donor.id !== donorId) {
      throw new ForbiddenException('You do not have permission to access this recurring donation');
    }
  }
}