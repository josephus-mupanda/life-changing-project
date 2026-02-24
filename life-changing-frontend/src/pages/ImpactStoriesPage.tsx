import React from 'react';
import { Link } from 'react-router-dom';
import { useLegacyScripts } from '../hooks/UseLegacyScripts';
import { Check, Globe, Users, GraduationCap, Briefcase, Award, Send, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../lib/language-context';

export const ImpactStoriesPage = () => {
    const { t } = useLanguage();
    useLegacyScripts();

    return (
        <>
            {/* Hero Section */}
            <div className="hero-wrap hero-wrap-2" style={{ backgroundImage: "url('/images/pic1.jpg')", height: '450px', minHeight: '450px' }} data-stellar-background-ratio="0.5">
                <div className="overlay"></div>
                <div className="container">
                    <div className="row no-gutters slider-text align-items-center justify-content-center" style={{ height: '450px', paddingTop: '80px' }} data-scrollax-parent="true">
                        <div className="col-md-9 ftco-animate text-center" data-scrollax=" properties: { translateY: '70%' }">
                            <p className="breadcrumbs" data-scrollax="properties: { translateY: '30%', opacity: 1.6 }"><span className="mr-2"><Link
                                to="/">{t('impact_page.breadcrumb_home')}</Link></span> <span>{t('impact_page.breadcrumb_impact')}</span></p>
                            <h1 className="mb-3 bread" data-scrollax="properties: { translateY: '30%', opacity: 1.6 }" style={{ fontSize: '36px' }}>{t('impact_page.title')}</h1>
                            <p className="mb-4 text-white" style={{ fontSize: '1.1rem' }}>{t('impact_page.subtitle')}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Split Design Impact Section */}
            <section className="ftco-section bg-white" style={{ padding: '40px 0 40px 0' }}>
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-md-6 ftco-animate pr-lg-5">
                            <motion.span
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5 }}
                                className="badge badge-light px-3 py-2 mb-3 font-weight-bold" style={{ color: '#076c5b', backgroundColor: '#e2f5f2', borderRadius: '50px', fontSize: '13px', letterSpacing: '1.2px', textTransform: 'uppercase' }}>
                                {t('impact_page.badge_lceo')}
                            </motion.span>
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className="mb-4" style={{ fontSize: '52px', fontWeight: '800', color: '#122f2b', lineHeight: '1.05', letterSpacing: '-1.5px' }}>
                                Together, We Make <br />
                                A Difference!
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="mb-5" style={{ color: '#666', fontSize: '19px', lineHeight: '1.8' }}>
                                {t('impact_page.description')}
                            </motion.p>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                            >
                                <Link to="/donate" className="btn px-4 py-3 font-weight-bold shadow-sm" style={{ backgroundColor: '#076c5b', color: '#fff', borderRadius: '8px' }}>
                                    {t('impact_page.btn_donate')}
                                </Link>
                            </motion.p>

                        </div>

                        <div className="col-md-6 ftco-animate position-relative mt-5 mt-md-0">
                            {/* Enlarged Image Grid */}
                            <div className="row no-gutters">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6 }}
                                    className="col-8 offset-4 mb-4"
                                >
                                    <div style={{
                                        backgroundImage: "url('/images/pic2.jpg')",
                                        height: '320px',
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        borderRadius: '16px'
                                    }}></div>
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0, x: -30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: 0.2 }}
                                    className="position-absolute" style={{ top: '15%', left: '0', width: '48%', zIndex: 2 }}
                                >
                                    <div style={{
                                        backgroundImage: "url('/images/pic8.jpg')",
                                        height: '240px',
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        borderRadius: '16px',
                                        border: '8px solid #fff'
                                    }}></div>
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: 0.4 }}
                                    className="col-6 pr-3"
                                >
                                    <div style={{
                                        backgroundImage: "url('/images/pic7s.jpg')",
                                        height: '190px',
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        borderRadius: '16px',
                                    }}></div>
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: 0.5 }}
                                    className="col-6"
                                >
                                    <div style={{
                                        backgroundImage: "url('/images/pic7.jpg')",
                                        height: '170px',
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        borderRadius: '16px',
                                    }}></div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Impact Numbers Section - Redesigned to match image theme */}
            <section className="ftco-section" style={{
                padding: '120px 0',
                backgroundColor: '#122f2b',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div className="container">
                    <div className="row">
                        {/* Left Side: Image and "Donate now" */}
                        <div className="col-lg-5 mb-5 mb-lg-0 ftco-animate d-flex flex-column align-items-center justify-content-center">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.7 }}
                                className="position-relative mb-4" style={{ width: '100%', maxWidth: '400px' }}
                            >
                                <div style={{
                                    backgroundImage: "url('/images/pic6.jpg')",
                                    height: '280px',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    borderRadius: '12px'
                                }}></div>
                            </motion.div>
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                                className="text-white font-weight-bold" style={{ fontSize: '56px', letterSpacing: '-1.5px' }}>{t('impact_page.donate_now_heading')}</motion.h2>
                        </div>

                        {/* Right Side: Tabbed Impact Dashboard */}
                        <div className="col-lg-7 ftco-animate">
                            <TabbedImpactDashboard />
                        </div>
                    </div>
                </div>

                {/* Exit Site Vertical Button (as seen in image) */}
                <div style={{
                    position: 'absolute',
                    right: '0',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 10
                }}>
                    <div
                        onClick={() => (window as any).$('#donateModal').modal('show')}
                        style={{
                            backgroundColor: '#bef264',
                            color: '#000',
                            padding: '12px 6px',
                            writingMode: 'vertical-rl',
                            textTransform: 'uppercase',
                            fontWeight: '700',
                            fontSize: '11px',
                            letterSpacing: '1px',
                            borderRadius: '4px 0 0 4px',
                            cursor: 'pointer'
                        }}
                    >
                        {t('impact_page.exit_site_btn')}
                    </div>
                </div>
            </section>

            {/* SDG Alignment Section */}
            <section className="ftco-section bg-white" style={{ padding: '100px 0 20px 0' }}>
                <div className="container">
                    <div className="row justify-content-center mb-4 pb-2">
                        <div className="col-md-10 text-center ftco-animate">
                            <motion.span
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5 }}
                                className="badge badge-light px-3 py-2 mb-2 font-weight-bold" style={{ color: '#076c5b', backgroundColor: '#e2f5f2', borderRadius: '50px', fontSize: '11px', letterSpacing: '1.2px', textTransform: 'uppercase' }}>
                                {t('impact_page.sdg_badge')}
                            </motion.span>
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className="mb-3 font-weight-bold" style={{ fontSize: '42px', color: '#111', letterSpacing: '-1.5px' }}>
                                {t('impact_page.sdg_title')}
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="mx-auto mb-0" style={{ maxWidth: '750px', color: '#666', fontSize: '18px', lineHeight: '1.7' }}>
                                {t('impact_page.sdg_desc')}
                            </motion.p>
                        </div>
                    </div>

                    <div className="row d-flex align-items-stretch no-gutters" style={{ borderRadius: '32px', overflow: 'hidden' }}>
                        {/* Light Card */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="col-lg-5 mb-4 mb-lg-0 ftco-animate"
                        >
                            <div className="h-100 d-flex flex-column" style={{
                                backgroundColor: '#f0f9f8',
                                padding: '60px 45px',
                                border: '1px solid rgba(7, 108, 91, 0.05)'
                            }}>
                                <h3 className="font-weight-bold mb-3" style={{ fontSize: '28px', color: '#122f2b', letterSpacing: '-0.5px' }}>{t('impact_page.resilience_title')}</h3>
                                <p style={{ color: '#666', fontSize: '17px', lineHeight: '1.8', marginBottom: '40px' }}>
                                    {t('impact_page.resilience_desc')}
                                </p>

                                <div className="mt-auto">
                                    {[
                                        { id: 1, title: t('work.sdg1'), progress: 78 },
                                        { id: 3, title: t('work.sdg3'), progress: 85 },
                                        { id: 4, title: t('work.sdg4'), progress: 92 }
                                    ].map((sdg, sidx) => (
                                        <motion.div
                                            key={sdg.id}
                                            initial={{ opacity: 0, width: 0 }}
                                            whileInView={{ opacity: 1, width: '100%' }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.8, delay: 0.3 + (sidx * 0.1) }}
                                            className="mb-4"
                                        >
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <span className="font-weight-bold" style={{ fontSize: '15px', color: '#111' }}>{sdg.title}</span>
                                                <span className="font-weight-bold" style={{ color: '#076c5b', fontSize: '14px' }}>{sdg.progress}%</span>
                                            </div>
                                            <div className="progress" style={{ height: '8px', backgroundColor: 'rgba(7, 108, 91, 0.1)', borderRadius: '10px' }}>
                                                <div className="progress-bar" style={{ width: `${sdg.progress}%`, backgroundColor: '#076c5b' }}></div>
                                            </div>
                                        </motion.div>
                                    ))}

                                    <Link to="/resources" className="btn btn-primary w-100 py-3 mt-4 border-0 font-weight-bold" style={{ backgroundColor: '#076c5b', borderRadius: '14px', fontSize: '15px', letterSpacing: '0.5px' }}>
                                        {t('impact_page.report_btn')}
                                    </Link>
                                </div>
                            </div>
                        </motion.div>

                        {/* Dark Card */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="col-lg-7 ftco-animate"
                        >
                            <div className="h-100 d-flex text-white" style={{
                                backgroundColor: '#076c5b',
                                padding: '60px 40px',
                                border: '1px solid rgba(7, 108, 91, 0.1)'
                            }}>
                                <div className="row w-100">
                                    <div className="col-md-7 d-flex flex-column">
                                        <h3 className="font-weight-bold mb-3 text-white" style={{ fontSize: '32px', letterSpacing: '-1px' }}>{t('impact_page.transformation_title')}</h3>
                                        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '17px', lineHeight: '1.8', marginBottom: '40px' }}>
                                            {t('impact_page.transformation_desc')}
                                        </p>

                                        <div className="mt-auto">
                                            {[
                                                { id: 5, title: t('work.sdg5'), progress: 88 },
                                                { id: 8, title: t('work.sdg8'), progress: 75 },
                                                { id: 10, title: t('work.sdg10'), progress: 82 }
                                            ].map((sdg, sidx) => (
                                                <motion.div
                                                    key={sdg.id}
                                                    initial={{ opacity: 0, width: 0 }}
                                                    whileInView={{ opacity: 1, width: '100%' }}
                                                    viewport={{ once: true }}
                                                    transition={{ duration: 0.8, delay: 0.3 + (sidx * 0.1) }}
                                                    className="mb-4"
                                                >
                                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                                        <span className="font-weight-bold" style={{ fontSize: '15px' }}>{sdg.title}</span>
                                                        <span className="font-weight-bold" style={{ color: '#fff', fontSize: '14px' }}>{sdg.progress}%</span>
                                                    </div>
                                                    <div className="progress" style={{ height: '8px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '10px' }}>
                                                        <div className="progress-bar" style={{ width: `${sdg.progress}%`, backgroundColor: '#fff' }}></div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                            <Link to="/contact" className="btn btn-white w-100 py-3 mt-4 font-weight-bold" style={{ borderRadius: '14px', fontSize: '15px', color: '#076c5b', letterSpacing: '0.5px' }}>
                                                {t('impact_page.partner_btn')}
                                            </Link>
                                        </div>
                                    </div>

                                    <div className="col-md-5 pl-md-5 mt-5 mt-md-0 border-left" style={{ borderColor: 'rgba(255,255,255,0.1) !important' }}>
                                        <h6 className="font-weight-bold text-uppercase mb-4" style={{ letterSpacing: '1.5px', fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{t('impact_page.outcomes_title')}</h6>
                                        <ul className="list-unstyled mb-0">
                                            {[
                                                t('impact_page.outcome_item1'),
                                                t('impact_page.outcome_item2'),
                                                t('impact_page.outcome_item3'),
                                                t('impact_page.outcome_item4'),
                                                t('impact_page.outcome_item5'),
                                                t('impact_page.outcome_item6')
                                            ].map((item, idx) => (
                                                <motion.li
                                                    key={idx}
                                                    initial={{ opacity: 0, x: 10 }}
                                                    whileInView={{ opacity: 1, x: 0 }}
                                                    viewport={{ once: true }}
                                                    transition={{ duration: 0.4, delay: 0.5 + (idx * 0.05) }}
                                                    className="d-flex align-items-start mb-3"
                                                >
                                                    <Check size={20} className="mr-3" style={{ color: '#eacfa2', marginTop: '4px' }} strokeWidth={3} />
                                                    <span style={{ fontSize: '16px', color: 'rgba(255,255,255,0.95)', fontWeight: '500' }}>{item}</span>
                                                </motion.li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Donation Modal - Preserving functionality */}
            <div className="modal fade" id="donateModal" tabIndex={-1} role="dialog" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered" role="document">
                    <div className="modal-content border-0 rounded-2xl p-4" style={{ borderRadius: '30px' }}>
                        <div className="modal-header border-0 pb-0">
                            <h5 className="text-2xl font-bold">{t('impact_page.donate_now_heading')}</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body py-8 text-center italic text-gray-500">
                            <p>{t('impact_page.subtitle')}</p>
                            <Link to="/donate" className="btn btn-primary btn-block py-3 font-weight-bold mt-4" style={{ borderRadius: '15px' }} onClick={() => (window as any).$('#donateModal').modal('hide')}>
                                Proceed to Donation
                            </Link>
                        </div>
                        <div className="modal-footer border-0 pt-0">
                            <button type="button" className="btn btn-light btn-block py-3 font-weight-bold" data-dismiss="modal" style={{ borderRadius: '15px' }}>
                                {t('impact_page.exit_site_btn')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

const TabbedImpactDashboard = () => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = React.useState('one-off');

    const stats = {
        'one-off': [
            { amount: t('impact_page.stat_one_off_1_amount'), desc: t('impact_page.stat_one_off_1_desc') },
            { amount: t('impact_page.stat_one_off_2_amount'), desc: t('impact_page.stat_one_off_2_desc') },
            { amount: t('impact_page.stat_one_off_3_amount'), desc: t('impact_page.stat_one_off_3_desc') },
        ],
        'monthly': [
            { amount: t('impact_page.stat_monthly_1_amount'), desc: t('impact_page.stat_monthly_1_desc') },
            { amount: t('impact_page.stat_monthly_2_amount'), desc: t('impact_page.stat_monthly_2_desc') },
            { amount: t('impact_page.stat_monthly_3_amount'), desc: t('impact_page.stat_monthly_3_desc') },
        ]
    };

    return (
        <div className="w-100">
            {/* Tab Headers */}
            <div className="d-flex mb-0">
                <button
                    onClick={() => setActiveTab('one-off')}
                    style={{
                        padding: '12px 25px',
                        backgroundColor: activeTab === 'one-off' ? 'transparent' : 'rgba(255,255,255,0.05)',
                        color: '#fff',
                        border: activeTab === 'one-off' ? '1px solid #fff' : 'none',
                        borderBottom: 'none',
                        borderRadius: '8px 8px 0 0',
                        fontSize: '14px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        zIndex: 2,
                        marginRight: '2px'
                    }}
                >
                    {t('impact_page.tab_one_off')}
                </button>
                <button
                    onClick={() => setActiveTab('monthly')}
                    style={{
                        padding: '12px 25px',
                        backgroundColor: activeTab === 'monthly' ? 'transparent' : 'rgba(255,255,255,0.05)',
                        color: '#fff',
                        border: activeTab === 'monthly' ? '1px solid #fff' : 'none',
                        borderBottom: 'none',
                        borderRadius: '8px 8px 0 0',
                        fontSize: '14px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        zIndex: 2
                    }}
                >
                    {t('impact_page.tab_monthly')}
                </button>
            </div>

            {/* Content Box */}
            <div style={{
                border: '1px solid #fff',
                padding: '50px 40px',
                borderRadius: '0 8px 8px 8px',
                position: 'relative',
                marginTop: '-1px',
                zIndex: 1,
                minHeight: '340px'
            }}>
                <div className="row">
                    <AnimatePresence mode="wait">
                        {stats[activeTab as keyof typeof stats].map((item, idx) => (
                            <motion.div
                                key={`${activeTab}-${idx}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3, delay: idx * 0.1 }}
                                className="col-md-4 mb-4 mb-md-0"
                            >
                                <h3 className="text-white font-weight-bold mb-3" style={{ fontSize: '48px', lineHeight: '1' }}>{item.amount}</h3>
                                <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '17px', lineHeight: '1.7', margin: 0 }}>
                                    {item.desc}
                                </p>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Main Action Button */}
                <div className="mt-5 pt-3">

                    <Link to="/donate" className="btn w-100 py-3 font-weight-bold d-flex align-items-center justify-content-center" style={{
                        backgroundColor: '#076c5b',
                        color: '#fff',
                        borderRadius: '14px',
                        fontSize: '16px',

                        transition: 'transform 0.2s ease, background-color 0.2s ease'
                    }}>
                        {t('impact_page.explore_btn')}
                    </Link>
                </div>
            </div>
        </div>
    );
};
