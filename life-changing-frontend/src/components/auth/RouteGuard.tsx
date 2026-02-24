// components/auth/RouteGuard.tsx
import { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { useProfile } from '@/lib/profile-context';
import { UserType } from '@/lib/types';
import { Loader2 } from 'lucide-react';

export function RouteGuard() {
    const { user, isAuthenticated, isLoading: authLoading, isProfileReady } = useAuth();
    const { currentProfile, isLoading: profileLoading } = useProfile();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Don't do anything while auth is loading
        if (authLoading) return;

        // Not authenticated - let ProtectedRoute handle it
        if (!isAuthenticated || !user) return;

        // Wait for profile to be ready
        if (!isProfileReady || profileLoading) return;

        const path = location.pathname;
        const isOnProfileCompletionPage = path.includes('/complete-profile');

        // Check if user has a profile
        const hasProfile = !!currentProfile;

        // Redirect logic based on profile status
        if (!hasProfile && !isOnProfileCompletionPage) {
            // No profile and not on completion page -> redirect to completion
            const profilePath = `/${user.userType}/complete-profile`;
            navigate(profilePath, { replace: true, state: { from: location } });
        } else if (hasProfile && isOnProfileCompletionPage) {
            // Has profile but on completion page -> redirect to dashboard
            navigate(`/${user.userType}`, { replace: true });
        }
    }, [authLoading, isAuthenticated, user, isProfileReady, profileLoading, currentProfile, location, navigate]);

    // Show loading while auth or profile is initializing
    if (authLoading || (isAuthenticated && (!isProfileReady || profileLoading))) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-teal-600 mx-auto mb-4" />
                    <p className="text-slate-500 dark:text-slate-400">
                        {authLoading ? 'Authenticating...' : 'Loading your profile...'}
                    </p>
                </div>
            </div>
        );
    }

    return <Outlet />;
}