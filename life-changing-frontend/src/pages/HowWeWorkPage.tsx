import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../lib/language-context';
import { useLegacyScripts } from '../hooks/UseLegacyScripts';
import { Gift, Heart, Megaphone, Handshake, PenTool, LayoutDashboard, Star, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export const HowWeWorkPage = () => {
    useLegacyScripts();
    const { t } = useLanguage();

    const supportWays = [
        { title: t('work.support_will'), icon: <PenTool size={28} strokeWidth={1.5} /> },
        { title: t('work.support_regular'), icon: <Heart size={28} strokeWidth={1.5} /> },
        { title: t('work.support_fundraise'), icon: <Megaphone size={28} strokeWidth={1.5} /> },
        { title: t('work.support_corporate'), icon: <Handshake size={28} strokeWidth={1.5} /> }
    ];

    const interventionAreas = [
        { title: t('work.area_edu_title'), image: '/images/cause-1.jpg', desc: t('work.area_edu_desc') },
        { title: t('work.area_srhr_title'), image: '/images/pic13.jpg', desc: t('work.area_srhr_desc') },
        { title: t('work.area_gender_title'), image: '/images/pic8.jpg', desc: t('work.area_gender_desc') },
        { title: t('work.area_econ_title'), image: '/images/pic9.jpg', desc: t('work.area_econ_desc') },
        { title: t('work.area_resilience_title'), image: '/images/testimonial1.jpg', desc: t('work.area_resilience_desc') },
        { title: t('work.area_emergency_title'), image: '/images/pic16.jpg', desc: t('work.area_emergency_desc') }
    ];

    const processSteps = [
        { title: t('work.process_step1_title'), desc: t('work.process_step1_desc') },
        { title: t('work.process_step2_title'), desc: t('work.process_step2_desc') },
        { title: t('work.process_step3_title'), desc: t('work.process_step3_desc') },
        { title: t('work.process_step4_title'), desc: t('work.process_step4_desc') },
        { title: t('work.process_step5_title'), desc: t('work.process_step5_desc') },
        { title: t('work.process_step6_title'), desc: t('work.process_step6_desc') }
    ];

    const strategicPhases = [
        {
            title: t('work.phase1_title'),
            icon: <CheckCircle size={24} />,
            details: t('work.phase1_desc')
        },
        {
            title: t('work.phase2_title'),
            icon: <CheckCircle size={24} />,
            details: t('work.phase2_desc')
        },
        {
            title: t('work.phase3_title'),
            icon: <CheckCircle size={24} />,
            details: t('work.phase3_desc')
        }
    ];

    const corePrinciples = [
        {
            title: t('work.principle1_title'),
            desc: t('work.principle1_desc'),
            icon: <Handshake size={32} />
        },
        {
            title: t('work.principle2_title'),
            desc: t('work.principle2_desc'),
            icon: <LayoutDashboard size={32} />
        },
        {
            title: t('work.principle3_title'),
            desc: t('work.principle3_desc'),
            icon: <PenTool size={32} />
        },
        {
            title: t('work.principle4_title'),
            desc: t('work.principle4_desc'),
            icon: <CheckCircle size={32} />
        }
    ];

    const keyResults = [
        { label: t('work.stat1_label'), value: '10,000+', desc: t('work.stat1_desc') },
        { label: t('work.stat2_label'), value: '50+', desc: t('work.stat2_desc') },
        { label: t('work.stat3_label'), value: '95%', desc: t('work.stat3_desc') },
        { label: t('work.stat4_label'), value: '300+', desc: t('work.stat4_desc') }
    ];

    const sdgGoals = [
        { title: t('work.sdg1') },
        { title: t('work.sdg4') },
        { title: t('work.sdg5') },
        { title: t('work.sdg8') }
    ];

    return (
        <>
            <style>
                {`
                .featured-story-main {
                    position: relative;
                    overflow: hidden;
                    cursor: pointer;
                }
                .featured-story-main img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.6s cubic-bezier(0.165, 0.84, 0.44, 1);
                }
                .featured-story-main:hover img {
                    transform: scale(1.08);
                }
                .featured-overlay {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: #00594f;
                    transition: all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);
                    color: white;
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-start;
                    z-index: 2;
                }
                .featured-story-main:hover .featured-overlay {
                    height: 100% !important;
                    background: rgba(0, 89, 79, 0.96);
                    justify-content: center;
                }
                .secondary-story-card {
                    position: relative;
                    overflow: hidden;
                    cursor: pointer;
                    background: #fff;
                    border: 1px solid #f0f2f2;
                }
                .secondary-story-card img {
                    width: 100%;
                    object-fit: cover;
                    transition: filter 0.3s ease;
                }
                .secondary-overlay {
                    background: #fff;
                    transition: all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);
                }
                .secondary-story-card:hover .secondary-overlay {
                    height: 100% !important;
                    transform: translateY(-180px);
                    background: #fff;
                }
                .story-badge {
                    background-color: #111;
                    color: white !important;
                    padding: 3px 12px;
                    font-size: 11px;
                    font-weight: 700;
                    margin-right: 15px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                .story-date {
                    font-size: 13px;
                    opacity: 0.7;
                }
                .featured-title {
                    font-weight: 800;
                    color: white;
                    text-decoration: underline;
                    text-decoration-thickness: 2px;
                    text-underline-offset: 6px;
                }
                .secondary-title {
                    font-weight: 800;
                    color: #00594f;
                    line-height: 1.3;
                }
                .featured-desc, .secondary-desc {
                    opacity: 0;
                    line-height: 1.7;
                    transition: opacity 0.4s ease;
                    color: rgba(255,255,255,0.9);
                }
                .secondary-desc {
                    color: #666;
                }
                .featured-story-main:hover .featured-desc, .secondary-story-card:hover .secondary-desc {
                    opacity: 1;
                }

                .impact-card {
                    position: relative;
                    height: 280px;
                    overflow: hidden;
                    border-radius: 0;
                    cursor: pointer;
                }
                .impact-card img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.5s ease;
                }
                .impact-card:hover img {
                    transform: scale(1.1);
                }
                .impact-card-overlay {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: #00594f;
                    padding: 15px 20px;
                    height: 54px;
                    transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-start;
                    color: white;
                    z-index: 2;
                }
                .impact-card:hover .impact-card-overlay {
                    height: 100%;
                    background: rgba(0, 89, 79, 0.92);
                    padding-top: 30px;
                }
                .impact-card-title {
                    font-size: 17px;
                    font-weight: 700;
                    margin-bottom: 15px;
                    white-space: nowrap;
                    text-transform: none;
                    display: inline-block;
                    width: fit-content;
                    position: relative;
                    color: #fff;
                }
                .impact-card:hover .impact-card-title {
                    white-space: normal;
                }
                .impact-card-title::after {
                    content: '';
                    position: absolute;
                    bottom: -4px;
                    left: 0;
                    width: 0;
                    height: 2px;
                    background-color: #fff;
                    transition: width 0.3s ease;
                }
                .impact-card:hover .impact-card-title::after {
                    width: 100%;
                }
                .impact-card-desc {
                    opacity: 0;
                    font-size: 14px;
                    line-height: 1.5;
                    transition: opacity 0.3s ease;
                    transition-delay: 0.1s;
                    margin-top: 5px;
                    color: rgba(255,255,255,0.9);
                }
                .impact-card:hover .impact-card-desc {
                    opacity: 1;
                }
                `}
            </style>

            <div className="hero-wrap" style={{ backgroundImage: "url('/images/how_we_work.jpg')", height: '350px', minHeight: '350px' }}>
                <div className="overlay"></div>
                <div className="container">
                    <div className="row no-gutters slider-text align-items-center justify-content-center" style={{ height: '350px', paddingTop: '60px' }}>
                        <div className="col-md-7 text-center">
                            <motion.p
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                                className="breadcrumbs">
                                <span className="mr-2"><Link to="/">{t('work.breadcrumb_home')}</Link></span>
                                <span>{t('work.breadcrumb_work')}</span>
                            </motion.p>
                            <motion.h1
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="mb-2 bread">
                                {t('work.title')}
                            </motion.h1>
                        </div>
                    </div>
                </div>
            </div>

            <section className="ftco-section bg-white" style={{ padding: '40px 0 20px 0' }}>
                <div className="container">
                    <div className="row mb-3">
                        <div className="col-md-12">
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5 }}
                                style={{ fontSize: '24px', fontWeight: '800', color: '#2c3e50', marginBottom: '15px' }}>
                                {t('work.more_ways_title')}
                            </motion.h2>
                        </div>
                    </div>
                    <div className="row">
                        {supportWays.map((item, idx) => (
                            <div className="col-md-3 mb-3" key={idx}>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                                    className="p-3 d-flex align-items-center h-100" style={{ backgroundColor: '#f9fbfb', borderRadius: '4px', border: '1px solid #f0f2f2' }}>
                                    <div className="mr-3" style={{ color: '#00594f' }}>
                                        {item.icon}
                                    </div>
                                    <h5 className="mb-0" style={{ fontSize: '14px', fontWeight: '700' }}>
                                        <Link to="#" style={{ color: '#111', textDecoration: 'underline', textDecorationThickness: '1.5px', textUnderlineOffset: '3px' }}>
                                            {item.title}
                                        </Link>
                                    </h5>
                                </motion.div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="ftco-section bg-light" style={{ padding: '40px 0 10px 0' }}>
                <div className="container">
                    <div className="row">
                        <div className="col-md-8 mb-3">
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                                className="featured-story-main" style={{ height: '420px', marginBottom: '0' }}>
                                <img src="/images/cropped_upscaled_image.jpg" alt="Featured Story" />
                                <div className="featured-overlay" style={{ padding: '25px', height: '140px' }}>
                                    <div className="d-flex align-items-center mb-2">
                                        <span className="story-badge">{t('work.story_badge')}</span>
                                        <span className="story-date">11 February 2026</span>
                                    </div>
                                    <h2 className="featured-title" style={{ fontSize: '26px', marginBottom: '10px' }}>
                                        {t('work.featured_story_title')}
                                    </h2>
                                    <p className="featured-desc" style={{ fontSize: '15px', marginTop: '10px' }}>
                                        {t('work.featured_story_desc')}
                                    </p>
                                </div>
                            </motion.div>
                        </div>

                        <div className="col-md-4 mb-3">
                            <motion.div
                                initial={{ opacity: 0, x: 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                                className="secondary-story-card" style={{ height: '420px' }}>
                                <img src="/images/img1.jpg" alt="Secondary Story" style={{ height: '220px' }} />
                                <div className="secondary-overlay" style={{ padding: '20px', height: '200px' }}>
                                    <div className="d-flex align-items-center mb-1">
                                        <span className="story-badge">{t('work.story_badge')}</span>
                                        <span className="story-date">17 February 2026</span>
                                    </div>
                                    <h3 className="secondary-title" style={{ fontSize: '18px', marginTop: '10px' }}>
                                        {t('work.secondary_story_title')}
                                    </h3>
                                    <p className="secondary-desc" style={{ fontSize: '14px', marginTop: '10px' }}>
                                        {t('work.secondary_story_desc')}
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="ftco-section bg-white" style={{ padding: '50px 0' }}>
                <div className="container">
                    <div className="row justify-content-center mb-4">
                        <div className="col-md-8 text-center">
                            <motion.span
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5 }}
                                className="badge badge-light px-3 py-2 mb-2 font-weight-bold" style={{ color: '#076c5b', backgroundColor: '#e2f5f2', borderRadius: '50px', fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                                {t('work.impact_badge')}
                            </motion.span>
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className="mb-2 font-weight-bold" style={{ fontSize: '32px', color: '#111' }}>
                                {t('work.impact_title')}
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                style={{ fontSize: '16px', color: '#666' }}>
                                {t('work.impact_desc')}
                            </motion.p>
                        </div>
                    </div>
                    <div className="row">
                        {interventionAreas.map((item, idx) => (
                            <div className="col-md-4 mb-3" key={idx}>
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: idx * 0.1 }}
                                    className="impact-card">
                                    <img src={item.image} alt={item.title} />
                                    <div className="impact-card-overlay">
                                        <h3 className="impact-card-title">{item.title}</h3>
                                        <p className="impact-card-desc">{item.desc}</p>
                                    </div>
                                </motion.div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="ftco-section bg-light" style={{ padding: '60px 0' }}>
                <div className="container">
                    <div className="row justify-content-center mb-4">
                        <div className="col-md-8 text-center">
                            <motion.span
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5 }}
                                className="badge badge-light px-3 py-2 mb-2 font-weight-bold" style={{ color: '#076c5b', backgroundColor: '#e2f5f2', borderRadius: '50px', fontSize: '13px', letterSpacing: '2px', textTransform: 'uppercase' }}>
                                {t('work.methodology_badge')}
                            </motion.span>
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className="mb-3 font-weight-bold" style={{ fontSize: '42px', color: '#111', letterSpacing: '-1.5px' }}>
                                {t('work.methodology_title')}
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="mx-auto" style={{ maxWidth: '800px', fontSize: '19px', color: '#666', lineHeight: '1.8' }}>
                                {t('work.methodology_desc')}
                            </motion.p>
                        </div>
                    </div>

                    <div className="row align-items-stretch mb-4">
                        <div className="col-lg-4 mb-4">
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                                className="h-100 p-5 d-flex flex-column justify-content-between" style={{
                                    background: '#076c5b',
                                    borderRadius: '32px',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                <div style={{ position: 'absolute', top: '30px', right: '30px', opacity: 0.1, color: 'white' }}>
                                    <LayoutDashboard size={120} strokeWidth={1} />
                                </div>
                                <div className="mt-2" style={{ position: 'relative', zIndex: 1 }}>
                                    <h3 className="text-white font-weight-bold mb-4" style={{ fontSize: '30px', lineHeight: '1.2' }}>
                                        {t('work.engine_title')}
                                    </h3>
                                    <p className="text-white-50" style={{ fontSize: '16px', lineHeight: '1.9' }}>
                                        {t('work.engine_desc')}
                                    </p>
                                    <div className="mt-4 p-3 rounded-2xl" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        <p className="text-white mb-0 small opacity-80">
                                            {t('work.engine_quote')}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-5 pt-4 border-top" style={{ borderColor: 'rgba(255,255,255,0.1) !important' }}>
                                    <div className="d-flex align-items-center">
                                        <div className="mr-3" style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: 'rgba(190, 242, 100, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Star size={22} color="#eacfa2" />
                                        </div>
                                        <p className="text-white mb-0 font-weight-bold" style={{ fontSize: '15px' }}>
                                            {t('work.certified_badge')}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        <div className="col-lg-8">
                            <div className="row">
                                {processSteps.map((step, idx) => (
                                    <div className="col-md-6 mb-4" key={idx}>
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                                            className="p-4 bg-white d-flex flex-column h-100 transition-all hover:bg-teal-50/20" style={{
                                                borderRadius: '16px',
                                                border: '1px solid #f0f4f4',
                                                padding: '16px',
                                                fontSize: '14px'
                                            }}>
                                            <div className="mb-3 d-flex align-items-center" style={{
                                                fontSize: '64px',
                                                fontWeight: '900',
                                                color: '#ffffff',
                                                backgroundColor: '#2f4f4f',
                                                width: '80px',
                                                height: '80px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                borderRadius: '8px',
                                                marginRight: '16px'
                                            }}>
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <h4 className="font-weight-bold mb-1" style={{ fontSize: '20px', color: '#122f2b', letterSpacing: '-0.5px' }}>{step.title}</h4>
                                                <p className="text-muted mb-0" style={{ fontSize: '15px', lineHeight: '1.7' }}>
                                                    {step.desc}
                                                </p>
                                            </div>
                                        </motion.div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="row mt-4 pt-2">
                        <div className="col-md-12">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                                className="p-5" style={{ backgroundColor: '#fff', borderRadius: '32px', border: '1px solid #eef2f2' }}>
                                <div className="row align-items-center mb-5">
                                    <div className="col-md-6">
                                        <h3 className="font-weight-bold mb-2" style={{ fontSize: '28px', color: '#122f2b' }}>{t('work.framework_title')}</h3>
                                        <p className="text-muted mb-0">{t('work.framework_desc')}</p>
                                    </div>
                                    <div className="col-md-6 text-md-right">
                                        <Link to="/contact" className="btn px-4 py-3 font-weight-bold" style={{ backgroundColor: '#076c5b', color: '#fff', borderRadius: '12px' }}>
                                            {t('work.download_btn')}
                                        </Link>
                                    </div>
                                </div>
                                <div className="row">
                                    {strategicPhases.map((phase, idx) => (
                                        <div className="col-md-4 mb-4 mb-md-0" key={idx}>
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 0.5, delay: 0.3 + (idx * 0.1) }}
                                            >
                                                <div className="d-flex mb-3 align-items-center" style={{ color: '#076c5b' }}>
                                                    <div className="mr-3 p-2 rounded-lg" style={{ backgroundColor: '#e2f5f2' }}>{phase.icon}</div>
                                                    <h5 className="mb-0 font-weight-bold" style={{ fontSize: '18px', color: '#122f2b' }}>{phase.title}</h5>
                                                </div>
                                                <p className="text-muted" style={{ fontSize: '15px', lineHeight: '1.7' }}>{phase.details}</p>
                                            </motion.div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    <div className="row mt-4 pt-4">
                        <div className="col-md-12 text-center mb-4">
                            <motion.h3
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5 }}
                                className="font-weight-bold" style={{ fontSize: '28px', color: '#122f2b', letterSpacing: '-1.0px' }}>
                                {t('work.principles_title')}
                            </motion.h3>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className="text-muted">
                                {t('work.principles_desc')}
                            </motion.p>
                        </div>
                        {corePrinciples.map((principle, idx) => (
                            <div className="col-md-3 mb-4" key={idx}>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                                    className="text-center p-4 h-100 transition-all" style={{
                                        backgroundColor: '#fff',
                                        borderRadius: '24px',
                                        border: '1px solid #f0f4f4',
                                        transition: 'transform 0.3s ease, background-color 0.3s ease',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'scale(1.2)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'scale(1)';
                                    }}
                                >
                                    <div className="mb-3 d-inline-flex align-items-center justify-content-center" style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#e2f5f2', color: '#076c5b' }}>
                                        {principle.icon}
                                    </div>
                                    <h5 className="font-weight-bold mb-2" style={{ fontSize: '17px', color: '#122f2b' }}>{principle.title}</h5>
                                    <p className="small text-muted mb-0" style={{ lineHeight: '1.6' }}>{principle.desc}</p>
                                </motion.div>
                            </div>
                        ))}
                    </div>

                    <div className="row mt-4 pt-4 border-top" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
                        <div className="col-md-12 text-center mb-4">
                            <motion.h3
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5 }}
                                className="font-weight-bold" style={{ fontSize: '32px', color: '#122f2b', letterSpacing: '-1.5px' }}>
                                {t('work.results_title')}
                            </motion.h3>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className="text-muted mx-auto" style={{ maxWidth: '600px' }}>
                                {t('work.results_desc')}
                            </motion.p>
                        </div>
                        {keyResults.map((stat, idx) => (
                            <div className="col-md-3 mb-4" key={idx}>
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                                    className="text-center p-4">
                                    <div className="font-weight-bold mb-1" style={{ fontSize: '42px', color: '#076c5b', letterSpacing: '-2px' }}>{stat.value}</div>
                                    <h5 className="font-weight-bold mb-2" style={{ fontSize: '18px', color: '#122f2b' }}>{stat.label}</h5>
                                    <p className="small text-muted mb-0" style={{ lineHeight: '1.5' }}>{stat.desc}</p>
                                </motion.div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="ftco-section" style={{ padding: '40px 0' }}>
                <div className="container">
                    <div className="row justify-content-center mb-3">
                        <div className="col-md-7 heading-section text-center">
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5 }}
                                className="mb-2" style={{ fontSize: '28px' }}>
                                {t('work.sdg_title')}
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                style={{ fontSize: '15px' }}>
                                {t('work.sdg_desc')}
                            </motion.p>
                        </div>
                    </div>
                    <div className="row text-center">
                        {sdgGoals.map((sdg, idx) => (
                            <div className="col-md-3 mb-3" key={idx}>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                                    className="p-4 h-100 text-center" style={{
                                        backgroundColor: '#fff',
                                        borderRadius: '12px',
                                        border: '1px solid #f0f4f4',
                                        transition: 'transform 0.3s ease, background-color 0.3s ease',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'scale(1.2)';
                                        e.currentTarget.style.backgroundColor = '#e2f5e9';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'scale(1)';
                                        e.currentTarget.style.backgroundColor = '#fff';
                                    }}>
                                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#2c3e50' }}>{sdg.title}</h3>
                                </motion.div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
};
