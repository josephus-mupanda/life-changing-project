export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  alternatePhone?: string | null;
  address?: string | null;
  isPrimary: boolean;
  beneficiary?: {
    id: string;
    businessType: string;
    location: {
      district: string;
      sector: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmergencyContactDto {
  name: string;
  relationship: string;
  phone: string;
  alternatePhone?: string;
  address?: string;
  isPrimary?: boolean;
}

export interface UpdateEmergencyContactDto extends Partial<CreateEmergencyContactDto> {}