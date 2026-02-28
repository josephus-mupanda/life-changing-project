// src/modules/donations/dto/create-donation.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsEnum, IsOptional, IsBoolean, IsUUID, Min, ValidateIf } from 'class-validator';
import { DonationType, PaymentMethod, Currency } from '../../../config/constants';

export class CreateDonationDto {
  @ApiProperty({ description: 'Amount to donate', example: 100.00 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ enum: Currency, description: 'Currency of donation', example: Currency.USD })
  @IsNotEmpty()
  @IsEnum(Currency)
  currency: Currency;

  @ApiProperty({ enum: DonationType, description: 'Type of donation' , example: DonationType.ONE_TIME})
  @IsNotEmpty()
  @IsEnum(DonationType)
  donationType: DonationType;

  @ApiProperty({ required: false, description: 'Project ID if applicable' })
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @ApiProperty({ required: false, description: 'Program ID if applicable' })
  @IsOptional()
  @IsUUID()
  programId?: string;

  @ApiProperty({ enum: PaymentMethod, description: 'Payment method' , example: PaymentMethod.CARD})
  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({ required: false, description: 'Donor message' })
  @IsOptional()
  @IsString()
  donorMessage?: string;

  @ApiProperty({ required: false, description: 'Make donation anonymous', default: false })
  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;

  // For Stripe (Card) payments
  @ApiProperty({ required: false, description: 'Payment method ID from Stripe (required for card payments)' })
  @ValidateIf(o => o.paymentMethod === PaymentMethod.CARD)
  @IsNotEmpty({ message: 'Payment method ID is required for card payments' })
  @IsString()
  paymentMethodId?: string;

  // For Paypack (Mobile Money) payments
  @ApiProperty({ required: false, description: 'Phone number for mobile money (required for MTN/Airtel payments)' })
  @ValidateIf(o => o.paymentMethod === PaymentMethod.MTN_MOBILE_MONEY || o.paymentMethod === PaymentMethod.AIRTEL_MONEY)
  @IsNotEmpty({ message: 'Phone number is required for mobile money payments' })
  @IsString()
  phoneNumber?: string;
}

export class ProcessDonationDto extends CreateDonationDto {
  @ApiProperty({ description: 'Donor ID' })
  @IsNotEmpty()
  @IsUUID()
  donorId: string;
}