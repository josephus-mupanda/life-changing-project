import React from 'react';
import { useAuth } from '../../lib/auth-context';
import { UserType } from '../../lib/types';
import { Link } from 'react-router-dom';
import {
    LayoutGrid,
    Users,
    Target,
    Heart,
    CircleDollarSign,
    History,
    Settings,
    LogOut,
    Briefcase,
    ListTodo,
    User,
    PlusCircle,
    FileText
} from 'lucide-react';

interface SidebarProps {
    activeView?: string;
    onViewChange?: (view: string) => void;
    isOpen?: boolean;
    onClose?: () => void;
}

export function Sidebar({ activeView, onViewChange, isOpen, onClose }: SidebarProps) {
    const { user, logout } = useAuth();

    const handleLinkClick = (e: React.MouseEvent, view: string) => {
        e.preventDefault();
        if (onViewChange) {
            onViewChange(view);
        }
        if (onClose) onClose();
    };

    const renderAdminLinks = () => (
        <>
            <a href="#" onClick={(e) => handleLinkClick(e, 'overview')} className={`sidebar-link ${activeView === 'overview' ? 'active' : ''}`}>
                <LayoutGrid size={18} className="mr-3" /> Dashboard
            </a>
            <a href="#" onClick={(e) => handleLinkClick(e, 'beneficiaries')} className={`sidebar-link ${activeView === 'beneficiaries' || activeView === 'add-beneficiary' ? 'active' : ''}`}>
                <Users size={18} className="mr-3" /> Beneficiaries
            </a>
            <a href="#" onClick={(e) => handleLinkClick(e, 'content')} className={`sidebar-link ${activeView === 'content' ? 'active' : ''}`}>
                <Target size={18} className="mr-3" /> Programs
            </a>
            <a href="#" onClick={(e) => handleLinkClick(e, 'donors')} className={`sidebar-link ${activeView === 'donors' || activeView === 'add-donor' ? 'active' : ''}`}>
                <Heart size={18} className="mr-3" /> Donors
            </a>
            <a href="#" onClick={(e) => handleLinkClick(e, 'financial')} className={`sidebar-link ${activeView === 'financial' ? 'active' : ''}`}>
                <CircleDollarSign size={18} className="mr-3" /> Financial
            </a>
            <a href="#" onClick={(e) => handleLinkClick(e, 'reports')} className={`sidebar-link ${activeView === 'reports' ? 'active' : ''}`}>
                <FileText size={18} className="mr-3" /> Reports
            </a>
            <a href="#" onClick={(e) => handleLinkClick(e, 'settings')} className={`sidebar-link ${activeView === 'settings' ? 'active' : ''}`}>
                <Settings size={18} className="mr-3" /> Settings
            </a>
        </>
    );

    const renderBeneficiaryLinks = () => (
        <>
            <a href="#" onClick={(e) => handleLinkClick(e, 'overview')} className={`sidebar-link ${activeView === 'overview' ? 'active' : ''}`}>
                <LayoutGrid size={18} className="mr-3" /> My Dashboard
            </a>
            <a href="#" onClick={(e) => handleLinkClick(e, 'business')} className={`sidebar-link ${activeView === 'business' ? 'active' : ''}`}>
                <Briefcase size={18} className="mr-3" /> My Business
            </a>
            <a href="#" onClick={(e) => handleLinkClick(e, 'tasks')} className={`sidebar-link ${activeView === 'tasks' ? 'active' : ''}`}>
                <ListTodo size={18} className="mr-3" /> Tasks & Goal
            </a>
            <a href="#" onClick={(e) => handleLinkClick(e, 'profile')} className={`sidebar-link ${activeView === 'profile' ? 'active' : ''}`}>
                <User size={18} className="mr-3" /> My Profile
            </a>
        </>
    );

    const renderDonorLinks = () => (
        <>
            <a href="#" onClick={(e) => handleLinkClick(e, 'overview')} className={`sidebar-link ${activeView === 'overview' ? 'active' : ''}`}>
                <LayoutGrid size={18} className="mr-3" /> Impact Overview
            </a>
            <a href="#" onClick={(e) => handleLinkClick(e, 'donations')} className={`sidebar-link ${activeView === 'donations' ? 'active' : ''}`}>
                <Heart size={18} className="mr-3" /> My Donations
            </a>
            <a href="#" onClick={(e) => handleLinkClick(e, 'reports')} className={`sidebar-link ${activeView === 'reports' ? 'active' : ''}`}>
                <FileText size={18} className="mr-3" /> Impact Reports
            </a>
            <a href="#" onClick={(e) => handleLinkClick(e, 'settings')} className={`sidebar-link ${activeView === 'settings' ? 'active' : ''}`}>
                <Settings size={18} className="mr-3" /> Settings
            </a>
            <Link to="/donate" className="sidebar-link text-primary font-weight-bold">
                <PlusCircle size={18} className="mr-3" /> New Donation
            </Link>
        </>
    );

    return (
        <>
            <div className={`overlay-backdrop ${isOpen ? 'show' : ''}`} onClick={onClose}></div>
            <div className={`sidebar shadow-sm ${isOpen ? 'show' : ''} d-flex flex-column`}>
                <div className="p-4 text-center border-bottom mb-4">
                    <Link to="/">
                        <img src="/images/logo.png" alt="LCEO Logo" style={{ height: '50px' }} />
                        <h5 className="mt-2 font-weight-bold" style={{ color: '#ffffff', fontSize: '1.1rem' }}>
                            {user?.userType === UserType.ADMIN ? 'LCEO Admin' :
                                user?.userType === UserType.BENEFICIARY ? 'Beneficiary Portal' :
                                    'Donor Portal'}
                        </h5>
                    </Link>
                </div>
                <nav className="flex-grow-1">
                    {user?.userType === UserType.ADMIN && renderAdminLinks()}
                    {user?.userType === UserType.BENEFICIARY && renderBeneficiaryLinks()}
                    {user?.userType === UserType.DONOR && renderDonorLinks()}
                </nav>

                <div className="sidebar-footer border-top p-4">
                    <div className="d-flex align-items-center mb-3">
                        <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mr-3" style={{ width: '40px', height: '40px', fontWeight: 'bold' }}>
                            GA
                        </div>
                        <div style={{ lineHeight: '1.2' }}>
                            <div className="font-weight-bold small text-white">Grace Administrator</div>
                            <div className="x-small text-white-50">admin@lceo.org</div>
                        </div>
                    </div>
                    <a href="#" onClick={(e) => { e.preventDefault(); logout(); }} className="sidebar-link text-danger p-0 d-flex align-items-center">
                        <LogOut size={16} className="mr-2" /> Log out
                    </a>
                </div>
            </div>
        </>
    );
}
