import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useLegacyScripts } from '@/hooks/UseLegacyScripts';
import { programsService } from '@/services/programs.service';
import { Program, Project, Beneficiary, Story, Donation } from '@/lib/types';
import { Loader2, Calendar, MapPin, Users, Briefcase, DollarSign, Heart, Award, TrendingUp, BookOpen, Clock, CheckCircle, XCircle, Phone, Mail, Globe, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

// Helper functions
const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(num);
};

const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

const getStatusBadge = (status: string) => {
    const configs: Record<string, { bg: string; text: string; icon: any }> = {
        active: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
        planning: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Clock },
        completed: { bg: 'bg-purple-100', text: 'text-purple-700', icon: Award },
        archived: { bg: 'bg-gray-100', text: 'text-gray-700', icon: XCircle }
    };
    const config = configs[status.toLowerCase()] || configs.active;
    const Icon = config.icon;

    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
            <Icon className="w-4 h-4 mr-2" />
            {status}
        </span>
    );
};

export const OurProgramsDetailsPage = () => {
    useLegacyScripts();
    const { language, t } = useLanguage();
    const navigate = useNavigate();

    const { id } = useParams<{ id: string }>();
    const [program, setProgram] = useState<Program | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        if (id) {
            fetchProgram();
        }
    }, [id]);

    const fetchProgram = async () => {
        try {
            const response = await programsService.getProgram(id!);
            const responseData = response as any;
            const programData = responseData.data || responseData;
            setProgram(programData);
        } catch (error) {
            console.error("Failed to fetch program", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!program) {
        return (
            <div className="container py-5 text-center">
                <h2>Program not found</h2>
                <Link to="/" className="btn btn-primary mt-3">Back to Home</Link>
            </div>
        );
    }

    const programName = program.name[language] || program.name.en;
    const programDescription = program.description[language] || program.description.en;
    const progress = program.budget > 0
        ? Math.round((Number(program.fundsUtilized || 0) / Number(program.budget)) * 100)
        : 0;

    return (
        <>
            {/* Hero Section with Program Cover */}
            <section
                className="hero-wrap hero-wrap-2"
                style={{
                    backgroundImage: program.coverImage ? `url(${program.coverImage})` : 'url("/images/bg_7.jpg")',
                    height: '500px',
                    minHeight: '500px',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}
                data-stellar-background-ratio="0.5"
            >
                <div className="overlay" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}></div>
                <div className="container">
                    <div className="row no-gutters slider-text align-items-end justify-content-center" style={{ height: '500px', paddingTop: '100px' }}>
                        <div className="col-md-9 ftco-animate pb-5 text-center text-white">
                            <h1 className="mb-3 bread" style={{ fontSize: '48px', fontWeight: '800' }}>{programName}</h1>
                            <p className="breadcrumbs mb-4">
                                <span className="mr-2"><Link to="/" className="text-white-50">{t('nav.home') || 'Home'}</Link></span>
                                <span className="mr-2"><Link to="/programs" className="text-white-50">{t('nav.programs') || 'Programs'}</Link></span>
                                <span className="text-white">{program.category.replace('_', ' ')}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="ftco-section">
                <div className="container">
                    {/* Back Button */}
                    <div className="row mb-4">
                        <div className="col-12 d-flex align-items-center gap-3">
                            <button
                                className="btn btn-white py-3 border-0 font-weight-bold d-flex align-items-center justify-content-center"
                                style={{
                                    borderRadius: '14px',
                                    fontSize: '15px',
                                    color: '#076c5b',
                                    letterSpacing: '0.5px',
                                    minWidth: '200px'
                                }}
                                onClick={() => window.location.href = '/'}
                            >
                                <ArrowLeft size={18} className="mr-2" />
                                {t('nav.back') || 'Back to Programs'}
                            </button>

                            {program.logo && (
                                <img
                                    src={program.logo}
                                    alt={programName}
                                    className="rounded-circle border border-white ml-auto"
                                    style={{
                                        width: '80px',
                                        height: '80px',
                                        objectFit: 'cover',
                                        marginLeft: 'auto' // This pushes it to the right
                                    }}
                                />
                            )}
                        </div>
                    </div>

                    {/* Program Stats Bar */}
                    <div className="row mb-5">
                        <div className="col-12">
                            <div className="bg-light p-4 rounded-lg d-flex flex-wrap justify-content-around">
                                <div className="text-center px-3">
                                    <div className="text-primary font-weight-bold mb-1">{t('programs.status') || 'Status'}</div>
                                    {getStatusBadge(program.status)}
                                </div>
                                <div className="text-center px-3">
                                    <div className="text-primary font-weight-bold mb-1">{t('programs.budget') || 'Budget'}</div>
                                    <div className="h5 mb-0">{formatCurrency(program.budget)}</div>
                                </div>
                                <div className="text-center px-3">
                                    <div className="text-primary font-weight-bold mb-1">{t('programs.progress') || 'Progress'}</div>
                                    <div className="h5 mb-0">{progress}%</div>
                                </div>
                                <div className="text-center px-3">
                                    <div className="text-primary font-weight-bold mb-1">{t('programs.start_date') || 'Start Date'}</div>
                                    <div className="h5 mb-0">{formatDate(program.startDate)}</div>
                                </div>
                                {program.endDate && (
                                    <div className="text-center px-3">
                                        <div className="text-primary font-weight-bold mb-1">{t('programs.end_date') || 'End Date'}</div>
                                        <div className="h5 mb-0">{formatDate(program.endDate)}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Main Content - Update all text to use translations */}
                    <div className="row">
                        <div className="col-lg-8 ftco-animate">
                            <div className="mb-4">
                                <span className="subheading text-primary text-uppercase font-weight-bold letter-spacing-2">
                                    {program.category.replace('_', ' ')}
                                </span>
                                <h2 className="mb-3 mt-2 font-weight-bold">{programName}</h2>
                                {program.name?.rw && language === 'rw' && (
                                    <p className="text-muted mb-4">{program.name.rw}</p>
                                )}
                            </div>

                            {/* Tabs - Update tab labels with translations */}
                            <div className="program-tabs mb-5 border-bottom">
                                <ul className="nav nav-tabs border-0" role="tablist">
                                    <li className="nav-item">
                                        <a className={`nav-link border-0 font-weight-bold ${activeTab === 'overview' ? 'active text-primary' : 'text-muted'} px-4`}
                                            onClick={() => setActiveTab('overview')}
                                            style={{ cursor: 'pointer' }}>
                                            {t('programs.overview') || 'Overview'}
                                        </a>
                                    </li>
                                    <li className="nav-item">
                                        <a className={`nav-link border-0 font-weight-bold ${activeTab === 'projects' ? 'active text-primary' : 'text-muted'} px-4`}
                                            onClick={() => setActiveTab('projects')}
                                            style={{ cursor: 'pointer' }}>
                                            {t('programs.projects') || 'Projects'} ({program.projects?.length || 0})
                                        </a>
                                    </li>
                                    <li className="nav-item">
                                        <a className={`nav-link border-0 font-weight-bold ${activeTab === 'beneficiaries' ? 'active text-primary' : 'text-muted'} px-4`}
                                            onClick={() => setActiveTab('beneficiaries')}
                                            style={{ cursor: 'pointer' }}>
                                            {t('programs.beneficiaries') || 'Beneficiaries'} ({program.beneficiaries?.length || 0})
                                        </a>
                                    </li>
                                    <li className="nav-item">
                                        <a className={`nav-link border-0 font-weight-bold ${activeTab === 'stories' ? 'active text-primary' : 'text-muted'} px-4`}
                                            onClick={() => setActiveTab('stories')}
                                            style={{ cursor: 'pointer' }}>
                                            {t('programs.stories') || 'Stories'} ({program.stories?.length || 0})
                                        </a>
                                    </li>
                                    <li className="nav-item">
                                        <a className={`nav-link border-0 font-weight-bold ${activeTab === 'donations' ? 'active text-primary' : 'text-muted'} px-4`}
                                            onClick={() => setActiveTab('donations')}
                                            style={{ cursor: 'pointer' }}>
                                            {t('programs.donations') || 'Donations'} ({program.donations?.length || 0})
                                        </a>
                                    </li>
                                </ul>
                            </div>

                            {/* Tab Content - Update each tab to use translated content */}
                            <div className="tab-content">
                                {/* Overview Tab */}
                                {activeTab === 'overview' && (
                                    <div>
                                        <div className="mb-5">
                                            <h3 className="mb-3 h4 font-weight-bold">{t('programs.about') || 'About the Program'}</h3>
                                            <div
                                                className="program-description"
                                                dangerouslySetInnerHTML={{ __html: programDescription }}
                                            />
                                        </div>

                                        {/* SDG Alignment */}
                                        {program.sdgAlignment && program.sdgAlignment.length > 0 && (
                                            <div className="mb-5">
                                                <h3 className="mb-3 h4 font-weight-bold">{t('programs.sdg_alignment') || 'SDG Alignment'}</h3>
                                                <div className="d-flex flex-wrap gap-2">
                                                    {program.sdgAlignment.map(sdg => (
                                                        <span key={sdg} className="badge badge-primary p-2 mr-2 mb-2">
                                                            {t('programs.sdg') || 'SDG'} {sdg}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Key Details */}
                                        <div className="row">
                                            <div className="col-md-6 mb-4">
                                                <div className="bg-light p-4 rounded">
                                                    <h4 className="h6 font-weight-bold mb-3">{t('programs.details') || 'Program Details'}</h4>
                                                    <ul className="list-unstyled">
                                                        <li className="mb-2"><strong>{t('programs.category') || 'Category'}:</strong> {program.category.replace('_', ' ')}</li>
                                                        <li className="mb-2"><strong>{t('programs.start_date') || 'Start Date'}:</strong> {formatDate(program.startDate)}</li>
                                                        {program.endDate && (
                                                            <li className="mb-2"><strong>{t('programs.end_date') || 'End Date'}:</strong> {formatDate(program.endDate)}</li>
                                                        )}
                                                        <li className="mb-2"><strong>{t('programs.status') || 'Status'}:</strong> {program.status}</li>
                                                    </ul>
                                                </div>
                                            </div>
                                            <div className="col-md-6 mb-4">
                                                <div className="bg-light p-4 rounded">
                                                    <h4 className="h6 font-weight-bold mb-3">{t('programs.financial') || 'Financial Overview'}</h4>
                                                    <ul className="list-unstyled">
                                                        <li className="mb-2"><strong>{t('programs.budget') || 'Budget'}:</strong> {formatCurrency(program.budget)}</li>
                                                        <li className="mb-2"><strong>{t('programs.allocated') || 'Allocated'}:</strong> {formatCurrency(program.fundsAllocated)}</li>
                                                        <li className="mb-2"><strong>{t('programs.utilized') || 'Utilized'}:</strong> {formatCurrency(program.fundsUtilized)}</li>
                                                        <li className="mb-2"><strong>{t('programs.progress') || 'Progress'}:</strong> {progress}%</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {/* Projects Tab - Update to use translated names */}
                                {activeTab === 'projects' && (
                                    <div>
                                        {program.projects && program.projects.length > 0 ? (
                                            <div className="row">
                                                {program.projects.map((project: Project) => {
                                                    const projectName = project.name[language] || project.name.en;
                                                    const projectDesc = project.description[language] || project.description.en;

                                                    return (
                                                        <div key={project.id} className="col-md-6 mb-4">
                                                            <div className="card h-100 border-0 shadow-sm">
                                                                {project.coverImage && (
                                                                    <img
                                                                        src={project.coverImage}
                                                                        alt={projectName}
                                                                        className="card-img-top"
                                                                        style={{ height: '180px', objectFit: 'cover' }}
                                                                    />
                                                                )}
                                                                <div className="card-body">
                                                                    <h5 className="card-title font-weight-bold">{projectName}</h5>
                                                                    <p className="card-text text-muted small">{project.name.rw}</p>
                                                                    <p className="card-text">{projectDesc}</p>

                                                                    <div className="mt-3">
                                                                        <div className="d-flex justify-content-between mb-2">
                                                                            <span>{t('programs.progress') || 'Progress'}</span>
                                                                            <span className="font-weight-bold">
                                                                                {project.budgetRequired > 0
                                                                                    ? Math.round((Number(project.budgetReceived || 0) / Number(project.budgetRequired)) * 100)
                                                                                    : 0}%
                                                                            </span>
                                                                        </div>
                                                                        <div className="progress" style={{ height: '8px' }}>
                                                                            <div
                                                                                className="progress-bar bg-success"
                                                                                role="progressbar"
                                                                                style={{
                                                                                    width: `${project.budgetRequired > 0
                                                                                        ? (Number(project.budgetReceived || 0) / Number(project.budgetRequired)) * 100
                                                                                        : 0}%`
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    </div>

                                                                    <div className="mt-3 small">
                                                                        <div><strong>{t('programs.budget') || 'Budget'}:</strong> {formatCurrency(project.budgetRequired)}</div>
                                                                        <div><strong>{t('programs.timeline') || 'Timeline'}:</strong> {formatDate(project.timeline.start)} - {formatDate(project.timeline.end)}</div>
                                                                        {project.location && (
                                                                            <div><strong>{t('programs.location') || 'Location'}:</strong> {project.location.districts?.join(', ')}</div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <p className="text-muted">{t('programs.no_projects') || 'No projects available for this program.'}</p>
                                        )}
                                    </div>
                                )}

                                {/* Beneficiaries Tab */}
                                {activeTab === 'beneficiaries' && (
                                    <div>
                                        {program.beneficiaries && program.beneficiaries.length > 0 ? (
                                            <div className="row">
                                                {program.beneficiaries.map((beneficiary: Beneficiary) => (
                                                    <div key={beneficiary.id} className="col-md-6 mb-4">
                                                        <div className="card border-0 shadow-sm h-100">
                                                            <div className="card-body">
                                                                <div className="d-flex align-items-center mb-3">
                                                                    <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mr-3"
                                                                        style={{ width: '50px', height: '50px' }}>
                                                                        <Users className="w-5 h-5" />
                                                                    </div>
                                                                    <div>
                                                                        <h5 className="mb-0 font-weight-bold">{beneficiary.user?.fullName}</h5>
                                                                        <small className="text-muted">{beneficiary.businessType}</small>
                                                                    </div>
                                                                </div>
                                                                <div className="small">
                                                                    <div className="mb-2">
                                                                        <MapPin className="w-4 h-4 inline mr-1" />
                                                                        {beneficiary.location?.district}, {beneficiary.location?.sector}
                                                                    </div>
                                                                    <div className="mb-2">
                                                                        <Phone className="w-4 h-4 inline mr-1" />
                                                                        {beneficiary.user?.phone}
                                                                    </div>
                                                                    <div className="mb-2">
                                                                        <Mail className="w-4 h-4 inline mr-1" />
                                                                        {beneficiary.user?.email}
                                                                    </div>
                                                                </div>
                                                                <div className="mt-3">
                                                                    <span className={`badge ${beneficiary.status === 'active' ? 'badge-success' : 'badge-secondary'}`}>
                                                                        {beneficiary.status}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-muted">No beneficiaries enrolled in this program yet.</p>
                                        )}
                                    </div>
                                )}

                                {/* Stories Tab */}
                                {activeTab === 'stories' && (
                                    <div>
                                        {program.stories && program.stories.length > 0 ? (
                                            <div className="row">
                                                {program.stories.map((story: Story) => (
                                                    <div key={story.id} className="col-md-6 mb-4">
                                                        <div className="card border-0 shadow-sm h-100">
                                                            {story.media && story.media.length > 0 && (
                                                                <img
                                                                    src={story.media[0].url}
                                                                    alt={story.title.en}
                                                                    className="card-img-top"
                                                                    style={{ height: '200px', objectFit: 'cover' }}
                                                                />
                                                            )}
                                                            <div className="card-body">
                                                                <h5 className="card-title font-weight-bold">{story.title.en}</h5>
                                                                <p className="card-text text-muted small">{story.title.rw}</p>
                                                                <p className="card-text">{story.content.en.substring(0, 150)}...</p>
                                                                <div className="d-flex justify-content-between align-items-center mt-3">
                                                                    <div>
                                                                        <small className="text-muted">By {story.authorName}</small>
                                                                    </div>
                                                                    {story.isPublished && (
                                                                        <span className="badge badge-success">Published</span>
                                                                    )}
                                                                </div>
                                                                {story.publishedDate && (
                                                                    <small className="text-muted d-block mt-2">
                                                                        {formatDate(story.publishedDate)}
                                                                    </small>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-muted">No stories available for this program.</p>
                                        )}
                                    </div>
                                )}

                                {/* Donations Tab */}
                                {activeTab === 'donations' && (
                                    <div>
                                        {program.donations && program.donations.length > 0 ? (
                                            <div className="table-responsive">
                                                <table className="table table-hover">
                                                    <thead>
                                                        <tr>
                                                            <th>Date</th>
                                                            <th>Donor</th>
                                                            <th>Amount</th>
                                                            <th>Method</th>
                                                            <th>Status</th>
                                                            <th>Type</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {program.donations.map((donation: Donation) => (
                                                            <tr key={donation.id}>
                                                                <td>{formatDate(donation.createdAt)}</td>
                                                                <td>
                                                                    {donation.isAnonymous ? 'Anonymous' : donation.donor?.user?.fullName || 'Unknown'}
                                                                    {donation.donorMessage && (
                                                                        <small className="d-block text-muted">"{donation.donorMessage}"</small>
                                                                    )}
                                                                </td>
                                                                <td className="font-weight-bold text-primary">
                                                                    {formatCurrency(donation.amount)} {donation.currency}
                                                                </td>
                                                                <td>
                                                                    <span className="badge badge-light">{donation.paymentMethod}</span>
                                                                </td>
                                                                <td>
                                                                    <span className={`badge ${donation.paymentStatus === 'completed' ? 'badge-success' :
                                                                        donation.paymentStatus === 'pending' ? 'badge-warning' :
                                                                            donation.paymentStatus === 'failed' ? 'badge-danger' :
                                                                                'badge-secondary'
                                                                        }`}>
                                                                        {donation.paymentStatus}
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <span className="badge badge-info">{donation.donationType}</span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <p className="text-muted">No donations received for this program yet.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sidebar - Update with translations */}
                        <div className="col-lg-4 sidebar ftco-animate">
                            {/* Action Buttons */}
                            <div className="sidebar-box p-4 bg-light rounded mb-4">

                                <button
                                    className="btn btn-primary w-100 py-3 mt-4 border-0 font-weight-bold" style={{ backgroundColor: '#076c5b', borderRadius: '14px', fontSize: '15px', letterSpacing: '0.5px' }}
                                    onClick={() => navigate(`/donate?program=${id}`)
                                    }
                                > {t('programs.donate') || 'Donate to this Program'}
                                </button>

                                <button
                                    className="btn btn-white w-100 py-3 mt-4 font-weight-bold" style={{ borderRadius: '14px', fontSize: '15px', color: '#076c5b', letterSpacing: '0.5px' }}
                                    onClick={() => navigate('/contact')}
                                >  {t('programs.become_partner') || 'Become a Partner'}
                                </button>

                            </div>

                            {/* Impact Stats */}
                            <div className="sidebar-box p-4 bg-white border rounded mb-4 shadow-sm">
                                <h3 className="heading-sidebar mb-4">{t('programs.impact') || 'Impact at a Glance'}</h3>
                                <div className="row text-center">
                                    <div className="col-6 mb-4">
                                        <h2 className="mb-0 text-primary font-weight-bold">
                                            {program.projects?.length || 0}
                                        </h2>
                                        <span className="text-muted small text-uppercase">{t('programs.projects') || 'Projects'}</span>
                                    </div>
                                    <div className="col-6 mb-4">
                                        <h2 className="mb-0 text-primary font-weight-bold">
                                            {program.beneficiaries?.length || 0}
                                        </h2>
                                        <span className="text-muted small text-uppercase">{t('programs.beneficiaries') || 'Beneficiaries'}</span>
                                    </div>
                                    <div className="col-6 mb-4">
                                        <h2 className="mb-0 text-primary font-weight-bold">{progress}%</h2>
                                        <span className="text-muted small text-uppercase">{t('programs.progress') || 'Progress'}</span>
                                    </div>
                                    <div className="col-6 mb-4">
                                        <h2 className="mb-0 text-primary font-weight-bold">
                                            {program.donations?.length || 0}
                                        </h2>
                                        <span className="text-muted small text-uppercase">{t('programs.donations') || 'Donations'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* SDG Alignment */}
                            {program.sdgAlignment && program.sdgAlignment.length > 0 && (
                                <div className="sidebar-box p-4 bg-light rounded mb-4">
                                    <h3 className="heading-sidebar mb-3">SDG Goals</h3>
                                    <div className="d-flex flex-wrap">
                                        {program.sdgAlignment.map(sdg => (
                                            <span key={sdg} className="badge badge-primary p-2 mr-2 mb-2">
                                                SDG {sdg}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Program Manager (Placeholder) */}
                            <div className="sidebar-box p-4 border rounded mb-4">
                                <h3 className="heading-sidebar mb-3">Program Contact</h3>
                                <div className="d-flex align-items-center">
                                    <div className="img mr-3" style={{
                                        backgroundImage: 'url(/images/person_1.jpg)',
                                        width: '60px',
                                        height: '60px',
                                        borderRadius: '50%',
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        backgroundColor: '#e9ecef'
                                    }}></div>
                                    <div>
                                        <h5 className="mb-0 font-weight-bold">Program Team</h5>
                                        <span className="text-muted small d-block mb-1">contact@lceo.org</span>
                                        <a href="mailto:contact@lceo.org" className="text-primary small">
                                            Send Message
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Stay Connected */}
                            <div className="sidebar-box">
                                <h3 className="heading-sidebar">Stay Connected</h3>
                                <p>Follow the journey and updates for this program on our platforms.</p>
                                <ul className="ftco-footer-social list-unstyled d-flex">
                                    <li className="mr-3"><a href="#"><span className="icon-twitter"></span></a></li>
                                    <li className="mr-3"><a href="#"><span className="icon-facebook"></span></a></li>
                                    <li className="mr-3"><a href="#"><span className="icon-instagram"></span></a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};