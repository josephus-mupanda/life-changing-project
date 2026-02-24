import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../lib/language-context';
import { useLegacyScripts } from '../hooks/UseLegacyScripts';
import { Zap, Shield, Lightbulb, HeartHandshake, Users, Award, Linkedin } from 'lucide-react';
import { motion } from 'framer-motion';

export const AboutPage = () => {
    useLegacyScripts();
    const { t } = useLanguage();

    const coreValues = [
        { title: t('about.value_empowerment_title'), desc: t('about.value_empowerment_desc'), icon: <Zap size={32} strokeWidth={1.5} /> },
        { title: t('about.value_protection_title'), desc: t('about.value_protection_desc'), icon: <Shield size={32} strokeWidth={1.5} /> },
        { title: t('about.value_innovation_title'), desc: t('about.value_innovation_desc'), icon: <Lightbulb size={32} strokeWidth={1.5} /> },
        { title: t('about.value_compassion_title'), desc: t('about.value_compassion_desc'), icon: <HeartHandshake size={32} strokeWidth={1.5} /> },
        { title: t('about.value_community_title'), desc: t('about.value_community_desc'), icon: <Users size={32} strokeWidth={1.5} /> },
        { title: t('about.value_excellence_title'), desc: t('about.value_excellence_desc'), icon: <Award size={32} strokeWidth={1.5} /> }
    ];

    const teamMembers = [
        {
            name: 'Sarah Mugabo',
            role: t('about.team_role_sarah'),
            bio: t('about.team_bio_sarah'),
            image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&h=800&auto=format&fit=crop'
        },
        {
            name: 'Jean Paul Uwimana',
            role: t('about.team_role_jean'),
            bio: t('about.team_bio_jean'),
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&h=800&auto=format&fit=crop'
        },
        {
            name: 'Grace Mutesi',
            role: t('about.team_role_grace'),
            bio: t('about.team_bio_grace'),
            image: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?q=80&w=600&h=800&auto=format&fit=crop'
        },
        {
            name: 'Emmanuel Nkusi',
            role: t('about.team_role_emmanuel'),
            bio: t('about.team_bio_emmanuel'),
            image: 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?q=80&w=600&h=800&auto=format&fit=crop'
        }
    ];

    const milestones = [
        { year: '2020', title: t('about.milestone_2020_title'), desc: t('about.milestone_2020_desc') },
        { year: '2021', title: t('about.milestone_2021_title'), desc: t('about.milestone_2021_desc') },
        { year: '2022', title: t('about.milestone_2022_title'), desc: t('about.milestone_2022_desc') },
        { year: '2023', title: t('about.milestone_2023_title'), desc: t('about.milestone_2023_desc') },
        { year: '2024', title: t('about.milestone_2024_title'), desc: t('about.milestone_2024_desc') }
    ];

    return (
        <>
            <style>{`
                section, .ftco-section, .card, .staff-card, .btn, .staff-card:hover {
                    box-shadow: none !important;
                    border: none !important;
                }
                .border-bottom { border-bottom: none !important; }
                
                .staff-card:hover .team-photo { transform: scale(1.1); }
                .staff-card:hover .info-panel { transform: translateY(-30px); height: 130px; }
                .staff-card:hover .bio-text { max-height: 60px; opacity: 1; margin-top: 8px; }
                .staff-card:hover .linkedin-pop { transform: scale(1.2) rotate(360deg); background-color: #4FB1A1; }
                .staff-card:hover .linkedin-pop span { color: #fff; }
            `}</style>

            <div className="hero-wrap" style={{ backgroundImage: "url('/images/about.jpg')", height: '350px', minHeight: '350px' }}>
                <div className="overlay"></div>
                <div className="container">
                    <div className="row no-gutters slider-text align-items-center justify-content-center" style={{ height: '350px', paddingTop: '60px' }}>
                        <div className="col-md-7 text-center">
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                                className="breadcrumbs">
                                <span className="mr-2"><Link to="/">{t('about.breadcrumb_home')}</Link></span>
                                <span>{t('about.breadcrumb_about')}</span>
                            </motion.p>
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="mb-2 bread">
                                {t('about.title')}
                            </motion.h1>
                        </div>
                    </div>
                </div>
            </div>

            <section className="ftco-section" style={{
                padding: '40px 0 30px 0',
                backgroundColor: '#fff',
                backgroundImage: 'radial-gradient(#e5e7eb 1.5px, transparent 1.5px)',
                backgroundSize: '24px 24px'
            }}>
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-lg-6 mb-5 mb-lg-0">
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8 }}
                                className="position-relative"
                                style={{
                                    backgroundImage: "url('/images/pic15.jpg')",
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    borderRadius: '24px',
                                    minHeight: '500px',
                                    overflow: 'hidden'
                                }}>
                                <div style={{
                                    position: 'absolute',
                                    bottom: '20px',
                                    left: '20px',
                                    right: '20px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    padding: '25px',
                                    borderRadius: '16px',
                                    textAlign: 'center'
                                }}>
                                    <h4 className="font-weight-bold mb-0" style={{ fontSize: '18px', color: '#111', lineHeight: '1.4' }}>
                                        {t('about.team_caption_title')} <br />
                                        <span style={{ color: '#076c5b' }}>{t('about.team_caption_subtitle')}</span>
                                    </h4>
                                </div>
                            </motion.div>
                        </div>

                        <div className="col-lg-6 pl-lg-5">
                            <motion.span
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5 }}
                                className="badge badge-light px-3 py-2 mb-3 font-weight-bold"
                                style={{ color: '#076c5b', backgroundColor: '#e2f5f2', borderRadius: '50px', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                                {t('about.badge')}
                            </motion.span>
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                                className="mb-4 font-weight-bold"
                                style={{ fontSize: '42px', lineHeight: '1.2', color: '#111' }}>
                                {t('about.title_impact_prefix')}<span style={{ color: '#076c5b' }}>{t('about.title_impact_highlight')}</span>
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="lead mb-4"
                                style={{ fontSize: '16px', color: '#666', lineHeight: '1.8' }}>
                                {t('about.description')}
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                            >
                                <ul className="nav nav-pills mb-3" id="pills-tab" role="tablist" style={{ gap: '20px' }}>
                                    <li className="nav-item">
                                        <a className="nav-link active font-weight-bold px-0 py-2" id="pills-vision-tab" data-toggle="pill" href="#pills-vision" role="tab" aria-controls="pills-vision" aria-selected="true"
                                            style={{ color: '#111', backgroundColor: 'transparent', borderBottom: 'none', borderRadius: 0, textTransform: 'uppercase', fontSize: '14px', letterSpacing: '1px' }}>
                                            {t('about.vision_tab')}
                                        </a>
                                    </li>
                                    <li className="nav-item">
                                        <a className="nav-link font-weight-bold px-0 py-2" id="pills-mission-tab" data-toggle="pill" href="#pills-mission" role="tab" aria-controls="pills-mission" aria-selected="false"
                                            style={{ color: '#888', backgroundColor: 'transparent', borderRadius: 0, textTransform: 'uppercase', fontSize: '14px', letterSpacing: '1px' }}>
                                            {t('about.mission_tab')}
                                        </a>
                                    </li>
                                </ul>
                                <div className="tab-content pt-2" id="pills-tabContent">
                                    <div className="tab-pane fade show active" id="pills-vision" role="tabpanel" aria-labelledby="pills-vision-tab">
                                        <p style={{ color: '#666', fontSize: '15px', lineHeight: '1.7' }}>
                                            {t('about.vision_desc')}
                                        </p>
                                    </div>
                                    <div className="tab-pane fade" id="pills-mission" role="tabpanel" aria-labelledby="pills-mission-tab">
                                        <p style={{ color: '#666', fontSize: '15px', lineHeight: '1.7' }}>
                                            {t('about.mission_desc')}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="ftco-section" id="values" style={{ padding: '40px 0 0 0', backgroundColor: '#fff' }}>
                <div className="container">
                    <div className="row justify-content-center mb-5">
                        <div className="col-md-8 text-center">
                            <motion.span
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5 }}
                                className="badge badge-light px-3 py-2 mb-3 font-weight-bold"
                                style={{ color: '#076c5b', backgroundColor: '#e2f5f2', borderRadius: '50px', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                                {t('about.foundation_badge')}
                            </motion.span>
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                                className="mb-4 font-weight-bold"
                                style={{ fontSize: '42px', color: '#111' }}>
                                {t('about.values_title')}
                            </motion.h2>
                        </div>
                    </div>
                </div>

                <div className="container-fluid px-0 transition-all">
                    <div style={{
                        background: 'linear-gradient(135deg, #076c5b 0%, #122f2b 100%)',
                        padding: '50px 0',
                        position: 'relative',
                        overflow: 'hidden',
                        width: '100vw',
                        marginLeft: 'calc(-50vw + 50%)'
                    }}>
                        <div className="container position-relative" style={{ zIndex: 1 }}>
                            <div className="row justify-content-center text-center mb-5">
                                <div className="col-md-10">
                                    <motion.h3
                                        initial={{ opacity: 0, y: 30 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.8, ease: "easeOut" }}
                                        className="text-white font-weight-bold mb-3" style={{ fontSize: '36px', letterSpacing: '-1px' }}
                                    >
                                        {t('about.values_heading_prefix')}<span style={{ color: '#4FB1A1' }}>{t('about.values_heading_highlight')}</span>
                                    </motion.h3>
                                    <motion.p
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                                        className="text-white opacity-75 mx-auto" style={{ maxWidth: '700px', fontSize: '18px', lineHeight: '1.6' }}
                                    >
                                        {t('about.values_desc')}
                                    </motion.p>
                                </div>
                            </div>

                            <motion.div
                                initial="hidden"
                                whileInView="show"
                                viewport={{ once: true, margin: "-50px" }}
                                variants={{
                                    hidden: { opacity: 0 },
                                    show: {
                                        opacity: 1,
                                        transition: {
                                            staggerChildren: 0.1
                                        }
                                    }
                                }}
                                className="row justify-content-center"
                            >
                                {coreValues.map((value, idx) => (
                                    <motion.div
                                        key={idx}
                                        variants={{
                                            hidden: { opacity: 0, y: 30 },
                                            show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
                                        }}
                                        className="col-md-4 mb-5"
                                    >
                                        <div style={{
                                            backgroundColor: '#fff',
                                            borderRadius: '12px',
                                            overflow: 'hidden',
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            border: '1px solid rgba(255,255,255,0.1)'
                                        }}>
                                            <div style={{
                                                backgroundColor: '#122f2b',
                                                padding: '35px 30px',
                                                minHeight: '160px',
                                                position: 'relative'
                                            }}>
                                                <div className="mb-3" style={{ color: '#4FB1A1' }}>
                                                    {value.icon}
                                                </div>
                                                <h4 className="text-white font-weight-bold mb-0" style={{ fontSize: '22px', lineHeight: '1.3' }}>
                                                    {value.title} <br />
                                                    <span style={{ fontWeight: '400', fontSize: '15px', color: 'rgba(255,255,255,0.6)' }}>{t('about.value_card_badge')}</span>
                                                </h4>

                                                <div style={{
                                                    position: 'absolute',
                                                    bottom: '15px',
                                                    right: '20px',
                                                    fontSize: '11px',
                                                    color: 'rgba(255,255,255,0.4)',
                                                    fontWeight: '700',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '1px'
                                                }}>
                                                    {t('about.value_card_footer')}
                                                </div>
                                            </div>

                                            <div className="p-4 d-flex flex-column justify-content-between flex-grow-1" style={{ backgroundColor: '#fff' }}>
                                                <p style={{ color: '#4a5568', fontSize: '15px', lineHeight: '1.7', marginBottom: '25px' }}>
                                                    {value.desc}
                                                </p>
                                                <Link to="/contact" className="font-weight-bold" style={{
                                                    color: '#076c5b',
                                                    fontSize: '12px',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '1.5px',
                                                    display: 'flex',
                                                    alignItems: 'center'
                                                }}>
                                                    {t('about.read_more_btn')} <span className="ml-2" style={{ fontSize: '16px' }}>»</span>
                                                </Link>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
                                className="text-center mt-3"
                            >
                                <Link to="/contact" className="btn px-5 py-3 font-weight-bold" style={{
                                    borderRadius: '50px',
                                    backgroundColor: '#4FB1A1',
                                    color: '#fff',
                                    transition: 'all 0.3s ease'
                                }}>
                                    {t('about.journey_btn')}
                                </Link>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="ftco-section" id="team" style={{ padding: '20px 0 20px 0', backgroundColor: '#fcfdfd' }}>
                <div className="container">
                    <div className="row justify-content-center mb-4">
                        <div className="col-md-8 heading-section text-center">
                            <motion.span
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5 }}
                                className="badge badge-light px-3 py-2 mb-2 font-weight-bold"
                                style={{ color: '#076c5b', backgroundColor: '#e2f5f2', borderRadius: '50px', fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                                {t('about.team_badge')}
                            </motion.span>
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                                className="mb-2 font-weight-bold"
                                style={{ fontSize: '32px', color: '#111' }}>
                                {t('about.team_title')}
                            </motion.h2>
                        </div>
                    </div>
                    <div className="row">
                        {teamMembers.map((member, idx) => (
                            <div className="col-md-3 mb-4" key={idx}>
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: idx * 0.1 }}
                                    className="staff-card overflow-hidden transition-all duration-500"
                                    style={{
                                        borderRadius: '16px',
                                        backgroundColor: '#fff',
                                        height: '380px',
                                        position: 'relative',
                                        cursor: 'pointer',
                                        overflow: 'hidden'
                                    }}>
                                    <div className="team-img-wrapper" style={{
                                        height: '280px',
                                        overflow: 'hidden',
                                        position: 'relative'
                                    }}>
                                        <div style={{
                                            height: '100%',
                                            width: '100%',
                                            backgroundImage: `url(${member.image})`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                            transition: 'transform 0.8s ease'
                                        }} className="team-photo"></div>

                                        <div style={{
                                            position: 'absolute',
                                            bottom: '10px',
                                            right: '15px',
                                            width: '32px',
                                            height: '32px',
                                            backgroundColor: '#fff',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            zIndex: 10,
                                            transition: 'transform 0.3s ease'
                                        }} className="linkedin-pop">
                                            <Linkedin size={18} strokeWidth={2} style={{ color: '#076c5b' }} />
                                        </div>
                                    </div>

                                    <div className="info-panel p-3 text-center" style={{
                                        backgroundColor: '#076c5b',
                                        color: '#fff',
                                        height: '100px',
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center'
                                    }}>
                                        <h3 className="mb-0" style={{ fontSize: '17px', fontWeight: 'bold', color: '#fff' }}>{member.name}</h3>
                                        <span className="d-block mb-2" style={{ fontSize: '12px', opacity: 0.8, letterSpacing: '0.5px' }}>{member.role}</span>

                                        <p className="small mb-0 bio-text" style={{
                                            lineHeight: '1.4',
                                            fontSize: '11px',
                                            maxHeight: '0',
                                            opacity: 0,
                                            overflow: 'hidden',
                                            transition: 'all 0.3s ease'
                                        }}>{member.bio}</p>
                                    </div>
                                </motion.div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="ftco-section bg-white" style={{ padding: '40px 0 100px 0' }}>
                <div className="container">
                    <div className="row justify-content-center mb-5 pb-4">
                        <div className="col-md-7 heading-section text-center">
                            <motion.span
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5 }}
                                className="badge badge-light px-3 py-2 mb-3 font-weight-bold"
                                style={{ color: '#076c5b', backgroundColor: '#e2f5f2', borderRadius: '50px', fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                                {t('about.progress_badge')}
                            </motion.span>
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                                className="mb-4 font-weight-bold"
                                style={{ fontSize: '42px', color: '#111', letterSpacing: '-1px' }}>
                                {t('about.progress_title')}
                            </motion.h2>
                        </div>
                    </div>

                    <div className="row align-items-center">
                        <div className="col-lg-6 mb-5 mb-lg-0">
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8 }}
                                className="ml-md-4 position-relative">
                                {/* Connecting Vertical Line */}
                                <div style={{
                                    position: 'absolute',
                                    left: '19px',
                                    top: '40px',
                                    bottom: '40px',
                                    width: '1px',
                                    backgroundColor: '#e2f5f2'
                                }}></div>

                                {milestones.map((step, idx) => (
                                    <div key={idx} className="d-flex mb-5 last:mb-0 position-relative" style={{ zIndex: 1 }}>
                                        <div className="d-flex align-items-center justify-content-center flex-shrink-0"
                                            style={{
                                                width: '40px',
                                                height: '40px',
                                                backgroundColor: '#e2f5f2',
                                                borderRadius: '50%',
                                                color: '#076c5b',
                                                fontWeight: 'bold',
                                                fontSize: '14px',
                                                border: 'none'
                                            }}>
                                            {idx + 1}
                                        </div>
                                        <div className="ml-4">
                                            <h5 className="font-weight-bold mb-1" style={{ fontSize: '18px', color: '#111' }}>{step.year}: {step.title}</h5>
                                            <p className="mb-0" style={{ color: '#666', fontSize: '15.5px', lineHeight: '1.6' }}>{step.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        </div>

                        <div className="col-lg-6">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8 }}
                                className="p-5 d-flex align-items-center justify-content-center"
                                style={{
                                    backgroundColor: '#f0f9f8',
                                    borderRadius: '32px',
                                    minHeight: '550px',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                <div style={{
                                    position: 'absolute',
                                    width: '300px',
                                    height: '300px',
                                    borderRadius: '50%',
                                    background: 'radial-gradient(circle, rgba(7, 108, 91, 0.05) 0%, rgba(7, 108, 91, 0) 70%)',
                                    top: '-50px',
                                    right: '-50px'
                                }}></div>

                                <div className="position-relative w-100 h-100 d-flex align-items-center justify-content-center">
                                    {/* Bottom/Back Card */}
                                    <div style={{
                                        width: '280px',
                                        height: '400px',
                                        backgroundImage: "url('/images/cause-2.jpg')",
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        borderRadius: '24px',
                                        transform: 'rotate(-10deg) translateX(40px)',
                                        border: 'none',
                                        zIndex: 1,
                                        position: 'absolute'
                                    }}>
                                        <div style={{ position: 'absolute', bottom: '20px', left: '20px', color: '#fff', zIndex: 2 }}>
                                            <h6 className="font-weight-bold mb-0">{t('about.image_impact_label')}</h6>
                                        </div>
                                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to top, rgba(7, 108, 91, 0.4), transparent)', borderRadius: '16px' }}></div>
                                    </div>

                                    {/* Top/Front Card */}
                                    <div style={{
                                        width: '280px',
                                        height: '400px',
                                        backgroundImage: "url('/images/cause-1.jpg')",
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        borderRadius: '24px',
                                        transform: 'rotate(5deg) translateY(-20px)',
                                        border: 'none',
                                        zIndex: 2,
                                        position: 'absolute'
                                    }}>
                                        <div style={{ position: 'absolute', bottom: '20px', left: '20px', color: '#fff', zIndex: 2 }}>
                                            <h6 className="font-weight-bold mb-0">{t('about.image_journey_label')}</h6>
                                        </div>
                                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to top, rgba(7, 108, 91, 0.4), transparent)', borderRadius: '16px' }}></div>
                                    </div>

                                    {/* Small Decorative Badge */}
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '60px',
                                        right: '20px',
                                        width: '100px',
                                        height: '100px',
                                        backgroundColor: '#076c5b',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#fff',
                                        zIndex: 3,
                                        border: 'none'
                                    }}>
                                        <div className="text-center">
                                            <span style={{ fontSize: '24px', fontWeight: 'bold' }}>5y+</span> <br />
                                            <span style={{ fontSize: '10px', textTransform: 'uppercase' }}>{t('about.legacy_label')}</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};
