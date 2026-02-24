// lib/profile-context.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Staff, Beneficiary, Donor } from './types';

interface ProfileContextType {
    // Current profile state - can be Staff, Beneficiary, or Donor
    currentProfile: Staff | Beneficiary | Donor | null;
    profileType: 'staff' | 'beneficiary' | 'donor' | null;

    // Profile management
    setProfile: <T extends Staff | Beneficiary | Donor>(profile: T, type: 'staff' | 'beneficiary' | 'donor') => void;
    clearProfile: () => void;

    // Type guards
    isStaff: () => boolean;
    isBeneficiary: () => boolean;
    isDonor: () => boolean;

    // Loading state
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;

    // Helper
    getProfileId: () => string | null;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
    const [currentProfile, setCurrentProfile] = useState<Staff | Beneficiary | Donor | null>(null);
    const [profileType, setProfileType] = useState<'staff' | 'beneficiary' | 'donor' | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const setProfile = <T extends Staff | Beneficiary | Donor>(profile: T, type: 'staff' | 'beneficiary' | 'donor') => {
        setCurrentProfile(profile);
        setProfileType(type);
        // Store profile ID in localStorage for quick reference
        if (profile?.id) {
            localStorage.setItem('currentProfileId', profile.id);
            localStorage.setItem('currentProfileType', type);
        }
    };

    const clearProfile = () => {
        setCurrentProfile(null);
        setProfileType(null);
        localStorage.removeItem('currentProfileId');
        localStorage.removeItem('currentProfileType');
    };

    const isStaff = () => profileType === 'staff';
    const isBeneficiary = () => profileType === 'beneficiary';
    const isDonor = () => profileType === 'donor';

    const getProfileId = () => currentProfile?.id || null;

    // Check for stored profile info on mount
    useEffect(() => {
        const storedProfileId = localStorage.getItem('currentProfileId');
        const storedProfileType = localStorage.getItem('currentProfileType');

        if (storedProfileId && storedProfileType) {
            // We have a stored profile reference, but actual data will be fetched by AuthProvider
            setIsLoading(true);
        } else {
            setIsLoading(false);
        }
    }, []);

    return (
        <ProfileContext.Provider
            value={{
                currentProfile,
                profileType,
                setProfile,
                clearProfile,
                isStaff,
                isBeneficiary,
                isDonor,
                isLoading,
                setIsLoading,
                getProfileId
            }}
        >
            {children}
        </ProfileContext.Provider>
    );
}

export function useProfile() {
    const context = useContext(ProfileContext);
    if (context === undefined) {
        throw new Error('useProfile must be used within a ProfileProvider');
    }
    return context;
}

// Type-safe getters
export function useCurrentStaff(): Staff | null {
    const { currentProfile, profileType } = useProfile();
    return profileType === 'staff' ? (currentProfile as Staff) : null;
}

export function useCurrentBeneficiary(): Beneficiary | null {
    const { currentProfile, profileType } = useProfile();
    return profileType === 'beneficiary' ? (currentProfile as Beneficiary) : null;
}

export function useCurrentDonor(): Donor | null {
    const { currentProfile, profileType } = useProfile();
    return profileType === 'donor' ? (currentProfile as Donor) : null;
}