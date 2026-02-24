import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { toast } from 'sonner';
import { Eye, EyeOff, Lock, CheckCircle, ArrowLeft } from 'lucide-react';

export function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    if (!token) {
        return (
            <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
                <div className="card shadow-sm border-0 p-5 text-center" style={{ maxWidth: '500px' }}>
                    <h3 className="text-danger">Invalid Link</h3>
                    <p className="text-muted">This password reset link is invalid or has expired.</p>
                    <Link to="/forgot-password" className="btn btn-primary mt-3">Request New Link</Link>
                    <div className="mt-3">
                        <Link to="/login" className="text-muted small">
                            <ArrowLeft size={14} className="mr-1" /> Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
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
            await authService.resetPassword(token, password, confirmPassword);
            setIsSuccess(true);
            toast.success('Password has been reset successfully!');
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to reset password. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
                <div className="card shadow-sm border-0 p-5 text-center" style={{ maxWidth: '500px', width: '100%' }}>
                    <CheckCircle size={64} className="text-success mb-3 mx-auto" />
                    <h2 className="mb-3">Password Reset!</h2>
                    <p className="text-muted mb-4">Your password has been successfully updated. You can now log in with your new password.</p>
                    <Link to="/login" className="btn btn-primary btn-block">Go to Login</Link>
                </div>
            </div>
        );
    }

    return (
        <div style={{ backgroundColor: '#fcfdfd', padding: '120px 0 80px 0', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="container">
                <div className="login-container text-center mx-auto" style={{ maxWidth: '400px', background: '#fff', borderRadius: '15px', boxShadow: '0 15px 40px rgba(0, 0, 0, 0.05)', overflow: 'hidden', padding: '40px' }}>

                    <div className="mb-4">
                        <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                            <Lock size={24} className="text-primary" style={{ color: '#17D1AC' }} />
                        </div>
                    </div>

                    <h4 className="mb-3 font-weight-bold" style={{ color: '#122f2b' }}>Reset Password</h4>
                    <p className="text-muted mb-4 small">
                        Enter your new password below.
                    </p>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group text-left mb-3">
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="form-control"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="New Password"
                                    required
                                    style={{ height: '48px', background: '#f8f9fa', border: '1px solid #eee', borderRadius: '8px', paddingRight: '45px', fontSize: '0.9rem' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#adb5bd' }}
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
                                    style={{ height: '48px', background: '#f8f9fa', border: '1px solid #eee', borderRadius: '8px', paddingRight: '45px', fontSize: '0.9rem' }}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-block mb-3 font-weight-bold"
                            disabled={isLoading}
                            style={{ height: '48px', background: '#17D1AC', border: 'none', borderRadius: '8px', boxShadow: 'none' }}
                        >
                            {isLoading ? 'Resetting...' : 'Reset Password'}
                        </button>

                        {/* Back to Login Link */}
                        <div className="text-center mt-3">
                            <Link to="/login" className="text-muted small d-inline-flex align-items-center">
                                <ArrowLeft size={14} className="mr-1" /> Back to Login
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
