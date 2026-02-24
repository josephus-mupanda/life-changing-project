// src/modules/auth/services/verification.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { MoreThan, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../users/entities/user.entity';
import { ActivityLogService } from '../../admin/activity-log.service';
import { VerifyAccountDto } from '../dto/verify-account.dto';
import { ResendVerificationDto } from '../dto/resend-verification.dto';
import { NotificationService } from 'src/modules/notifications/services/notifications.service';
import { Helpers } from 'src/shared/utils/helpers';

@Injectable()
export class VerificationService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private helpers: Helpers,
    private activityLogService: ActivityLogService,
    private notificationService: NotificationService,

  ) { }

  async verifyAccount(verifyAccountDto: VerifyAccountDto): Promise<{ message: string }> {
    const { token } = verifyAccountDto;

    const user = await this.usersRepository.findOne({
      where: { verificationToken: token, verificationTokenExpires: MoreThan(new Date()), },
    });

    if (!user) {
      // Check if token exists but expired
      const expiredUser = await this.usersRepository.findOne({
        where: { verificationToken: token },
      });

      if (expiredUser) {
        throw new BadRequestException('Verification code has expired. Please request a new one.');
      }

      throw new NotFoundException('Invalid verification token');
    }

    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpires = null;
    user.verifiedAt = new Date();

    await this.usersRepository.save(user);

    // Log account verification
    await this.activityLogService.logActivity(
      user.id,
      'ACCOUNT_VERIFIED',
      'users',
      user.id,
      null,
      { timestamp: new Date().toISOString() },
      'Account verified successfully'
    );

    return { message: 'Account verified successfully' };
  }

  async resendVerificationCode(resendVerificationDto: ResendVerificationDto): Promise<{ message: string }> {
    const { phone } = resendVerificationDto;

    // Find user by phone
    const user = await this.usersRepository.findOne({
      where: { phone },
    });

    if (!user) {
      throw new NotFoundException('User not found with this phone number');
    }

    // Check if already verified
    if (user.isVerified) {
      throw new BadRequestException('Account is already verified');
    }

    // Generate new 5-digit verification token
    const verificationToken = this.helpers.generateRandomToken();
    const verificationExpires = new Date();
    verificationExpires.setMinutes(verificationExpires.getMinutes() + 10); // 10 minutes expiry

    // Update user with new token
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = verificationExpires;
    await this.usersRepository.save(user);

    await this.notificationService.sendSMSVerification(phone, verificationToken);

    // Log the resend
    await this.activityLogService.logActivity(
      user.id,
      'VERIFICATION_CODE_RESENT',
      'users',
      user.id,
      null,
      { timestamp: new Date().toISOString() },
      'Verification code resent via SMS'
    );

    return { message: 'Verification code sent successfully' };
  }
}