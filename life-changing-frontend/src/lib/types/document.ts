export interface BeneficiaryDocument {
  id: string;
  documentType: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  publicId: string;
  verified: boolean;
  verifiedAt?: string | null;
  verifiedBy?: {
    id: string;
    fullName: string;
  } | null;
  uploadedBy: {
    id: string;
    fullName: string;
    email: string;
  };
  uploadedByType: string;
  beneficiary?: {
    id: string;
    businessType: string;
    location: {
      district: string;
      sector: string;
    };
  };
  createdAt: string;
}

export interface DocumentStats {
  total: number;
  verified: number;
  pending: number;
  byType: Array<{
    documenttype: string;
    total: string;
    verified: string;
    pending: string;
  }>;
}

export enum DocumentType {
  ID_CARD = 'id_card',
  BIRTH_CERTIFICATE = 'birth_certificate',
  SCHOOL_CERTIFICATE = 'school_certificate',
  MEDICAL_REPORT = 'medical_report',
  BUSINESS_LICENSE = 'business_license',
  OTHER = 'other',
}