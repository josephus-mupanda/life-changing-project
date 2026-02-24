import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { ArrowLeft, Phone, CheckCircle, AlertCircle, RefreshCw, Key, EyeOff, Eye } from 'lucide-react';
import { OTPInput } from '@/components/ui/otp-input';
import { toast } from 'sonner';

export function OTPVerificationPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const phone = location.state?.phone || '';

    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes = 600 seconds
    const [canResend, setCanResend] = useState(false);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (!phone) {
            navigate('/forgot-password');
        }
    }, [phone, navigate]);

    // Timer for code expiry (10 minutes)
    useEffect(() => {
        if (!showPasswordForm && timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [timeLeft, showPasswordForm]);

    // Format time as MM:SS
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleResendCode = async () => {
        setCanResend(false);
        setTimeLeft(600); // Reset to 10 minutes
        setError('');

        try {
            await authService.forgotPassword(phone);
            toast.success('New verification code sent to your phone.');
        } catch (error: any) {
            console.error(error);
            toast.error('Failed to resend code. Please try again.');
            setCanResend(true);
        }
    };

    const handleVerifyOTP = async (code: string) => {
        if (code.length !== 5) return;
        setOtp(code);
        setShowPasswordForm(true);
        setError('');
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (password.length < 8) {
            toast.error('Password must be at least 8 characters long');
            return;
        }

        setIsLoading(true);
        try {
            // Check if code has expired
            if (timeLeft <= 0) {
                setError('Verification code has expired. Please request a new one.');
                setShowPasswordForm(false);
                setIsLoading(false);
                return;
            }

            // Use the 5-digit OTP as the token
            await authService.resetPassword(otp, password, confirmPassword);
            toast.success('Password has been reset successfully!');

            // Redirect to login after success
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (error: any) {
            console.error(error);
            setError(error.response?.data?.message || 'Failed to reset password. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!phone) return null;

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
                            background: showPasswordForm ? 'rgba(23, 209, 172, 0.1)' : 'rgba(0, 123, 255, 0.1)'
                        }}>
                            {showPasswordForm ? (
                                <Key size={24} style={{ color: '#17D1AC' }} />
                            ) : (
                                <Phone size={24} style={{ color: '#007bff' }} />
                            )}
                        </div>
                    </div>

                    {!showPasswordForm ? (
                        <>
                            <h4 className="mb-3 font-weight-bold" style={{ color: '#122f2b' }}>
                                Enter Reset Code
                            </h4>

                            <p className="text-muted mb-4 small">
                                We've sent a 5-digit verification code to<br />
                                <strong className="text-dark">{phone}</strong>
                            </p>

                            {/* Timer Display */}
                            <div className="mb-3">
                                <div className={`small ${timeLeft < 60 ? 'text-danger' : 'text-muted'}`}>
                                    Code expires in: <span className="font-weight-bold">{formatTime(timeLeft)}</span>
                                </div>
                                {timeLeft < 60 && (
                                    <div className="text-danger small mt-1">
                                        ⚠️ Code expiring soon! Request a new one if it expires.
                                    </div>
                                )}
                            </div>

                            {/* OTP Input */}
                            <div className="mb-4">
                                <OTPInput
                                    length={5}
                                    value={otp}
                                    onChange={setOtp}
                                    onComplete={handleVerifyOTP}
                                    disabled={isLoading || timeLeft <= 0}
                                    error={!!error}
                                />
                            </div>

                            {/* Expired Message */}
                            {timeLeft <= 0 && (
                                <div className="alert alert-warning mb-3 py-2 small d-flex align-items-center">
                                    <AlertCircle size={14} className="mr-1" />
                                    Code has expired. Please request a new one.
                                </div>
                            )}

                            {/* Error Message */}
                            {error && timeLeft > 0 && (
                                <div className="alert alert-danger mb-3 py-2 small d-flex align-items-center">
                                    <AlertCircle size={14} className="mr-1" />
                                    {error}
                                </div>
                            )}

                            {/* Resend Button - Only show when expired or after 10 minutes */}
                            {timeLeft <= 0 && (
                                <div className="mt-3 text-center">
                                    <button
                                        onClick={handleResendCode}
                                        className="btn btn-primary"
                                        style={{ background: '#007bff', border: 'none' }}
                                    >
                                        <RefreshCw size={14} className="mr-1" />
                                        Request New Code
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <h4 className="mb-3 font-weight-bold" style={{ color: '#122f2b' }}>
                                Reset Password
                            </h4>

                            <p className="text-muted mb-4 small">
                                Enter your new password below.
                            </p>

                            <form onSubmit={handleResetPassword}>
                                <div className="form-group text-left mb-3">
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            className="form-control"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="New Password"
                                            required
                                            style={{
                                                height: '48px',
                                                background: '#f8f9fa',
                                                border: '1px solid #eee',
                                                borderRadius: '8px',
                                                paddingRight: '45px',
                                                fontSize: '0.9rem'
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            style={{
                                                position: 'absolute',
                                                right: '15px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                background: 'none',
                                                border: 'none',
                                                color: '#adb5bd'
                                            }}
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="form-group text-left mb-4">
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            className="form-control"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Confirm Password"
                                            required
                                            style={{
                                                height: '48px',
                                                background: '#f8f9fa',
                                                border: '1px solid #eee',
                                                borderRadius: '8px',
                                                fontSize: '0.9rem'
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Warning if code is about to expire */}
                                {timeLeft < 60 && (
                                    <div className="alert alert-warning mb-3 py-2 small">
                                        ⚠️ Your code expires in {formatTime(timeLeft)}. Please reset quickly!
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
                                    disabled={isLoading || timeLeft <= 0}
                                    style={{
                                        height: '48px',
                                        background: timeLeft <= 0 ? '#6c757d' : '#17D1AC',
                                        border: 'none',
                                        borderRadius: '8px',
                                        boxShadow: 'none',
                                        opacity: isLoading ? 0.7 : 1
                                    }}
                                >
                                    {isLoading ? 'Resetting...' : 'Reset Password'}
                                </button>
                            </form>
                        </>
                    )}

                    <div className="mt-4 pt-4 border-top">
                        <Link
                            to={showPasswordForm ? "#" : "/forgot-password"}
                            className="text-muted small d-inline-flex align-items-center"
                            onClick={(e) => {
                                if (showPasswordForm) {
                                    e.preventDefault();
                                    setShowPasswordForm(false);
                                    setOtp(''); // Clear OTP when going back
                                    setPassword(''); // Clear password for security
                                    setConfirmPassword(''); // Clear confirm password
                                    setError(''); // Clear any errors
                                }
                            }}
                        >
                            <ArrowLeft size={14} className="mr-1" />
                            {showPasswordForm ? 'Back to Code Entry' : 'Back to Forgot Password'}
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

// Helper function for conditional classes
function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}