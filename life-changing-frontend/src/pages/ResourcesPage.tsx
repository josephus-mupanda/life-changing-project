import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../lib/language-context';
import { useLegacyScripts } from '../hooks/UseLegacyScripts';
import { FileText, Download, PlayCircle, Image as ImageIcon, Calendar, Clock, MapPin, Video, FileCode, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const ResourcesPage = () => {
    const { t } = useLanguage();
    useLegacyScripts();

    const annualReports = [
        {
            title: "2024 Annual Impact Report",
            type: "PDF",
            size: "2.4 MB",
            date: "Feb 2025",
            isLatest: true
        },
        {
            title: "2023 Annual Report",
            type: "PDF",
            size: "2.1 MB",
            date: "Jan 2024",
            isLatest: false
        },
        {
            title: "2022 Year in Review",
            type: "PDF",
            size: "1.8 MB",
            date: "Jan 2023",
            isLatest: false
        }
    ];

    const programBriefs = [
        {
            title: "IkiraroBiz Entrepreneurship Model",
            type: "PDF",
            size: "1.2 MB",
            date: "Jan 2025"
        },
        {
            title: "Girls School Retention Strategy",
            type: "PDF",
            size: "980 KB",
            date: "Dec 2024"
        }
    ];

    const researchPublications = [
        {
            title: "Gender-Transformative Change in Rwanda",
            type: "PDF",
            size: "3.2 MB",
            date: "Dec 2024"
        },
        {
            title: "Economic Empowerment Impact Study",
            type: "PDF",
            size: "2.8 MB",
            date: "Sep 2024"
        }
    ];

    const multimedia = [
        {
            title: "LCEO Documentary 2024",
            type: "Video",
            date: "Jan 2025",
            action: "View"
        },
        {
            title: "Beneficiary Success Stories",
            type: "Video",
            date: "Dec 2024",
            action: "View"
        }
    ];

    const photoGallery = [
        {
            title: "2024 Program Activities",
            type: "Album",
            date: "Dec 2024",
            action: "View"
        },
        {
            title: "Community Events 2024",
            type: "Album",
            date: "Nov 2024",
            action: "View"
        }
    ];

    const upcomingEvents = [
        {
            type: "In-Person",
            title: t('events.report_launch_title'),
            date: "March 15, 2025",
            time: "10:00 AM - 2:00 PM",
            location: "Bugesera District Office"
        },
        {
            type: "Public Event",
            title: t('events.graduation_title'),
            date: "April 22, 2025",
            time: "9:00 AM - 12:00 PM",
            location: "Nyamata Community Center"
        },
        {
            type: "Program Activity",
            title: t('events.workshop_title'),
            date: "May 8, 2025",
            time: "2:00 PM - 5:00 PM",
            location: "Safe Space Centers"
        }
    ];

    const renderResourceCard = (item: any) => (
        <div className="flex items-center bg-white p-6 rounded-2xl border border-slate-100 transition-all duration-300 hover:border-teal-500/30 group shadow-sm hover:shadow-md h-full mb-4">
            <div className="mr-4 flex items-center justify-center" style={{ width: '56px', height: '56px', flexShrink: 0 }}>
                {item.type === 'PDF' && <FileText size={42} strokeWidth={1} className="text-teal-600" />}
                {item.type === 'Video' && <Video size={42} strokeWidth={1} className="text-teal-600" />}
                {item.type === 'PPT' && <FileCode size={42} strokeWidth={1} className="text-teal-600" />}
                {item.type === 'Album' && <ImageIcon size={42} strokeWidth={1} className="text-teal-600" />}
            </div>
            <div className="flex-grow">
                <div className="flex items-center mb-1">
                    <h5 className="font-bold mb-0 text-slate-800 group-hover:text-teal-600 transition-colors" style={{ fontSize: '1rem' }}>{item.title}</h5>
                    {item.isLatest && (
                        <span className="badge ml-2 px-2 py-0.5 text-white rounded-full bg-emerald-500 font-bold" style={{ fontSize: '9px' }}>{t('resources.latest_badge')}</span>
                    )}
                </div>
                <div className="flex items-center text-slate-500 text-xs mt-1 space-x-2">
                    <span className="font-bold text-teal-600/70">{item.type}</span>
                    {item.size && (
                        <>
                            <span className="opacity-30">•</span>
                            <span>{item.size}</span>
                        </>
                    )}
                    <span className="opacity-30">•</span>
                    <span>{item.date}</span>
                </div>
            </div>
            <button className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 text-slate-600 group-hover:bg-teal-600 group-hover:text-white transition-all">
                {item.action === 'View' ? <PlayCircle size={16} /> : <Download size={16} />}
            </button>
        </div>
    );

    return (
        <div className="bg-slate-50 min-h-screen">
            <style>{`
                .impact-card {
                    position: relative;
                    border-radius: 20px;
                    overflow: hidden;
                    height: 380px;
                    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 10px 30px -10px rgba(0,0,0,0.1);
                    margin-bottom: 30px !important;
                }
                .impact-card:hover {
                    box-shadow: 0 20px 40px -10px rgba(0,0,0,0.2);
                    transform: translateY(-5px);
                }
                .impact-card img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.7s ease;
                }
                .impact-card:hover img {
                    transform: scale(1.1);
                }
                .impact-card-overlay {
                    position: absolute;
                    inset: 0;
                    background: rgba(18, 47, 43, 0.8);
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-end;
                    padding: 30px;
                    opacity: 0;
                    transition: all 0.4s ease;
                }
                .impact-card:hover .impact-card-overlay {
                    opacity: 1;
                }
                .impact-card-title {
                    font-size: 20px;
                    font-weight: 800;
                    color: white;
                    margin-bottom: 12px;
                    line-height: 1.2;
                }
                .impact-card-desc {
                    font-size: 14px;
                    color: rgba(255,255,255,0.8);
                    line-height: 1.6;
                }

                .event-perspective {
                    perspective: 1500px;
                    height: 480px;
                    margin-bottom: 30px;
                }
                .event-flip-inner {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    transition: transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
                    transform-style: preserve-3d;
                }
                .event-perspective:hover .event-flip-inner {
                    transform: rotateY(180deg);
                }
                .event-flip-front, .event-flip-back {
                    position: absolute;
                    inset: 0;
                    backface-visibility: hidden;
                    border-radius: 20px;
                    overflow: hidden;
                }
                .event-flip-back {
                    background: #122f2b;
                    color: white;
                    transform: rotateY(180deg);
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-start;
                    padding: 40px;
                }
                
                .resource-section-wrapper {
                    padding: 60px 0;
                }
                
                .resource-col-spacing {
                    padding: 15px !important;
                }
            `}</style>

            {/* Full Height Hero Section (Contact Page Style) */}
            <div className="hero-wrap" style={{ backgroundImage: "url('/images/bg_1.jpg')", height: '500px', minHeight: '500px', backgroundPosition: 'center', backgroundSize: 'cover' }} data-stellar-background-ratio="0.5">
                <div className="overlay"></div>
                <div className="container">
                    <div className="row no-gutters slider-text align-items-center justify-content-center" style={{ height: '500px', paddingTop: '100px' }}>
                        <div className="col-md-7 ftco-animate text-center">
                            <h1 className="mb-0 bread" style={{ fontWeight: '800', fontSize: '48px', color: '#fff', textShadow: '0 2px 15px rgba(0,0,0,0.4)' }}>{t('resources.title')}</h1>
                            <p className="breadcrumbs" style={{ fontSize: '18px', fontWeight: '500', marginTop: '10px' }}>
                                <span className="mr-2"><Link to="/" style={{ color: '#fff' }}>{t('resources.breadcrumb_home')}</Link></span>
                                <span style={{ color: '#4FB1A1' }}>{t('resources.breadcrumb_resources')}</span>
                            </p>
                            <p className="mt-4 text-white" style={{ fontSize: '1.1rem', opacity: 0.9, maxWidth: '600px', margin: '20px auto 0' }}>{t('resources.subtitle')}</p>
                        </div>
                    </div>
                </div>
            </div>

            <section className="bg-gray-50" style={{ padding: '80px 0' }}>
                <div className="container">
                    {/* Annual Reports Section */}
                    <div className="row mb-5">
                        <div className="col-md-12">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="text-emerald-600 font-black text-xs uppercase tracking-[0.2em]">{t('resources.accountability_badge')}</span>
                                <div className="h-px flex-1 bg-gray-200"></div>
                            </div>
                            <h2 className="text-3xl font-black text-gray-900 mb-5">{t('resources.reports_title')}</h2>
                        </div>
                        <div className="row">
                            {annualReports.map((report, idx) => (
                                <div key={idx} className="col-md-4 mb-4 resource-col-spacing">
                                    <motion.div whileHover={{ y: -5 }}>
                                        {renderResourceCard(report)}
                                    </motion.div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Program Briefs & Research */}
                    <div className="row mb-5">
                        <div className="col-md-6 mb-5">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="text-emerald-600 font-black text-xs uppercase tracking-[0.2em]">{t('resources.strategy_badge')}</span>
                                <div className="h-px flex-1 bg-gray-200"></div>
                            </div>
                            <h2 className="text-3xl font-black text-gray-900 mb-5">{t('resources.briefs_title')}</h2>
                            <div className="row">
                                {programBriefs.map((brief, idx) => (
                                    <div key={idx} className="col-md-12 resource-col-spacing">
                                        <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                                            {renderResourceCard(brief)}
                                        </motion.div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="col-md-6 mb-5">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="text-emerald-600 font-black text-xs uppercase tracking-[0.2em]">{t('resources.knowledge_badge')}</span>
                                <div className="h-px flex-1 bg-gray-200"></div>
                            </div>
                            <h2 className="text-3xl font-black text-gray-900 mb-5">{t('resources.research_title')}</h2>
                            <div className="row">
                                {researchPublications.map((pub, idx) => (
                                    <div key={idx} className="col-md-12 resource-col-spacing">
                                        <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                                            {renderResourceCard(pub)}
                                        </motion.div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Multimedia & Photos */}
                    <div className="row mb-5">
                        <div className="col-md-6 mb-5">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="text-emerald-600 font-black text-xs uppercase tracking-[0.2em]">{t('resources.video_badge')}</span>
                                <div className="h-px flex-1 bg-gray-200"></div>
                            </div>
                            <h2 className="text-3xl font-black text-gray-900 mb-5 text-left">{t('resources.multimedia_title')}</h2>
                            <div className="row">
                                {multimedia.map((item, idx) => (
                                    <div key={idx} className="col-md-12 resource-col-spacing">
                                        <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                                            {renderResourceCard(item)}
                                        </motion.div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="col-md-6 mb-5">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="text-emerald-600 font-black text-xs uppercase tracking-[0.2em]">{t('resources.gallery_badge')}</span>
                                <div className="h-px flex-1 bg-gray-200"></div>
                            </div>
                            <h2 className="text-3xl font-black text-gray-900 mb-5 text-left">{t('resources.gallery_title')}</h2>
                            <div className="row">
                                {photoGallery.map((item, idx) => (
                                    <div key={idx} className="col-md-12 resource-col-spacing">
                                        <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                                            {renderResourceCard(item)}
                                        </motion.div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Impact Grid */}
                    <div className="row mb-5">
                        <div className="col-md-12 text-center mb-5">
                            <h2 className="text-4xl font-black text-gray-900 mb-4">{t('resources.action_title')}</h2>
                            <p className="text-lg text-gray-600 max-w-2xl mx-auto">{t('resources.action_desc')}</p>
                        </div>
                        <div className="row">
                            {[
                                { img: '/images/p7.jpg', title: 'School Materials Distribution', desc: 'Distribution of essential learning supplies to partner schools.' },
                                { img: '/images/p4.jpg', title: 'Vocational Training Session', desc: 'Practical skills workshops empowering youth with livelihood opportunities.' },
                                { img: '/images/p5.jpg', title: "Keza's Journey (Video)", desc: 'Watch the inspiring story of community support and resilience.' }
                            ].map((card, idx) => (
                                <div key={idx} className="col-md-4 mb-4 resource-col-spacing">
                                    <div className="impact-card group cursor-pointer">
                                        <img src={card.img} alt={card.title} />
                                        <div className="impact-card-overlay">
                                            <h3 className="impact-card-title">{card.title}</h3>
                                            <p className="impact-card-desc">{card.desc}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Events Section */}
            <section className="py-24 bg-white relative overflow-hidden">
                <div className="container relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <span className="text-emerald-600 font-black text-xs uppercase tracking-[0.3em] mb-4 block">{t('resources.events_badge')}</span>
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">{t('resources.events_title')}</h2>
                        <p className="text-lg text-gray-600">{t('resources.events_desc')}</p>
                    </div>

                    <div className="row">
                        {[
                            { title: t('resources.who_we_are'), img: '/images/pic14.jpg', event: upcomingEvents[0], color: 'emerald' },
                            { title: t('resources.what_we_do'), img: '/images/pic2.jpg', event: upcomingEvents[1], color: 'blue' },
                            { title: t('resources.why_we_do_it'), img: '/images/pic19.jpg', event: upcomingEvents[2], color: 'rose' }
                        ].map((item, idx) => (
                            <div key={idx} className="col-md-4 mb-5 resource-col-spacing">
                                <h3 className="text-2xl font-black text-gray-900 text-center uppercase tracking-wider mb-4">{item.title}</h3>
                                <div className="event-perspective group">
                                    <div className="event-flip-inner">
                                        <div className="event-flip-front">
                                            <img src={item.img} alt={item.title} />
                                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors"></div>
                                        </div>
                                        <div className="event-flip-back shadow-2xl">
                                            <div className="mb-auto">
                                                <span className="inline-block px-3 py-1 mb-6 text-[10px] font-black tracking-widest text-emerald-400 bg-emerald-400/10 rounded-full border border-emerald-400/20 uppercase">
                                                    {item.event.type}
                                                </span>
                                                <h4 className="text-2xl font-black mb-6 leading-tight">{item.event.title}</h4>
                                                <div className="space-y-4 text-white/70">
                                                    <div className="flex items-center gap-3">
                                                        <Calendar size={18} className="text-emerald-500" />
                                                        <span className="font-bold text-white">{item.event.date}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <Clock size={18} className="text-emerald-500" />
                                                        <span>{item.event.time}</span>
                                                    </div>
                                                    <div className="flex items-start gap-3">
                                                        <MapPin size={18} className="text-emerald-500 mt-1" />
                                                        <span className="text-sm">{item.event.location}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button className="w-full py-4 bg-emerald-500 text-white font-black rounded-xl hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 group/btn">
                                                {item.color === 'blue' ? t('resources.learn_more_btn') : t('resources.register_btn')}
                                                <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};
