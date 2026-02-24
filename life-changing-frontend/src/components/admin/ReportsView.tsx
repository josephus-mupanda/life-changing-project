import React, { useState } from 'react';
import { toast } from 'sonner';
import {
    Download,
    Wand2,
    Users,
    DollarSign,
    BarChart3,
    FileText,
    Filter,
    Target,
    TrendingUp,
    ChevronDown,
    FilePlus
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
    LineChart,
    Line,
    Legend,
    PieChart,
    Pie,
    Cell
} from 'recharts';

export function ReportsView() {
    const [activeTab, setActiveTab] = useState('impact');

    const beneficiaryTrendsData = [
        { name: 'Jan', Active: 95, New: 12, Graduated: 5 },
        { name: 'Feb', Active: 102, New: 15, Graduated: 8 },
        { name: 'Mar', Active: 108, New: 18, Graduated: 12 },
        { name: 'Apr', Active: 115, New: 14, Graduated: 10 },
        { name: 'May', Active: 122, New: 16, Graduated: 14 },
        { name: 'Jun', Active: 128, New: 12, Graduated: 15 },
    ];

    const beneficiaryStatusData = [
        { name: 'Active', value: 1, color: '#4c9789' },
        { name: 'Graduated', value: 1, color: '#7bc1b5' },
        { name: 'Inactive', value: 0, color: '#eacfa2' },
    ];

    const impactMetricsData = [
        { label: 'Women Empowered', current: 125, target: 150, color: '#0d9488' },
        { label: 'Businesses Launched', current: 45, target: 60, color: '#0d9488' },
        { label: 'Girls in School', current: 89, target: 100, color: '#0d9488' },
        { label: 'Training Sessions', current: 240, target: 300, color: '#0d9488' }
    ];

    const programComparisonData = [
        { name: 'She Can Code', budget: 50000, utilized: 15000 },
        { name: 'Business Incubation', budget: 75000, utilized: 20000 },
        { name: 'Community Health', budget: 25000, utilized: 10000 },
    ];

    const programsDetailData = [
        { name: 'She Can Code', beneficiaries: 1, budget: 50000, utilized: 15000, percentage: 30.0 },
        { name: 'Business Incubation', beneficiaries: 1, budget: 75000, utilized: 20000, percentage: 26.7 },
        { name: 'Community Health', beneficiaries: 0, budget: 25000, utilized: 10000, percentage: 40.0 },
    ];

    const handleDownload = (type: string) => {
        toast.promise(
            new Promise((resolve) => setTimeout(resolve, 2000)),
            {
                loading: `Generating ${type} report...`,
                success: `${type} report downloaded successfully!`,
                error: 'Failed to generate report.',
            }
        );
    };

    const renderImpactMetrics = () => (
        <div className="cms-card border-0 shadow-sm p-4 mt-2">
            <div className="d-flex justify-content-between align-items-start mb-4">
                <div>
                    <h6 className="font-weight-bold mb-1">Key Impact Metrics</h6>
                    <p className="small text-muted mb-0">Progress towards annual targets</p>
                </div>
                <div className="dropdown">
                    <button className="btn btn-sm btn-light border px-3 d-flex align-items-center bg-transparent x-small font-weight-bold" style={{ borderRadius: '8px' }}>
                        Year 2024 <ChevronDown size={14} className="ml-2 opacity-50" />
                    </button>
                </div>
            </div>

            <div className="mt-4">
                {impactMetricsData.map((metric, idx) => {
                    const percentage = Math.round((metric.current / metric.target) * 100);
                    return (
                        <div key={idx} className="mb-4">
                            <div className="d-flex justify-content-between align-items-end mb-2">
                                <span className="font-weight-bold small">{metric.label}</span>
                                <div className="text-right">
                                    <div className="font-weight-bold small" style={{ color: '#111827' }}>{metric.current} / {metric.target}</div>
                                    <div className="x-small text-muted">{percentage}% achieved</div>
                                </div>
                            </div>
                            <div className="progress" style={{ height: '8px', backgroundColor: '#f3f4f6', borderRadius: '4px' }}>
                                <div
                                    className="progress-bar"
                                    role="progressbar"
                                    style={{
                                        width: `${percentage}%`,
                                        backgroundColor: '#0d9488',
                                        borderRadius: '4px'
                                    }}
                                ></div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    const savedReportsData = [
        {
            title: 'Q2 2024 Impact Report',
            description: 'Comprehensive impact analysis for April-June 2024',
            period: 'Q2 2024',
            generatedAt: '6/30/2024',
            size: '4.5 MB',
            category: 'Impact'
        },
        {
            title: 'Monthly Program Performance',
            description: 'Detailed program metrics and KPIs for June 2024',
            period: 'June 2024',
            generatedAt: '7/4/2024',
            size: '2.8 MB',
            category: 'Program'
        },
        {
            title: 'Donor Engagement Report',
            description: 'Donor activity and retention analysis',
            period: 'May 2024',
            generatedAt: '6/5/2024',
            size: '3.2 MB',
            category: 'Donor'
        }
    ];

    const renderSavedReports = () => (
        <div className="mt-2">
            {savedReportsData.map((report, idx) => (
                <div key={idx} className="cms-card shadow-sm p-4 mb-3 position-relative overflow-hidden">
                    <div className="d-flex align-items-start">
                        <div className="bg-primary-light text-primary rounded-lg p-3 mr-4 d-flex align-items-center justify-content-center" style={{ width: '56px', height: '56px' }}>
                            <FileText size={28} />
                        </div>
                        <div className="flex-grow-1">
                            <div className="d-flex justify-content-between align-items-start">
                                <div>
                                    <h5 className="font-weight-bold mb-1" style={{ color: '#111827' }}>{report.title}</h5>
                                    <p className="text-muted small mb-3">{report.description}</p>

                                    <div className="d-flex align-items-center gap-4 flex-wrap">
                                        <div className="d-flex align-items-center x-small text-muted">
                                            <Filter size={12} className="mr-1 opacity-60" /> {report.period}
                                        </div>
                                        <div className="d-flex align-items-center x-small text-muted">
                                            <Target size={12} className="mr-1 opacity-60" /> Generated: {report.generatedAt}
                                        </div>
                                        <div className="d-flex align-items-center x-small text-muted">
                                            <FileText size={12} className="mr-1 opacity-60" /> {report.size}
                                        </div>
                                    </div>
                                </div>
                                <span className={`badge rounded-pill px-3 py-1 x-small font-weight-bold ${report.category === 'Impact' ? 'badge-primary-light' :
                                    report.category === 'Program' ? 'bg-info-light text-info' : 'bg-success-light text-success'
                                    }`} style={{ fontSize: '10px' }}>
                                    {report.category}
                                </span>
                            </div>

                            <div className="d-flex mt-4">
                                <button className="btn btn-sm btn-light border px-4 font-weight-bold x-small mr-2" style={{ borderRadius: '8px' }}>
                                    View
                                </button>
                                <button onClick={() => handleDownload(report.title)} className="btn btn-sm btn-primary px-4 d-flex align-items-center font-weight-bold x-small" style={{ borderRadius: '8px' }}>
                                    <Download size={14} className="mr-2" /> Download
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    const renderProgramPerformance = () => (
        <div className="mt-2">
            <div className="cms-card shadow-sm p-4 mb-4">
                <div className="mb-4">
                    <h6 className="font-weight-bold mb-1">Program Performance Comparison</h6>
                    <p className="small text-muted mb-0">Budget utilization by program</p>
                </div>
                <div style={{ height: '350px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={programComparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6c757d' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6c757d' }} />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
                            />
                            <Bar dataKey="budget" name="Budget ($)" fill="#eacfa2" barSize={80} />
                            <Bar dataKey="utilized" name="Utilized ($)" fill="#4c9789" barSize={80} />
                        </BarChart>
                    </ResponsiveContainer>
                    <div className="d-flex justify-content-center mt-4 pt-2">
                        <div className="d-flex align-items-center small text-muted mr-4">
                            <div className="mr-2" style={{ width: 12, height: 12, backgroundColor: '#eacfa2', borderRadius: '2px' }}></div> Budget ($)
                        </div>
                        <div className="d-flex align-items-center small text-muted">
                            <div className="mr-2" style={{ width: 12, height: 12, backgroundColor: '#4c9789', borderRadius: '2px' }}></div> Utilized ($)
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                {programsDetailData.map((prog, idx) => (
                    <div key={idx} className="col-md-4 mb-4">
                        <div className="cms-card border-0 shadow-sm p-4 h-100">
                            <h6 className="font-weight-bold mb-4">{prog.name}</h6>
                            <div className="d-flex justify-content-between mb-3">
                                <span className="small text-muted">Beneficiaries</span>
                                <span className="font-weight-bold small">{prog.beneficiaries}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-3">
                                <span className="small text-muted">Budget</span>
                                <span className="font-weight-bold small">${prog.budget.toLocaleString()}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-4">
                                <span className="small text-muted">Utilized</span>
                                <span className="font-weight-bold small text-accent">${prog.utilized.toLocaleString()}</span>
                            </div>
                            <div className="border-top pt-3">
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="small text-muted">Utilization</span>
                                    <span className="font-weight-bold small">{prog.percentage}%</span>
                                </div>
                                <div className="progress" style={{ height: '8px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
                                    <div
                                        className="progress-bar"
                                        role="progressbar"
                                        style={{
                                            width: `${prog.percentage}%`,
                                            backgroundColor: '#4c9789',
                                            borderRadius: '4px'
                                        }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="p-1 pt-3">
            {/* Header Section */}
            <div className="d-flex justify-content-between align-items-center mb-4 pt-2">
                <div>
                    <h2 className="font-weight-bold mb-1">Reports & Analytics</h2>
                    <p className="text-muted small mb-0">Generate insights and download comprehensive reports</p>
                </div>
                <div className="d-flex">
                    <button className="btn btn-light btn-sm border d-flex align-items-center px-3 mr-2" style={{ borderRadius: '8px' }}>
                        <Filter size={16} className="mr-2" /> Filter
                    </button>
                    <button className="btn btn-primary btn-sm d-flex align-items-center px-3" style={{ borderRadius: '8px' }}>
                        <FilePlus size={16} className="mr-2" /> Generate Report
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="row mb-4">
                <div className="col-md-3 mb-3">
                    <div className="cms-card p-3 border-0 shadow-sm d-flex justify-content-between align-items-center h-100">
                        <div>
                            <div className="x-small text-muted mb-3">Active Programs</div>
                            <h2 className="font-weight-bold mb-0">3</h2>
                        </div>
                        <div className="text-secondary opacity-30">
                            <Target size={32} />
                        </div>
                    </div>
                </div>
                <div className="col-md-3 mb-3">
                    <div className="cms-card p-3 border-0 shadow-sm d-flex justify-content-between align-items-center h-100">
                        <div>
                            <div className="x-small text-muted mb-3">Total Beneficiaries</div>
                            <h2 className="font-weight-bold mb-0 text-success">2</h2>
                        </div>
                        <div className="text-success opacity-50">
                            <Users size={32} />
                        </div>
                    </div>
                </div>
                <div className="col-md-3 mb-3">
                    <div className="cms-card p-3 border-0 shadow-sm d-flex justify-content-between align-items-center h-100">
                        <div>
                            <div className="x-small text-muted mb-3">Total Donations</div>
                            <h2 className="font-weight-bold mb-0 text-success">$1,500</h2>
                        </div>
                        <div className="text-success opacity-50">
                            <TrendingUp size={32} />
                        </div>
                    </div>
                </div>
                <div className="col-md-3 mb-3">
                    <div className="cms-card p-3 border-0 shadow-sm d-flex justify-content-between align-items-center h-100">
                        <div>
                            <div className="x-small text-muted mb-3">Success Rate</div>
                            <h2 className="font-weight-bold mb-0 text-primary">50%</h2>
                        </div>
                        <div className="text-primary opacity-50">
                            <BarChart3 size={32} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Middle Section: Trends & Status */}
            <div className="row mb-4">
                <div className="col-lg-7 mb-3">
                    <div className="cms-card border-0 shadow-sm h-100">
                        <div className="p-4">
                            <h6 className="font-weight-bold mb-1">Beneficiary Trends</h6>
                            <p className="x-small text-muted mb-4">Monthly beneficiary statistics</p>
                            <div style={{ height: '280px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={beneficiaryTrendsData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                        <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '20px' }} />
                                        <Line type="monotone" dataKey="Active" stroke="#4c9789" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                                        <Line type="monotone" dataKey="New" stroke="#7bc1b5" strokeWidth={2} dot={{ r: 3 }} />
                                        <Line type="monotone" dataKey="Graduated" stroke="#eacfa2" strokeWidth={2} dot={{ r: 3 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-lg-5 mb-3">
                    <div className="cms-card border-0 shadow-sm h-100">
                        <div className="p-4">
                            <h6 className="font-weight-bold mb-1">Beneficiary Status</h6>
                            <p className="x-small text-muted mb-4">Current distribution by status</p>
                            <div style={{ height: '280px', position: 'relative' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={beneficiaryStatusData}
                                            innerRadius={70}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {beneficiaryStatusData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                                {/* Center Labels for Pie Chart as seen in image */}
                                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                                    <div className="x-small text-muted">Total</div>
                                    <div className="font-weight-bold h4 mb-0">2</div>
                                </div>
                                <div className="d-flex justify-content-around mt-2">
                                    {beneficiaryStatusData.map((item, idx) => (
                                        <div key={idx} className="text-center">
                                            <div className="x-small text-muted mb-0">{item.name}: {item.value}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs Section */}
            <div className="cms-tabs mb-4">
                <button
                    className={`cms-tab ${activeTab === 'impact' ? 'active' : ''}`}
                    onClick={() => setActiveTab('impact')}
                >
                    Impact Metrics
                </button>
                <button
                    className={`cms-tab ${activeTab === 'performance' ? 'active' : ''}`}
                    onClick={() => setActiveTab('performance')}
                >
                    Program Performance
                </button>
                <button
                    className={`cms-tab ${activeTab === 'saved' ? 'active' : ''}`}
                    onClick={() => setActiveTab('saved')}
                >
                    Saved Reports
                </button>
            </div>

            {/* Conditional Rendering */}
            {activeTab === 'impact' && renderImpactMetrics()}
            {activeTab === 'performance' && renderProgramPerformance()}
            {activeTab === 'saved' && renderSavedReports()}
        </div>
    );
}


