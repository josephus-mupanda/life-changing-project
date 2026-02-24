import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { CheckCircle, XCircle, ArrowLeft, Phone, Mail, RefreshCw, AlertCircle } from 'lucide-react';
import { OTPInput } from '@/components/ui/otp-input';
import { toast } from 'sonner';

type VerificationMethod = 'email' | 'sms';

export function VerifyAccountPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();
    const urlToken = searchParams.get('token');
    const phone = location.state?.phone || '';

    const [method, setMethod] = useState<VerificationMethod>(urlToken ? 'email' : 'sms');
    const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'input'>(
        urlToken ? 'verifying' : 'input'
    );
    const [message, setMessage] = useState('');
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(60);
    const [canResend, setCanResend] = useState(false);

    // Email verification (token from URL)
    useEffect(() => {
        if (method === 'email' && urlToken) {
            verifyEmail();
        }
    }, [method, urlToken]);

    // Timer for SMS resend
    useEffect(() => {
        if (method === 'sms' && status === 'input') {
            if (timeLeft > 0) {
                const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
                return () => clearTimeout(timer);
            } else {
                setCanResend(true);
            }
        }
    }, [timeLeft, method, status]);

    const verifyEmail = async () => {
        setStatus('verifying');
        setMessage('Verifying your account...');

        try {
            await authService.verifyAccount(urlToken!);
            setStatus('success');
            setMessage('Your account has been successfully verified! You can now log in.');

            // Auto redirect after 5 seconds
            setTimeout(() => {
                navigate('/login');
            }, 5000);
        } catch (error: any) {
            setStatus('error');
            setMessage(error.response?.data?.message || 'Verification failed. The link may have expired.');
        }
    };

    const verifySms = async (code: string) => {
        if (code.length !== 5) return;

        setIsLoading(true);
        try {
            await authService.verifyAccount(code); // Use the 5-digit code as token
            setStatus('success');
            setMessage('Your account has been successfully verified! You can now log in.');

            // Auto redirect after 5 seconds
            setTimeout(() => {
                navigate('/login');
            }, 5000);
        } catch (error: any) {
            setMessage(error.response?.data?.message || 'Verification failed. The code may have expired.');
            setOtp('');
            toast.error('Invalid verification code');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (!phone) {
            toast.error('Phone number not found');
            return;
        }

        setCanResend(false);
        setTimeLeft(60);
        setMessage('');

        try {
            // You need to implement this method in your auth service
            await authService.resendVerificationCode(phone);
            toast.success('New verification code sent to your phone.');
        } catch (error: any) {
            console.error(error);
            toast.error('Failed to resend code. Please try again.');
            setCanResend(true);
        }
    };

    const getIcon = () => {
        if (status === 'verifying') return null;
        if (status === 'success') return CheckCircle;
        if (status === 'error') return XCircle;
        return method === 'email' ? Mail : Phone;
    };

    const Icon = getIcon();

    return (
        <div style={{
            backgroundColor: '#fcfdfd',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <div className="container">
                <div className="login-container text-center mx-auto" style={{
                    maxWidth: '450px',
                    background: '#fff',
                    borderRadius: '15px',
                    boxShadow: '0 15px 40px rgba(0, 0, 0, 0.05)',
                    overflow: 'hidden',
                    padding: '40px'
                }}>

                    {/* Icon */}
                    <div className="mb-4">
                        <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center" style={{
                            width: '70px',
                            height: '70px',
                            background: status === 'success' ? 'rgba(40, 167, 69, 0.1)' :
                                status === 'error' ? 'rgba(220, 53, 69, 0.1)' :
                                    method === 'email' ? 'rgba(23, 209, 172, 0.1)' :
                                        'rgba(0, 123, 255, 0.1)'
                        }}>
                            {status === 'verifying' ? (
                                <div className="spinner-border text-primary" role="status" style={{ width: '2rem', height: '2rem' }}>
                                    <span className="sr-only">Loading...</span>
                                </div>
                            ) : Icon && <Icon size={32} style={{
                                color: status === 'success' ? '#28a745' :
                                    status === 'error' ? '#dc3545' :
                                        method === 'email' ? '#17D1AC' : '#007bff'
                            }} />}
                        </div>
                    </div>

                    <h2 className="mb-3 font-weight-bold" style={{ color: '#122f2b' }}>
                        {status === 'verifying' ? 'Verifying Account' :
                            status === 'success' ? 'Account Verified' :
                                status === 'error' ? 'Verification Failed' :
                                    method === 'email' ? 'Verify Your Email' : 'Verify Your Phone'}
                    </h2>

                    {status === 'input' && method === 'sms' && (
                        <p className="text-muted mb-4 small">
                            We've sent a 5-digit verification code to<br />
                            <strong className="text-dark">{phone}</strong>
                        </p>
                    )}

                    {/* OTP Input for SMS verification */}
                    {status === 'input' && method === 'sms' && (
                        <div className="mb-4">
                            <OTPInput
                                length={5}
                                value={otp}
                                onChange={setOtp}
                                onComplete={verifySms}
                                disabled={isLoading}
                                error={!!message}
                            />
                        </div>
                    )}

                    {/* Error/Success Message */}
                    {message && status !== 'verifying' && (
                        <div className={`alert ${status === 'success' ? 'alert-success' :
                            status === 'error' ? 'alert-danger' :
                                'alert-info'} d-flex align-items-center mb-4`}
                            role="alert">
                            {status === 'error' && <AlertCircle size={16} className="mr-2" />}
                            <span className="small">{message}</span>
                        </div>
                    )}

                    {/* Resend SMS option */}
                    {status === 'input' && method === 'sms' && (
                        <div className="mt-3 text-center">
                            {!canResend ? (
                                <p className="small text-muted">
                                    Resend code in <span className="font-weight-bold">{timeLeft}s</span>
                                </p>
                            ) : (
                                <button
                                    onClick={handleResendCode}
                                    className="btn btn-link p-0 small font-weight-bold"
                                    style={{ color: '#007bff' }}
                                >
                                    <RefreshCw size={14} className="mr-1" />
                                    Resend Code
                                </button>
                            )}
                        </div>
                    )}

                    {/* Action Buttons */}
                    {status === 'success' && (
                        <div className="text-center">
                            <div className="alert alert-success d-flex align-items-center mb-4" role="alert">
                                <CheckCircle size={18} className="mr-2" />
                                <span className="small">{message}</span>
                            </div>

                            {/* Manual login button */}
                            <Link
                                to="/login"
                                className="btn btn-primary btn-block py-2 font-weight-bold mb-3"
                                style={{ background: '#17D1AC', border: 'none' }}
                            >
                                Go to Login Now
                            </Link>

                            {/* Auto-redirect message */}
                            <p className="small text-muted">
                                Redirecting to login in 5 seconds...
                            </p>

                            {/* Cancel auto-redirect option (optional) */}
                            <button
                                onClick={() => {
                                    // Clear the timeout if user clicks manually
                                    navigate('/login');
                                }}
                                className="btn btn-link p-0 small font-weight-bold"
                                style={{ color: '#17D1AC' }}
                            >
                                Click here if not redirected
                            </button>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="d-flex flex-column gap-2">
                            <Link to="/login" className="btn btn-outline-secondary btn-block">
                                <ArrowLeft size={16} className="mr-2" /> Back to Login
                            </Link>
                        </div>
                    )}

                    {status === 'input' && method === 'sms' && (
                        <div className="mt-4 pt-4 border-top">
                            <Link to="/login" className="text-muted small d-inline-flex align-items-center">
                                <ArrowLeft size={14} className="mr-1" /> Back to Login
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}