// User Types
export enum UserType {
  ADMIN = 'admin',
  DONOR = 'donor',
  BENEFICIARY = 'beneficiary',
}

// Staff Roles
export enum StaffRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  PROGRAM_MANAGER = 'program_manager',
  DATA_ENTRY = 'data_entry',
  VIEWER = 'viewer',
}

// Languages
export enum Language {
  EN = 'en',
  RW = 'rw',
}

// Beneficiary Status
export enum BeneficiaryStatus {
  ACTIVE = 'active',
  GRADUATED = 'graduated',
  INACTIVE = 'inactive',
}

// Tracking Frequency
export enum TrackingFrequency {
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

// Attendance Status
export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
}

// Task Status
export enum TaskStatus {
  COMPLETED = 'completed',
  IN_PROGRESS = 'in_progress',
  NOT_DONE = 'not_done',
}

// Goal Types
export enum GoalType {
  FINANCIAL = 'financial',
  BUSINESS = 'business',
  EDUCATION = 'education',
  PERSONAL = 'personal',
  SKILLS = 'skills',
}

// Goal Status
export enum GoalStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  ACHIEVED = 'achieved',
  ABANDONED = 'abandoned',
}

// Program Categories
export enum ProgramCategory {
  EDUCATION = 'education',
  ENTREPRENEURSHIP = 'entrepreneurship',
  HEALTH = 'health',
  CROSS_CUTTING = 'cross_cutting',
}

// Program Status
export enum ProgramStatus {
  PLANNING = 'planning',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
}

// Payment Methods
export enum PaymentMethod {
  CARD = 'card',
  MTN_MOBILE_MONEY = 'mtn_mobile_money',
  AIRTEL_MONEY = 'airtel_money',
  BANK_TRANSFER = 'bank_transfer'
}

// Payment Status
export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum PaymentProvider {
  STRIPE = 'stripe',
  PAYPACK = 'paypack',
}


// Donation Types
export enum DonationType {
  ONE_TIME = 'one_time',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
}

// Recurring Frequency
export enum RecurringFrequency {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
}

// Recurring Status
export enum RecurringStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  CANCELLED = 'cancelled',
}

// Currencies
export enum Currency {
  RWF = 'RWF',
  USD = 'USD',
  EUR = 'EUR',
}

// Receipt Preferences
export enum ReceiptPreference {
  EMAIL = 'email',
  POSTAL = 'postal',
  NONE = 'none',
}

// Document Types
export enum DocumentType {
  ID_CARD = 'id_card',
  BIRTH_CERTIFICATE = 'birth_certificate',
  SCHOOL_CERTIFICATE = 'school_certificate',
  MEDICAL_REPORT = 'medical_report',
  BUSINESS_LICENSE = 'business_license',
  OTHER = 'other',
}

// Notification Types
export enum NotificationType {
  DONATION_RECEIPT = 'donation_receipt',
  TRACKING_REMINDER = 'tracking_reminder',
  PROGRAM_UPDATE = 'program_update',
  IMPACT_REPORT = 'impact_report',
  SYSTEM_ALERT = 'system_alert',
  WELCOME = 'welcome',
  PASSWORD_RESET = 'password_reset',
}

// Notification Status
export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  READ = 'read',
}

// Notification Channel
export enum NotificationChannel {
  SMS = 'sms',
  EMAIL = 'email',
  IN_APP = 'in_app',
}

// Metric Period
export enum MetricPeriod {
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  ANNUAL = 'annual',
}

// Metric Source
export enum MetricSource {
  KOBO = 'kobo',
  MANUAL = 'manual',
  SYSTEM_CALCULATED = 'system_calculated',
}

// Author Roles
export enum AuthorRole {
  BENEFICIARY = 'beneficiary',
  DONOR = 'donor',
  STAFF = 'staff',
  PARTNER = 'partner',
  VOLUNTEER = 'volunteer',
}

// --- DTOs ---

