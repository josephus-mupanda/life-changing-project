// components/auth/ProfileGuard.tsx
import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { useProfile } from '@/lib/profile-context';
import { UserType } from '@/lib/types';
import { staffService } from '@/services/staff.service';
import { beneficiaryService } from '@/services/beneficiary.service';
import { donorService } from '@/services/donor.service';

interface ProfileGuardProps {
    userType: UserType;
}

export function ProfileGuard({ userType }: ProfileGuardProps) {
    const { user } = useAuth();
    const { setProfile } = useProfile();
    const location = useLocation();
    const hasAttemptedRef = useRef(false);

    useEffect(() => {
        // Prevent multiple simultaneous attempts
        if (hasAttemptedRef.current) return;

        const ensureProfileInContext = async () => {
            // If we're on profile completion page, don't fetch profile
            if (location.pathname.includes('/complete-profile')) {
                return;
            }

            hasAttemptedRef.current = true;

            try {
                let profileData = null;
                let type: 'staff' | 'beneficiary' | 'donor' | null = null;

                switch (userType) {
                    case UserType.ADMIN:
                        profileData = await staffService.getProfile();
                        type = 'staff';
                        break;
                    case UserType.BENEFICIARY:
                        profileData = await beneficiaryService.getProfile();
                        type = 'beneficiary';
                        break;
                    case UserType.DONOR:
                        profileData = await donorService.getProfile();
                        type = 'donor';
                        break;
                    default:
                        return;
                }

                // If profile exists, set it
                if (profileData && type) {
                    setProfile(profileData, type);
                } else {
                    // Profile doesn't exist - clear it
                    console.log(`No ${userType} profile found`);
                }

            } catch (error) {
                console.error('Error fetching profile:', error);
                // Don't set profile on error
            }
        };

        ensureProfileInContext();
    }, [userType, location.pathname, setProfile]);

    return <Outlet />;
}