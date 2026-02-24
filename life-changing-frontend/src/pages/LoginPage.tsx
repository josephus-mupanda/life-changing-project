import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth-context';
import { useSearchParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { UserType } from '@/lib/types';
import { ArrowLeft, Eye, EyeOff, User, Heart } from 'lucide-react';

export function LoginPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { login, register, isLoading, isAuthenticated, user } = useAuth(); // Added register

    const [accessType, setAccessType] = useState<'login' | 'signup' | 'demo'>('login');
    const [role, setRole] = useState<UserType>(UserType.BENEFICIARY);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Try React Router params first
        let r = searchParams.get('role');

        // Fallback to window.location.search (for standard ?role=admin links)
        if (!r) {
            const urlParams = new URLSearchParams(window.location.search);
            r = urlParams.get('role');
        }

        if (r) {
            if (r === 'beneficiary') setRole(UserType.BENEFICIARY);
            else if (r === 'donor') setRole(UserType.DONOR);
            else setRole(UserType.ADMIN);
        }
    }, [searchParams]);

    useEffect(() => {
        if (isAuthenticated && user) {
            // Check for return URL in state (from ProtectedRoute) or query param (from direct link/API interceptor)
            // location.state.from might be an object (location) or string depending on how it was passed.
            // ProtectedRoute passes `state={{ from: location }}` where location is an object.
            const fromState = location.state?.from?.pathname || location.state?.from;
            const returnUrl = fromState || searchParams.get('returnUrl');

            if (returnUrl) {
                navigate(returnUrl, { replace: true });
            } else {
                if (user.userType === UserType.ADMIN) navigate('/admin');
                else if (user.userType === UserType.BENEFICIARY) navigate('/beneficiary');
                else if (user.userType === UserType.DONOR) navigate('/donor');
            }
        }
    }, [isAuthenticated, user, navigate, location, searchParams]);

    // Pre-fill for demo
    useEffect(() => {
        if (accessType === 'demo') {
            if (role === UserType.ADMIN) {
                setEmail('admin@lceo.org');
                setPassword('Password123!');
            } else if (role === UserType.BENEFICIARY) {
                setEmail('josephusmupanda48@gmail.com');
                setPassword('Password123!');
            } else if (role === UserType.DONOR) {
                setEmail('donor@lceo.org');
                setPassword('donor123');
            }
        }
    }, [role, accessType]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            if (accessType === 'signup') {
                await register({
                    email,
                    password,
                    fullName: name,
                    userType: role,
                    phone: phone || '+250700000000', // Use input or fallback
                    // language: Language.EN // Default or add selector
                });
            } else {
                await login({ email, password });
            }
        } catch (err: any) {
            // Error handled in AuthContext (toasts), but we can set local error state too if needed
            // setError('Account error. Please check your credentials.'); 
        }
    };

    const getRoleName = () => {
        switch (role) {
            case UserType.BENEFICIARY: return 'Beneficiary';
            case UserType.DONOR: return 'Donor';
            default: return 'Administrator';
        }
    };

    return (
        <div style={{ backgroundColor: '#fcfdfd', padding: '120px 0 80px 0' }}>
            <div className="container">
                <div className="login-container text-center mx-auto" style={{ maxWidth: '400px', background: '#fff', borderRadius: '15px', boxShadow: '0 15px 40px rgba(0, 0, 0, 0.05)', overflow: 'hidden' }}>

                    {/* Compact Tabs */}
                    <div className="d-flex" style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <button
                            className="flex-fill py-3 border-0 transition-all font-weight-bold"
                            style={{
                                background: 'white',
                                color: (accessType === 'login' || accessType === 'signup') ? '#17D1AC' : '#6c757d',
                                borderBottom: (accessType === 'login' || accessType === 'signup') ? '4px solid #17D1AC' : '4px solid transparent',
                                fontSize: '1.1rem',
                                transition: 'all 0.3s ease'
                            }}
                            onClick={() => setAccessType('login')}
                        >
                            {accessType === 'signup' ? 'Sign Up' : 'Login'}
                        </button>
                        <button
                            className="flex-fill py-3 border-0 transition-all font-weight-bold"
                            style={{
                                background: 'white',
                                color: accessType === 'demo' ? '#17D1AC' : '#6c757d',
                                borderBottom: accessType === 'demo' ? '4px solid #17D1AC' : '4px solid transparent',
                                fontSize: '1.1rem',
                                transition: 'all 0.3s ease'
                            }}
                            onClick={() => setAccessType('demo')}
                        >
                            Demo Access
                        </button>
                    </div>

                    <div className="p-4">
                        {accessType !== 'demo' ? (
                            <>
                                <div className="role-badge mb-3" style={{ display: 'inline-block', padding: '4px 12px', background: 'rgba(23, 209, 172, 0.1)', borderRadius: '20px', fontSize: '11px', fontWeight: 700, color: '#122f2b', textTransform: 'uppercase' }}>
                                    {getRoleName()} {accessType === 'signup' ? 'Registration' : 'Login'}
                                </div>
                                <h4 className="mb-4 font-weight-bold" style={{ color: '#122f2b' }}>
                                    {accessType === 'signup' ? 'Create Account' : 'Welcome Back'}
                                </h4>

                                <form onSubmit={handleSubmit}>
                                    {accessType === 'signup' && (
                                        <div className="form-group text-left mb-3">
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                placeholder="Full Name"
                                                required
                                                style={{ height: '48px', background: '#f8f9fa', border: '1px solid #eee', borderRadius: '8px', fontSize: '0.9rem' }}
                                            />
                                        </div>
                                    )}

                                    <div className="form-group text-left mb-3">
                                        <input
                                            type="email"
                                            className="form-control"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Email Address"
                                            required
                                            pattern="[^@\s]+@[^@\s]+\.[^@\s]+"
                                            title="Please enter a valid email address"
                                            style={{ height: '48px', background: '#f8f9fa', border: '1px solid #eee', borderRadius: '8px', fontSize: '0.9rem' }}
                                        />
                                    </div>
                                    {accessType === 'signup' && (
                                        <div className="form-group text-left mb-3">
                                            <input
                                                type="tel"
                                                className="form-control"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                placeholder="Phone Number"
                                                required
                                                style={{ height: '48px', background: '#f8f9fa', border: '1px solid #eee', borderRadius: '8px', fontSize: '0.9rem' }}
                                            />
                                        </div>
                                    )}
                                    <div className="form-group text-left mb-4">
                                        <div style={{ position: 'relative' }}>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                className="form-control"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="Password"
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
                                        {accessType === 'login' && (
                                            <div className="text-right mt-2">
                                                <Link to="/forgot-password" className="small text-muted">Forgot Password?</Link>
                                            </div>
                                        )}
                                    </div>

                                    {accessType === 'signup' && (
                                        <div className="form-group text-left mb-4">
                                            <label className="small font-weight-bold text-muted mb-2">I am a:</label>
                                            <div className="d-flex" style={{ gap: '15px' }}>
                                                <button
                                                    type="button"
                                                    className={`btn flex-fill py-2 small font-weight-bold ${role === UserType.BENEFICIARY ? 'btn-primary' : 'btn-outline-light text-muted border'}`}
                                                    onClick={() => setRole(UserType.BENEFICIARY)}
                                                    style={{ borderRadius: '8px', background: role === UserType.BENEFICIARY ? '#17D1AC' : 'transparent', border: role === UserType.BENEFICIARY ? 'none' : '1px solid #eee', boxShadow: 'none' }}
                                                >
                                                    Beneficiary
                                                </button>
                                                <button
                                                    type="button"
                                                    className={`btn flex-fill py-2 small font-weight-bold ${role === UserType.DONOR ? 'btn-primary' : 'btn-outline-light text-muted border'}`}
                                                    onClick={() => setRole(UserType.DONOR)}
                                                    style={{ borderRadius: '8px', background: role === UserType.DONOR ? '#17D1AC' : 'transparent', border: role === UserType.DONOR ? 'none' : '1px solid #eee', boxShadow: 'none' }}
                                                >
                                                    Donor
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {error && <div className="alert alert-danger mb-3 py-2 small">{error}</div>}

                                    <button
                                        type="submit"
                                        className="btn btn-primary btn-block mb-3 font-weight-bold"
                                        disabled={isLoading}
                                        style={{ height: '48px', background: '#17D1AC', border: 'none', borderRadius: '8px', boxShadow: 'none' }}
                                    >
                                        {isLoading ? 'Processing...' : (accessType === 'signup' ? 'Create Account' : 'Sign In')}
                                    </button>

                                    <div className="mb-3 d-flex align-items-center">
                                        <hr className="flex-fill" /> <span className="mx-2 small text-muted">OR</span> <hr className="flex-fill" />
                                    </div>

                                    <button
                                        type="button"
                                        className="btn btn-outline-light btn-block mb-4 border d-flex align-items-center justify-content-center gap-2"
                                        style={{ height: '48px', borderRadius: '8px', background: 'white', color: '#666' }}
                                    >
                                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="18" height="18" alt="Google" />
                                        <span className="small font-weight-bold">
                                            {accessType === 'signup' ? 'Sign up with Google' : 'Sign in with Google'}
                                        </span>
                                    </button>

                                    <div className="text-center mt-3" style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                                        <span className="text-muted">
                                            {accessType === 'signup' ? 'Already have an account?' : "Don't have an account?"}
                                        </span>{' '}
                                        <button
                                            type="button"
                                            style={{
                                                background: 'transparent',
                                                border: 'none',
                                                padding: 0,
                                                margin: 0,
                                                color: '#17D1AC',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                boxShadow: 'none',
                                                outline: 'none',
                                                verticalAlign: 'baseline'
                                            }}
                                            onClick={() => setAccessType(accessType === 'signup' ? 'login' : 'signup')}
                                        >
                                            {accessType === 'signup' ? 'Sign In' : 'Create account'}
                                        </button>
                                    </div>
                                </form>
                            </>
                        ) : (
                            <div className="py-2">
                                <h5 className="mb-4 font-weight-bold" style={{ color: '#122f2b' }}>Experience LCEO</h5>

                                {/* Hide admin portal button for demo as requested */}
                                {/* <button className="btn btn-outline-light btn-block mb-3 text-left d-flex align-items-center p-3 border" style={{ borderRadius: '12px' }} onClick={() => login('admin@lceo.org', UserType.ADMIN)}>
    <div className="bg-light rounded-circle p-2 mr-3 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}><Settings size={20} className="text-primary" /></div>
    <div><div className="font-weight-bold text-dark" style={{ fontSize: '0.9rem' }}>Admin Portal</div><small className="text-muted">Manage the whole organization</small></div>
</button> */}

                                <button className="btn btn-outline-light btn-block mb-3 text-left d-flex align-items-center p-3 border" style={{ borderRadius: '12px' }} onClick={() => login({ email: 'ben@lceo.org', password: 'password123' })}>
                                    <div className="bg-light rounded-circle p-2 mr-3 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}><User size={20} className="text-success" /></div>
                                    <div><div className="font-weight-bold text-dark" style={{ fontSize: '0.9rem' }}>Beneficiary Area</div><small className="text-muted">View progress and support</small></div>
                                </button>

                                <button className="btn btn-outline-light btn-block mb-3 text-left d-flex align-items-center p-3 border" style={{ borderRadius: '12px' }} onClick={() => login({ email: 'donor@lceo.org', password: 'password123' })}>
                                    <div className="bg-light rounded-circle p-2 mr-3 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}><Heart size={20} className="text-danger" /></div>
                                    <div><div className="font-weight-bold text-dark" style={{ fontSize: '0.9rem' }}>Donor Dashboard</div><small className="text-muted">Track your global impact</small></div>
                                </button>
                            </div>
                        )}

                        <div className="mt-4 pt-4 border-top">
                            <Link to="/" className="text-muted small d-inline-flex align-items-center">
                                <ArrowLeft size={14} className="mr-1" /> Back to website
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
