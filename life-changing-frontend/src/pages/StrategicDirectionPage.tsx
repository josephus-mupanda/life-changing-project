import React from 'react';
import { Link } from 'react-router-dom';
import { useLegacyScripts } from '../hooks/UseLegacyScripts';
import { User, Users, Shield, Globe, BookOpen, TrendingUp, GraduationCap, Briefcase, Award, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../lib/language-context';

export const StrategicDirectionPage = () => {
    const { t } = useLanguage();
    useLegacyScripts();

    return (
        <>
            <div className="hero-wrap" style={{ backgroundImage: "url('/images/bg_2.jpg')", height: '500px', minHeight: '500px' }}>
                <div className="overlay"></div>
                <div className="container">
                    <div className="row no-gutters slider-text align-items-center justify-content-center" style={{ height: '500px', paddingTop: '100px' }}>
                        <div className="col-md-7 text-center">
                            <motion.h1
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                                className="mb-4"
                            >
                                {t('strategic.hero_title')}
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="mb-5"
                            >
                                {t('strategic.hero_desc')}
                            </motion.p>

                            <motion.p
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.4 }}
                            >
                                <Link to="/about" className="btn btn-white btn-outline-white px-4 py-3">{t('strategic.learn_more')}</Link>
                            </motion.p>
                        </div>
                    </div>
                </div>
            </div>

            <section className="ftco-counter ftco-intro" id="section-counter" style={{ marginTop: '-80px', position: 'relative', zIndex: 10 }}>
                <div className="container">
                    <div className="row no-gutters">
                        <div className="col-md-12">
                            <div className="row no-gutters d-md-flex align-items-center justify-content-between p-4" style={{ background: '#076c5b', borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
                                <div className="col-md-12 mb-4 text-center">
                                    <h3 className="text-white font-weight-bold mb-0" style={{ fontSize: '24px' }}>{t('strategic.impact_title')}</h3>
                                </div>
                                {[{ icon: <Users size={32} strokeWidth={1.5} />, number: '5000', label: t('strategic.stat1_label') },
                                { icon: <GraduationCap size={32} strokeWidth={1.5} />, number: '1200', label: t('strategic.stat2_label') },
                                { icon: <Briefcase size={32} strokeWidth={1.5} />, number: '450', label: t('strategic.stat3_label') },
                                { icon: <Award size={32} strokeWidth={1.5} />, number: '300', label: t('strategic.stat4_label') }].map((stat, idx) => (
                                    <div className="col-md-3 d-flex justify-content-center align-items-center mb-0 ftco-animate" key={idx}>
                                        <div className="d-flex align-items-center">
                                            <div className="mr-2" style={{ color: 'white', opacity: 0.9 }}>
                                                {stat.icon}
                                            </div>
                                            <div className="text-white">
                                                <div className="d-flex align-items-baseline">
                                                    <strong className="number" style={{ fontSize: '28px', fontWeight: '800' }}>{stat.number}</strong>
                                                    <span style={{ fontSize: '16px', marginLeft: '1px', fontWeight: '700' }}>+</span>
                                                </div>
                                                <span style={{ fontSize: '11px', textTransform: 'none', opacity: 0.85, display: 'block', lineHeight: '1.2' }}>
                                                    {stat.label}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="ftco-section p-0 overflow-hidden" style={{ backgroundColor: '#f8f9fa' }}>
                <div className="container-fluid p-0">
                    <div className="row no-gutters d-flex align-items-stretch">
                        <div className="col-md-6" style={{
                            backgroundImage: "url('/images/cause-1.jpg')",
                            backgroundSize: 'cover',
                            backgroundPosition: 'center center',
                            minHeight: '500px',
                            position: 'relative'
                        }}>
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'rgba(7, 108, 91, 0.3)'
                            }}></div>
                        </div>

                        <div className="col-md-6 d-flex align-items-center" style={{
                            backgroundColor: '#076c5b',
                            padding: '80px',
                            color: '#ffffff'
                        }}>
                            <motion.div
                                initial={{ opacity: 0, x: 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                                className="w-100"
                            >
                                <h2 className="text-white font-weight-bold mb-4" style={{
                                    fontSize: '48px',
                                    lineHeight: '1.1',
                                    letterSpacing: '-1.5px'
                                }}>
                                    {t('strategic.title')}
                                </h2>

                                <p className="mb-4 text-white" style={{ fontSize: '19px', lineHeight: '1.7', opacity: '0.9' }}>
                                    {t('strategic.desc1')}
                                </p>

                                <p className="mb-5 text-white" style={{ fontSize: '19px', lineHeight: '1.7', opacity: '0.9' }}>
                                    {t('strategic.desc2')}
                                </p>

                                <Link to="/about" className="d-flex align-items-center text-white font-weight-bold" style={{
                                    fontSize: '16px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    textDecoration: 'none'
                                }}>
                                    {t('strategic.learn_more_btn')}
                                    <div className="ml-3 bg-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                                        <ChevronRight size={18} style={{ color: '#076c5b', marginLeft: '0px' }} />
                                    </div>
                                </Link>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="ftco-section bg-light" style={{ padding: '100px 0' }}>
                <div className="container">
                    <div className="row">
                        <div className="col-md-12 mb-5">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                                className="p-5 bg-white rounded-lg" style={{ borderRadius: '32px', border: '1px solid rgba(0,0,0,0.05)' }}
                            >
                                <h3 className="mb-4 font-weight-bold" style={{ color: '#076c5b', fontSize: '32px', letterSpacing: '-1px' }}>{t('strategic.philosophy_title')}</h3>
                                <p className="lead" style={{ color: '#555', lineHeight: '1.9', fontSize: '20px' }}>
                                    {t('strategic.philosophy_desc')}
                                </p>
                            </motion.div>
                        </div>

                        <div className="col-md-12 text-left">
                            <div className="p-5 bg-white" style={{
                                borderRadius: '32px',
                                border: '1px solid rgba(0,0,0,0.05)'
                            }}>
                                <div className="row mb-5">
                                    <div className="col-lg-7">
                                        <motion.span
                                            initial={{ opacity: 0, y: 10 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.5 }}
                                            className="badge badge-light px-3 py-2 mb-3 font-weight-bold" style={{ color: '#076c5b', backgroundColor: '#e2f5f2', borderRadius: '50px', fontSize: '11px', letterSpacing: '1.2px', textTransform: 'uppercase' }}
                                        >
                                            {t('strategic.change_model_badge')}
                                        </motion.span>
                                        <motion.h2
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.6, delay: 0.1 }}
                                            className="mb-4 font-weight-bold" style={{ fontSize: '48px', lineHeight: '1.1', color: '#111', letterSpacing: '-2px' }}
                                        >
                                            {t('strategic.change_model_title')}
                                        </motion.h2>
                                    </div>
                                    <div className="col-lg-5 d-flex align-items-end">
                                        <motion.p
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.6, delay: 0.2 }}
                                            style={{ fontSize: '18px', color: '#666', lineHeight: '1.8', marginBottom: '1.5rem' }}
                                        >
                                            {t('strategic.change_model_desc')}
                                        </motion.p>
                                    </div>
                                </div>

                                <div className="row mt-5 pt-4">
                                    {[
                                        { level: t('strategic.level1_title'), icon: <User size={60} strokeWidth={1} />, text: t('strategic.level1_desc') },
                                        { level: t('strategic.level2_title'), icon: <Users size={60} strokeWidth={1} />, text: t('strategic.level2_desc') },
                                        { level: t('strategic.level3_title'), icon: <Shield size={60} strokeWidth={1} />, text: t('strategic.level3_desc') }
                                    ].map((item, idx) => (
                                        <div className="col-md-4 mb-5 d-flex" key={idx}>
                                            <motion.div
                                                initial={{ opacity: 0, y: 30 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                                className="d-flex"
                                            >
                                                <div className="mr-3 d-flex align-items-start justify-content-center" style={{ width: '80px', flexShrink: 0 }}>
                                                    <div style={{ color: '#076c5b' }}>{item.icon}</div>
                                                </div>
                                                <div>
                                                    <h5 className="font-weight-bold mb-2 d-flex align-items-center" style={{ fontSize: '20px', color: '#111' }}>
                                                        {item.level} <span className="ml-2" style={{ fontSize: '16px', fontWeight: '900', color: '#076c5b', opacity: 0.8 }}>›</span>
                                                    </h5>
                                                    <p style={{ fontSize: '16px', color: '#666', lineHeight: '1.7' }}>
                                                        {item.text}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="ftco-section" style={{ backgroundColor: '#00594f', padding: '100px 0' }}>
                <div className="container">
                    <div className="row justify-content-start mb-5 pb-3">
                        <div className="col-md-12">
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5 }}
                                className="mb-4 text-white font-weight-bold" style={{ fontSize: '42px', letterSpacing: '-1.5px' }}
                            >
                                {t('strategic.alignment_title')}
                            </motion.h2>
                        </div>
                    </div>
                    <div className="row">
                        {[
                            { title: t('strategic.vision2050_title'), icon: <Globe className="text-white" size={60} strokeWidth={1} />, text: t('strategic.vision2050_desc') },
                            { title: t('strategic.nst2_title'), icon: <BookOpen className="text-white" size={60} strokeWidth={1} />, text: t('strategic.nst2_desc') },
                            { title: t('strategic.econ_title'), icon: <TrendingUp className="text-white" size={60} strokeWidth={1} />, text: t('strategic.econ_desc') },
                            { title: t('strategic.gender_title'), icon: <GraduationCap className="text-white" size={60} strokeWidth={1} />, text: t('strategic.gender_desc') }
                        ].map((item, idx) => (
                            <div className="col-md-6 mb-5 d-flex" key={idx}>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                                    className="d-flex"
                                >
                                    <div className="mr-4 d-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px', flexShrink: 0 }}>
                                        {item.icon}
                                    </div>
                                    <div>
                                        <h4 className="text-white font-weight-bold mb-3 d-flex align-items-center" style={{ fontSize: '24px' }}>
                                            {item.title} <span className="ml-2" style={{ fontSize: '18px', fontWeight: '900', opacity: 0.8 }}>›</span>
                                        </h4>
                                        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '17px', lineHeight: '1.7' }}>
                                            {item.text}
                                        </p>
                                    </div>
                                </motion.div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
};
