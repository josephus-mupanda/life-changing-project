import React, { useState } from 'react';
import { mockDonors } from '../../lib/mock-data';
import { Donor } from '../../lib/types';
import {
    Plus,
    Eye,
    X,
    User,
    Mail,
    Globe,
    Phone,
    Calendar,
    DollarSign,
    TrendingUp,
    Search,
    Filter
} from 'lucide-react';
import {
    BarChart,
    Bar,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';

interface DonorsViewProps {
    onAdd?: () => void;
}

export function DonorsView({ onAdd }: DonorsViewProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);

    const filteredDonors = mockDonors.filter(donor => {
        const matchesSearch = donor.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            donor.user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            donor.country.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesType = typeFilter === 'all' ||
            (typeFilter === 'recurring' && donor.isRecurringDonor) ||
            (typeFilter === 'one-time' && !donor.isRecurringDonor);

        return matchesSearch && matchesType;
    });

    const totalDonors = mockDonors.length;
    const recurringDonors = mockDonors.filter(d => d.isRecurringDonor).length;
    const totalDonated = mockDonors.reduce((sum, d) => sum + d.totalDonated, 0);
    const avgDonation = totalDonors > 0 ? totalDonated / totalDonors : 0;

    const monthlyDonations = [
        { month: 'Jan', amount: 5000 },
        { month: 'Feb', amount: 6000 },
        { month: 'Mar', amount: 7500 },
        { month: 'Apr', amount: 6500 },
        { month: 'May', amount: 8000 },
        { month: 'Jun', amount: 9000 },
    ];

    const donorsByCountry = [
        { name: 'USA', value: 5, color: '#4c9789' },
        { name: 'UK', value: 2, color: '#6fb3a6' },
        { name: 'Canada', value: 1, color: '#eacfa2' },
        { name: 'Rwanda', value: 2, color: '#3a7369' },
    ];

    return (
        <div className="pt-3">
            {/* Stats Cards */}
            <div className="row mb-4">
                <div className="col-md-3">
                    <div className="cms-card p-4 h-100">
                        <div className="text-muted small text-uppercase font-weight-bold d-flex align-items-center mb-1">
                            <User size={14} className="mr-1" /> Total Donors
                        </div>
                        <div className="font-weight-bold h3 mb-0">{totalDonors}</div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="cms-card p-4 h-100">
                        <div className="text-muted small text-uppercase font-weight-bold d-flex align-items-center mb-1">
                            <TrendingUp size={14} className="mr-1" /> Recurring
                        </div>
                        <div className="font-weight-bold h3 mb-0 text-primary">{recurringDonors}</div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="cms-card p-4 h-100">
                        <div className="text-muted small text-uppercase font-weight-bold d-flex align-items-center mb-1">
                            <DollarSign size={14} className="mr-1" /> Total Donated
                        </div>
                        <div className="font-weight-bold h3 mb-0 text-success">${totalDonated.toLocaleString()}</div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="cms-card p-4 h-100">
                        <div className="text-muted small text-uppercase font-weight-bold d-flex align-items-center mb-1">
                            <TrendingUp size={14} className="mr-1" /> Avg. Donation
                        </div>
                        <div className="font-weight-bold h3 mb-0 text-info">${avgDonation.toFixed(0)}</div>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="row mb-4">
                <div className="col-lg-8 mb-4">
                    <div className="cms-card h-100">
                        <div className="cms-card-header">
                            <h5 className="font-weight-bold mb-0 text-accent">Monthly Trends</h5>
                        </div>
                        <div className="p-4" style={{ height: '350px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={monthlyDonations}>
                                    <defs>
                                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} />
                                    <YAxis axisLine={false} tickLine={false} />
                                    <Tooltip cursor={{ fill: '#f8f9fa' }} />
                                    <Area type="monotone" dataKey="amount" stroke="var(--primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorAmount)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
                <div className="col-lg-4 mb-4">
                    <div className="cms-card h-100">
                        <div className="cms-card-header">
                            <h5 className="font-weight-bold mb-0 text-accent">By Location</h5>
                        </div>
                        <div className="p-4" style={{ height: '350px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={donorsByCountry}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {donorsByCountry.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="text-center mt-3">
                                {donorsByCountry.map(entry => (
                                    <span key={entry.name} className="badge badge-light mr-2 mb-2 p-2">
                                        <span className="mr-2" style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: entry.color }}></span>
                                        {entry.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Donors Table */}
            <div className="cms-card">
                <div className="cms-card-header">
                    <h5 className="font-weight-bold mb-0 text-accent">Active Donors List</h5>
                    <button className="btn btn-primary btn-sm d-flex align-items-center" onClick={onAdd}>
                        <Plus size={14} className="mr-1" /> Add New Donor
                    </button>
                </div>
                <div className="row p-4">
                    <div className="col-md-8">
                        <div className="position-relative">
                            <Search size={16} className="position-absolute text-muted" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type="text"
                                className="form-control form-control-custom pl-5"
                                placeholder="Search donors by name, email or country..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="position-relative">
                            <Filter size={14} className="position-absolute text-muted" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                            <select className="form-control form-control-custom pl-5" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                                <option value="all">All Donor Types</option>
                                <option value="recurring">Recurring Donors</option>
                                <option value="one-time">One-time Donors</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div className="table-responsive">
                    <table className="table cms-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Country</th>
                                <th>Total Donated</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDonors.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-4 text-muted">No donors found matching your search.</td>
                                </tr>
                            ) : (
                                filteredDonors.map(donor => (
                                    <tr key={donor.id}>
                                        <td className="font-weight-bold">{donor.fullName}</td>
                                        <td>{donor.user.email}</td>
                                        <td>{donor.country}</td>
                                        <td>${donor.totalDonated.toLocaleString()}</td>
                                        <td>
                                            <span className={`badge ${donor.isRecurringDonor ? 'badge-primary' : 'badge-success'} text-white px-3 py-1 rounded-pill`}>
                                                {donor.isRecurringDonor ? 'Recurring' : 'Active'}
                                            </span>
                                        </td>
                                        <td>
                                            <button className="btn-action btn-edit" onClick={() => setSelectedDonor(donor)} title="View Profile">
                                                <Eye size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Details Modal */}
            {selectedDonor && (
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
                            <h4 className="mb-0 font-weight-bold text-accent">Donor Details</h4>
                            <button className="btn btn-link text-dark p-0" onClick={() => setSelectedDonor(null)}>
                                <X size={24} />
                            </button>
                        </div>
                        <div className="modal-body-custom">
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <label className="small text-muted font-weight-bold text-uppercase">Full Name</label>
                                    <div className="font-weight-bold">{selectedDonor.fullName}</div>
                                </div>
                                <div className="col-md-6">
                                    <label className="small text-muted font-weight-bold text-uppercase">Email</label>
                                    <div>{selectedDonor.user.email}</div>
                                </div>
                            </div>
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <label className="small text-muted font-weight-bold text-uppercase">Country</label>
                                    <div>{selectedDonor.country}</div>
                                </div>
                                <div className="col-md-6">
                                    <label className="small text-muted font-weight-bold text-uppercase">Phone</label>
                                    <div>{selectedDonor.user.phone}</div>
                                </div>
                            </div>

                            <h6 className="font-weight-bold mt-4 mb-3 border-bottom pb-2">Donation Summary</h6>
                            <div className="row mb-3">
                                <div className="col-md-4">
                                    <label className="small text-muted font-weight-bold text-uppercase">Total Donated</label>
                                    <div className="text-success font-weight-bold display-4" style={{ fontSize: '1.5rem' }}>${selectedDonor.totalDonated.toLocaleString()}</div>
                                </div>
                                <div className="col-md-4">
                                    <label className="small text-muted font-weight-bold text-uppercase">Recurring?</label>
                                    <div><span className={`badge ${selectedDonor.isRecurringDonor ? 'badge-primary' : 'badge-secondary'}`}>{selectedDonor.isRecurringDonor ? 'Yes, Recurring' : 'One-time'}</span></div>
                                </div>
                                <div className="col-md-4">
                                    <label className="small text-muted font-weight-bold text-uppercase">Last Donation</label>
                                    <div>{selectedDonor.lastDonationDate
                                        ? new Date(selectedDonor.lastDonationDate).toLocaleDateString()
                                        : 'Never'}</div>
                                </div>
                            </div>
                        </div>
                        <div className="text-right p-4 border-top">
                            <button className="btn btn-secondary mr-2" onClick={() => setSelectedDonor(null)}>Close</button>
                            <button className="btn btn-primary">Edit Donor</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
