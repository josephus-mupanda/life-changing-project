// src/modules/donations/dto/create-recurring-donation.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsEnum, IsOptional, IsBoolean, IsUUID, Min, IsDate, ValidateIf, IsObject, ValidateNested } from 'class-validator';
import { RecurringFrequency, Currency, PaymentMethod } from '../../../config/constants';
import { Type } from 'class-transformer';

// Define a discriminated union type for payment method details
class CardPaymentDetails {
  @ApiProperty({ example: 'card' })
  @IsString()
  type: 'card';

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  last4?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  expiryMonth?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  expiryYear?: number;
}

class MobileMoneyPaymentDetails {
  @ApiProperty({ example: 'mobile_money' })
  @IsString()
  type: 'mobile_money';

  @ApiProperty()
  @IsString()
  phoneNumber: string;

  @ApiProperty({ enum: ['mtn', 'airtel'] })
  @IsString()
  provider: 'mtn' | 'airtel';
}

export class CreateRecurringDonationDto {
  @ApiProperty({ description: 'Recurring donation amount', example: 50.00 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ enum: Currency, description: 'Currency', example: Currency.USD })
  @IsNotEmpty()
  @IsEnum(Currency)
  currency: Currency;

  @ApiProperty({ enum: RecurringFrequency, description: 'Frequency of recurring donation' , example: RecurringFrequency.MONTHLY})
  @IsNotEmpty()
  @IsEnum(RecurringFrequency)
  frequency: RecurringFrequency;

  @ApiProperty({ enum: PaymentMethod, description: 'Payment method', example: PaymentMethod.CARD })
  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({ required: false, description: 'Project ID if applicable' })
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @ApiProperty({ required: false, description: 'Program ID if applicable' })
  @IsOptional()
  @IsUUID()
  programId?: string;

  // For Stripe (Card) payments
  @ApiProperty({ required: false, description: 'Payment method ID from Stripe (required for card payments)' })
  @ValidateIf(o => o.paymentMethod === PaymentMethod.CARD)
  @IsNotEmpty({ message: 'Payment method ID is required for card payments' })
  @IsString()
  paymentMethodId?: string;

  @ApiProperty({ required: false, description: 'Payment method details for card' })
  @ValidateIf(o => o.paymentMethod === PaymentMethod.CARD)
  @IsOptional()
  @ValidateNested()
  @Type(() => CardPaymentDetails)
  cardDetails?: CardPaymentDetails;

  @ApiProperty({ required: false, description: 'Subscription ID from Stripe (will be generated)' })
  @IsOptional()
  @IsString()
  subscriptionId?: string;

  // For Paypack (Mobile Money) payments
  @ApiProperty({ required: false, description: 'Phone number for mobile money (required for MTN/Airtel payments)' })
  @ValidateIf(o => o.paymentMethod === PaymentMethod.MTN_MOBILE_MONEY || o.paymentMethod === PaymentMethod.AIRTEL_MONEY)
  @IsNotEmpty({ message: 'Phone number is required for mobile money payments' })
  @IsString()
  phoneNumber?: string;

  @ApiProperty({ required: false, description: 'Mobile money provider details' })
  @ValidateIf(o => o.paymentMethod === PaymentMethod.MTN_MOBILE_MONEY || o.paymentMethod === PaymentMethod.AIRTEL_MONEY)
  @IsOptional()
  @ValidateNested()
  @Type(() => MobileMoneyPaymentDetails)
  mobileMoneyDetails?: MobileMoneyPaymentDetails;

  @ApiProperty({ required: false, description: 'Start date of recurring donation' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @ApiProperty({ required: false, description: 'End date of recurring donation' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;

  @ApiProperty({ required: false, default: false, description: 'Send payment reminders' })
  @IsOptional()
  @IsBoolean()
  sendReminders?: boolean;
}

export class UpdateRecurringDonationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(RecurringFrequency)
  frequency?: RecurringFrequency;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  sendReminders?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  nextChargeDate?: Date;

  @ApiProperty({ required: false, description: 'Cancellation reason if applicable' })
  @IsOptional()
  @IsString()
  cancellationReason?: string;
}

export class CancelRecurringDonationDto {
  @ApiProperty({ description: 'Reason for cancellation' })
  @IsNotEmpty()
  @IsString()
  reason: string;
}