import React from 'react';
import { Link } from 'react-router-dom';
import { useLegacyScripts } from '../hooks/UseLegacyScripts';
import { MapPin, Mail, Phone, Heart, Plus, Minus, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../lib/language-context';

export const ContactPage = () => {
    useLegacyScripts();
    const { t } = useLanguage();
    const [zoom, setZoom] = React.useState(15);

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 1, 21));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 1, 1));

    return (
        <>
            {/* Full Height Hero Section (Restored to 500px) */}
            <div className="hero-wrap" style={{ backgroundImage: "url('/images/bg_2.jpg')", height: '500px', minHeight: '500px', backgroundPosition: 'center', backgroundSize: 'cover' }} data-stellar-background-ratio="0.5">
                <div className="overlay"></div>
                <div className="container">
                    <div className="row no-gutters slider-text align-items-center justify-content-center" style={{ height: '500px', paddingTop: '100px' }}>
                        <div className="col-md-7 ftco-animate text-center">
                            <h1 className="mb-0 bread" style={{ fontWeight: '800', fontSize: '48px', color: '#fff', textShadow: '0 2px 15px rgba(0,0,0,0.4)' }}>{t('contact.title')}</h1>
                            <p className="breadcrumbs" style={{ fontSize: '18px', fontWeight: '500', marginTop: '10px' }}>
                                <span className="mr-2"><Link to="/" style={{ color: '#fff' }}>{t('contact.breadcrumb_home')}</Link></span>
                                <span style={{ color: '#4FB1A1' }}>{t('contact.breadcrumb_contact')}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Map Section */}
            <div className="map-container" style={{ width: '100%', height: '400px', position: 'relative', backgroundColor: '#eee', borderBottom: '4px solid #076c5b' }}>
                <iframe
                    title="LCEO Location Map"
                    src={`https://maps.google.com/maps?q=-2.1467,30.1281&hl=en&z=${zoom}&output=embed`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                ></iframe>

                <div style={{ position: 'absolute', bottom: '20px', left: '20px', display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 10 }}>
                    <button onClick={handleZoomIn} className="btn shadow-lg" style={{ width: '40px', height: '40px', backgroundColor: '#fff', color: '#076c5b', padding: 0, borderRadius: '4px', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Plus size={20} strokeWidth={2.5} />
                    </button>
                    <button onClick={handleZoomOut} className="btn shadow-lg" style={{ width: '40px', height: '40px', backgroundColor: '#fff', color: '#076c5b', padding: 0, borderRadius: '4px', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Minus size={20} strokeWidth={2.5} />
                    </button>
                </div>
            </div>

            {/* Premium Contact Section */}
            <section className="ftco-section" style={{
                padding: '10px 0', // Further reduced padding to minimize white space
                backgroundColor: '#fff',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Animated Background Image Layer */}
                <motion.div
                    animate={{
                        y: [0, -30, 0],
                        rotate: [0, 2, 0],
                        scale: [1, 1.05, 1]
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        bottom: 0,
                        left: 0,
                        backgroundImage: "url('/images/support.png')",
                        backgroundSize: '80% auto',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        zIndex: 1,
                        opacity: 0.35 // Increased visibility
                    }}
                />

                {/* Clean Semi-Transparent Overlay for Text Legibility */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(255, 255, 255, 0.65)', // More transparent
                    zIndex: 2
                }}></div>

                <div className="container" style={{ position: 'relative', zIndex: 2 }}>
                    <div className="row justify-content-center">
                        <div className="col-lg-12">
                            <div className="row">
                                {/* Left Column: Contact Form Card */}
                                <div className="col-md-7 mb-4 mb-md-0 ftco-animate">
                                    <div className="p-4 p-md-5" style={{
                                        borderRadius: '24px',
                                        border: '1px solid rgba(255, 255, 255, 0.4)',
                                        backgroundColor: 'rgba(255, 255, 255, 0.35)', // Transparent background
                                        backdropFilter: 'blur(10px)', // Glassmorphism
                                        WebkitBackdropFilter: 'blur(10px)',
                                        minHeight: '600px',
                                        marginTop: '40px' // Moved down a little
                                    }}>
                                        <h2 style={{ fontSize: '36px', fontWeight: '900', color: '#122f2b', marginBottom: '10px', letterSpacing: '-1px' }}>{t('contact.get_in_touch')}</h2>
                                        <p style={{ color: '#666', fontSize: '17px', marginBottom: '40px', maxWidth: '450px' }}>
                                            {t('contact.get_in_touch_desc')}
                                        </p>

                                        <form action="#" className="contact-form-premium">
                                            <div className="row">
                                                <div className="col-md-6 mb-4">
                                                    <label style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', color: '#122f2b', display: 'block', marginBottom: '8px', letterSpacing: '0.5px' }}>{t('contact.first_name')}</label>
                                                    <input type="text" className="form-control" style={{ height: '55px', backgroundColor: 'rgba(255, 255, 255, 0.6)', border: '1px solid #eef2f2', borderRadius: '12px', fontSize: '15px', fontWeight: '500' }} placeholder={t('contact.first_name')} />
                                                </div>
                                                <div className="col-md-6 mb-4">
                                                    <label style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', color: '#122f2b', display: 'block', marginBottom: '8px', letterSpacing: '0.5px' }}>{t('contact.last_name')}</label>
                                                    <input type="text" className="form-control" style={{ height: '55px', backgroundColor: 'rgba(255, 255, 255, 0.6)', border: '1px solid #eef2f2', borderRadius: '12px', fontSize: '15px', fontWeight: '500' }} placeholder={t('contact.last_name')} />
                                                </div>
                                                <div className="col-md-12 mb-4">
                                                    <label style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', color: '#122f2b', display: 'block', marginBottom: '8px', letterSpacing: '0.5px' }}>{t('contact.email')}</label>
                                                    <input type="email" className="form-control" style={{ height: '55px', backgroundColor: 'rgba(255, 255, 255, 0.6)', border: '1px solid #eef2f2', borderRadius: '12px', fontSize: '15px', fontWeight: '500' }} placeholder="name@company.com" />
                                                </div>
                                                <div className="col-md-12 mb-4">
                                                    <label style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', color: '#122f2b', display: 'block', marginBottom: '8px', letterSpacing: '0.5px' }}>{t('contact.help_label')}</label>
                                                    <textarea name="" id="" cols={30} rows={5} className="form-control" style={{ backgroundColor: 'rgba(255, 255, 255, 0.6)', border: '1px solid #eef2f2', borderRadius: '12px', fontSize: '15px', fontWeight: '500', paddingTop: '15px' }} placeholder={t('contact.help_placeholder')}></textarea>
                                                </div>
                                                <div className="col-md-12 mt-2">
                                                    <button type="submit" className="btn px-5 py-3 shadow-lg pulse-hover" style={{ backgroundColor: '#076c5b', color: '#fff', fontWeight: '800', fontSize: '15px', borderRadius: '12px', border: 'none', transition: 'all 0.3s ease' }}>
                                                        {t('contact.send_message')}
                                                    </button>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                </div>

                                {/* Right Column: Details & Connect */}
                                <div className="col-md-5 pl-lg-5 ftco-animate">
                                    <div className="p-4 p-md-5 rounded-3xl" style={{ backgroundColor: 'transparent' }}>
                                        <div className="mb-5">
                                            <span className="badge px-3 py-2 mb-3 font-weight-bold" style={{ color: '#076c5b', backgroundColor: '#e2f5f2', borderRadius: '50px', fontSize: '12px', textTransform: 'uppercase' }}>{t('contact.badge')}</span>
                                            <h3 style={{ fontSize: '32px', fontWeight: '900', color: '#122f2b', marginBottom: '20px', letterSpacing: '-1px' }}>{t('contact.conversation_title')}</h3>
                                            <p style={{ color: '#666', fontSize: '16px', lineHeight: '1.7' }}>
                                                {t('contact.conversation_desc')}
                                            </p>
                                        </div>

                                        <div className="info-box d-flex align-items-center mb-4 p-3 bg-white rounded-2xl shadow-sm border border-slate-50">
                                            <div className="icon-wrap mr-4 d-flex align-items-center justify-content-center" style={{ width: '56px', height: '56px', backgroundColor: '#f0f9f8', color: '#4FB1A1', borderRadius: '16px' }}>
                                                <MapPin size={28} strokeWidth={1.5} />
                                            </div>
                                            <div>
                                                <p className="small mb-1 font-weight-bold text-muted text-uppercase">{t('contact.office_location')}</p>
                                                <p className="mb-0 font-weight-bold" style={{ color: '#122f2b' }}>{t('contact.office_address')}</p>
                                            </div>
                                        </div>

                                        <div className="info-box d-flex align-items-center mb-4 p-3 bg-white rounded-2xl shadow-sm border border-slate-50">
                                            <div className="icon-wrap mr-4 d-flex align-items-center justify-content-center" style={{ width: '56px', height: '56px', backgroundColor: '#f0f9f8', color: '#4FB1A1', borderRadius: '16px' }}>
                                                <Mail size={26} strokeWidth={1.5} />
                                            </div>
                                            <div>
                                                <p className="small mb-1 font-weight-bold text-muted text-uppercase">{t('contact.email_us')}</p>
                                                <a href="mailto:info.lceo@gmail.com" className="mb-0 font-weight-bold d-block" style={{ color: '#122f2b', textDecoration: 'none' }}>info.lceo@gmail.com</a>
                                            </div>
                                        </div>

                                        <div className="info-box d-flex align-items-center mb-5 p-3 bg-white rounded-2xl shadow-sm border border-slate-50">
                                            <div className="icon-wrap mr-4 d-flex align-items-center justify-content-center" style={{ width: '56px', height: '56px', backgroundColor: '#f0f9f8', color: '#4FB1A1', borderRadius: '16px' }}>
                                                <Phone size={28} strokeWidth={1.5} />
                                            </div>
                                            <div>
                                                <p className="small mb-1 font-weight-bold text-muted text-uppercase">{t('contact.call_support')}</p>
                                                <a href="tel:+250788123456" className="mb-0 font-weight-bold d-block" style={{ color: '#122f2b', textDecoration: 'none' }}>+250 788 123 456</a>
                                            </div>
                                        </div>

                                        {/* Premium CTA Card */}
                                        <div className="p-5 rounded-3xl text-white shadow-2xl overflow-hidden position-relative animate-in" style={{ backgroundColor: '#122f2b', borderRadius: '24px' }}>
                                            <div className="position-relative" style={{ zIndex: 2 }}>
                                                <h4 className="text-white mb-3" style={{ fontWeight: '900', fontSize: '24px', letterSpacing: '-0.5px' }}>{t('contact.cta_title')}</h4>
                                                <p className="text-white opacity-80 mb-4" style={{ fontSize: '15px' }}>{t('contact.cta_desc')}</p>
                                                <Link to="/donate" className="btn px-5 py-3 font-weight-bold d-inline-block" style={{ backgroundColor: '#eacfa2', color: '#122f2b', borderRadius: '12px', border: 'none', transition: 'all 0.3s ease' }}>
                                                    {t('contact.donate_now')}
                                                </Link>
                                            </div>
                                            <div className="position-absolute" style={{ color: '#fff', opacity: 0.05, bottom: '-20px', right: '-20px', zIndex: 1 }}>
                                                <Heart size={140} strokeWidth={1} fill="currentColor" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};
