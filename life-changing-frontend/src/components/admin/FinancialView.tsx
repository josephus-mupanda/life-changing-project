import React from 'react';
import { toast } from 'sonner';
import {
    Download,
    TrendingUp,
    TrendingDown,
    DollarSign,
    CreditCard,
    ArrowRight,
    PieChart as PieChartIcon,
    History,
    Filter,
    FileText
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell
} from 'recharts';
import { mockDonations } from '../../lib/mock-data';

export function FinancialView() {
    const revenueData = [
        { name: 'Jan', revenue: 4500, expenses: 3200 },
        { name: 'Feb', revenue: 5200, expenses: 3800 },
        { name: 'Mar', revenue: 4800, expenses: 4100 },
        { name: 'Apr', revenue: 6100, expenses: 4200 },
        { name: 'May', revenue: 5900, expenses: 4500 },
        { name: 'Jun', revenue: 7200, expenses: 4800 },
    ];

    const budgetData = [
        { name: 'Education', allocated: 25000, spent: 18500 },
        { name: 'Health', allocated: 15000, spent: 12400 },
        { name: 'Entrepreneurship', allocated: 20000, spent: 15600 },
        { name: 'Operations', allocated: 10000, spent: 9200 },
    ];

    const COLORS = ['#4c9789', '#eacfa2', '#6fb3a6', '#3a7369'];

    const handleExport = (type: string) => {
        toast.info(`Exporting ${type} financial data...`);
    };

    return (
        <div className="p-1 pt-3">
            {/* Financial Summary Cards */}
            <div className="row mb-4">
                <div className="col-md-3 mb-3">
                    <div className="cms-card p-3 border-0 shadow-sm h-100">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                            <div className="bg-primary-light text-primary p-2 rounded-lg">
                                <DollarSign size={20} />
                            </div>
                        </div>
                        <div className="text-muted x-small font-weight-bold text-uppercase mb-1">Total Budget</div>
                        <h4 className="font-weight-bold mb-0 text-accent">$250,000</h4>
                        <p className="x-small text-muted mb-0 mt-1">2023-2024 Fiscal Year</p>
                    </div>
                </div>
                <div className="col-md-3 mb-3">
                    <div className="cms-card p-3 border-0 shadow-sm h-100">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                            <div className="bg-info-light text-info p-2 rounded-lg">
                                <TrendingUp size={20} />
                            </div>
                        </div>
                        <div className="text-muted x-small font-weight-bold text-uppercase mb-1">Funds Allocated</div>
                        <h4 className="font-weight-bold mb-0 text-accent">$185,200</h4>
                        <p className="x-small text-muted mb-0 mt-1">Direct program funding</p>
                    </div>
                </div>
                <div className="col-md-3 mb-3">
                    <div className="cms-card p-3 border-0 shadow-sm h-100">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                            <div className="bg-success-light text-success p-2 rounded-lg">
                                <TrendingUp size={20} />
                            </div>
                        </div>
                        <div className="text-muted x-small font-weight-bold text-uppercase mb-1">Funds Utilized</div>
                        <h4 className="font-weight-bold mb-0 text-accent">$124,500</h4>
                        <p className="x-small text-muted mb-0 mt-1">YTD disbursement</p>
                    </div>
                </div>
                <div className="col-md-3 mb-3">
                    <div className="cms-card p-3 border-0 shadow-sm h-100">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                            <div className="bg-warning-light text-warning p-2 rounded-lg">
                                <DollarSign size={20} />
                            </div>
                        </div>
                        <div className="text-muted x-small font-weight-bold text-uppercase mb-1">Total Donations</div>
                        <h4 className="font-weight-bold mb-0 text-accent">$156,700</h4>
                        <p className="x-small text-muted mb-0 mt-1">From all channels</p>
                    </div>
                </div>
            </div>

            <div className="row mb-4">
                {/* Revenue vs Expenses Chart */}
                <div className="col-lg-8">
                    <div className="cms-card h-100 border-0 shadow-sm">
                        <div className="cms-card-header bg-white border-0 py-3 px-4 d-flex justify-content-between align-items-center">
                            <div>
                                <h6 className="font-weight-bold mb-0">Financial Performance</h6>
                                <p className="x-small text-muted mb-0">Monthly revenue and expenses overview</p>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                                <button className="btn btn-sm btn-light border-0"><Filter size={14} /></button>
                                <select className="form-control-sm border-0 bg-light x-small font-weight-bold">
                                    <option>Last 6 Months</option>
                                    <option>2023 Full Year</option>
                                </select>
                            </div>
                        </div>
                        <div className="p-4" style={{ height: '350px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revenueData}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4c9789" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#4c9789" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6c757d' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6c757d' }} />
                                    <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} />
                                    <Area type="monotone" dataKey="revenue" stroke="#4c9789" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" name="Revenue" />
                                    <Area type="monotone" dataKey="expenses" stroke="#dc3545" strokeWidth={2} fill="transparent" name="Expenses" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Budget Allocation */}
                <div className="col-lg-4">
                    <div className="cms-card h-100 border-0 shadow-sm">
                        <div className="cms-card-header bg-white border-0 py-3 px-4">
                            <h6 className="font-weight-bold mb-0">Budget Allocation</h6>
                            <p className="x-small text-muted mb-0">Budget vs Actual Spend by Category</p>
                        </div>
                        <div className="p-4">
                            {budgetData.map((item, i) => (
                                <div key={i} className="mb-4">
                                    <div className="d-flex justify-content-between x-small font-weight-bold text-muted mb-1">
                                        <span>{item.name}</span>
                                        <span>${item.spent.toLocaleString()} / ${item.allocated.toLocaleString()}</span>
                                    </div>
                                    <div className="progress" style={{ height: '6px', borderRadius: '3px' }}>
                                        <div
                                            className="progress-bar"
                                            role="progressbar"
                                            style={{
                                                width: `${(item.spent / item.allocated) * 100}%`,
                                                backgroundColor: COLORS[i % COLORS.length]
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                            <button className="btn btn-outline-primary btn-sm btn-block mt-2 font-weight-bold">View Budget Details</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Financial Reports Section as per image */}
            <div className="cms-card border-0 shadow-sm mb-4">
                <div className="p-4">
                    <h6 className="font-weight-bold mb-1">Financial Reports</h6>
                    <p className="small text-muted mb-4">Download comprehensive financial statements</p>

                    <div className="row">
                        {[
                            { title: 'Budget Report', period: 'Q2 2024', color: '#eef4ff', iconColor: '#007bff' },
                            { title: 'Donation Report', period: 'Q2 2024', color: '#ecfdf5', iconColor: '#10b981' },
                            { title: 'Expense Report', period: 'Q2 2024', color: '#f5f3ff', iconColor: '#8b5cf6' }
                        ].map((report, idx) => (
                            <div key={idx} className="col-md-4 mb-3">
                                <div className="p-3 border rounded-lg h-100 d-flex flex-column align-items-center justify-content-center">
                                    <div className="d-flex align-items-center mb-3 w-100">
                                        <div className="rounded p-2 mr-3 d-flex align-items-center justify-content-center" style={{ backgroundColor: report.color, color: report.iconColor, width: '40px', height: '40px' }}>
                                            <FileText size={20} />
                                        </div>
                                        <div>
                                            <div className="font-weight-bold small mb-0">{report.title}</div>
                                            <div className="x-small text-muted">{report.period}</div>
                                        </div>
                                    </div>
                                    <button onClick={() => toast.success(`${report.title} download started`)} className="btn btn-sm btn-light border py-2 px-4 w-100 d-flex align-items-center justify-content-center transition-all hover-bg-white font-weight-bold small">
                                        <Download size={14} className="mr-2" /> Download
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="row">
                {/* Recent Transactions */}
                <div className="col-lg-8 mb-4">
                    <div className="cms-card border-0 shadow-sm h-100">
                        <div className="cms-card-header bg-white border-0 py-3 px-4 d-flex justify-content-between align-items-center">
                            <div>
                                <h6 className="font-weight-bold mb-0">Recent Transactions</h6>
                                <p className="x-small text-muted mb-0">Latest donations and disbursements</p>
                            </div>
                            <button className="btn btn-sm btn-light border-0 text-muted d-flex align-items-center x-small font-weight-bold">
                                <History size={14} className="mr-1" /> View History
                            </button>
                        </div>
                        <div className="table-responsive">
                            <table className="table cms-table mb-0">
                                <thead>
                                    <tr className="x-small text-muted uppercase">
                                        <th className="border-0 bg-white pl-4">Description</th>
                                        <th className="border-0 bg-white">Category</th>
                                        <th className="border-0 bg-white">Date</th>
                                        <th className="border-0 bg-white">Amount</th>
                                        <th className="border-0 bg-white pr-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mockDonations.slice(0, 5).map((don, idx) => (
                                        <tr key={idx} className="border-top">
                                            <td className="small font-weight-bold py-3 pl-4">
                                                <div className="d-flex align-items-center">
                                                    <div className="bg-light rounded p-2 mr-3 text-success">
                                                        <DollarSign size={14} />
                                                    </div>
                                                    <div>
                                                        <div className="mb-0">Donation from {don.donor.fullName}</div>
                                                        <div className="x-small text-muted">{don.transactionId}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="small text-muted py-3">Inbound</td>
                                            <td className="small text-muted py-3">{don.createdAt.toLocaleDateString()}</td>
                                            <td className="small font-weight-bold text-success py-3">+ ${don.amount.toLocaleString()}</td>
                                            <td className="py-3 pr-4">
                                                <span className="badge badge-success-light text-success px-2 py-1 x-small font-weight-bold rounded-pill">Completed</span>
                                            </td>
                                        </tr>
                                    ))}
                                    <tr className="border-top">
                                        <td className="small font-weight-bold py-3 pl-4">
                                            <div className="d-flex align-items-center">
                                                <div className="bg-light rounded p-2 mr-3 text-danger">
                                                    <ArrowRight size={14} />
                                                </div>
                                                <div>
                                                    <div className="mb-0">Disbursement: Laptop program</div>
                                                    <div className="x-small text-muted">DISB-992211</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="small text-muted py-3">Outbound</td>
                                        <td className="small text-muted py-3">Oct 12, 2023</td>
                                        <td className="small font-weight-bold text-danger py-3">- $4,500.00</td>
                                        <td className="py-3 pr-4">
                                            <span className="badge badge-success-light text-success px-2 py-1 x-small font-weight-bold rounded-pill">Completed</span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Export Options */}
                <div className="col-lg-4 mb-4">
                    <div className="cms-card shadow-sm p-4 h-100">
                        <h6 className="font-weight-bold mb-3 text-accent d-flex align-items-center">
                            <Download size={18} className="mr-2" /> Quick Export
                        </h6>
                        <div className="d-grid gap-3">
                            <button onClick={() => handleExport('P&L')} className="btn btn-light btn-block text-left py-2 px-3 d-flex justify-content-between align-items-center transition-all hover-bg-white hover-shadow-sm border x-small">
                                <div>
                                    <div className="font-weight-bold mb-0">Monthly P&L</div>
                                </div>
                                <Download size={12} className="text-muted" />
                            </button>
                            <button onClick={() => handleExport('Tax')} className="btn btn-light btn-block text-left py-2 px-3 d-flex justify-content-between align-items-center transition-all hover-bg-white hover-shadow-sm border x-small">
                                <div>
                                    <div className="font-weight-bold mb-0">Tax Readiness</div>
                                </div>
                                <Download size={12} className="text-muted" />
                            </button>
                        </div>
                        <div className="mt-4 p-3 bg-light rounded-lg border-0 shadow-inner">
                            <h6 className="x-small font-weight-bold text-muted text-uppercase mb-2">Internal Note</h6>
                            <p className="x-small text-muted mb-0 italic">All disbursements over $5,000 require secondary approval from the Board Treasurer within 24 hours.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
