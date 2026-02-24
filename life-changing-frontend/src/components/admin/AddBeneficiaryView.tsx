import React, { useState } from 'react';
import { mockPrograms } from '../../lib/mock-data';
import { ArrowLeft, Save, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface AddBeneficiaryViewProps {
    onCancel: () => void;
    onSuccess: () => void;
}

export function AddBeneficiaryView({ onCancel, onSuccess }: AddBeneficiaryViewProps) {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        location: '',
        education: '',
        program: '',
        emergencyContact: '',
        emergencyPhone: '',
        notes: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Mock API call
        setTimeout(() => {
            setLoading(false);
            toast.success('Beneficiary Added Successfully!');
            onSuccess();
        }, 1500);
    };

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="container-fluid pb-5">
            <div className="row justify-content-center">
                <div className="col-xl-8 col-lg-10">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2 className="font-weight-bold mb-0">Add Beneficiary</h2>
                        <button className="btn btn-outline-secondary btn-sm d-flex align-items-center px-3" style={{ borderRadius: '8px' }} onClick={onCancel}>
                            <ArrowLeft size={14} className="mr-1" /> Back to List
                        </button>
                    </div>

                    <div className="cms-card shadow-soft">
                        <div className="cms-card-header bg-white border-bottom py-3">
                            <h5 className="mb-0 font-weight-bold text-accent">Beneficiary Enrollment Form</h5>
                        </div>
                        <div className="card-body p-4 p-md-5">
                            <form onSubmit={handleSubmit}>
                                <h6 className="font-weight-bold text-muted mb-4 text-uppercase small" style={{ letterSpacing: '1px' }}>Personal Details</h6>
                                <div className="form-row">
                                    <div className="form-group col-md-6 mb-4">
                                        <label className="small font-weight-bold text-muted mb-2">Full Name *</label>
                                        <input type="text" className="form-control form-control-custom" required
                                            value={formData.fullName} onChange={e => handleChange('fullName', e.target.value)} />
                                    </div>
                                    <div className="form-group col-md-6 mb-4">
                                        <label className="small font-weight-bold text-muted mb-2">Date of Birth *</label>
                                        <input type="date" className="form-control form-control-custom" required
                                            value={formData.dateOfBirth} onChange={e => handleChange('dateOfBirth', e.target.value)} />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group col-md-6 mb-4">
                                        <label className="small font-weight-bold text-muted mb-2">Location *</label>
                                        <input type="text" className="form-control form-control-custom" placeholder="District, Sector" required
                                            value={formData.location} onChange={e => handleChange('location', e.target.value)} />
                                    </div>
                                    <div className="form-group col-md-6 mb-4">
                                        <label className="small font-weight-bold text-muted mb-2">Education Level</label>
                                        <select className="form-control form-control-custom"
                                            value={formData.education} onChange={e => handleChange('education', e.target.value)}>
                                            <option value="">Select Level</option>
                                            <option value="primary">Primary School</option>
                                            <option value="secondary">Secondary School</option>
                                            <option value="vocational">Vocational Training</option>
                                            <option value="university">University</option>
                                            <option value="none">None</option>
                                        </select>
                                    </div>
                                </div>

                                <h6 className="font-weight-bold text-muted mb-4 mt-2 text-uppercase small" style={{ letterSpacing: '1px' }}>Contact Information</h6>
                                <div className="form-row">
                                    <div className="form-group col-md-6 mb-4">
                                        <label className="small font-weight-bold text-muted mb-2">Email Address *</label>
                                        <input type="email" className="form-control form-control-custom" required
                                            value={formData.email} onChange={e => handleChange('email', e.target.value)} />
                                    </div>
                                    <div className="form-group col-md-6 mb-4">
                                        <label className="small font-weight-bold text-muted mb-2">Phone Number *</label>
                                        <input type="tel" className="form-control form-control-custom" required
                                            value={formData.phone} onChange={e => handleChange('phone', e.target.value)} />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group col-md-6 mb-4">
                                        <label className="small font-weight-bold text-muted mb-2">Emergency Contact Name</label>
                                        <input type="text" className="form-control form-control-custom"
                                            value={formData.emergencyContact} onChange={e => handleChange('emergencyContact', e.target.value)} />
                                    </div>
                                    <div className="form-group col-md-6 mb-4">
                                        <label className="small font-weight-bold text-muted mb-2">Emergency Contact Phone</label>
                                        <input type="tel" className="form-control form-control-custom"
                                            value={formData.emergencyPhone} onChange={e => handleChange('emergencyPhone', e.target.value)} />
                                    </div>
                                </div>

                                <h6 className="font-weight-bold text-muted mb-4 mt-2 text-uppercase small" style={{ letterSpacing: '1px' }}>Program Assignment</h6>
                                <div className="form-group mb-4">
                                    <label className="small font-weight-bold text-muted mb-2">Assign to Program</label>
                                    <select className="form-control form-control-custom"
                                        value={formData.program} onChange={e => handleChange('program', e.target.value)}>
                                        <option value="">Select a Program</option>
                                        {mockPrograms.map(p => (
                                            <option key={p.id} value={p.id}>{p.name.en}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group mb-4">
                                    <label className="small font-weight-bold text-muted mb-2">Additional Notes</label>
                                    <textarea className="form-control form-control-custom" rows={3}
                                        value={formData.notes} onChange={e => handleChange('notes', e.target.value)}></textarea>
                                </div>

                                <div className="border-top pt-4 mt-4 d-flex justify-content-end gap-2">
                                    <button type="button" className="btn btn-light px-4 mr-2 d-flex align-items-center font-weight-bold" style={{ borderRadius: '8px' }} onClick={onCancel} disabled={loading}>
                                        <XCircle size={16} className="mr-2" /> Discard
                                    </button>
                                    <button type="submit" className="btn btn-primary px-5 d-flex align-items-center font-weight-bold" style={{ borderRadius: '8px' }} disabled={loading}>
                                        {loading ? 'Processing...' : <><Save size={16} className="mr-2" /> Save Beneficiary</>}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
