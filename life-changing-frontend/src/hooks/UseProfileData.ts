// hooks/useProfileData.ts
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useProfile } from '@/lib/profile-context';

interface UseProfileDataOptions<T> {
    fetchFn: (profileId: string) => Promise<T>;
    deps?: any[];
    enabled?: boolean;
}

export function useProfileData<T>({
    fetchFn,
    deps = [],
    enabled = true
}: UseProfileDataOptions<T>) {
    const { isAuthenticated, isLoading: authLoading, isProfileReady } = useAuth();
    const { getProfileId, isLoading: profileLoading } = useProfile();
    const [data, setData] = useState<T | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            // Don't fetch if not enabled
            if (!enabled) {
                setIsLoading(false);
                return;
            }

            // Wait for auth and profile to be ready
            if (authLoading || profileLoading || !isProfileReady) {
                return;
            }

            // Don't fetch if not authenticated
            if (!isAuthenticated) {
                setIsLoading(false);
                return;
            }

            const profileId = getProfileId();

            // Don't fetch if no profile ID (user needs to complete profile)
            if (!profileId) {
                console.log('No profile ID available - user may need to complete profile');
                setIsLoading(false);
                setData(null);
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                const result = await fetchFn(profileId);
                setData(result);
            } catch (err) {
                setError(err as Error);
                console.error('Data fetch failed:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [isAuthenticated, authLoading, isProfileReady, profileLoading, enabled, ...deps]);

    return { data, isLoading, error };
}