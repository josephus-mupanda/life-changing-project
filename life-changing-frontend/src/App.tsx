
import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './lib/auth-context';
import { ProfileProvider } from './lib/profile-context';
import { Toaster } from 'sonner';
import './dashboard.css';

// Public Pages
import { LoginPage } from '@/pages/auth/LoginPage';
import { VerifyAccountPage } from './pages/auth/VerifyAccountPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { HomePage } from '@/pages/HomePage';
import { AboutPage } from '@/pages/AboutPage';
import { ContactPage } from '@/pages/ContactPage';
import { HowWeWorkPage } from '@/pages/HowWeWorkPage';
import { StrategicDirectionPage } from '@/pages/StrategicDirectionPage';
import { ImpactStoriesPage } from '@/pages/ImpactStoriesPage';
import { ResourcesPage as PublicResourcesPage } from '@/pages/ResourcesPage';
import { OurProgramsDetailsPage } from '@/pages/OurProgramsDetailsPage';
import { DonationPage } from '@/pages/DonationPage';

// Layouts and Components
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { SearchModal } from './components/layout/SearchModal';
import { ScrollToTop } from './components/layout/ScrollToTop';
import { FloatingScrollToTop } from './components/layout/FloatingScrollToTop';
import { Chatbot } from './components/layout/Chatbot';
import { LanguageProvider } from './lib/language-context';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Types
import { UserType } from './lib/types';

// Dashboard Pages - Admin
import { AdminDashboard as AdminDashboardOverview } from './pages/admin/AdminDashboard';
import { BeneficiariesPage } from './pages/admin/BeneficiariesPage';
import DonorsPage from './pages/admin/DonorsPage';
import FinancialPage from './pages/admin/FinancialPage';
import ReportsPage from './pages/admin/ReportsPage';
import { ManageUsersPage } from './pages/admin/ManageUsersPage';
import AddBeneficiaryPage from './pages/admin/AddBeneficiaryPage';
import AddDonorPage from './pages/admin/AddDonorPage';
import DonationsPage from './pages/admin/DonationsPage';
import { ProgramsPage } from './pages/admin/ProgramsPage';
import { ProgramDetailsPage } from './pages/admin/ProgramDetailsPage';
import { ProfileGuard } from './components/auth/ProfileGuard';
import CompleteAdminProfilePage from './pages/admin/CompleteAdminProfilePage';

// Dashboard Pages - Beneficiary
import GoalsPage from './pages/beneficiary/GoalsPage';
import TrackingPage from './pages/beneficiary/TrackingPage';
// Import the pages (create these files first)
import EmergencyContactsPage from '@/pages/beneficiary/EmergencyContactsPage';
import DocumentsPage from '@/pages/beneficiary/DocumentsPage';

// Dashboard Pages - Donor
import DonorDashboard from './pages/donor/DonorDashboard';
import DonorDonationsPage from './pages/donor/DonorDonationsPage';
import ImpactReportsPage from './pages/donor/ImpactReportsPage';
import AdminProfilePage from './pages/admin/AdminProfilePage';
import BeneficiaryProfilePage from './pages/beneficiary/BeneficiaryProfilePage';
import DonorProfilePage from './pages/donor/DonorProfilePage';
import CompleteDonorProfilePage from './pages/donor/CompleteDonorProfilePage';
import CompleteBeneficiaryProfilePage from './pages/beneficiary/CompleteBeneficiaryProfilePage';
import { OTPVerificationPage } from './pages/auth/OTPVerificationPage';
import { HelpFaqPage } from './pages/HelpFaqPage';
import { RouteGuard } from './components/auth/RouteGuard';
import BeneficiaryDashboard from './pages/beneficiary/BeneficiaryDashboard';

