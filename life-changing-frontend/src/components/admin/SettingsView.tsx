import React, { useState } from 'react';
import { toast } from 'sonner';
import {
    ChevronDown,
    Shield,
    Info,
    CheckCircle,
    CreditCard,
    Smartphone,
    Zap,
    Database,
    Mail,
    RefreshCw,
    Link as LinkIcon
} from 'lucide-react';

export function SettingsView() {
    const [activeTab, setActiveTab] = useState('general');

    const handleSave = (msg: string) => {
        toast.promise(
            new Promise((resolve) => setTimeout(resolve, 1500)),
            {
                loading: 'Applying changes...',
                success: msg,
                error: 'Failed to update settings.',
            }
        );
    };

    const renderGeneralSettings = () => (
        <div className="mt-2">
            {/* Organization Information */}
            <div className="cms-card shadow-sm p-4 mb-4">
                <div className="mb-4">
                    <h6 className="font-weight-bold mb-1" style={{ color: '#111827' }}>Organization Information</h6>
                    <p className="small text-muted mb-0">Update your organization's basic information</p>
                </div>

                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label className="x-small font-weight-bold text-muted mb-2">Organization Name</label>
                        <input type="text" className="form-control" defaultValue="Life-Changing Endeavor Organization"
                            style={{ backgroundColor: '#f9fafb', border: '1px solid #f3f4f6', borderRadius: '8px', fontSize: '13px', padding: '10px 15px' }} />
                    </div>
                    <div className="col-md-6 mb-3">
                        <label className="x-small font-weight-bold text-muted mb-2">Abbreviation</label>
                        <input type="text" className="form-control" defaultValue="LCEO"
                            style={{ backgroundColor: '#f9fafb', border: '1px solid #f3f4f6', borderRadius: '8px', fontSize: '13px', padding: '10px 15px' }} />
                    </div>
                    <div className="col-md-12 mb-3">
                        <label className="x-small font-weight-bold text-muted mb-2">Primary Email</label>
                        <input type="email" className="form-control" defaultValue="info@lceo.org"
                            style={{ backgroundColor: '#f9fafb', border: '1px solid #f3f4f6', borderRadius: '8px', fontSize: '13px', padding: '10px 15px' }} />
                    </div>
                    <div className="col-md-6 mb-3">
                        <label className="x-small font-weight-bold text-muted mb-2">Phone Number</label>
                        <input type="text" className="form-control" defaultValue="+250 780 123 456"
                            style={{ backgroundColor: '#f9fafb', border: '1px solid #f3f4f6', borderRadius: '8px', fontSize: '13px', padding: '10px 15px' }} />
                    </div>
                    <div className="col-md-6 mb-3">
                        <label className="x-small font-weight-bold text-muted mb-2">Website</label>
                        <input type="text" className="form-control" defaultValue="www.lceo.org"
                            style={{ backgroundColor: '#f9fafb', border: '1px solid #f3f4f6', borderRadius: '8px', fontSize: '13px', padding: '10px 15px' }} />
                    </div>
                    <div className="col-md-12 mb-3">
                        <label className="x-small font-weight-bold text-muted mb-2">Address</label>
                        <input type="text" className="form-control" defaultValue="KN 4 Ave, Kigali, Rwanda"
                            style={{ backgroundColor: '#f9fafb', border: '1px solid #f3f4f6', borderRadius: '8px', fontSize: '13px', padding: '10px 15px' }} />
                    </div>
                    <div className="col-md-12 mb-4">
                        <label className="x-small font-weight-bold text-muted mb-2">Mission Statement</label>
                        <textarea className="form-control" rows={3} defaultValue="To walk alongside girls and women as they heal, grow and thrive- through mindset shift and mental resilience, education and economic empowerment"
                            style={{ backgroundColor: '#f9fafb', border: '1px solid #f3f4f6', borderRadius: '8px', fontSize: '13px', padding: '10px 15px' }}>
                        </textarea>
                    </div>
                </div>

                <div className="d-flex justify-content-end gap-2 mt-2">
                    <button className="btn btn-light btn-sm px-4 mr-2" style={{ borderRadius: '8px', fontWeight: '500', fontSize: '13px' }}>Cancel</button>
                    <button className="btn btn-primary btn-sm px-4" style={{ borderRadius: '8px', fontWeight: '500', fontSize: '13px' }} onClick={() => handleSave('Organization info updated!')}>Save Changes</button>
                </div>
            </div>

            {/* Regional Settings */}
            <div className="cms-card shadow-sm p-4 mb-4">
                <div className="mb-4">
                    <h6 className="font-weight-bold mb-1" style={{ color: '#111827' }}>Regional Settings</h6>
                    <p className="small text-muted mb-0">Configure language and timezone preferences</p>
                </div>

                <div className="row">
                    <div className="col-md-6 mb-4">
                        <label className="x-small font-weight-bold text-muted mb-2">Default Language</label>
                        <div className="position-relative">
                            <select className="form-control x-small font-weight-bold pr-5" style={{ backgroundColor: '#f9fafb', border: '1px solid #f3f4f6', borderRadius: '8px', padding: '10px 15px', appearance: 'none', height: 'auto' }}>
                                <option>English</option>
                                <option>French</option>
                                <option>Kinyarwanda</option>
                            </select>
                            <ChevronDown size={14} className="position-absolute" style={{ right: '15px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: 0.5 }} />
                        </div>
                    </div>
                    <div className="col-md-6 mb-4">
                        <label className="x-small font-weight-bold text-muted mb-2">Timezone</label>
                        <div className="position-relative">
                            <select className="form-control x-small font-weight-bold pr-5" style={{ backgroundColor: '#f9fafb', border: '1px solid #f3f4f6', borderRadius: '8px', padding: '10px 15px', appearance: 'none', height: 'auto' }}>
                                <option>East Africa Time (UTC+3)</option>
                                <option>Central Africa Time (UTC+2)</option>
                            </select>
                            <ChevronDown size={14} className="position-absolute" style={{ right: '15px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: 0.5 }} />
                        </div>
                    </div>
                    <div className="col-md-6 mb-4">
                        <label className="x-small font-weight-bold text-muted mb-2">Default Currency</label>
                        <div className="position-relative">
                            <select className="form-control x-small font-weight-bold pr-5" style={{ backgroundColor: '#f9fafb', border: '1px solid #f3f4f6', borderRadius: '8px', padding: '10px 15px', appearance: 'none', height: 'auto' }}>
                                <option>Rwandan Franc (RWF)</option>
                                <option>US Dollar (USD)</option>
                            </select>
                            <ChevronDown size={14} className="position-absolute" style={{ right: '15px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: 0.5 }} />
                        </div>
                    </div>
                    <div className="col-md-6 mb-4">
                        <label className="x-small font-weight-bold text-muted mb-2">Date Format</label>
                        <div className="position-relative">
                            <select className="form-control x-small font-weight-bold pr-5" style={{ backgroundColor: '#f9fafb', border: '1px solid #f3f4f6', borderRadius: '8px', padding: '10px 15px', appearance: 'none', height: 'auto' }}>
                                <option>MM/DD/YYYY</option>
                                <option>DD/MM/YYYY</option>
                            </select>
                            <ChevronDown size={14} className="position-absolute" style={{ right: '15px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: 0.5 }} />
                        </div>
                    </div>
                </div>

                <div className="d-flex justify-content-end gap-2 mt-2">
                    <button className="btn btn-light btn-sm px-4 mr-2" style={{ borderRadius: '8px', fontWeight: '500', fontSize: '13px' }}>Cancel</button>
                    <button className="btn btn-primary btn-sm px-4" style={{ borderRadius: '8px', fontWeight: '500', fontSize: '13px' }} onClick={() => handleSave('Regional settings updated!')}>Save Changes</button>
                </div>
            </div>
        </div>
    );

    const renderNotificationsSettings = () => (
        <div className="mt-2">
            {/* Email Notifications */}
            <div className="cms-card shadow-sm p-4 mb-4">
                <div className="mb-4">
                    <h6 className="font-weight-bold mb-1" style={{ color: '#111827' }}>Email Notifications</h6>
                    <p className="small text-muted mb-0">Manage email notification preferences</p>
                </div>

                <div className="mt-4">
                    {[
                        { title: 'New Donation Notifications', desc: 'Receive alerts for new donations', defaultChecked: true },
                        { title: 'Weekly Tracking Reminders', desc: 'Send reminders to beneficiaries for weekly tracking', defaultChecked: true },
                        { title: 'System Alerts', desc: 'Critical system notifications', defaultChecked: true },
                        { title: 'Monthly Reports', desc: 'Automated monthly impact reports', defaultChecked: true }
                    ].map((item, idx) => (
                        <div key={idx} className="d-flex justify-content-between align-items-center mb-4 pb-4 border-bottom last:border-0">
                            <div>
                                <h6 className="small font-weight-bold mb-1" style={{ color: '#111827' }}>{item.title}</h6>
                                <p className="x-small text-muted mb-0">{item.desc}</p>
                            </div>
                            <label className="cms-switch mb-0">
                                <input type="checkbox" defaultChecked={item.defaultChecked} />
                                <span className="cms-slider"></span>
                            </label>
                        </div>
                    ))}
                </div>

                <div className="d-flex justify-content-end gap-2 mt-2">
                    <button className="btn btn-light btn-sm px-4 mr-2" style={{ borderRadius: '8px', fontWeight: '500', fontSize: '13px' }}>Cancel</button>
                    <button className="btn btn-primary btn-sm px-4" style={{ borderRadius: '8px', fontWeight: '500', fontSize: '13px' }} onClick={() => handleSave('Email settings updated!')}>Save Changes</button>
                </div>
            </div>

            {/* SMS Notifications */}
            <div className="cms-card shadow-sm p-4 mb-4">
                <div className="mb-4">
                    <h6 className="font-weight-bold mb-1" style={{ color: '#111827' }}>SMS Notifications</h6>
                    <p className="small text-muted mb-0">Configure SMS notification settings</p>
                </div>

                <div className="mt-4">
                    {[
                        { title: 'Emergency Alerts', desc: 'Send SMS for urgent matters', defaultChecked: true },
                        { title: 'Appointment Reminders', desc: 'Meeting and session reminders', defaultChecked: true },
                        { title: 'Payment Confirmations', desc: 'Donation receipt confirmations', defaultChecked: false }
                    ].map((item, idx) => (
                        <div key={idx} className="d-flex justify-content-between align-items-center mb-4 pb-4 border-bottom last:border-0">
                            <div>
                                <h6 className="small font-weight-bold mb-1" style={{ color: '#111827' }}>{item.title}</h6>
                                <p className="x-small text-muted mb-0">{item.desc}</p>
                            </div>
                            <label className="cms-switch mb-0">
                                <input type="checkbox" defaultChecked={item.defaultChecked} />
                                <span className="cms-slider"></span>
                            </label>
                        </div>
                    ))}
                </div>

                <div className="d-flex justify-content-end gap-2 mt-2">
                    <button className="btn btn-light btn-sm px-4 mr-2" style={{ borderRadius: '8px', fontWeight: '500', fontSize: '13px' }}>Cancel</button>
                    <button className="btn btn-primary btn-sm px-4" style={{ borderRadius: '8px', fontWeight: '500', fontSize: '13px' }} onClick={() => handleSave('SMS settings updated!')}>Save Changes</button>
                </div>
            </div>
        </div>
    );

    const renderSecuritySettings = () => (
        <div className="mt-2">
            {/* Security Status Banner */}
            <div className="alert border-0 p-4 mb-4 d-flex align-items-start" style={{ backgroundColor: '#f0f7ff', borderRadius: '12px', border: '1px solid #e0f2fe' }}>
                <div className="text-primary mr-3 mt-1">
                    <CheckCircle size={20} />
                </div>
                <div>
                    <h6 className="font-weight-bold mb-1" style={{ color: '#0369a1', fontSize: '14px' }}>Security Status</h6>
                    <p className="small mb-0" style={{ color: '#0c4a6e' }}>Your system security settings are configured correctly.</p>
                </div>
            </div>

            {/* Password Policy */}
            <div className="cms-card shadow-sm p-4 mb-4">
                <div className="mb-4">
                    <h6 className="font-weight-bold mb-1" style={{ color: '#111827' }}>Password Policy</h6>
                    <p className="small text-muted mb-0">Configure password requirements</p>
                </div>

                <div className="mt-4">
                    {[
                        { title: 'Minimum Password Length', desc: 'Require at least 8 characters', type: 'input', value: '8' },
                        { title: 'Require Special Characters', desc: 'Password must include special characters', type: 'switch', defaultChecked: true },
                        { title: 'Require Numbers', desc: 'Password must include numbers', type: 'switch', defaultChecked: true },
                        { title: 'Password Expiration', desc: 'Days until password expires', type: 'input', value: '90' }
                    ].map((item, idx) => (
                        <div key={idx} className="d-flex justify-content-between align-items-center mb-4 pb-4 border-bottom last:border-0">
                            <div>
                                <h6 className="small font-weight-bold mb-1" style={{ color: '#111827' }}>{item.title}</h6>
                                <p className="x-small text-muted mb-0">{item.desc}</p>
                            </div>
                            {item.type === 'switch' ? (
                                <label className="cms-switch mb-0">
                                    <input type="checkbox" defaultChecked={item.defaultChecked} />
                                    <span className="cms-slider"></span>
                                </label>
                            ) : (
                                <input type="text" className="form-control text-center" defaultValue={item.value}
                                    style={{ width: '60px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '6px', fontSize: '12px', padding: '5px' }} />
                            )}
                        </div>
                    ))}
                </div>

                <div className="d-flex justify-content-end gap-2 mt-2">
                    <button className="btn btn-light btn-sm px-4 mr-2" style={{ borderRadius: '8px', fontWeight: '500', fontSize: '13px' }}>Cancel</button>
                    <button className="btn btn-primary btn-sm px-4" style={{ borderRadius: '8px', fontWeight: '500', fontSize: '13px' }} onClick={() => handleSave('Password policy updated!')}>Save Changes</button>
                </div>
            </div>

            {/* Two-Factor Authentication */}
            <div className="cms-card shadow-sm p-4 mb-4">
                <div className="mb-4">
                    <h6 className="font-weight-bold mb-1" style={{ color: '#111827' }}>Two-Factor Authentication</h6>
                    <p className="small text-muted mb-0">Add an extra layer of security</p>
                </div>

                <div className="mt-4">
                    <div className="d-flex justify-content-between align-items-center mb-4 pb-4 border-bottom">
                        <div>
                            <h6 className="small font-weight-bold mb-1" style={{ color: '#111827' }}>Enable 2FA for Admins</h6>
                            <p className="x-small text-muted mb-0">Require two-factor authentication for admin users</p>
                        </div>
                        <label className="cms-switch mb-0">
                            <input type="checkbox" defaultChecked={true} />
                            <span className="cms-slider"></span>
                        </label>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-4 pb-4 border-bottom last:border-0">
                        <div>
                            <h6 className="small font-weight-bold mb-1" style={{ color: '#111827' }}>2FA Method</h6>
                            <p className="x-small text-muted mb-0">Choose authentication method</p>
                        </div>
                        <div className="position-relative">
                            <select className="form-control x-small font-weight-bold pr-4" style={{ width: '100px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '6px', height: '32px', appearance: 'none' }}>
                                <option>SMS</option>
                                <option>Email</option>
                                <option>App</option>
                            </select>
                            <ChevronDown size={12} className="position-absolute" style={{ right: '8px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: 0.5 }} />
                        </div>
                    </div>
                </div>

                <div className="d-flex justify-content-end gap-2 mt-2">
                    <button className="btn btn-light btn-sm px-4 mr-2" style={{ borderRadius: '8px', fontWeight: '500', fontSize: '13px' }}>Cancel</button>
                    <button className="btn btn-primary btn-sm px-4" style={{ borderRadius: '8px', fontWeight: '500', fontSize: '13px' }} onClick={() => handleSave('2FA settings updated!')}>Save Changes</button>
                </div>
            </div>

            {/* Session Management */}
            <div className="cms-card shadow-sm p-4 mb-4">
                <div className="mb-4">
                    <h6 className="font-weight-bold mb-1" style={{ color: '#111827' }}>Session Management</h6>
                    <p className="small text-muted mb-0">Control user session behavior</p>
                </div>

                <div className="mt-4">
                    <div className="d-flex justify-content-between align-items-center mb-4 pb-4 border-bottom">
                        <div>
                            <h6 className="small font-weight-bold mb-1" style={{ color: '#111827' }}>Session Timeout (minutes)</h6>
                            <p className="x-small text-muted mb-0">Auto-logout after inactivity</p>
                        </div>
                        <input type="text" className="form-control text-center" defaultValue="30"
                            style={{ width: '60px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '6px', fontSize: '12px', padding: '5px' }} />
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-4 pb-4 border-bottom last:border-0">
                        <div>
                            <h6 className="small font-weight-bold mb-1" style={{ color: '#111827' }}>Allow Multiple Sessions</h6>
                            <p className="x-small text-muted mb-0">Users can login from multiple devices</p>
                        </div>
                        <label className="cms-switch mb-0">
                            <input type="checkbox" defaultChecked={true} />
                            <span className="cms-slider"></span>
                        </label>
                    </div>
                </div>

                <div className="d-flex justify-content-end gap-2 mt-2">
                    <button className="btn btn-light btn-sm px-4 mr-2" style={{ borderRadius: '8px', fontWeight: '500', fontSize: '13px' }}>Cancel</button>
                    <button className="btn btn-primary btn-sm px-4" style={{ borderRadius: '8px', fontWeight: '500', fontSize: '13px' }} onClick={() => handleSave('Session settings updated!')}>Save Changes</button>
                </div>
            </div>
        </div>
    );

    const renderIntegrationsSettings = () => (
        <div className="mt-2">
            {/* Payment Gateways */}
            <div className="cms-card shadow-sm p-4 mb-4">
                <div className="mb-4">
                    <h6 className="font-weight-bold mb-1" style={{ color: '#111827' }}>Payment Gateways</h6>
                    <p className="small text-muted mb-0">Configure payment processing integrations</p>
                </div>

                <div className="mt-4">
                    {[
                        {
                            name: 'Stripe',
                            desc: 'Credit card processing',
                            status: 'Connected',
                            icon: CreditCard,
                            color: '#6366f1',
                            actions: ['Configure', 'Disconnect']
                        },
                        {
                            name: 'Mobile Money (MTN/Airtel)',
                            desc: 'Mobile payments in Rwanda',
                            status: 'Connected',
                            icon: Smartphone,
                            color: '#f59e0b',
                            actions: ['Configure', 'Disconnect']
                        },
                        {
                            name: 'PayPal',
                            desc: 'International donations',
                            status: 'Not Connected',
                            icon: Zap,
                            color: '#3b82f6',
                            actions: ['Connect']
                        }
                    ].map((item, idx) => (
                        <div key={idx} className="border rounded-lg p-4 mb-3 position-relative overflow-hidden" style={{ backgroundColor: '#fff' }}>
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <div className="d-flex align-items-center">
                                    <div className="p-2 rounded-lg mr-3" style={{ backgroundColor: `${item.color}15`, color: item.color }}>
                                        <item.icon size={20} />
                                    </div>
                                    <div>
                                        <h6 className="small font-weight-bold mb-1" style={{ color: '#111827' }}>{item.name}</h6>
                                        <p className="x-small text-muted mb-0">{item.desc}</p>
                                    </div>
                                </div>
                                <span className={`badge ${item.status === 'Connected' ? 'success-badge-light' : 'badge-light text-muted border'} d-flex align-items-center`} style={{ fontSize: '10px', padding: '4px 10px', borderRadius: '6px' }}>
                                    {item.status === 'Connected' && <CheckCircle size={10} className="mr-1" />} {item.status}
                                </span>
                            </div>
                            <div className="d-flex gap-2">
                                {item.actions.map((action, aidx) => (
                                    <button
                                        key={aidx}
                                        className={`btn btn-sm px-3 font-weight-bold x-small ${action === 'Disconnect' ? 'btn-outline-danger' : action === 'Connect' ? 'btn-primary' : 'btn-light border'} ${aidx < item.actions.length - 1 ? 'mr-2' : ''}`}
                                        style={{ borderRadius: '6px' }}
                                        onClick={() => action === 'Connect' ? handleSave(`${item.name} connected!`) : undefined}
                                    >
                                        {action}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Data Collection Tools */}
            <div className="cms-card shadow-sm p-4 mb-4">
                <div className="mb-4">
                    <h6 className="font-weight-bold mb-1" style={{ color: '#111827' }}>Data Collection Tools</h6>
                    <p className="small text-muted mb-0">Integrate with data collection platforms</p>
                </div>

                <div className="mt-4">
                    <div className="border rounded-lg p-4 mb-3" style={{ backgroundColor: '#fff' }}>
                        <div className="d-flex justify-content-between align-items-start mb-3">
                            <div className="d-flex align-items-center">
                                <div className="p-2 rounded-lg mr-3" style={{ backgroundColor: '#f9731615', color: '#f97316' }}>
                                    <Database size={20} />
                                </div>
                                <div>
                                    <h6 className="small font-weight-bold mb-1" style={{ color: '#111827' }}>KoboToolbox</h6>
                                    <p className="x-small text-muted mb-0">Field data collection</p>
                                </div>
                            </div>
                            <span className="badge success-badge-light d-flex align-items-center" style={{ fontSize: '10px', padding: '4px 10px', borderRadius: '6px' }}>
                                <CheckCircle size={10} className="mr-1" /> Connected
                            </span>
                        </div>
                        <div className="d-flex">
                            <button className="btn btn-sm btn-light border px-3 mr-2 font-weight-bold x-small" style={{ borderRadius: '6px' }}>Configure</button>
                            <button className="btn btn-sm btn-light border px-3 font-weight-bold x-small d-flex align-items-center" style={{ borderRadius: '6px' }}>
                                <RefreshCw size={12} className="mr-1" /> Sync Data
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Communication Tools */}
            <div className="cms-card shadow-sm p-4 mb-4">
                <div className="mb-4">
                    <h6 className="font-weight-bold mb-1" style={{ color: '#111827' }}>Communication Tools</h6>
                    <p className="small text-muted mb-0">Email and SMS service providers</p>
                </div>

                <div className="mt-4">
                    <div className="border rounded-lg p-4 mb-3" style={{ backgroundColor: '#fff' }}>
                        <div className="d-flex justify-content-between align-items-start mb-3">
                            <div className="d-flex align-items-center">
                                <div className="p-2 rounded-lg mr-3" style={{ backgroundColor: '#10b98115', color: '#10b981' }}>
                                    <Mail size={20} />
                                </div>
                                <div>
                                    <h6 className="small font-weight-bold mb-1" style={{ color: '#111827' }}>SendGrid</h6>
                                    <p className="x-small text-muted mb-0">Email delivery service</p>
                                </div>
                            </div>
                            <span className="badge success-badge-light d-flex align-items-center" style={{ fontSize: '10px', padding: '4px 10px', borderRadius: '6px' }}>
                                <CheckCircle size={10} className="mr-1" /> Connected
                            </span>
                        </div>
                        <div className="d-flex">
                            <button className="btn btn-sm btn-light border px-4 font-weight-bold x-small" style={{ borderRadius: '6px' }}>Configure</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="p-1 pt-3">
            {/* Tabs Section */}
            <div className="cms-tabs mb-4">
                <button
                    className={`cms-tab ${activeTab === 'general' ? 'active' : ''}`}
                    onClick={() => setActiveTab('general')}
                >
                    General
                </button>
                <button
                    className={`cms-tab ${activeTab === 'notifications' ? 'active' : ''}`}
                    onClick={() => setActiveTab('notifications')}
                >
                    Notifications
                </button>
                <button
                    className={`cms-tab ${activeTab === 'security' ? 'active' : ''}`}
                    onClick={() => setActiveTab('security')}
                >
                    Security
                </button>
                <button
                    className={`cms-tab ${activeTab === 'integrations' ? 'active' : ''}`}
                    onClick={() => setActiveTab('integrations')}
                >
                    Integrations
                </button>
            </div>

            {/* Conditional Rendering */}
            {activeTab === 'general' && renderGeneralSettings()}
            {activeTab === 'notifications' && renderNotificationsSettings()}
            {activeTab === 'security' && renderSecuritySettings()}
            {activeTab === 'integrations' && renderIntegrationsSettings()}
        </div>
    );
}
