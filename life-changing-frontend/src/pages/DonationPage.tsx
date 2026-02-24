import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth-context';
import { toast } from 'sonner';
import {
    Heart, Check, CheckCircle, ArrowLeft, ArrowRight,
    RefreshCcw, CreditCard, Smartphone, Building2,
    Banknote, Layers, Briefcase
} from 'lucide-react';

export function DonationPage() {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const [showForm, setShowForm] = useState(false);
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        program: 'general',
        type: 'one-time',
        frequency: 'monthly',
        amount: '10',
        customAmount: '',
        anonymous: false,
        message: '',
        paymentMethod: 'card',
        email: '', // will be pre-filled
        name: '',  // will be pre-filled
    });

    // Restore state if returning from login
    useEffect(() => {
        const pending = sessionStorage.getItem('pendingDonation');
        if (pending) {
            try {
                const data = JSON.parse(pending);
                setFormData(prev => ({ ...prev, ...data.formData }));
                if (data.step) setStep(data.step);
                if (data.showForm) setShowForm(true); // Ensure form is shown
                sessionStorage.removeItem('pendingDonation'); // Clear it
                toast.info('Welcome back! Resuming your donation.');
            } catch (e) {
                console.error('Failed to parse pending donation', e);
            }
        } else if (isAuthenticated && user) {
            // Pre-fill user details if not restoring
            setFormData(prev => ({
                ...prev,
                email: user.email || '',
                name: user.fullName || ''
            }));
        }
    }, [isAuthenticated, user]);

    const totalSteps = 4;
    const progress = (step / totalSteps) * 100;

    const detailedSuggestedAmounts = [25, 50, 100, 250, 500, 1000];

    const mockPrograms = [
        { id: 'education', name: { en: 'Education For All' }, description: { en: 'Scholarships and school supplies for vulnerable children.' } },
        { id: 'health', name: { en: 'Community Health' }, description: { en: 'Medical insurance and hygiene kits for families.' } },
        { id: 'business', name: { en: 'IkiraroBiz Impact' }, description: { en: 'Micro-loans and training for young entrepreneurs.' } }
    ];

    const handleNext = () => {
        // Intercept before Payment Step (Simulation: moving from Step 3 to 4)
        // Adjust logic based on viewType if needed, but Step 3->4 is common in detailed view
        // In Quick View, there isn't a multi-step wizard in the same way, 
        // but 'Continue to Payment' (step 3) -> Step 4 is in Detail view.
        // Let's check logic:
        // Quick view has "Donate Now" -> calls `handleCompleteDonation` directly in current code?
        // No, Quick view "Donate Now" button at line 261 calls `handleCompleteDonation`.

        // Detailed View uses `handleNext`.

        // if (viewType === 'detailed' && step === 3)
        if (step === 3) {
            if (!isAuthenticated) {
                sessionStorage.setItem('pendingDonation', JSON.stringify({
                    formData,
                    step: 4,
                    viewType: 'detailed',
                    showForm: true
                }));
                navigate('/login', { state: { from: '/donate' } });
                return;
            }
        }

        setStep(prev => prev + 1);
        window.scrollTo(0, 0);
    };

    const handleCompleteDonation = () => {
        // For Quick View or Final Step of Detailed View
        if (!isAuthenticated) {
            sessionStorage.setItem('pendingDonation', JSON.stringify({
                formData,
                // step: viewType === 'detailed' ? 5 : 1, // If quick view, maybe just keep them there? Quick view doesn't have steps.
                // viewType,
                showForm: true
            }));
            navigate('/login', { state: { from: '/donate' } });
            return;
        }

        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            toast.success('Donation processed successfully! Thank you for your support.');
            setStep(5); // Show success step for both views
        }, 2000);
    };

    const handleBack = () => {
        setStep(prev => prev - 1);
        window.scrollTo(0, 0);
    };

    const selectedAmount = parseInt(formData.amount || formData.customAmount || '0');

    const renderSplashScreen = () => (
        <div className="text-center animate-fadeIn py-5">
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
                {/* Progress */}
                <div className="mb-2">
                    <div className="d-flex justify-content-between align-items-center mb-1">
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
                    <div className="card-body p-4">

                        {step === 0 && (
                            <div>
                                <div className="text-center animate-fadeIn py-5">
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

                                </div>

                                <div className="d-flex justify-content-between mt-5" style={{ gap: '12px' }}>
                                    <button
                                        className="btn btn-white py-3 mt-4 border-0 font-weight-bold d-flex align-items-center justify-content-center"
                                        style={{ borderRadius: '14px', fontSize: '15px', color: '#076c5b', letterSpacing: '0.5px', flex: 1 }}
                                        onClick={() => window.location.href = '/'}
                                    >
                                        <ArrowLeft size={18} className="mr-2" /> Back to the web site
                                    </button>
                                    <button
                                        className="btn btn-primary py-3 mt-4 border-0 font-weight-bold d-flex align-items-center justify-content-center"
                                        style={{ backgroundColor: '#076c5b', borderRadius: '14px', fontSize: '15px', letterSpacing: '0.5px', flex: 1 }}
                                        onClick={handleNext}
                                    >
                                        Become a Monthly Partner <ArrowRight size={18} className="ml-2" />
                                    </button>

                                </div>
                            </div>
                        )}

                        {/* Step 1: Program Selection */}
                        {step === 1 && (
                            <div>
                                <h2 className="font-weight-bold mb-2 text-dark" style={{ fontSize: '2rem' }}>Direct Your Impact</h2>
                                <p className="text-muted mb-5" style={{ fontSize: '1.1rem' }}>Choose a specific area to support or donate where it's needed most.</p>

                                <div className="donation-options">
                                    {/* Option: Where Needed Most */}
                                    <div
                                        className={`donation-card p-4 mb-3 rounded-lg cursor-pointer transition-all d-flex align-items-center ${formData.program === 'general' ? 'active-donation-card' : ''}`}
                                        style={{
                                            border: '1px solid #eee',
                                            borderRadius: '15px'
                                        }}
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

                                    {mockPrograms.map((p, idx) => {
                                        const styles = [
                                            { bg: '#fef3c7', icon: Layers, color: '#d97706' },
                                            { bg: '#f3e8ff', icon: Briefcase, color: '#7e22ce' },
                                            { bg: '#fee2e2', icon: Heart, color: '#dc2626' }
                                        ][idx] || { bg: '#f1f5f9', icon: CheckCircle, color: '#475569' };

                                        return (
                                            <div
                                                key={p.id}
                                                className={`donation-card p-4 mb-3 rounded-lg cursor-pointer transition-all d-flex align-items-center ${formData.program === p.id ? 'active-donation-card' : ''}`}
                                                style={{ border: '1px solid #eee', borderRadius: '15px' }}
                                                onClick={() => setFormData({ ...formData, program: p.id })}
                                            >
                                                <div className="icon-box mr-4 d-flex align-items-center justify-content-center shadow-sm" style={{
                                                    width: '60px',
                                                    height: '60px',
                                                    backgroundColor: styles.bg,
                                                    borderRadius: '15px'
                                                }}>
                                                    <styles.icon size={28} color={styles.color} />
                                                </div>
                                                <div className="flex-grow-1">
                                                    <h5 className="font-weight-bold mb-1 text-dark">{p.name.en}</h5>
                                                    <p className="text-muted mb-0 small" style={{ fontSize: '0.9rem' }}>{p.description.en}</p>
                                                </div>
                                                <div className="ml-3">
                                                    <div className={`rounded-circle border d-flex align-items-center justify-content-center ${formData.program === p.id ? 'bg-primary border-primary' : ''}`} style={{ width: '24px', height: '24px' }}>
                                                        {formData.program === p.id && <Check size={14} color="white" strokeWidth={4} />}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="d-flex justify-content-between mt-5" style={{ gap: '12px' }}>
                                    <button
                                        className="btn btn-white py-3 mt-4 border-0 font-weight-bold d-flex align-items-center justify-content-center"
                                        style={{ borderRadius: '14px', fontSize: '15px', color: '#076c5b', letterSpacing: '0.5px', flex: 1 }}
                                        // onClick={() => window.location.href = '/'}
                                        onClick={handleBack}
                                    >
                                        <ArrowLeft size={18} className="mr-2" /> Back
                                    </button>
                                    <button
                                        className="btn btn-primary py-3 mt-4 border-0 font-weight-bold d-flex align-items-center justify-content-center"
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
                                                <p className="text-muted small mb-4">Join our Impact Circle with recurring monthly support. Predictable funding allows us to plan long-term programs.</p>

                                                <ul className="list-unstyled mb-0">
                                                    <li className="d-flex align-items-center mb-2 small font-weight-bold text-dark">
                                                        <Check size={16} className="text-success mr-2" /> Monthly impact reports
                                                    </li>
                                                    <li className="d-flex align-items-center mb-2 small font-weight-bold text-dark">
                                                        <Check size={16} className="text-success mr-2" /> Exclusive beneficiary updates
                                                    </li>
                                                    <li className="d-flex align-items-center mb-0 small font-weight-bold text-dark">
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
                                                <p className="text-muted small mb-4">Make a single donation to support our programs. Every contribution makes a difference.</p>

                                                <ul className="list-unstyled mb-0">
                                                    <li className="d-flex align-items-center mb-2 small font-weight-bold text-dark">
                                                        <Check size={16} className="text-success mr-2" /> Immediate impact
                                                    </li>
                                                    <li className="d-flex align-items-center mb-2 small font-weight-bold text-dark">
                                                        <Check size={16} className="text-success mr-2" /> Tax-deductible receipt
                                                    </li>
                                                    <li className="d-flex align-items-center mb-0 small font-weight-bold text-dark">
                                                        <Check size={16} className="text-success mr-2" /> Optional email updates
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
                                        className="btn btn-white py-3 mt-4 border-0 font-weight-bold d-flex align-items-center justify-content-center"
                                        style={{ borderRadius: '14px', fontSize: '15px', color: '#076c5b', letterSpacing: '0.5px', flex: 1 }}
                                        // onClick={() => window.location.href = '/'}
                                        onClick={handleBack}
                                    >
                                        <ArrowLeft size={18} className="mr-2" /> Back
                                    </button>
                                    <button
                                        className="btn btn-primary py-3 mt-4 border-0 font-weight-bold d-flex align-items-center justify-content-center"
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
                                        className="btn btn-white py-3 mt-4 border-0 font-weight-bold d-flex align-items-center justify-content-center"
                                        style={{ borderRadius: '14px', fontSize: '15px', color: '#076c5b', letterSpacing: '0.5px', flex: 1 }}
                                        onClick={handleBack}
                                    >
                                        <ArrowLeft size={18} className="mr-2" /> Back
                                    </button>

                                    <button
                                        className="btn btn-primary py-3 mt-4 border-0 font-weight-bold d-flex align-items-center justify-content-center"
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
                                    <div className="text-muted font-weight-bold small text-uppercase">{formData.type === 'recurring' ? 'Monthly' : 'One-time'} Contribution</div>
                                    <div className="small text-muted mt-1">for {formData.program === 'general' ? 'Where Needed Most' : mockPrograms.find(p => p.id === formData.program)?.name.en}</div>
                                </div>

                                <div className="form-group mb-4">
                                    <label className="font-weight-bold mb-3 text-muted small text-uppercase">Payment Method</label>
                                    <div className="row mx-n2">
                                        {[
                                            { id: 'card', name: 'Credit Card', icon: CreditCard, color: '#4c9789' },
                                            { id: 'mobile', name: 'Mobile Money', icon: Smartphone, color: '#ffcc00' },
                                            { id: 'bank', name: 'Bank Transfer', icon: Building2, color: '#28a745' },
                                            { id: 'cash', name: 'Cash', icon: Banknote, color: '#6c757d' }
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

                                <div className="form-row">
                                    <div className="col-md-6 mb-3">
                                        <input type="text" className="form-control form-control-lg border-light py-4" placeholder="Full Name" style={{ borderRadius: '10px' }}
                                            value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <input type="email" className="form-control form-control-lg border-light py-4" placeholder="Email Address" style={{ borderRadius: '10px' }}
                                            value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                    </div>
                                </div>

                                <div className="d-flex justify-content-between mt-5" style={{ gap: '12px' }}>
                                    <button
                                        className="btn btn-white py-3 mt-4 border-0 font-weight-bold d-flex align-items-center justify-content-center"
                                        style={{ borderRadius: '14px', fontSize: '15px', color: '#076c5b', letterSpacing: '0.5px', flex: 1 }}
                                        onClick={handleBack} disabled={loading}
                                    >
                                        <ArrowLeft size={18} className="mr-2" /> Back
                                    </button>

                                    <button
                                        className="btn btn-primary py-3 mt-4 border-0 font-weight-bold d-flex align-items-center justify-content-center"
                                        style={{ backgroundColor: '#076c5b', borderRadius: '14px', fontSize: '15px', letterSpacing: '0.5px', flex: 1 }}
                                        onClick={handleCompleteDonation} disabled={!formData.paymentMethod || !formData.name || !formData.email || loading}>

                                        {loading ? 'Processing...' : 'Finish Donation'}
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
                .no-gutters {
                    margin-right: 0;
                    margin-left: 0;
                }
                .no-gutters > [class*="col-"] {
                    padding-right: 0;
                    padding-left: 0;
                }
                .z-index-1 { z-index: 1; }
                .space-y-4 > * + * { margin-top: 1.5rem; }
                .animate-fadeIn {
                    animation: fadeIn 0.8s ease-out;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-pulse {
                    animation: pulse 2s infinite;
                }
                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1); }
                }
                .hover-scale {
                    transition: all 0.3s ease;
                }
                .hover-scale:hover {
                    transform: scale(1.02);
                    box-shadow: 0 10px 25px rgba(0,0,0,0.1) !important;
                }
                .bg-success-light {
                    background-color: #e6f4ea;
                }
                /* Button Hover Fixes */
                .btn-lceo-primary { color: #fff !important; }
                .btn-lceo-primary:hover {
                    background-color: #3d7a6e !important;
                    color: #fff !important;
                    transform: translateY(-1px);
                }
                .btn-lceo-dark { color: #fff !important; }
                .btn-lceo-dark:hover {
                    background-color: #0d2420 !important;
                    color: #fff !important;
                    transform: translateY(-1px);
                }
                .btn-lceo-outline:hover {
                    background-color: #4c9789 !important;
                    color: #fff !important;
                    border-color: #4c9789 !important;
                    transform: translateY(-1px);
                }
                .btn-lceo-outline-secondary:hover {
                    background-color: #6c757d !important;
                    color: #fff !important;
                    border-color: #6c757d !important;
                    transform: translateY(-1px);
                }
                .btn-lceo-link:hover {
                    color: #3d7a6e !important;
                    text-decoration: none !important;
                }
                .btn-share-social {
                    background-color: #ffffff;
                    border: 1px solid #e9ecef !important;
                    color: #495057 !important;
                }
                .btn-share-social:hover {
                    background-color: #f8f9fa !important;
                    border-color: #dee2e6 !important;
                    color: #122f2b !important;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.05);
                }
                .cursor-pointer {
                    cursor: pointer;
                }
                .gap-2 { gap: 0.5rem; }
                .gap-3 { gap: 1rem; }
                .gap-4 { gap: 1.5rem; }
                .responsive-title { font-size: 1.75rem; }
                .responsive-lead { font-size: 0.95rem; }
                .responsive-impact-title { font-size: 2rem; }
                @media (min-width: 768px) {
                    .responsive-title { font-size: 3.5rem; }
                    .responsive-lead { font-size: 1.25rem; }
                    .responsive-impact-title { font-size: 2.8rem; }
                }
            `}</style>
            <div className="container">
                <div className="row justify-content-center">
                    <div className={step !== 5 && showForm ? "col-xl-10" : "col-lg-12"}>
                        {!showForm ? (
                            renderSplashScreen()
                        ) : step === 5 ? (
                            <div className="animate-fadeIn">
                                {/* Progress for Step 5 */}
                                <div className="mb-5">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <span className="text-muted font-weight-bold small">Step 5 of 5</span>
                                        <span className="text-primary font-weight-bold small" style={{ color: '#4c9789' }}>100% Complete</span>
                                    </div>
                                    <div className="progress" style={{ height: '8px', background: '#e9ecef', borderRadius: '10px' }}>
                                        <div className="progress-bar" style={{
                                            width: '100%',
                                            background: '#4c9789',
                                            borderRadius: '10px'
                                        }}></div>
                                    </div>
                                </div>

                                <div className="card shadow-sm border-0 rounded-xl overflow-hidden p-4 p-md-5" style={{ borderRadius: '25px' }}>
                                    <div className="text-center py-4">
                                        <div className="mb-4">
                                            <div className="bg-success-light rounded-circle d-inline-flex p-4 shadow-sm" style={{ backgroundColor: '#e6f4ea' }}>
                                                <CheckCircle size={60} className="text-success" />
                                            </div>
                                        </div>

                                        <h2 className="font-weight-bold mb-3 text-dark" style={{ fontSize: '2.4rem' }}>Thank You for Your Generosity!</h2>
                                        <p className="text-muted mb-5 mx-auto" style={{ maxWidth: '650px', fontSize: '1.15rem' }}>
                                            Your donation of <strong className="text-primary" style={{ color: '#4c9789' }}>${selectedAmount}</strong> will make a lasting impact on the lives of young women and girls in Rwanda.
                                        </p>

                                        <div className="p-4 rounded-xl mb-5 mx-auto" style={{ backgroundColor: '#f0f7f6', maxWidth: '600px' }}>
                                            <h5 className="font-weight-bold text-dark mb-4">What Happens Next?</h5>
                                            <div className="text-left">
                                                <div className="d-flex align-items-center mb-3">
                                                    <div className="bg-white rounded-circle d-flex align-items-center justify-content-center mr-3 font-weight-bold text-primary" style={{ width: '32px', height: '32px', minWidth: '32px', color: '#4c9789', border: '1px solid rgba(76, 151, 137, 0.2)' }}>1</div>
                                                    <div className="text-muted small font-weight-bold">You'll receive a confirmation email with your receipt</div>
                                                </div>
                                                <div className="d-flex align-items-center mb-3">
                                                    <div className="bg-white rounded-circle d-flex align-items-center justify-content-center mr-3 font-weight-bold text-primary" style={{ width: '32px', height: '32px', minWidth: '32px', color: '#4c9789', border: '1px solid rgba(76, 151, 137, 0.2)' }}>2</div>
                                                    <div className="text-muted small font-weight-bold">Monthly impact reports will be sent to your inbox</div>
                                                </div>
                                                <div className="d-flex align-items-center">
                                                    <div className="bg-white rounded-circle d-flex align-items-center justify-content-center mr-3 font-weight-bold text-primary" style={{ width: '32px', height: '32px', minWidth: '32px', color: '#4c9789', border: '1px solid rgba(76, 151, 137, 0.2)' }}>3</div>
                                                    <div className="text-muted small font-weight-bold">You can track your impact through your donor dashboard</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="d-flex justify-content-center flex-wrap mb-5 gap-2">
                                            <button className="btn btn-outline-secondary btn-lg mb-2 px-5 py-3 rounded-xl font-weight-bold shadow-sm btn-lceo-outline-secondary" onClick={() => window.location.href = '/'}>Return Home</button>
                                            <button className="btn btn-primary btn-lg mb-2 px-5 py-3 rounded-xl font-weight-bold shadow-sm d-flex align-items-center justify-content-center btn-lceo-primary" style={{ backgroundColor: '#4c9789', border: 'none' }} onClick={() => navigate('/donor')}>
                                                View My Dashboard <ArrowRight size={20} className="ml-2" />
                                            </button>
                                        </div>

                                        <hr className="my-4 mx-auto" style={{ maxWidth: '80%', opacity: 0.1 }} />

                                        <div>
                                            <p className="text-muted small font-weight-bold mb-3">Share your support:</p>
                                            <div className="d-flex justify-content-center flex-wrap gap-2">
                                                <button className="btn btn-light mb-2 mx-1 px-4 py-2 rounded-xl small font-weight-bold transition-all hover-scale btn-share-social">Share on Facebook</button>
                                                <button className="btn btn-light mb-2 mx-1 px-4 py-2 rounded-xl small font-weight-bold transition-all hover-scale btn-share-social">Share on Twitter</button>
                                                <button className="btn btn-light mb-2 mx-1 px-4 py-2 rounded-xl small font-weight-bold transition-all hover-scale btn-share-social">Share via Email</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="animate-fadeIn">
                                {renderDetailedDonation()}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
