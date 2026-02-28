import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../lib/auth-context';
import { programsService } from '@/services/programs.service';
import { donationService } from '@/services/donation.service';
import { Program, PaymentMethod, DonationType, RecurringFrequency, Currency } from '@/lib/types';
import { toast } from 'sonner';
import {
    Heart, Check, CheckCircle, ArrowLeft, ArrowRight,
    RefreshCcw, CreditCard, Smartphone, Building2,
    Banknote, Layers, Briefcase, GraduationCap, Loader2
} from 'lucide-react';

// DEVELOPMENT MODE FLAG - Set to true to bypass actual payments
const DEV_MODE = true; // Change to false for production

export function DonationPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { isAuthenticated, user } = useAuth();
    const [step, setStep] = useState(0);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [polling, setPolling] = useState(false);
    const [programs, setPrograms] = useState<Program[]>([]);
    const [loadingPrograms, setLoadingPrograms] = useState(true);
    const [transactionId, setTransactionId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        program: 'general',
        type: 'one-time',
        frequency: 'monthly',
        amount: '',
        customAmount: '10',
        anonymous: false,
        message: '',
        paymentMethod: 'card',
        email: '',
        name: '',
        phoneNumber: '',
        paymentMethodId: ''
    });

    // Check for program ID in URL
    useEffect(() => {
        const programId = searchParams.get('program');
        if (programId) {
            setFormData(prev => ({ ...prev, program: programId }));
            setShowForm(true);
            setStep(1);
        }
    }, [searchParams]);

    // Fetch programs from API
    useEffect(() => {
        const fetchPrograms = async () => {
            try {
                const response = await programsService.getPrograms(1, 10);
                const responseData = response as any;
                const programsData = responseData.data?.data || responseData.data || responseData;
                setPrograms(Array.isArray(programsData) ? programsData : []);
            } catch (error) {
                console.error("Failed to fetch programs", error);
            } finally {
                setLoadingPrograms(false);
            }
        };
        fetchPrograms();
    }, []);

    // Restore state if returning from login
    useEffect(() => {
        const pending = sessionStorage.getItem('pendingDonation');
        if (pending) {
            try {
                const data = JSON.parse(pending);
                setFormData(prev => ({ ...prev, ...data.formData }));
                if (data.step) setStep(data.step);
                if (data.showForm) setShowForm(true);
                sessionStorage.removeItem('pendingDonation');
                toast.info('Welcome back! Resuming your donation.');
            } catch (e) {
                console.error('Failed to parse pending donation', e);
            }
        } else if (isAuthenticated && user) {
            setFormData(prev => ({
                ...prev,
                email: user.email || '',
                name: user.fullName || ''
            }));
        }
    }, [isAuthenticated, user]);

    // Poll for donation status - COMMENTED OUT FOR DEV MODE
    useEffect(() => {
        let interval: NodeJS.Timeout;
        
        if (!DEV_MODE && polling && transactionId) {
            interval = setInterval(async () => {
                try {
                    const status = await donationService.getDonationStatus(transactionId);
                    
                    if (status.paymentStatus === 'completed') {
                        setPolling(false);
                        setLoading(false);
                        setStep(5);
                        toast.success('Donation completed successfully! Thank you for your support.');
                    } else if (status.paymentStatus === 'failed') {
                        setPolling(false);
                        setLoading(false);
                        toast.error('Payment failed. Please try again.');
                    }
                } catch (error) {
                    console.error('Error checking donation status:', error);
                }
            }, 3000);
        }
        
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [polling, transactionId]);

    const totalSteps = 4;
    const progress = (step / totalSteps) * 100;

    const detailedSuggestedAmounts = [25, 50, 100, 250, 500, 1000];

    const getProgramIcon = (category: string) => {
        const icons: Record<string, any> = {
            education: GraduationCap,
            entrepreneurship: Briefcase,
            health: Heart,
            cross_cutting: Layers
        };
        return icons[category] || Heart;
    };

    const getProgramColor = (category: string) => {
        const colors: Record<string, { bg: string; color: string }> = {
            education: { bg: '#fef3c7', color: '#d97706' },
            entrepreneurship: { bg: '#f3e8ff', color: '#7e22ce' },
            health: { bg: '#fee2e2', color: '#dc2626' },
            cross_cutting: { bg: '#f1f5f9', color: '#475569' }
        };
        return colors[category] || { bg: '#f1f5f9', color: '#475569' };
    };

    const handleNext = () => {
        setStep(prev => prev + 1);
        window.scrollTo(0, 0);
    };

    const handleBack = () => {
        setStep(prev => prev - 1);
        window.scrollTo(0, 0);
    };

    // Prepare donation payload based on form data
    const prepareDonationPayload = () => {
        const basePayload: any = {
            amount: selectedAmount,
            currency: Currency.USD,
            donationType: formData.type === 'recurring' ? DonationType.MONTHLY : DonationType.ONE_TIME,
            donorMessage: formData.message || undefined,
            isAnonymous: formData.anonymous,
        };

        // Add program/project
        if (formData.program !== 'general') {
            basePayload.programId = formData.program;
        }

        // Add payment method specific fields
        if (formData.paymentMethod === 'card') {
            basePayload.paymentMethod = PaymentMethod.CARD;
            basePayload.paymentMethodId = formData.paymentMethodId || 'pm_card_visa';
            
            if (formData.type === 'recurring') {
                basePayload.frequency = formData.frequency as RecurringFrequency;
                basePayload.startDate = new Date().toISOString().split('T')[0];
                basePayload.sendReminders = true;
                basePayload.cardDetails = {
                    type: 'card',
                    last4: '4242',
                    brand: 'visa',
                    expiryMonth: 12,
                    expiryYear: 2025
                };
            }
        } else if (formData.paymentMethod === 'mobile') {
            basePayload.paymentMethod = PaymentMethod.MTN_MOBILE_MONEY;
            basePayload.phoneNumber = formData.phoneNumber || '0788123456';
            
            if (formData.type === 'recurring') {
                basePayload.frequency = formData.frequency as RecurringFrequency;
                basePayload.startDate = new Date().toISOString().split('T')[0];
                basePayload.sendReminders = true;
            }
        }

        return basePayload;
    };

    const handleCompleteDonation = async () => {
        if (!isAuthenticated) {
            sessionStorage.setItem('pendingDonation', JSON.stringify({
                formData,
                step: 4,
                showForm: true
            }));
            navigate('/login', { 
                state: { 
                    from: '/donate',
                    message: 'Please log in to complete your donation'
                } 
            });
            return;
        }

        setLoading(true);
        
        try {
            // DEVELOPMENT MODE - Skip actual API call and simulate success
            if (DEV_MODE) {
                console.log('⚡ DEV MODE: Simulating successful donation');
                
                // Simulate a short delay to show loading state
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                // Create a mock transaction ID
                const mockTransactionId = `dev_${Date.now()}_${Math.random().toString(36).substring(7)}`;
                setTransactionId(mockTransactionId);
                
                // Show success message immediately
                toast.success('Donation completed successfully! Thank you for your support.');
                setStep(5);
                setLoading(false);
                return;
            }
            
            // PRODUCTION MODE - Normal flow
            const payload = prepareDonationPayload();
            let response;
            
            if (formData.type === 'recurring') {
                response = await donationService.createRecurring(payload);
            } else {
                response = await donationService.createDonation(payload);
            }
            
            // Extract transaction ID from response
            const newTransactionId = response.transactionId || response.id;
            setTransactionId(newTransactionId);
            
            toast.info(`Payment initiated! Transaction ID: ${newTransactionId}`);
            
            // Start polling for status
            setPolling(true);
            
        } catch (error: any) {
            console.error('Donation failed:', error);
            
            // DEVELOPMENT MODE - Even if API fails, show success
            if (DEV_MODE) {
                console.log('⚡ DEV MODE: API failed but simulating success anyway');
                toast.success('Donation completed successfully! (DEV MODE)');
                setStep(5);
                setLoading(false);
                return;
            }
            
            toast.error(error.response?.data?.message || 'Failed to process donation');
            setLoading(false);
        }
    };

    // Also bypass the status check endpoint for polling
    const getDonationStatus = async (transactionId: string) => {
        if (DEV_MODE) {
            // Always return completed in dev mode
            return { paymentStatus: 'completed' };
        }
        return await donationService.getDonationStatus(transactionId);
    };

    const selectedAmount = parseInt(formData.customAmount || formData.amount || '0');

    const renderSplashScreen = () => (
        <div className="text-center animate-fadeIn py-5">
            {/* ... keep existing splash screen JSX ... */}
            <div className="mb-4 position-relative d-inline-block">
                <div className="bg-white rounded-circle p-4 d-flex align-items-center justify-content-center shadow-lg" style={{ width: '150px', height: '150px', border: '8px solid #f0f7f6' }}>
                    <Heart size={70} color="#4c9789" fill="#4c9789" className="animate-pulse" />
                </div>
                <div className="position-absolute" style={{ bottom: '10px', right: '10px' }}>
                    <div className="bg-primary rounded-circle p-2 shadow-sm" style={{ backgroundColor: '#4c9789' }}>
                        <Check size={20} color="white" strokeWidth={3} />
                    </div>
                </div>
            </div>

            <h1 className="h2 md:display-4 font-weight-bold mb-3 text-dark responsive-title" style={{ letterSpacing: '-1px', color: '#122f2b' }}>Empower a Future Today</h1>
            <p className="lead text-muted mb-4 md:mb-5 mx-auto px-2 responsive-lead" style={{ maxWidth: '800px', lineHeight: '1.6' }}>
                We support girls, caregivers, and youth by promoting education, health, mentorship, and skills development to strengthen families and build resilient communities.
            </p>

            <div className="row justify-content-center mb-5 gx-3">
                <div className="col-md-5">
                    <button
                        className="btn btn-primary w-100 py-3 mt-4 border-0 font-weight-bold" style={{ backgroundColor: '#076c5b', borderRadius: '14px', fontSize: '15px', letterSpacing: '0.5px' }}
                        onClick={() => {
                            setShowForm(true);
                            setStep(1);
                            setFormData({ ...formData, type: 'recurring' });
                        }}
                    > Become a Monthly Partner
                    </button>
                    <p className="small text-muted mt-2">Join our Impact Circle for sustainable change</p>
                </div>
            </div>

            <div className="d-flex justify-content-center align-items-center flex-wrap mt-5 pt-3 border-top" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
                {[
                    { text: 'Tax Deductible', icon: CheckCircle },
                    { text: 'Secure SSL Payment', icon: CheckCircle },
                    { text: '95% to Direct Programs', icon: CheckCircle }
                ].map((item, idx) => (
                    <div key={idx} className="mx-4 my-2 d-flex align-items-center">
                        <item.icon size={20} className="mr-2 text-success" />
                        <span className="font-weight-bold text-dark" style={{ fontSize: '0.95rem' }}>{item.text}</span>
                    </div>
                ))}
            </div>
            <div className="row justify-content-center mb-5 gx-3">
                <div className="col-md-5">
                    <button
                        className="btn btn-white w-100 py-3 mt-4 font-weight-bold" style={{ borderRadius: '14px', fontSize: '15px', color: '#076c5b', letterSpacing: '0.5px' }}
                        onClick={() => window.location.href = '/'}
                    >  Back to Website
                    </button>
                </div>
            </div>
        </div>
    );

    const renderDetailedDonation = () => (
        <div className="row justify-content-center">
            <div className="col-lg-8">
                {/* Progress Bar */}
                <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="text-muted font-weight-bold small">Step {step} of {totalSteps}</span>
                        <span className="text-primary font-weight-bold small" style={{ color: '#4c9789' }}>{Math.round(progress)}% Complete</span>
                    </div>
                    <div className="progress" style={{ height: '6px', background: '#e9ecef', borderRadius: '10px' }}>
                        <div className="progress-bar" style={{
                            width: `${progress}%`,
                            background: '#4c9789',
                            borderRadius: '10px',
                            transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}></div>
                    </div>
                </div>

                <div className="card shadow-sm border-0 rounded-xl overflow-hidden" style={{ borderRadius: '20px' }}>
                    <div className="card-body p-4 p-md-5">
                        {/* Step 1: Program Selection */}
                        {step === 1 && (
                            <div>
                                <h2 className="font-weight-bold mb-2 text-dark" style={{ fontSize: '2rem' }}>Direct Your Impact</h2>
                                <p className="text-muted mb-5" style={{ fontSize: '1.1rem' }}>Choose a specific area to support or donate where it's needed most.</p>

                                <div className="donation-options">
                                    {/* Option: Where Needed Most */}
                                    <div
                                        className={`donation-card p-4 mb-3 rounded-lg cursor-pointer transition-all d-flex align-items-center ${formData.program === 'general' ? 'active-donation-card' : ''}`}
                                        style={{ border: '1px solid #eee', borderRadius: '15px' }}
                                        onClick={() => setFormData({ ...formData, program: 'general' })}
                                    >
                                        <div className="icon-box mr-4 d-flex align-items-center justify-content-center shadow-sm" style={{
                                            width: '60px',
                                            height: '60px',
                                            backgroundColor: '#4c9789',
                                            borderRadius: '15px'
                                        }}>
                                            <Heart size={30} color="white" fill="white" />
                                        </div>
                                        <div className="flex-grow-1">
                                            <h5 className="font-weight-bold mb-1 text-dark">Where Needed Most</h5>
                                            <p className="text-muted mb-0 small" style={{ fontSize: '0.95rem' }}>Allow LCEO to direct your gift to areas of highest priority.</p>
                                        </div>
                                        <div className="ml-3">
                                            <div className={`rounded-circle border d-flex align-items-center justify-content-center ${formData.program === 'general' ? 'bg-primary border-primary' : ''}`} style={{ width: '24px', height: '24px' }}>
                                                {formData.program === 'general' && <Check size={14} color="white" strokeWidth={4} />}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Real programs from API */}
                                    {loadingPrograms ? (
                                        <div className="text-center py-4">
                                            <div className="spinner-border text-primary" role="status">
                                                <span className="sr-only">Loading...</span>
                                            </div>
                                        </div>
                                    ) : programs.length === 0 ? (
                                        <div className="text-center py-4 text-muted">
                                            No programs available at the moment.
                                        </div>
                                    ) : (
                                        programs.map((program) => {
                                            const Icon = getProgramIcon(program.category);
                                            const colors = getProgramColor(program.category);
                                            
                                            return (
                                                <div
                                                    key={program.id}
                                                    className={`donation-card p-4 mb-3 rounded-lg cursor-pointer transition-all d-flex align-items-center ${formData.program === program.id ? 'active-donation-card' : ''}`}
                                                    style={{ border: '1px solid #eee', borderRadius: '15px' }}
                                                    onClick={() => setFormData({ ...formData, program: program.id })}
                                                >
                                                     {program.logo && (
                                                            <img 
                                                                src={program.logo} 
                                                                alt={program.name.en}
                                                                style={{ 
                                                                    width: '30px', 
                                                                    height: '30px', 
                                                                    objectFit: 'cover',
                                                                    borderRadius: '50%',
                                                                    marginRight: '8px',
                                                                    display: 'inline-block'
                                                                }} 
                                                            />
                                                        )}
                                                    <div className="flex-grow-1">
                                                        <h5 className="font-weight-bold mb-1 text-dark">{program.name.en}</h5>
                                                        <p className="text-muted mb-0 small" style={{ fontSize: '0.9rem' }}>
                                                            {program.description.en.replace(/<[^>]*>/g, '').substring(0, 100)}...
                                                        </p>
                                                    </div>
                                                    <div className="ml-3">
                                                        <div className={`rounded-circle border d-flex align-items-center justify-content-center ${formData.program === program.id ? 'bg-primary border-primary' : ''}`} style={{ width: '24px', height: '24px' }}>
                                                            {formData.program === program.id && <Check size={14} color="white" strokeWidth={4} />}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>

                                <div className="d-flex justify-content-between mt-5" style={{ gap: '12px' }}>
                                    <button
                                        className="btn btn-white py-3 border-0 font-weight-bold d-flex align-items-center justify-content-center"
                                        style={{ borderRadius: '14px', fontSize: '15px', color: '#076c5b', letterSpacing: '0.5px', flex: 1 }}
                                        onClick={() => {
                                            setShowForm(false);
                                            setStep(0);
                                        }}
                                    >
                                        <ArrowLeft size={18} className="mr-2" /> Back to Splash
                                    </button>
                                    <button
                                        className="btn btn-primary py-3 border-0 font-weight-bold d-flex align-items-center justify-content-center"
                                        style={{ backgroundColor: '#076c5b', borderRadius: '14px', fontSize: '15px', letterSpacing: '0.5px', flex: 1 }}
                                        onClick={handleNext}
                                    >
                                        Next Step <ArrowRight size={18} className="ml-2" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Donation Type */}
                        {step === 2 && (
                            <div className="animate-fadeIn">
                                <div className="text-center mb-5">
                                    <h2 className="font-weight-bold text-dark mb-2" style={{ fontSize: '2rem' }}>Choose Your Donation Type</h2>
                                    <p className="text-muted" style={{ fontSize: '1.1rem' }}>Monthly giving creates lasting change - join our Impact Circle</p>
                                </div>

                                <div className="row">
                                    {/* Monthly Giving Card */}
                                    <div className="col-md-6 mb-4">
                                        <div
                                            className={`card h-100 cursor-pointer transition-all border-0 shadow-sm position-relative ${formData.type === 'recurring' ? 'active-donation-card' : ''}`}
                                            style={{
                                                borderRadius: '20px',
                                                border: formData.type === 'recurring' ? '2px solid #4c9789' : '1px solid #eee',
                                                backgroundColor: formData.type === 'recurring' ? '#f0f7f6' : '#fff'
                                            }}
                                            onClick={() => setFormData({ ...formData, type: 'recurring' })}
                                        >
                                            <div className="position-absolute" style={{ top: '-12px', right: '20px', zIndex: 10 }}>
                                                <span className="badge badge-primary px-3 py-2 shadow-sm rounded-pill" style={{ backgroundColor: '#4c9789', fontWeight: 'bold' }}>Recommended</span>
                                            </div>
                                            <div className="card-body p-4">
                                                <div className="d-flex align-items-center mb-3">
                                                    <div className="bg-primary-light rounded-circle p-3 mr-3 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(76, 151, 137, 0.1)', color: '#4c9789', width: '60px', height: '60px', borderRadius: '15px' }}>
                                                        <RefreshCcw size={28} />
                                                    </div>
                                                    <h4 className="font-weight-bold mb-0">Monthly Giving</h4>
                                                </div>
                                                <p className="text-muted small mb-4">Join our Impact Circle with recurring monthly support.</p>
                                                <ul className="list-unstyled mb-0">
                                                    <li className="d-flex align-items-center mb-2 small font-weight-bold text-dark">
                                                        <Check size={16} className="text-success mr-2" /> Monthly impact reports
                                                    </li>
                                                    <li className="d-flex align-items-center mb-2 small font-weight-bold text-dark">
                                                        <Check size={16} className="text-success mr-2" /> Cancel anytime
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    {/* One-Time Gift Card */}
                                    <div className="col-md-6 mb-4">
                                        <div
                                            className={`card h-100 cursor-pointer transition-all border-0 shadow-sm ${formData.type === 'one-time' ? 'active-donation-card' : ''}`}
                                            style={{
                                                borderRadius: '20px',
                                                border: formData.type === 'one-time' ? '2px solid #122f2b' : '1px solid #eee',
                                                backgroundColor: formData.type === 'one-time' ? '#f8f9fa' : '#fff'
                                            }}
                                            onClick={() => setFormData({ ...formData, type: 'one-time' })}
                                        >
                                            <div className="card-body p-4">
                                                <div className="d-flex align-items-center mb-3">
                                                    <div className="bg-secondary-light rounded-circle p-3 mr-3 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(18, 47, 43, 0.1)', color: '#122f2b', width: '60px', height: '60px', borderRadius: '15px' }}>
                                                        <Heart size={28} />
                                                    </div>
                                                    <h4 className="font-weight-bold mb-0">One-Time Gift</h4>
                                                </div>
                                                <p className="text-muted small mb-4">Make a single donation to support our programs.</p>
                                                <ul className="list-unstyled mb-0">
                                                    <li className="d-flex align-items-center mb-2 small font-weight-bold text-dark">
                                                        <Check size={16} className="text-success mr-2" /> Immediate impact
                                                    </li>
                                                    <li className="d-flex align-items-center mb-2 small font-weight-bold text-dark">
                                                        <Check size={16} className="text-success mr-2" /> Tax-deductible receipt
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {formData.type === 'recurring' && (
                                    <div className="mt-4 animate-fadeIn">
                                        <div className="d-flex justify-content-center flex-wrap gap-3">
                                            {['Monthly', 'Quarterly', 'Yearly'].map((f) => (
                                                <button
                                                    key={f}
                                                    className={`btn px-4 py-3 font-weight-bold transition-all shadow-sm ${formData.frequency === f.toLowerCase() ? 'btn-primary' : 'btn-outline-primary'}`}
                                                    style={{
                                                        borderColor: '#4c9789',
                                                        backgroundColor: formData.frequency === f.toLowerCase() ? '#4c9789' : 'transparent',
                                                        color: formData.frequency === f.toLowerCase() ? '#fff' : '#4c9789',
                                                        borderRadius: '12px',
                                                        minWidth: '120px'
                                                    }}
                                                    onClick={() => setFormData({ ...formData, frequency: f.toLowerCase() })}
                                                >
                                                    {f}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="d-flex justify-content-between mt-5" style={{ gap: '12px' }}>
                                    <button
                                        className="btn btn-white py-3 border-0 font-weight-bold d-flex align-items-center justify-content-center"
                                        style={{ borderRadius: '14px', fontSize: '15px', color: '#076c5b', letterSpacing: '0.5px', flex: 1 }}
                                        onClick={handleBack}
                                    >
                                        <ArrowLeft size={18} className="mr-2" /> Back
                                    </button>
                                    <button
                                        className="btn btn-primary py-3 border-0 font-weight-bold d-flex align-items-center justify-content-center"
                                        style={{ backgroundColor: '#076c5b', borderRadius: '14px', fontSize: '15px', letterSpacing: '0.5px', flex: 1 }}
                                        onClick={handleNext}
                                    >
                                        Continue <ArrowRight size={18} className="ml-2" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Donation Amount */}
                        {step === 3 && (
                            <div className="animate-fadeIn">
                                <div className="text-center mb-5">
                                    <h2 className="font-weight-bold text-dark mb-2" style={{ fontSize: '2rem' }}>Choose Your Donation Amount</h2>
                                    <p className="text-muted" style={{ fontSize: '1.1rem' }}>See the immediate impact of your contribution</p>
                                </div>

                                <div className="row">
                                    {detailedSuggestedAmounts.map(amt => (
                                        <div className="col-6 col-md-4 mb-3" key={amt}>
                                            <button
                                                className={`btn btn-block py-4 font-weight-bold transition-all shadow-sm ${selectedAmount === amt ? 'btn-primary' : 'btn-light'}`}
                                                style={{
                                                    borderRadius: '15px',
                                                    backgroundColor: selectedAmount === amt ? '#4c9789' : '#fff',
                                                    borderColor: selectedAmount === amt ? '#4c9789' : '#eee',
                                                    color: selectedAmount === amt ? '#fff' : '#444',
                                                    fontSize: '1.25rem'
                                                }}
                                                onClick={() => setFormData({ ...formData, amount: '', customAmount: amt.toString() })}
                                            >
                                                ${amt}
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div className="form-group mt-4 px-0">
                                    <label className="font-weight-bold text-muted small text-uppercase mb-2">Or enter custom amount</label>
                                    <div className="position-relative">
                                        <div className="position-absolute h-100 d-flex align-items-center px-4 text-muted" style={{ left: 0, top: 0, zIndex: 10, fontSize: '1.2rem' }}>$</div>
                                        <input
                                            type="number"
                                            className="form-control form-control-lg bg-light border-0 py-4 shadow-sm"
                                            placeholder="Enter amount"
                                            style={{ borderRadius: '15px', fontSize: '1.2rem', paddingLeft: '3rem' }}
                                            value={formData.customAmount}
                                            onChange={e => setFormData({ ...formData, customAmount: e.target.value, amount: '' })}
                                        />
                                    </div>
                                </div>

                                {selectedAmount > 0 && (
                                    <div className="mt-4 p-4 rounded-xl shadow-sm animate-fadeIn" style={{ backgroundColor: '#f0f7f6', border: '1px solid #e0eeeb' }}>
                                        <h5 className="font-weight-bold text-dark mb-4">Your Impact</h5>
                                        <div className="space-y-4">
                                            <div className="d-flex align-items-center mb-3">
                                                <div className="bg-white rounded-xl shadow-sm d-flex align-items-center justify-content-center mr-3" style={{ width: '50px', height: '50px', backgroundColor: 'rgba(76, 151, 137, 0.1)' }}>
                                                    <Layers size={24} color="#4c9789" />
                                                </div>
                                                <div>
                                                    <div className="font-weight-bold text-dark" style={{ fontSize: '1.1rem' }}>{Math.max(1, Math.floor(selectedAmount / 25))} girls</div>
                                                    <div className="small text-muted">School supplies for full year</div>
                                                </div>
                                            </div>
                                            <div className="d-flex align-items-center mb-3">
                                                <div className="bg-white rounded-xl shadow-sm d-flex align-items-center justify-content-center mr-3" style={{ width: '50px', height: '50px', backgroundColor: 'rgba(18, 47, 43, 0.1)' }}>
                                                    <RefreshCcw size={24} color="#122f2b" />
                                                </div>
                                                <div>
                                                    <div className="font-weight-bold text-dark" style={{ fontSize: '1.1rem' }}>{Math.max(1, Math.floor(selectedAmount / 50))} months</div>
                                                    <div className="small text-muted">Of mentorship support</div>
                                                </div>
                                            </div>
                                            <div className="d-flex align-items-center">
                                                <div className="bg-white rounded-xl shadow-sm d-flex align-items-center justify-content-center mr-3" style={{ width: '50px', height: '50px', backgroundColor: 'rgba(217, 119, 6, 0.1)' }}>
                                                    <Briefcase size={24} color="#d97706" />
                                                </div>
                                                <div>
                                                    <div className="font-weight-bold text-dark" style={{ fontSize: '1.1rem' }}>{Math.max(1, Math.floor(selectedAmount / 200))} young women</div>
                                                    <div className="small text-muted">Business seed capital</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="mt-5 p-4 rounded-xl shadow-sm" style={{ backgroundColor: '#fff', border: '1px solid #eee' }}>
                                    <div className="custom-control custom-checkbox mb-4">
                                        <input
                                            type="checkbox"
                                            className="custom-control-input"
                                            id="anonymousCheck"
                                            checked={formData.anonymous}
                                            onChange={e => setFormData({ ...formData, anonymous: e.target.checked })}
                                        />
                                        <label className="custom-control-label font-weight-bold text-dark cursor-pointer d-flex align-items-center" htmlFor="anonymousCheck">
                                            Make my donation anonymous
                                        </label>
                                    </div>

                                    <div className="form-group mb-0">
                                        <label className="font-weight-bold text-dark small text-uppercase mb-2">Personal Message (Optional)</label>
                                        <textarea
                                            className="form-control bg-light border-0 py-3 px-3"
                                            rows={3}
                                            placeholder="Share a message with the LCEO community..."
                                            style={{ borderRadius: '12px', fontSize: '0.95rem', resize: 'none' }}
                                            value={formData.message}
                                            onChange={e => setFormData({ ...formData, message: e.target.value })}
                                        ></textarea>
                                    </div>
                                </div>

                                <div className="d-flex justify-content-between mt-5" style={{ gap: '12px' }}>
                                    <button
                                        className="btn btn-white py-3 border-0 font-weight-bold d-flex align-items-center justify-content-center"
                                        style={{ borderRadius: '14px', fontSize: '15px', color: '#076c5b', letterSpacing: '0.5px', flex: 1 }}
                                        onClick={handleBack}
                                    >
                                        <ArrowLeft size={18} className="mr-2" /> Back
                                    </button>
                                    <button
                                        className="btn btn-primary py-3 border-0 font-weight-bold d-flex align-items-center justify-content-center"
                                        style={{ backgroundColor: '#076c5b', borderRadius: '14px', fontSize: '15px', letterSpacing: '0.5px', flex: 1 }}
                                        onClick={handleNext}
                                        disabled={!selectedAmount}
                                    >
                                        Continue to Payment <ArrowRight size={18} className="ml-2" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Payment */}
                        {step === 4 && (
                            <div>
                                <h3 className="font-weight-bold mb-4 text-center">Payment Details</h3>
                                <div className="p-4 rounded-xl mb-4 text-center" style={{ backgroundColor: '#f8f9fa', border: '1px dashed #ddd' }}>
                                    <div className="h2 font-weight-bold mb-1" style={{ color: '#122f2b' }}>${selectedAmount}</div>
                                    <div className="text-muted font-weight-bold small text-uppercase">
                                        {formData.type === 'recurring' ? formData.frequency.charAt(0).toUpperCase() + formData.frequency.slice(1) : 'One-time'} Contribution
                                    </div>
                                    <div className="small text-muted mt-1">
                                        for {formData.program === 'general' 
                                            ? 'Where Needed Most' 
                                            : programs.find(p => p.id === formData.program)?.name.en || 'General Fund'}
                                    </div>
                                </div>

                                <div className="form-group mb-4">
                                    <label className="font-weight-bold mb-3 text-muted small text-uppercase">Payment Method</label>
                                    <div className="row mx-n2">
                                        {[
                                            { id: 'card', name: 'Credit Card', icon: CreditCard, color: '#4c9789' },
                                            { id: 'mobile', name: 'Mobile Money', icon: Smartphone, color: '#ffcc00' }
                                        ].map(method => (
                                            <div className="col-6 mb-3 px-2" key={method.id}>
                                                <div
                                                    className={`card h-100 cursor-pointer text-center py-3 px-2 transition-all ${formData.paymentMethod === method.id ? 'active-donation-card' : ''}`}
                                                    style={{ border: formData.paymentMethod === method.id ? `2px solid ${method.color}` : '1px solid #dee2e6', borderRadius: '12px' }}
                                                    onClick={() => setFormData({ ...formData, paymentMethod: method.id })}
                                                >
                                                    <div className="mb-2" style={{ color: method.color }}>
                                                        <method.icon size={28} />
                                                    </div>
                                                    <h6 className="font-weight-bold mb-0" style={{ fontSize: '0.85rem' }}>{method.name}</h6>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Conditional fields based on payment method */}
                                {formData.paymentMethod === 'card' && (
                                    <div className="mb-4">
                                        <label className="font-weight-bold mb-2 text-muted small text-uppercase">Card Details</label>
                                        <input
                                            type="text"
                                            className="form-control form-control-lg mb-2"
                                            placeholder="Card Number"
                                            value={formData.paymentMethodId}
                                            onChange={e => setFormData({ ...formData, paymentMethodId: e.target.value })}
                                        />
                                        <div className="text-muted small">
                                            For testing: pm_card_visa, pm_card_mastercard
                                        </div>
                                    </div>
                                )}

                                {formData.paymentMethod === 'mobile' && (
                                    <div className="mb-4">
                                        <label className="font-weight-bold mb-2 text-muted small text-uppercase">Phone Number</label>
                                        <input
                                            type="tel"
                                            className="form-control form-control-lg"
                                            placeholder="0788123456"
                                            value={formData.phoneNumber}
                                            onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                                        />
                                    </div>
                                )}

                                <div className="form-row">
                                    <div className="col-md-6 mb-3">
                                        <input 
                                            type="text" 
                                            className="form-control form-control-lg border-light py-4" 
                                            placeholder="Full Name" 
                                            style={{ borderRadius: '10px' }}
                                            value={formData.name} 
                                            onChange={e => setFormData({ ...formData, name: e.target.value })} 
                                            required
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <input 
                                            type="email" 
                                            className="form-control form-control-lg border-light py-4" 
                                            placeholder="Email Address" 
                                            style={{ borderRadius: '10px' }}
                                            value={formData.email} 
                                            onChange={e => setFormData({ ...formData, email: e.target.value })} 
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Authentication Warning */}
                                {!isAuthenticated && (
                                    <div className="alert alert-info d-flex align-items-center mb-4" style={{ backgroundColor: '#e8f4fd', border: 'none', borderRadius: '12px' }}>
                                        <div className="mr-3">
                                            <div className="bg-white rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                                                <Heart size={20} color="#4c9789" />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="font-weight-bold mb-1" style={{ color: '#0c5460' }}>You'll need to log in to complete your donation</p>
                                            <p className="small mb-0 text-muted">Don't worry, your donation details will be saved.</p>
                                        </div>
                                    </div>
                                )}

                                {/* Processing State */}
                                {loading && (
                                    <div className="text-center mb-4 p-4 bg-light rounded-lg">
                                        <Loader2 className="spinner mx-auto mb-3" size={40} color="#4c9789" />
                                        <p className="font-weight-bold">Processing your donation...</p>
                                        {transactionId && (
                                            <p className="small text-muted">Transaction ID: {transactionId}</p>
                                        )}
                                    </div>
                                )}

                                <div className="d-flex justify-content-between mt-5" style={{ gap: '12px' }}>
                                    <button
                                        className="btn btn-white py-3 border-0 font-weight-bold d-flex align-items-center justify-content-center"
                                        style={{ borderRadius: '14px', fontSize: '15px', color: '#076c5b', letterSpacing: '0.5px', flex: 1 }}
                                        onClick={handleBack} 
                                        disabled={loading}
                                    >
                                        <ArrowLeft size={18} className="mr-2" /> Back
                                    </button>
                                    <button
                                        className="btn btn-primary py-3 border-0 font-weight-bold d-flex align-items-center justify-content-center"
                                        style={{ backgroundColor: '#076c5b', borderRadius: '14px', fontSize: '15px', letterSpacing: '0.5px', flex: 1 }}
                                        onClick={handleCompleteDonation} 
                                        disabled={!formData.paymentMethod || !formData.name || !formData.email || loading}
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 size={18} className="mr-2 animate-spin" />
                                                Processing...
                                            </>
                                        ) : !isAuthenticated ? (
                                            'Continue to Login'
                                        ) : (
                                            'Complete Donation'
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: '#ffffff', padding: '110px 15px 80px' }}>
            <style>{`
                .donation-card {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .donation-card:hover {
                    border-color: #4c9789 !important;
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(0,0,0,0.06);
                }
                .active-donation-card {
                    border-color: #4c9789 !important;
                    background-color: #f0f7f6 !important;
                    box-shadow: 0 4px 12px rgba(76, 151, 137, 0.12);
                }
                .rounded-xl {
                    border-radius: 20px !important;
                }
                .cursor-pointer {
                    cursor: pointer;
                }
                .gap-3 { gap: 1rem; }
                .animate-fadeIn {
                    animation: fadeIn 0.8s ease-out;
                }
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
            <div className="container">
                <div className="row justify-content-center">
                    <div className={step !== 5 && showForm ? "col-xl-10" : "col-lg-12"}>
                        {!showForm ? (
                            renderSplashScreen()
                        ) : step === 5 ? (
                            <div className="animate-fadeIn">
                                <div className="card shadow-sm border-0 rounded-xl overflow-hidden p-5">
                                    <div className="text-center py-4">
                                        <div className="mb-4">
                                            <div className="bg-success-light rounded-circle d-inline-flex p-4 shadow-sm" style={{ backgroundColor: '#e6f4ea' }}>
                                                <CheckCircle size={60} className="text-success" />
                                            </div>
                                        </div>
                                        <h2 className="font-weight-bold mb-3" style={{ fontSize: '2rem' }}>Thank You for Your Support!</h2>
                                        <p className="text-muted mb-4">Your donation of ${selectedAmount} will make a lasting impact.</p>
                                        <p className="text-muted small mb-4">A receipt has been sent to {formData.email}</p>
                                        <button
                                            className="btn btn-primary px-5 py-3 font-weight-bold"
                                            style={{ backgroundColor: '#4c9789', border: 'none', borderRadius: '10px' }}
                                            onClick={() => navigate('/')}
                                        >
                                            Return Home
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            renderDetailedDonation()
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}