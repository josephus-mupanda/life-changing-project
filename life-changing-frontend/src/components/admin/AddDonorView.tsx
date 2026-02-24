import React, { useState } from 'react';
import { ArrowLeft, Save, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface AddDonorViewProps {
    onCancel: () => void;
    onSuccess: () => void;
}

export function AddDonorView({ onCancel, onSuccess }: AddDonorViewProps) {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        organization: '',
        type: 'individual',
        country: '',
        city: '',
        notes: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Mock API call
        setTimeout(() => {
            setLoading(false);
            toast.success('Donor Added Successfully!');
            onSuccess();
        }, 1500);
    };

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="font-weight-bold mb-0">Add Donor</h2>
                <button className="btn btn-outline-secondary btn-sm d-flex align-items-center" onClick={onCancel}>
                    <ArrowLeft size={14} className="mr-1" /> Back to List
                </button>
            </div>

            <div className="cms-card shadow-soft">
                <div className="cms-card-header bg-white border-bottom">
                    <h5 className="mb-0 font-weight-bold text-accent">Donor Registration Form</h5>
                </div>
                <div className="card-body p-4">
                    <form onSubmit={handleSubmit}>
                        <h6 className="font-weight-bold text-muted mb-4 text-uppercase small" style={{ letterSpacing: '1px' }}>Basic Information</h6>
                        <div className="form-row">
                            <div className="form-group col-md-6 mb-3">
                                <label className="small font-weight-bold text-muted">Full Name *</label>
                                <input type="text" className="form-control form-control-custom" required
                                    value={formData.fullName} onChange={e => handleChange('fullName', e.target.value)} />
                            </div>
                            <div className="form-group col-md-6 mb-3">
                                <label className="small font-weight-bold text-muted">Donor Type *</label>
                                <select className="form-control form-control-custom" required
                                    value={formData.type} onChange={e => handleChange('type', e.target.value)}>
                                    <option value="individual">Individual</option>
                                    <option value="corporate">Corporate</option>
                                    <option value="foundation">Foundation</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group col-md-12 mb-3">
                                <label className="small font-weight-bold text-muted">Organization (if applicable)</label>
                                <input type="text" className="form-control form-control-custom"
                                    value={formData.organization} onChange={e => handleChange('organization', e.target.value)} />
                            </div>
                        </div>

                        <h6 className="font-weight-bold text-muted mb-4 mt-4 text-uppercase small" style={{ letterSpacing: '1px' }}>Contact & Location</h6>
                        <div className="form-row">
                            <div className="form-group col-md-6 mb-3">
                                <label className="small font-weight-bold text-muted">Email Address *</label>
                                <input type="email" className="form-control form-control-custom" required
                                    value={formData.email} onChange={e => handleChange('email', e.target.value)} />
                            </div>
                            <div className="form-group col-md-6 mb-3">
                                <label className="small font-weight-bold text-muted">Phone Number *</label>
                                <input type="tel" className="form-control form-control-custom" required
                                    value={formData.phone} onChange={e => handleChange('phone', e.target.value)} />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group col-md-6 mb-3">
                                <label className="small font-weight-bold text-muted">Country *</label>
                                <input type="text" className="form-control form-control-custom" required
                                    value={formData.country} onChange={e => handleChange('country', e.target.value)} />
                            </div>
                            <div className="form-group col-md-6 mb-3">
                                <label className="small font-weight-bold text-muted">City</label>
                                <input type="text" className="form-control form-control-custom"
                                    value={formData.city} onChange={e => handleChange('city', e.target.value)} />
                            </div>
                        </div>

                        <div className="form-group mb-4">
                            <label className="small font-weight-bold text-muted">Additional Notes</label>
                            <textarea className="form-control form-control-custom" rows={3}
                                value={formData.notes} onChange={e => handleChange('notes', e.target.value)}></textarea>
                        </div>

                        <div className="border-top pt-4 mt-4 d-flex justify-content-end">
                            <button type="button" className="btn btn-outline-secondary mr-2 d-flex align-items-center" onClick={onCancel} disabled={loading}>
                                <XCircle size={16} className="mr-1" /> Discard
                            </button>
                            <button type="submit" className="btn btn-primary px-5 d-flex align-items-center" disabled={loading}>
                                {loading ? 'Processing...' : <><Save size={16} className="mr-1" /> Save Donor</>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
