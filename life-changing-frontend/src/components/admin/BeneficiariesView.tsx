import React, { useState } from 'react';
import { mockBeneficiaries, mockPrograms } from '../../lib/mock-data';
import { BeneficiaryStatus, Beneficiary } from '../../lib/types';
import { toast } from 'sonner';
import {
    Plus,
    Eye,
    Trash2,
    Download,
    Search,
    Filter,
    X
} from 'lucide-react';

interface BeneficiariesViewProps {
    onAdd?: () => void;
}

export function BeneficiariesView({ onAdd }: BeneficiariesViewProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [programFilter, setProgramFilter] = useState<string>('all');
    const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null);

    // Filtering logic
    const filteredBeneficiaries = mockBeneficiaries.filter(beneficiary => {
        const matchesSearch = beneficiary.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            beneficiary.location.district.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || beneficiary.status === statusFilter;
        const matchesProgram = programFilter === 'all' || beneficiary.program.id === programFilter;

        return matchesSearch && matchesStatus && matchesProgram;
    });

    const formatDate = (date: Date) => {
        if (!date) return 'N/A';
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        }).format(new Date(date));
    };

    return (
        <div className="pt-3">
            <div className="cms-card mb-4">
                <div className="cms-card-header">
                    <h5 className="font-weight-bold mb-0 text-accent">Manage Beneficiaries</h5>
                    <div className="d-flex">
                        <button className="btn btn-outline-primary btn-sm mr-2 d-flex align-items-center" onClick={() => toast.info('Exporting beneficiary data...')}>
                            <Download size={14} className="mr-1" /> Export Data
                        </button>
                        <button className="btn btn-primary btn-sm d-flex align-items-center" onClick={onAdd}>
                            <Plus size={14} className="mr-1" /> Add New
                        </button>
                    </div>
                </div>
                <div className="row p-4">
                    <div className="col-md-4">
                        <div className="position-relative">
                            <Search size={16} className="position-absolute text-muted" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type="text"
                                className="form-control form-control-custom pl-5"
                                placeholder="Search by name or district..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="position-relative">
                            <Filter size={14} className="position-absolute text-muted" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                            <select className="form-control form-control-custom pl-5" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                <option value="all">All Statuses</option>
                                <option value={BeneficiaryStatus.ACTIVE}>Active</option>
                                <option value={BeneficiaryStatus.GRADUATED}>Graduated</option>
                                <option value={BeneficiaryStatus.INACTIVE}>Inactive</option>
                            </select>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="position-relative">
                            <Filter size={14} className="position-absolute text-muted" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                            <select className="form-control form-control-custom pl-5" value={programFilter} onChange={(e) => setProgramFilter(e.target.value)}>
                                <option value="all">All Programs</option>
                                {mockPrograms.map(p => (
                                    <option key={p.id} value={p.id}>{p.name.en}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table cms-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Program</th>
                                <th>Location</th>
                                <th>Enrollment</th>
                                <th>Status</th>
                                <th>Last Tracking</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBeneficiaries.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-4 text-muted">No beneficiaries found matching your criteria.</td>
                                </tr>
                            ) : (
                                filteredBeneficiaries.map((beneficiary) => (
                                    <tr key={beneficiary.id}>
                                        <td>
                                            <div className="font-weight-bold">{beneficiary.fullName}</div>
                                            <div className="small text-muted">{beneficiary.user.phone}</div>
                                        </td>
                                        <td>{beneficiary.program.name.en}</td>
                                        <td>
                                            {beneficiary.location.district}
                                            <div className="small text-muted">{beneficiary.location.sector}</div>
                                        </td>
                                        <td>{formatDate(beneficiary.enrollmentDate)}</td>
                                        <td>
                                            <span className={`badge badge-pill ${beneficiary.status === BeneficiaryStatus.ACTIVE ? 'badge-success' :
                                                beneficiary.status === BeneficiaryStatus.GRADUATED ? 'badge-info' :
                                                    'badge-secondary'
                                                } text-white px-3 py-1`}>
                                                {beneficiary.status}
                                            </span>
                                        </td>
                                        <td>{beneficiary.lastTrackingDate ? formatDate(beneficiary.lastTrackingDate) : 'Never'}</td>
                                        <td className="text-right">
                                            <button
                                                className="btn-action btn-edit mr-2"
                                                onClick={() => setSelectedBeneficiary(beneficiary)}
                                                title="View Details"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button className="btn-action btn-delete" title="Delete">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="p-3 border-top text-center text-muted small">
                    Showing {filteredBeneficiaries.length} of {mockBeneficiaries.length} records
                </div>
            </div>

            {/* Details Modal */}
            {selectedBeneficiary && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1050
                }}>
                    <div className="modal-content-custom" style={{ width: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div className="modal-header-custom d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 font-weight-bold text-accent">Beneficiary Details</h5>
                            <button className="btn btn-link text-dark p-0" onClick={() => setSelectedBeneficiary(null)}>
                                <X size={24} />
                            </button>
                        </div>
                        <div className="modal-body-custom">
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <label className="small text-muted font-weight-bold text-uppercase">Full Name</label>
                                    <div className="font-weight-bold">{selectedBeneficiary.fullName}</div>
                                </div>
                                <div className="col-md-6">
                                    <label className="small text-muted font-weight-bold text-uppercase">Status</label>
                                    <div>{selectedBeneficiary.status}</div>
                                </div>
                            </div>
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <label className="small text-muted font-weight-bold text-uppercase">Program</label>
                                    <div>{selectedBeneficiary.program.name.en}</div>
                                </div>
                                <div className="col-md-6">
                                    <label className="small text-muted font-weight-bold text-uppercase">Phone</label>
                                    <div>{selectedBeneficiary.user.phone}</div>
                                </div>
                            </div>
                            <div className="row mb-3">
                                <div className="col-md-12">
                                    <label className="small text-muted font-weight-bold text-uppercase">Location</label>
                                    <div>{selectedBeneficiary.location.village}, {selectedBeneficiary.location.cell}, {selectedBeneficiary.location.sector}, {selectedBeneficiary.location.district}</div>
                                </div>
                            </div>
                            <h6 className="font-weight-bold mt-4 mb-3 border-bottom pb-2">Business Info</h6>
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <label className="small text-muted font-weight-bold text-uppercase">Business Type</label>
                                    <div>{selectedBeneficiary.businessType}</div>
                                </div>
                                <div className="col-md-6">
                                    <label className="small text-muted font-weight-bold text-uppercase">Initial Capital</label>
                                    <div className="text-success font-weight-bold">{selectedBeneficiary.startCapital.toLocaleString()} RWF</div>
                                </div>
                            </div>
                        </div>
                        <div className="text-right p-4 border-top">
                            <button className="btn btn-secondary mr-2" onClick={() => setSelectedBeneficiary(null)}>Close</button>
                            <button className="btn btn-primary">Edit Details</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
