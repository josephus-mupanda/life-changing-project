
import React from 'react';
import { Link } from 'react-router-dom';
import { useLegacyScripts } from '@/hooks/UseLegacyScripts';

export const OurProgramsDetailsPage = () => {
    useLegacyScripts();

    return (
        <>
            {/* Hero-like header section */}
            <section className="hero-wrap hero-wrap-2" style={{ backgroundImage: 'url("/images/bg_7.jpg")', height: '500px', minHeight: '500px' }} data-stellar-background-ratio="0.5">
                <div className="overlay"></div>
                <div className="container">
                    <div className="row no-gutters slider-text align-items-end justify-content-center" style={{ height: '500px', paddingTop: '100px' }}>
                        <div className="col-md-9 ftco-animate pb-5 text-center">
                            <h1 className="mb-3 bread">Program Details</h1>
                            <p className="breadcrumbs"><span className="mr-2"><Link to="/">Home</Link></span> <span>Programs</span></p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="ftco-section">
                <div className="container">
                    {/* Back Button */}
                    <div className="row mb-5">
                        <div className="col-12">
                            <Link to="/" className="btn btn-outline-secondary d-inline-flex align-items-center">
                                <span className="mr-2">&larr;</span> Back to Programs
                            </Link>
                        </div>
                    </div>

                    <div className="row">
                        {/* Main Content */}
                        <div className="col-lg-8 ftco-animate">
                            <span className="subheading text-primary text-uppercase font-weight-bold letter-spacing-2">Entreneurship</span>
                            <h2 className="mb-3 mt-2 font-weight-bold">Business Incubation</h2>
                            <p className="lead mb-5">
                                Supporting women entrepreneurs to start and grow businesses through seed funding and mentorship.
                            </p>

                            {/* Tabs Navigation */}
                            <div className="program-tabs mb-5 border-bottom">
                                <ul className="nav nav-tabs border-0" id="myTab" role="tablist">
                                    <li className="nav-item">
                                        <a className="nav-link active border-0 font-weight-bold text-dark pl-0 pr-4" id="overview-tab" data-toggle="tab" href="#overview" role="tab" aria-controls="overview" aria-selected="true">Overview</a>
                                    </li>
                                    <li className="nav-item">
                                        <a className="nav-link border-0 text-muted px-4" id="approach-tab" data-toggle="tab" href="#approach" role="tab" aria-controls="approach" aria-selected="false">Our Approach</a>
                                    </li>
                                    <li className="nav-item">
                                        <a className="nav-link border-0 text-muted px-4" id="stories-tab" data-toggle="tab" href="#stories" role="tab" aria-controls="stories" aria-selected="false">Stories</a>
                                    </li>
                                    <li className="nav-item">
                                        <a className="nav-link border-0 text-muted px-4" id="financials-tab" data-toggle="tab" href="#financials" role="tab" aria-controls="financials" aria-selected="false">Financials</a>
                                    </li>
                                </ul>
                            </div>

                            {/* Tab Content */}
                            <div className="tab-content" id="myTabContent">
                                <div className="tab-pane fade show active" id="overview" role="tabpanel" aria-labelledby="overview-tab">
                                    <div className="mb-5">
                                        <h3 className="mb-3 h4 font-weight-bold">The Challenge</h3>
                                        <p>Many young women in rural Rwanda face significant barriers to economic independence. Limited access to education, lack of capital, and societal expectations often constrain their potential. This program specifically targets these systemic issues by providing a comprehensive support structure.</p>
                                    </div>

                                    <div className="mb-5">
                                        <h3 className="mb-3 h4 font-weight-bold">Our Solution</h3>
                                        <p>Supporting women entrepreneurs to start and grow businesses through seed funding and mentorship. We implement a holistic model that combines technical training, soft skills development, and direct financial support. By addressing both the hard and soft constraints, we ensure sustainable outcomes for our beneficiaries.</p>
                                    </div>
                                </div>
                                <div className="tab-pane fade" id="approach" role="tabpanel" aria-labelledby="approach-tab">
                                    <p>Our approach details go here...</p>
                                </div>
                                <div className="tab-pane fade" id="stories" role="tabpanel" aria-labelledby="stories-tab">
                                    <p>Success stories go here...</p>
                                </div>
                                <div className="tab-pane fade" id="financials" role="tabpanel" aria-labelledby="financials-tab">
                                    <p>Financial details go here...</p>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="col-lg-4 sidebar ftco-animate">
                            {/* Action Buttons */}
                            <div className="sidebar-box p-4 bg-light rounded mb-4">
                                <Link to="/donate" className="btn btn-primary btn-block py-3 mb-3 font-weight-bold shadow-sm">Donate to this Program</Link>
                                <button className="btn btn-outline-primary btn-block py-3 font-weight-bold">Become a Partner</button>
                            </div>

                            {/* Stats */}
                            <div className="sidebar-box p-4 bg-white border rounded mb-4 shadow-sm">
                                <h3 className="heading-sidebar mb-4">Impact at a Glance</h3>
                                <div className="row text-center">
                                    <div className="col-6 mb-4">
                                        <h2 className="mb-0 text-primary font-weight-bold">3+</h2>
                                        <span className="text-muted small text-uppercase">Years Active</span>
                                    </div>
                                    <div className="col-6 mb-4">
                                        <h2 className="mb-0 text-primary font-weight-bold">120+</h2>
                                        <span className="text-muted small text-uppercase">Beneficiaries</span>
                                    </div>
                                    <div className="col-6 mb-4">
                                        <h2 className="mb-0 text-primary font-weight-bold">85%</h2>
                                        <span className="text-muted small text-uppercase">Success Rate</span>
                                    </div>
                                    <div className="col-6 mb-4">
                                        <h2 className="mb-0 text-primary font-weight-bold">$75k</h2>
                                        <span className="text-muted small text-uppercase">Budget</span>
                                    </div>
                                </div>
                            </div>

                            {/* Support Block */}
                            <div className="sidebar-box p-4 bg-light rounded mb-4">
                                <h3 className="heading-sidebar">Support This Program</h3>
                                <p className="mb-4">Your contribution directly impacts the lives of women in this program.</p>
                                <Link to="/donate" className="btn btn-primary btn-block py-2 mb-2">Donate Now</Link>
                                <button className="btn btn-white btn-outline-dark btn-block py-2">Start a Fundraiser</button>
                            </div>

                            {/* Program Manager */}
                            <div className="sidebar-box p-4 border rounded mb-4">
                                <h3 className="heading-sidebar mb-3">Program Manager</h3>
                                <div className="d-flex align-items-center">
                                    <div className="img mr-3" style={{
                                        backgroundImage: 'url(/images/person_1.jpg)',
                                        width: '60px',
                                        height: '60px',
                                        borderRadius: '50%',
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        backgroundColor: '#e9ecef',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#6c757d',
                                        fontSize: '18px',
                                        fontWeight: 'bold'
                                    }}>
                                        {/* Fallback initials if image not loaded, though BG image is set */}
                                        <span style={{ opacity: 0 }} >JS</span>
                                    </div>
                                    <div>
                                        <h5 className="mb-0 font-weight-bold">Jean Staff</h5>
                                        <span className="text-muted small d-block mb-1">Program Manager</span>
                                        <a href="mailto:jean@lceo.org" className="text-primary small">jean@lceo.org</a>
                                    </div>
                                </div>
                            </div>

                            {/* Location */}
                            <div className="sidebar-box p-4 bg-light rounded mb-4">
                                <h3 className="heading-sidebar mb-3">Location</h3>
                                <div className="map-container bg-white border rounded d-flex align-items-center justify-content-center text-muted mb-2" style={{ height: '180px' }}>
                                    <span className="icon-map-o mr-2"></span> Map View
                                </div>
                                <p className="small text-muted mb-0">Operating in Gasabo and Nyarugenge districts, Kigali City.</p>
                            </div>

                            {/* Stay Connected */}
                            <div className="sidebar-box">
                                <h3 className="heading-sidebar">Stay Connected</h3>
                                <p>Follow the journey and updates for this program on our platforms.</p>
                                <ul className="ftco-footer-social list-unstyled float-md-left float-lft mt-3">
                                    <li className="ftco-animate fadeInUp ftco-animated"><a href="#"><span className="icon-twitter"></span></a></li>
                                    <li className="ftco-animate fadeInUp ftco-animated"><a href="#"><span className="icon-facebook"></span></a></li>
                                    <li className="ftco-animate fadeInUp ftco-animated"><a href="#"><span className="icon-instagram"></span></a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};
