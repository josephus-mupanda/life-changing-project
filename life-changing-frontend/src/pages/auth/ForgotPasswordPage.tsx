import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { ArrowLeft, Mail, Phone, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

type ContactMethod = 'email' | 'phone';

export function ForgotPasswordPage() {
    const navigate = useNavigate();
    const [contactMethod, setContactMethod] = useState<ContactMethod>('email');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (contactMethod === 'email') {
                if (!email) {
                    setError('Please enter your email address');
                    setIsLoading(false);
                    return;
                }
                await authService.forgotPassword(email);
                toast.success('Password reset link sent to your email.');
                setIsSent(true);
            } else {
                if (!phone) {
                    setError('Please enter your phone number');
                    setIsLoading(false);
                    return;
                }
                await authService.forgotPassword(phone);
                toast.success('Password reset code sent to your phone.');
                // Navigate to OTP verification with phone number
                navigate('/verify-otp', { state: { phone } });
            }
        } catch (error: any) {
            console.error(error);
            const errorMessage = error.response?.data?.message || 'Failed to send reset link. Please try again.';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const getIcon = () => {
        if (contactMethod === 'email') return Mail;
        return Phone;
    };

    const Icon = getIcon();

    return (
        <div style={{ 
            backgroundColor: '#fcfdfd', 
            padding: '120px 0 80px 0', 
            minHeight: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
        }}>
            <div className="container">
                <div className="login-container text-center mx-auto" style={{ 
                    maxWidth: '400px', 
                    background: '#fff', 
                    borderRadius: '15px', 
                    boxShadow: '0 15px 40px rgba(0, 0, 0, 0.05)', 
                    overflow: 'hidden', 
                    padding: '40px' 
                }}>
                    {/* Icon */}
                    <div className="mb-4">
                        <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center" style={{ 
                            width: '60px', 
                            height: '60px',
                            background: contactMethod === 'email' ? 'rgba(23, 209, 172, 0.1)' : 'rgba(0, 123, 255, 0.1)'
                        }}>
                            <Icon size={24} style={{ 
                                color: contactMethod === 'email' ? '#17D1AC' : '#17D1AC' 
                            }} />
                        </div>
                    </div>

                    <h4 className="mb-3 font-weight-bold" style={{ color: '#122f2b' }}>
                        Reset Your Password
                    </h4>

                    {!isSent || contactMethod === 'phone' ? (
                        <>
                            <p className="text-muted mb-4 small">
                                {contactMethod === 'email' 
                                    ? "Enter your email address and we'll send you a link to reset your password. (Valid for 10 minutes)"
                                    : "Enter your phone number and we'll send you a 5-digit code to reset your password. (Valid for 10 minutes)"}
                            </p>

                            {/* Contact Method Toggle */}
                            <div className="d-flex mb-4" style={{ 
                                background: '#f8f9fa', 
                                borderRadius: '8px', 
                                padding: '4px' 
                            }}>
                                <button
                                    type="button"
                                    className="flex-fill py-2 border-0 font-weight-bold small"
                                    style={{
                                        background: contactMethod === 'email' ? '#17D1AC' : 'transparent',
                                        color: contactMethod === 'email' ? 'white' : '#6c757d',
                                        borderRadius: '6px',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onClick={() => setContactMethod('email')}
                                >
                                    <Mail size={14} className="mr-1" style={{ display: 'inline' }} />
                                    Email
                                </button>
                                <button
                                    type="button"
                                    className="flex-fill py-2 border-0 font-weight-bold small"
                                    style={{
                                        background: contactMethod === 'phone' ? '#17D1AC' : 'transparent',
                                        color: contactMethod === 'phone' ? 'white' : '#6c757d',
                                        borderRadius: '6px',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onClick={() => setContactMethod('phone')}
                                >
                                    <Phone size={14} className="mr-1" style={{ display: 'inline' }} />
                                    Phone
                                </button>
                            </div>

                            <form onSubmit={handleSubmit}>
                                {contactMethod === 'email' ? (
                                    <div className="form-group text-left mb-3">
                                        <div style={{ position: 'relative' }}>
                                            <Mail size={18} style={{ 
                                                position: 'absolute', 
                                                left: '15px', 
                                                top: '50%', 
                                                transform: 'translateY(-50%)',
                                                color: '#adb5bd'
                                            }} />
                                            <input
                                                type="email"
                                                className="form-control"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="Email Address"
                                                required={contactMethod === 'email'}
                                                style={{ 
                                                    height: '48px', 
                                                    background: '#f8f9fa', 
                                                    border: '1px solid #eee', 
                                                    borderRadius: '8px', 
                                                    paddingLeft: '45px',
                                                    fontSize: '0.9rem' 
                                                }}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="form-group text-left mb-3">
                                        <div style={{ position: 'relative' }}>
                                            <Phone size={18} style={{ 
                                                position: 'absolute', 
                                                left: '15px', 
                                                top: '50%', 
                                                transform: 'translateY(-50%)',
                                                color: '#adb5bd'
                                            }} />
                                            <input
                                                type="tel"
                                                className="form-control"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                placeholder="Phone Number (e.g., +250788123456)"
                                                required={contactMethod === 'phone'}
                                                style={{ 
                                                    height: '48px', 
                                                    background: '#f8f9fa', 
                                                    border: '1px solid #eee', 
                                                    borderRadius: '8px', 
                                                    paddingLeft: '45px',
                                                    fontSize: '0.9rem' 
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Error Message */}
                                {error && (
                                    <div className="alert alert-danger mb-3 py-2 small d-flex align-items-center">
                                        <AlertCircle size={14} className="mr-1" />
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="btn btn-primary btn-block mb-3 font-weight-bold"
                                    disabled={isLoading}
                                    style={{ 
                                        height: '48px', 
                                        background: contactMethod === 'email' ? '#17D1AC' : '#17D1AC', 
                                        border: 'none', 
                                        borderRadius: '8px', 
                                        boxShadow: 'none',
                                        opacity: isLoading ? 0.7 : 1
                                    }}
                                >
                                    {isLoading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                                            Sending...
                                        </>
                                    ) : (
                                        contactMethod === 'email' ? 'Send Reset Link' : 'Send Reset Code'
                                    )}
                                </button>
                            </form>
                        </>
                    ) : (
                        // Email success message (phone doesn't show this since it navigates)
                        <div className="text-center">
                            <div className="alert alert-success d-flex align-items-center mb-4" role="alert">
                                <CheckCircle size={18} className="mr-2" />
                                <span className="small">
                                    Check your email for the reset link! (Valid for 10 minutes)
                                </span>
                            </div>
                            <p className="small text-muted mb-4">
                                Didn't receive the email? Check your spam folder or try again.
                            </p>
                            <button
                                onClick={() => setIsSent(false)}
                                className="btn btn-link p-0 small font-weight-bold"
                                style={{ color: '#17D1AC' }}
                            >
                                Try another email
                            </button>
                        </div>
                    )}

                    <div className="mt-4 pt-4 border-top">
                        <Link to="/login" className="text-muted small d-inline-flex align-items-center">
                            <ArrowLeft size={14} className="mr-1" /> Back to Login
                        </Link>
                    </div>

                    {/* Help Text */}
                    <div className="mt-3">
                        <small className="text-muted">
                            Need help? <a href="/contact" className="text-primary">Contact Support</a>
                        </small>
                    </div>
                </div>
            </div>
        </div>
    );
}