function AppContent() {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const isPreview = queryParams.get('preview') === 'true';

    const dashboardRoutes = ['/admin', '/beneficiary', '/donor', '/dashboard', '/profile'];
    const isDashboard = dashboardRoutes.some(route => location.pathname.startsWith(route));
    const hideGlobalElements = isDashboard || isPreview;

    React.useEffect(() => {
        if ('scrollRestoration' in window.history) {
            window.history.scrollRestoration = 'manual';
        }

        const publicStyle = document.getElementById('public-style') as HTMLLinkElement;
        const adminStyle = document.getElementById('admin-style') as HTMLLinkElement;

        if (isDashboard) {
            if (publicStyle) publicStyle.disabled = true;
            if (adminStyle) adminStyle.disabled = false;
        } else {
            if (publicStyle) publicStyle.disabled = false;
            if (adminStyle) adminStyle.disabled = true;
        }

        // Failsafe cleanup for potential stuck overlays or body classes
        document.body.classList.remove('modal-open');
        document.body.style.overflow = 'auto';
        document.body.style.paddingRight = '0';
        const loader = document.getElementById('ftco-loader');
        if (loader) loader.classList.remove('show');

        // Remove lingering backdrop if any
        const backdrops = document.getElementsByClassName('modal-backdrop');
        while (backdrops.length > 0) {
            backdrops[0].parentNode?.removeChild(backdrops[0]);
        }
    }, [isDashboard, location.pathname]);

    return (
        <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', overflowX: 'hidden' }}>
            {isDashboard && (
                <style>{`
                    body, html {
                        margin: 0 !important;
                        padding: 0 !important;
                        height: 100% !important;
                        min-height: 100% !important;
                        overflow-x: hidden;
                        background-color: var(--background, #FFFFFF);
                        color: var(--foreground, #020617);
                        font-family: 'Open Sans', sans-serif !important;
                    }
                    
                    #root {
                        min-height: 100vh;
                        display: flex;
                        flex-direction: column;
                        background-color: #FFFFFF;
                    }

                    :root {
                        --background: #FFFFFF;
                        --foreground: #020617;
                    }

                    /* Global Text Overrides */
                    .text-slate-900, 
                    .text-gray-900, 
                    .text-teal-900,
                    .text-teal-950,
                    .text-dark,
                    .text-slate-800, 
                    .text-gray-800,
                    .heading,
                    h1, h2, h3, h4, h5, h6 { 
                        color: #212529 !important; 
                        font-family: 'Poppins', sans-serif !important;
                        font-weight: 700 !important;
                    }
                    
                    .text-slate-700, 
                    .text-gray-700,
                    .text-slate-600, 
                    .text-gray-600, 
                    .text-teal-600,
                    .lead,
                    .subheading { color: #555555 !important; }
                    
                    .text-slate-500, 
                    .text-gray-500,
                    .text-muted,
                    p,
                    label,
                    .label,
                    .text-black { color: #666666 !important; }
                    
                    /* Global Shadow and Border Removal - Modern Aesthetic */
                    section, .ftco-section, .card, .staff-card, .staff-card:hover {
                        box-shadow: none !important;
                    }
                    /* Remove legacy borders only */
                    .ftco-section, .ftco-footer, .navbar {
                        border: none !important;
                    }
                    .border-bottom { border-bottom: none !important; }

                    /* Responsive Helpers */
                    @media (max-width: 450px) {
                        .xs-hidden { display: none !important; }
                    }
                `}</style>
            )}
            {!hideGlobalElements && <Navbar />}
            <main style={{ flex: 1, paddingTop: '0' }}>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/verify-account" element={<VerifyAccountPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/verify-otp" element={<OTPVerificationPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                    <Route path="/donate" element={<DonationPage />} />

                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/how-we-work" element={<HowWeWorkPage />} />
                    <Route path="/strategic-direction" element={<StrategicDirectionPage />} />
                    <Route path="/impact-stories" element={<ImpactStoriesPage />} />
                    <Route path="/help-faq" element={<HelpFaqPage />} />
                    <Route path="/resources" element={<PublicResourcesPage />} />
                    <Route path="/programs/:id" element={<OurProgramsDetailsPage />} />

                    {/* Admin Dashboard Routes */}
                    <Route element={<ProtectedRoute allowedRoles={[UserType.ADMIN]} />}>
                        <Route element={<RouteGuard />}>
                            {/* Profile completion page */}
                            <Route path="admin/complete-profile" element={<CompleteAdminProfilePage />} />

                            <Route element={<ProfileGuard userType={UserType.ADMIN} />}>
                                <Route path="/admin" element={<DashboardLayout />}>
                                    <Route index element={<AdminDashboardOverview />} />
                                    <Route path="beneficiaries" element={<BeneficiariesPage />} />
                                    <Route path="beneficiaries/add" element={<AddBeneficiaryPage />} />
                                    <Route path="donors" element={<DonorsPage />} />
                                    <Route path="donors/add" element={<AddDonorPage />} />
                                    <Route path="donations" element={<DonationsPage />} />
                                    <Route path="programs" element={<ProgramsPage />} />
                                    <Route path="programs/:id" element={<ProgramDetailsPage />} />
                                    <Route path="financial" element={<FinancialPage />} />
                                    <Route path="reports" element={<ReportsPage />} />
                                    <Route path="users" element={<ManageUsersPage />} />
                                    <Route path="profile" element={<AdminProfilePage />} />
                                </Route>
                            </Route>
                        </Route>
                    </Route>

                    {/* Beneficiary Dashboard Routes */}
                    <Route element={<ProtectedRoute allowedRoles={[UserType.BENEFICIARY]} />}>
                        <Route element={<RouteGuard />}>
                            {/* Profile completion page */}
                            <Route path="beneficiary/complete-profile" element={<CompleteBeneficiaryProfilePage />} />
                            <Route element={<ProfileGuard userType={UserType.BENEFICIARY} />}>

                                {/* <Route path="/dashboard" element={<Navigate to="/beneficiary" replace />} /> */}
                                <Route path="/beneficiary" element={<DashboardLayout />}>
                                    <Route index element={<BeneficiaryDashboard />} />
                                    <Route path="goals" element={<GoalsPage />} />

                                    <Route path="tracking" element={<TrackingPage />} />

                                    {/* Emergency Contacts */}
                                    <Route path="contacts" element={<EmergencyContactsPage />} />

                                    {/* Documents */}
                                    <Route path="documents" element={<DocumentsPage />} />

                                    <Route path="profile" element={<BeneficiaryProfilePage />} />

                                </Route>
                            </Route>
                        </Route>
                    </Route>

                    {/* Donor Dashboard Routes */}
                    <Route element={<ProtectedRoute allowedRoles={[UserType.DONOR]} />}>
                        <Route element={<RouteGuard />}>
                            {/* Profile completion page */}
                            <Route path="donor/complete-profile" element={<CompleteDonorProfilePage />} />
                            <Route element={<ProfileGuard userType={UserType.DONOR} />}>

                                <Route path="/donor" element={<DashboardLayout />}>
                                    <Route index element={<DonorDashboard />} />
                                    <Route path="donations" element={<DonorDonationsPage />} />
                                    <Route path="reports" element={<ImpactReportsPage />} />
                                    <Route path="profile" element={<DonorProfilePage />} />

                                </Route>
                            </Route>
                        </Route>
                    </Route>

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
            {!hideGlobalElements && <Footer />}
            {!hideGlobalElements && <SearchModal />}
            {!hideGlobalElements && <FloatingScrollToTop />}
            {!hideGlobalElements && <Chatbot />}
        </div>
    );
}

function App() {
    return (
        <LanguageProvider>
            <ProfileProvider>
                <AuthProvider>
                    <Toaster position="top-right" richColors />
                    <HashRouter>
                        <ScrollToTop />
                        <AppContent />
                    </HashRouter>
                </AuthProvider>
            </ProfileProvider>
        </LanguageProvider>
    );
}

export default App;