export interface LoginDto {
  email?: string;
  phone?: string;
  password: string;
  deviceId?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RegisterDto {
  email?: string;
  phone: string;
  password: string;
  fullName: string;
  userType?: UserType;
  language?: Language;
  deviceId?: string;
}

export interface RegisterResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface LocationDto {
  district: string;
  sector: string;
  cell: string;
  village: string;
}

export interface CreateBeneficiaryDto {
  dateOfBirth: string;
  location: LocationDto;
  programId?: string;
  enrollmentDate?: string;
  startCapital: number;
  businessType: string;
  trackingFrequency: TrackingFrequency;
  requiresSpecialAttention?: boolean;
}

export interface CommunicationPreferencesDto {
  email: boolean;
  sms: boolean;
}

export interface CreateDonorDto {
  country: string;
  preferredCurrency: Currency;
  communicationPreferences: CommunicationPreferencesDto;
  receiptPreference: ReceiptPreference;
  anonymityPreference?: boolean;
  receiveNewsletter?: boolean;
}

export interface UpdateDonorDto extends Partial<CreateDonorDto> { }

export interface NameDto {
  en: string;
  rw: string;
}

export interface DescriptionDto {
  en: string;
  rw: string;
}

export interface MilestoneDto {
  date: string;
  description: string;
}

export interface TimelineDto {
  start: string;
  end: string;
  milestones?: MilestoneDto[];
}

export interface ProgramLocationDto {
  districts: string[];
  sectors: string[];
}

export interface ProjectDto {
  name: NameDto;
  description: DescriptionDto;
  budgetRequired: number;
  timeline: TimelineDto;
  location: ProgramLocationDto;
}

export interface CreateProgramDto {
  name: NameDto;
  description: DescriptionDto;
  category: ProgramCategory;
  sdgAlignment: number[];
  kpiTargets: Record<string, any>;
  startDate: string;
  endDate?: string;
  budget: number;
  status?: ProgramStatus;
  projects?: ProjectDto[];
}

export interface CreateDonationDto {
  amount: number;
  currency: Currency;
  donationType: DonationType;
  projectId?: string;
  programId?: string;
  paymentMethod: PaymentMethod;
  donorMessage?: string;
  isAnonymous?: boolean;
  paymentMethodId: string;
}

// 1. USER ENTITY
export interface User {
  id: string;
  email: string | null;
  fullName: string;
  phone: string;
  profileImageUrl?: string;
  userType: UserType;
  language: Language;
  isVerified: boolean;
  verificationToken: string | null;
  verifiedAt: Date | null;
  resetPasswordToken: string | null;
  resetPasswordExpires: Date | null;
  offlineSyncToken: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
}

// 2. STAFF ENTITY
export interface Staff {
  id: string;
  user: User;
  fullName: string;
  role: StaffRole;
  department: string | null;
  permissions: string[];
  employeeId: string | null;
  hireDate: Date | null;
  contactInfo: {
    emergencyContact: string;
    emergencyPhone: string;
    address: string;
  } | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  submittedTrackings: WeeklyTracking[];
  verifiedTrackings: WeeklyTracking[];
  uploadedDocuments: BeneficiaryDocument[];
  verifiedDocuments: BeneficiaryDocument[];
  verifiedMetrics: ImpactMetric[];
}

// 4. BENEFICIARY ENTITY
export interface Beneficiary {
  id: string;
  user: User;
  fullName: string;
  dateOfBirth: Date;
  location: LocationDto;
  program: Program;
  status: BeneficiaryStatus;
  enrollmentDate: Date;
  exitDate: Date | null;
  startCapital: number;
  currentCapital: number;
  businessType: string;
  trackingFrequency: TrackingFrequency;
  lastTrackingDate: Date | null;
  nextTrackingDate: Date | null;
  profileCompletion: number;
  requiresSpecialAttention: boolean;
  createdAt: Date;
  updatedAt: Date;
  weeklyTrackings: WeeklyTracking[];
  goals: Goal[];
  documents: BeneficiaryDocument[];
  emergencyContacts: EmergencyContact[];
}

// 5. DONOR ENTITY
export interface Donor {
  id: string;
  user: User;
  fullName: string;
  country: string;
  preferredCurrency: Currency;
  communicationPreferences: CommunicationPreferencesDto;
  receiptPreference: ReceiptPreference;
  totalDonated: number;
  lastDonationDate: Date | null;
  isRecurringDonor: boolean;
  anonymityPreference: boolean;
  receiveNewsletter: boolean;
  impactScore?: number;
  createdAt: Date;
  updatedAt: Date;
  donations: Donation[];
  recurringDonations: RecurringDonation[];
}

// 6. NOTIFICATION ENTITY
export interface Notif {
  id: string;
  user: User;
  type: NotificationType;
  title: NameDto;
  message: DescriptionDto;
  data: Record<string, any> | null;
  status: NotificationStatus;
  channel: NotificationChannel;
  scheduledFor: Date | null;
  sentAt: Date | null;
  deliveredAt: Date | null;
  readAt: Date | null;
  deliveryReport: any;
  createdAt: Date;
}

// 7. GOAL ENTITY
export interface Goal {
  id: string;
  beneficiary: Beneficiary;
  description: string;
  type: GoalType;
  targetAmount: number;
  currentProgress: number;
  targetDate: Date;
  status: GoalStatus;
  milestones: Array<{
    description: string;
    targetAmount: number;
    targetDate: Date;
    completed: boolean;
    completedAt: Date;
  }> | null;
  notes: string | null;
  actionPlan: {
    steps: string[];
    resourcesNeeded: string[];
    timeline: string;
  } | null;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
}

// 8. EMERGENCY CONTACT ENTITY
export interface EmergencyContact {
  id: string;
  beneficiary: Beneficiary;
  name: string;
  relationship: string;
  phone: string;
  alternatePhone: string | null;
  address: string;
  isPrimary: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 9. WEEKLY TRACKING ENTITY
export interface WeeklyTracking {
  id: string;
  beneficiary: Beneficiary;
  weekEnding: Date;
  attendance: AttendanceStatus;
  taskGiven: string | null;
  taskCompletionStatus: TaskStatus | null;
  incomeThisWeek: number;
  expensesThisWeek: number;
  currentCapital: number;
  salesData: {
    unitsSold: number;
    averagePrice: number;
    bestSellingProduct: string;
  } | null;
  challenges: string | null;
  solutionsImplemented: string | null;
  notes: string | null;
  nextWeekPlan: {
    tasks: string[];
    goals: string[];
    supportNeeded: string[];
  } | null;
  submittedBy: User | null;
  submittedByType: UserType;
  isOfflineSync: boolean;
  syncSessionId: string | null;
  offlineData: any;
  submittedAt: Date;
  verifiedAt: Date | null;
  verifiedBy: Staff | null;
}

// 10. BENEFICIARY DOCUMENT ENTITY
export interface BeneficiaryDocument {
  id: string;
  beneficiary: Beneficiary;
  documentType: DocumentType;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  publicId: string;
  uploadedBy: User | null;
  uploadedByType: UserType;
  verified: boolean;
  verifiedBy: Staff | null;
  verifiedAt: Date | null;
  createdAt: Date;
}

// 11. DONATION ENTITY
export interface Donation {
  id: string;
  donor: Donor;
  amount: number;
  currency: string;
  localAmount: number;
  exchangeRate: number;
  donationType: DonationType;
  project: Project | null;
  program: Program | null;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  transactionId: string;
  paymentDetails: any;
  receiptSent: boolean;
  receiptSentAt: Date | null;
  receiptNumber: string | null;
  isAnonymous: boolean;
  metadata: any;
  donorMessage: string | null;
  isTest: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 12. RECURRING DONATION ENTITY
export interface RecurringDonation {
  id: string;
  donor: Donor;
  amount: number;
  currency: string;
  frequency: RecurringFrequency;
  project: Project | null;
  program: Program | null;
  status: RecurringStatus;
  nextChargeDate: Date;
  lastChargedDate: Date | null;
  lastChargeId: string | null;
  paymentMethodId: string;
  subscriptionId: string;
  paymentMethodDetails: any;
  totalCharges: number;
  totalAmount: number;
  startDate: Date | null;
  endDate: Date | null;
  cancellationReason: string | null;
  sendReminders: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 13. PROGRAM ENTITY
export interface Program {
  id: string;
  name: NameDto;
  description: DescriptionDto;
  category: ProgramCategory;
  sdgAlignment: number[];
  kpiTargets: Record<string, any>;
  startDate: Date;
  endDate: Date | null;
  status: ProgramStatus;
  budget: number;
  fundsAllocated: number;
  fundsUtilized: number;
  coverImage: string | null;
  logo: string | null;
  sortOrder: number;
  metadata: Record<string, any> | null;
  createdAt: Date;
  updatedAt: Date;
  projects: Project[];
  beneficiaries: Beneficiary[];
  impactMetrics: ImpactMetric[];
  stories: Story[];
  donations: Donation[];
}

// 14. PROJECT ENTITY
export interface Project {
  id: string;
  program: Program;
  name: NameDto;
  description: DescriptionDto;
  budgetRequired: number;
  budgetReceived: number;
  budgetUtilized: number;
  timeline: TimelineDto;
  location: ProgramLocationDto;
  impactMetrics: {
    beneficiariesTarget: number;
    beneficiariesReached: number;
    successIndicators: any[];
  };
  donationAllocationPercentage: number;
  isActive: boolean;
  isFeatured: boolean;
  coverImage: string | null;
  gallery: Array<{
    url: string;
    caption: string;
    type: string;
    publicId?: string;
    id?: string;
  }> | null;
  createdAt: Date;
  updatedAt: Date;
  donations: Donation[];
}

// 15. IMPACT METRIC ENTITY
export interface ImpactMetric {
  id: string;
  program: Program;
  metricName: string;
  metricValue: number;
  measurementUnit: string;
  period: MetricPeriod;
  periodDate: Date;
  source: MetricSource;
  notes: string | null;
  verifiedBy: Staff | null;
  verifiedAt: Date | null;
  createdAt: Date;
}

// 16. STORY ENTITY
export interface Story {
  id: string;
  title: NameDto;
  content: DescriptionDto;
  authorName: string;
  authorRole: AuthorRole;
  authorPhoto: string | null;
  program: Program | null;
  beneficiaryId: string | null;
  media: Array<{
    url: string;
    type: 'image' | 'video';
    caption: string;
    thumbnail: string;
  }> | null;
  isFeatured: boolean;
  isPublished: boolean;
  publishedDate: Date;
  language: Language;
  viewCount: number;
  shareCount: number;
  metadata: {
    tags: string[];
    location: string;
    duration: number;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardStats {
  totalBeneficiaries: number;
  activeBeneficiaries: number;
  totalDonors: number;
  totalDonations: number;
  activePrograms: number;
  graduatedBeneficiaries: number;
  recentDonations: Donation[];
  monthlyTrends: {
    month: string;
    beneficiaries: number;
    donations: number;
  }[];
}

// --- Missing DTOs and Interfaces ---

export interface UpdateBeneficiaryDto extends Partial<CreateBeneficiaryDto> { }

export interface BusinessGoal {
  id: string;
  beneficiary: {  // 👈 Full beneficiary object, not just ID
    id: string;
    dateOfBirth: string;
    location: {
      cell: string;
      sector: string;
      village: string;
      district: string;
    };
    status: string;
    enrollmentDate: string;
    exitDate: string | null;
    startCapital: string;
    currentCapital: string;
    businessType: string;
    trackingFrequency: string;
    lastTrackingDate: string;
    nextTrackingDate: string;
    profileCompletion: number;
    requiresSpecialAttention: boolean;
    createdAt: string;
    updatedAt: string;
  };
  description: string;
  type: GoalType;
  targetAmount: string;  // 👈 String in API, not number
  currentProgress: string;  // 👈 String in API, not number
  targetDate: string;
  status: GoalStatus;
  milestones?: Array<{  // 👈 Add these fields!
    targetDate: string;
    description: string;
    targetAmount: number;
  }>;
  notes?: string;
  actionPlan?: {
    steps: string[];
    timeline: string;
    resourcesNeeded: string[];
  };
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}




export interface WeeklyTrackingDto {
  weekEnding: string;
  attendance: AttendanceStatus;
  taskGiven?: string;
  taskCompletionStatus?: TaskStatus;
  incomeThisWeek: number;
  expensesThisWeek: number;
  currentCapital: number;
  salesData?: {
    unitsSold: number;
    averagePrice: number;
    bestSellingProduct: string;
  };
  challenges?: string;
  solutionsImplemented?: string;
  notes?: string;
  nextWeekPlan?: {
    tasks: string[];
    goals: string[];
    supportNeeded: string[];
  };
}

export interface CreateGoalDto {
  description: string;
  type: GoalType;
  targetAmount: number;
  targetDate: string;
  actionPlan?: {
    steps: string[];
    resourcesNeeded: string[];
    timeline: string;
  };
  notes?: string;
}

export interface UpdateGoalDto extends Partial<CreateGoalDto> {
  status?: GoalStatus;
  currentProgress?: number;
}

export interface CreateEmergencyContactDto {
  name: string;
  relationship: string;
  phone: string;
  alternatePhone?: string;
  address: string;
  isPrimary?: boolean;
}

export interface UpdateEmergencyContactDto extends Partial<CreateEmergencyContactDto> { }

export interface CreateStaffDto {
  userId: string;
  position: string;
  department: string;
}

export interface UpdateStaffDto extends Partial<CreateStaffDto> { }

export interface UpdateProgramDto extends Partial<CreateProgramDto> { }

export interface CreateProjectDto {
  programId: string;
  name: NameDto;
  description: DescriptionDto;
  location: LocationDto;
  timeline: TimelineDto;
  budgetRequired: number;
}

export interface UpdateProjectDto extends Partial<CreateProjectDto> { }

export interface CreateStoryDto {
  title: NameDto;
  content: DescriptionDto;
  beneficiaryId?: string;
  projectId?: string;
  programId?: string;
  mediaUrl?: string; // or array
}

export interface IncompleteProfileUser {
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  userType: UserType;
  profileType: string;
  registeredAt: Date;
  missingFields: string[];
}



export interface UpdateStoryDto extends Partial<CreateStoryDto> { }

// --- Added DTOs for Programs and Documents ---

export interface BulkDeleteDocumentsDto {
  ids: string[];
}

export interface BulkVerifyDocumentsDto {
  ids: string[];
}

export interface DocumentStatsDto {
  total: number;
  verified: number;
  unverified: number;
  rejected: number;
  byType: Record<string, number>;
}

export interface ProgramStatsDto {
  totalBeneficiaries: number;
  totalProjects: number;
  budgetUtilization: number;
  completionRate: number;
}
