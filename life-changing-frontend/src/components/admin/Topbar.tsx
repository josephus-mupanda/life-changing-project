import React from 'react';
import { useAuth } from '../../lib/auth-context';
import { Menu, ChevronDown, User, Settings, LogOut } from 'lucide-react';

interface TopbarProps {
    title: string;
    onToggleSidebar?: () => void;
}

export function Topbar({ title, onToggleSidebar }: TopbarProps) {
    const { user, logout } = useAuth();

    return (
        <div className="navbar-top mb-4 rounded shadow-sm">
            <div className="d-flex align-items-center">
                <button
                    className="btn btn-light d-lg-none mr-3 d-flex align-items-center justify-content-center"
                    onClick={onToggleSidebar}
                    style={{ width: '40px', height: '40px' }}
                >
                    <Menu size={24} />
                </button>
                <h4 className="font-weight-bold mb-0 text-accent">{title}</h4>
            </div>

            <div className="d-flex align-items-center">
                <div className="dropdown">
                    <button className="btn btn-sm btn-light dropdown-toggle d-flex align-items-center" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        <img src="/images/person_1.jpg" alt="Admin" className="rounded-circle mr-2" style={{ width: '30px', height: '30px', objectFit: 'cover' }} />
                        <span className="d-none d-md-inline">{user?.fullName || 'Admin'}</span>
                        <ChevronDown size={14} className="ml-2 text-muted" />
                    </button>
                    <div className="dropdown-menu dropdown-menu-right shadow-lg border-0" aria-labelledby="dropdownMenuButton">
                        <a className="dropdown-item d-flex align-items-center py-2" href="#">
                            <User size={14} className="mr-2" /> Profile
                        </a>
                        <a className="dropdown-item d-flex align-items-center py-2" href="#">
                            <Settings size={14} className="mr-2" /> Settings
                        </a>
                        <div className="dropdown-divider"></div>
                        <button className="dropdown-item d-flex align-items-center py-2 text-danger" onClick={logout}>
                            <LogOut size={14} className="mr-2" /> Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
