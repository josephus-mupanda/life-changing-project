import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../lib/language-context';
import { useLegacyScripts } from '../hooks/UseLegacyScripts';
import { mockPrograms, mockStories } from '../lib/mock-data';
import { ProgramCategory } from '../lib/types';
import { Users, GraduationCap, Briefcase, Award, Wallet, Heart, TrendingUp, Globe, Handshake, X, ChevronLeft, ChevronRight } from 'lucide-react';

export const HomePage = () => {
    useLegacyScripts();
    const { language, t } = useLanguage();

    const [counters, setCounters] = useState({
        women: '5000',
        education: '1200',
        livelihoods: '450',
        leadership: '300'
    });

    // Typing effect state for Mission section
    const [typingText, setTypingText] = useState('');
    const typingPhrases = {
        en: ["And Improvements.", "Empowering Communities.", "Changing Lives.", "For a Better Future."],
        rw: ["N'Inzira y'Iterambere.", "Guhindura Ubuzima.", "Kubaka Imiryango.", "Heza hazaza."],
    };
    const [phraseIdx, setPhraseIdx] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState<number>(-1);

    const galleryImages = [
        '/images/testimonial1.jpg',
        '/images/pic5.jpg',
        '/images/pic11.jpg',
        '/images/pic14.jpg',
        '/images/pic13.jpg',
        '/images/pic9.jpg',
        '/images/pic15.jpg',
        '/images/pic19.jpg'
    ];

    const openLightbox = (e: React.MouseEvent, index: number) => {
        e.preventDefault();
        setSelectedImageIndex(index);
        setSelectedImage(galleryImages[index]);
        document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
        setSelectedImage(null);
        setSelectedImageIndex(-1);
        document.body.style.overflow = 'auto';
    };

    const nextImage = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        const nextIdx = (selectedImageIndex + 1) % galleryImages.length;
        setSelectedImageIndex(nextIdx);
        setSelectedImage(galleryImages[nextIdx]);
    };

    const prevImage = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        const prevIdx = (selectedImageIndex - 1 + galleryImages.length) % galleryImages.length;
        setSelectedImageIndex(prevIdx);
        setSelectedImage(galleryImages[prevIdx]);
    };

    React.useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        const phrases = typingPhrases[language as keyof typeof typingPhrases] || typingPhrases.en;
        const currentPhrase = phrases[phraseIdx];

        if (isDeleting) {
            timer = setTimeout(() => {
                setTypingText(currentPhrase.substring(0, typingText.length - 1));
                if (typingText.length <= 1) {
                    setIsDeleting(false);
                    setPhraseIdx((prev) => (prev + 1) % phrases.length);
                }
            }, 50);
        } else {
            timer = setTimeout(() => {
                setTypingText(currentPhrase.substring(0, typingText.length + 1));
                if (typingText.length === currentPhrase.length) {
                    // Wait for 5 seconds before starting to delete
                    setTimeout(() => setIsDeleting(true), 5000);
                }
            }, 100);
        }

        return () => clearTimeout(timer);
    }, [typingText, isDeleting, phraseIdx, language]);

    // Helper to calculate percentage
    const getPercentage = (allocated: number = 0, budget: number = 100) => {
        if (!budget) return 0;
        return Math.min(100, Math.round((allocated / budget) * 100));
    };

    const getCategoryColor = (category: ProgramCategory) => {
        const colors = {
            [ProgramCategory.EDUCATION]: 'text-blue-600 bg-blue-50',
            [ProgramCategory.ENTREPRENEURSHIP]: 'text-green-600 bg-green-50',
            [ProgramCategory.HEALTH]: 'text-pink-600 bg-pink-50',
            [ProgramCategory.CROSS_CUTTING]: 'text-purple-600 bg-purple-50',
        };
        return colors[category] || 'text-gray-600 bg-gray-50';
    };

    return (
        <>
            <div className="hero-wrap" style={{ backgroundImage: "url('/images/bg_2.jpg')", height: '600px', backgroundPosition: 'center center' }} data-stellar-background-ratio="0.5">
                <div className="overlay"></div>
                <div className="container">
                    <div className="row no-gutters slider-text align-items-center justify-content-center" style={{ height: '600px' }}>
                        <div className="col-md-9 ftco-animate text-center">
                            <h1 className="mb-4" style={{ fontSize: '56px', fontWeight: '900', lineHeight: '1.1' }}>{t('hero.title')}</h1>
                            <p style={{ fontSize: '20px', lineHeight: '1.6', marginBottom: '40px', fontWeight: '500', opacity: 0.9 }}>{t('hero.subtitle')}</p>
                            <p className="d-flex justify-content-center" style={{ gap: '20px' }}>
                                <Link to="/donate" className="btn btn-white px-5 py-3" style={{ borderRadius: '50px', fontWeight: '700', color: '#076c5b' }}>{t('btn.donate')}</Link>
                                <Link to="/about" className="btn btn-outline-white px-5 py-3" style={{ borderRadius: '50px', fontWeight: '700', borderWidth: '2px' }}>{t('btn.learn_more')}</Link>
                            </p>
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
                                    <h3 className="text-white font-weight-bold mb-0" style={{ fontSize: '24px' }}>{t('home.impact_heading')}</h3>
                                </div>
                                <div className="col-md-3 d-flex justify-content-center align-items-center mb-0 ftco-animate">
                                    <div className="d-flex align-items-center">
                                        <div className="mr-2" style={{ color: 'white', opacity: 0.9 }}>
                                            <Users size={32} strokeWidth={1.5} />
                                        </div>
                                        <div className="text-white">
                                            <div className="d-flex align-items-baseline">
                                                <strong className="number" data-number={counters.women} style={{ fontSize: '28px', fontWeight: '800' }}>0</strong>
                                                <span style={{ fontSize: '16px', marginLeft: '1px', fontWeight: '700' }}>+</span>
                                            </div>
                                            <span style={{ fontSize: '11px', textTransform: 'none', opacity: 0.85, display: 'block', lineHeight: '1.2' }}>
                                                {t('home.impact_women')}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-3 d-flex justify-content-center align-items-center mb-0 ftco-animate">
                                    <div className="d-flex align-items-center">
                                        <div className="mr-2" style={{ color: 'white', opacity: 0.9 }}>
                                            <GraduationCap size={32} strokeWidth={1.5} />
                                        </div>
                                        <div className="text-white">
                                            <div className="d-flex align-items-baseline">
                                                <strong className="number" data-number={counters.education} style={{ fontSize: '28px', fontWeight: '800' }}>0</strong>
                                                <span style={{ fontSize: '16px', marginLeft: '1px', fontWeight: '700' }}>+</span>
                                            </div>
                                            <span style={{ fontSize: '11px', textTransform: 'none', opacity: 0.85, display: 'block', lineHeight: '1.2' }}>
                                                {t('home.impact_education')}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-3 d-flex justify-content-center align-items-center mb-0 ftco-animate">
                                    <div className="d-flex align-items-center">
                                        <div className="mr-2" style={{ color: 'white', opacity: 0.9 }}>
                                            <Briefcase size={32} strokeWidth={1.5} />
                                        </div>
                                        <div className="text-white">
                                            <div className="d-flex align-items-baseline">
                                                <strong className="number" data-number={counters.livelihoods} style={{ fontSize: '28px', fontWeight: '800' }}>0</strong>
                                                <span style={{ fontSize: '16px', marginLeft: '1px', fontWeight: '700' }}>+</span>
                                            </div>
                                            <span style={{ fontSize: '11px', textTransform: 'none', opacity: 0.85, display: 'block', lineHeight: '1.2' }}>
                                                {t('home.impact_livelihoods')}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-3 d-flex justify-content-center align-items-center mb-0 ftco-animate">
                                    <div className="d-flex align-items-center">
                                        <div className="mr-2" style={{ color: 'white', opacity: 0.9 }}>
                                            <Award size={32} strokeWidth={1.5} />
                                        </div>
                                        <div className="text-white">
                                            <div className="d-flex align-items-baseline">
                                                <strong className="number" data-number={counters.leadership} style={{ fontSize: '28px', fontWeight: '800' }}>0</strong>
                                                <span style={{ fontSize: '16px', marginLeft: '1px', fontWeight: '700' }}>+</span>
                                            </div>
                                            <span style={{ fontSize: '11px', textTransform: 'none', opacity: 0.85, display: 'block', lineHeight: '1.2' }}>
                                                {t('home.impact_leadership')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="ftco-section" id="mission" style={{
                padding: '30px 0 40px',
                backgroundColor: '#fff',
                position: 'relative',
                zIndex: 0
            }}>
                <div className="container">
                    <div className="row align-items-center">
                        {/* Left Column: Text Content */}
                        <div className="col-lg-6 mb-5 mb-lg-0 ftco-animate">
                            <style>
                                {`
                                @keyframes tripleBounce {
                                    0% { transform: translateY(-300px); opacity: 0; }
                                    20% { transform: translateY(0); opacity: 1; }
                                    40% { transform: translateY(-40px); }
                                    60% { transform: translateY(0); }
                                    80% { transform: translateY(-20px); }
                                    90% { transform: translateY(0); }
                                    95% { transform: translateY(-10px); }
                                    100% { transform: translateY(0); opacity: 1; }
                                }
                                .mission-bounce.ftco-animated {
                                    animation: tripleBounce 2s ease-out forwards !important;
                                }
                                .typing-cursor {
                                    border-right: 3px solid #076c5b;
                                    animation: blink 0.7s infinite;
                                    margin-left: 4px;
                                }
                                @keyframes blink {
                                    0%, 100% { border-color: transparent; }
                                    50% { border-color: #076c5b; }
                                }
                                `}
                            </style>
                            <span className="badge badge-light px-3 py-2 mb-3 font-weight-bold" style={{ color: '#076c5b', backgroundColor: '#e2f5f2', borderRadius: '50px', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                                {t('home.mission_badge')}
                            </span>
                            <h2 className="mb-4 font-weight-bold ftco-animate mission-bounce" style={{ fontSize: '42px', lineHeight: '1.2', color: '#111' }}>
                                {t('home.mission_title')}
                                <br />
                                <span style={{ color: '#076c5b', fontSize: '32px', opacity: 0.8 }}>
                                    {typingText}<span className="typing-cursor"></span>
                                </span>
                            </h2>
                            <p className="lead mb-4 ftco-animate" style={{ fontSize: '16px', color: '#666', lineHeight: '1.8' }}>
                                {t('home.mission_desc')}
                            </p>

                            <div className="row mb-5">
                                <div className="col-md-6 mb-3 ftco-animate">
                                    <div className="d-flex align-items-center">
                                        <div className="d-flex align-items-center justify-content-center mr-3" style={{ width: '40px', height: '40px', flexShrink: 0, color: '#076c5b' }}>
                                            <Wallet size={32} strokeWidth={1.5} />
                                        </div>
                                        <span style={{ fontSize: '15px', color: '#333', fontWeight: 500 }}>{t('home.mission_empowerment')}</span>
                                    </div>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <div className="d-flex align-items-center">
                                        <div className="d-flex align-items-center justify-content-center mr-3" style={{ width: '40px', height: '40px', flexShrink: 0, color: '#076c5b' }}>
                                            <GraduationCap size={32} strokeWidth={1.5} />
                                        </div>
                                        <span style={{ fontSize: '15px', color: '#333', fontWeight: 500 }}>{t('home.mission_education')}</span>
                                    </div>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <div className="d-flex align-items-center">
                                        <div className="d-flex align-items-center justify-content-center mr-3" style={{ width: '40px', height: '40px', flexShrink: 0, color: '#076c5b' }}>
                                            <Heart size={32} strokeWidth={1.5} />
                                        </div>
                                        <span style={{ fontSize: '15px', color: '#333', fontWeight: 500 }}>{t('home.mission_health')}</span>
                                    </div>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <div className="d-flex align-items-center">
                                        <div className="d-flex align-items-center justify-content-center mr-3" style={{ width: '40px', height: '40px', flexShrink: 0, color: '#076c5b' }}>
                                            <Users size={32} strokeWidth={1.5} />
                                        </div>
                                        <span style={{ fontSize: '15px', color: '#333', fontWeight: 500 }}>{t('home.mission_advocacy')}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="ftco-animate">
                                <Link to="/about" className="btn px-4 py-3 font-weight-bold shadow-sm" style={{ backgroundColor: '#076c5b', color: '#fff', borderRadius: '8px' }}>
                                    {t('home.mission_learn_more')}
                                </Link>
                            </div>
                        </div>

                        {/* Right Column: Image Composition */}
                        <div className="col-lg-6 position-relative">
                            <div className="position-relative" style={{ height: '500px' }}>
                                {/* Main Image */}
                                <div className="ftco-animate" style={{
                                    backgroundImage: "url('/images/pic9.jpg')",
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    borderRadius: '24px',
                                    width: '75%',
                                    height: '85%',
                                    position: 'absolute',
                                    top: 0,
                                    right: 0,
                                    zIndex: 1
                                }}></div>

                                {/* Floating Image 1 (Left Overlap) */}
                                <div className="ftco-animate" style={{
                                    backgroundImage: "url('/images/cause-1.jpg')",
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    borderRadius: '16px',
                                    width: '45%',
                                    height: '40%',
                                    position: 'absolute',
                                    bottom: '30px',
                                    left: '10px',
                                    zIndex: 2
                                }}></div>

                                {/* Floating Stat Card 1 */}
                                <div className="bg-white shadow-sm p-3 d-flex align-items-center ftco-animate" style={{
                                    position: 'absolute',
                                    top: '40px',
                                    left: '0',
                                    borderRadius: '12px',
                                    zIndex: 3,
                                    maxWidth: '180px'
                                }}>
                                    <div className="mr-3 d-flex align-items-center justify-content-center" style={{ width: '44px', height: '44px', flexShrink: 0, color: '#076c5b' }}>
                                        <Users size={32} strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <span className="d-block font-weight-bold" style={{ fontSize: '16px', color: '#111' }}>{t('home.mission_lives_changed_count')}</span>
                                        <span style={{ fontSize: '11px', color: '#888' }}>{t('home.mission_lives_changed')}</span>
                                    </div>
                                </div>

                                {/* Floating Stat Card 2 */}
                                <div className="bg-white shadow-sm p-3 d-flex align-items-center ftco-animate" style={{
                                    position: 'absolute',
                                    bottom: '100px',
                                    right: '-20px',
                                    borderRadius: '12px',
                                    zIndex: 3,
                                    maxWidth: '200px'
                                }}>
                                    <div className="mr-3 d-flex align-items-center justify-content-center" style={{ width: '44px', height: '44px', flexShrink: 0, color: '#4FB1A1' }}>
                                        <TrendingUp size={32} strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <span className="d-block font-weight-bold" style={{ fontSize: '14px', color: '#111' }}>{t('home.mission_sustainable_impact')}</span>
                                        <span className="text-success font-weight-bold" style={{ fontSize: '10px' }}>{t('home.mission_success_rate')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="ftco-section bg-white" id="impact-areas" style={{ padding: '40px 0' }}>
                <style>
                    {`
                    .impact-area-card {
                        height: 360px;
                        border-radius: 12px;
                        overflow: hidden;
                        position: relative;
                        cursor: pointer;
                        transition: all 0.4s ease;
                    }
                    .impact-area-card .impact-bg {
                        width: 100%;
                        height: 100%;
                        background-size: cover;
                        background-position: center;
                        transition: transform 0.6s ease;
                    }
                    .impact-area-card:hover .impact-bg {
                        transform: scale(1.1);
                    }
                    .impact-area-overlay {
                        position: absolute;
                        bottom: 0;
                        left: 0;
                        width: 100%;
                        background-color: rgba(0, 89, 79, 0.95);
                        padding: 15px 20px;
                        color: #fff;
                        transition: all 0.4s ease;
                        min-height: 55px;
                    }
                    .impact-area-card:hover .impact-area-overlay {
                        min-height: 100%;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                    }
                    .impact-area-desc {
                        opacity: 0;
                        font-size: 14px;
                        line-height: 1.6;
                        margin-top: 15px;
                        transition: opacity 0.3s ease;
                        transition-delay: 0.1s;
                        display: none;
                    }
                    .impact-area-card:hover .impact-area-desc {
                        opacity: 1;
                        display: block;
                    }
                    `}
                </style>
                <div className="container">
                    <div className="row justify-content-center mb-3">
                        <div className="col-md-8 text-center ftco-animate">
                            <span className="badge badge-light px-3 py-2 mb-3 font-weight-bold" style={{ color: '#076c5b', backgroundColor: '#e2f5f2', borderRadius: '50px', fontSize: '12px', letterSpacing: '1.2px', textTransform: 'uppercase' }}>
                                {t('home.impact_areas_badge')}
                            </span>
                            <h2 className="mb-2 font-weight-bold" style={{ fontSize: '36px', color: '#111' }}>
                                {t('home.impact_areas_title')}
                            </h2>
                        </div>
                    </div>

                    <div className="row">
                        {/* 1. Emergency Response (Featured) */}
                        <div className="col-md-4 mb-3 ftco-animate">
                            <div className="impact-area-card">
                                <div className="impact-bg" style={{ backgroundImage: "url('/images/pic14.jpg')" }}></div>
                                <div className="impact-area-overlay">
                                    <h3 className="text-white font-weight-bold mb-0" style={{ fontSize: '18px' }}>
                                        {t('home.impact_areas_emergency_title')}
                                    </h3>
                                    <p className="impact-area-desc">
                                        {t('home.impact_areas_emergency_desc')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* 2. Economic Empowerment */}
                        <div className="col-md-4 mb-3 ftco-animate">
                            <div className="impact-area-card">
                                <div className="impact-bg" style={{ backgroundImage: "url('/images/pic13.jpg')" }}></div>
                                <div className="impact-area-overlay">
                                    <h3 className="text-white font-weight-bold mb-0" style={{ fontSize: '18px' }}>
                                        {t('home.impact_areas_economic_title')}
                                    </h3>
                                    <p className="impact-area-desc">
                                        {t('home.impact_areas_economic_desc')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* 3. SRHR & Menstrual Health */}
                        <div className="col-md-4 mb-3 ftco-animate">
                            <div className="impact-area-card">
                                <div className="impact-bg" style={{ backgroundImage: "url('/images/pic15.jpg')" }}></div>
                                <div className="impact-area-overlay">
                                    <h3 className="text-white font-weight-bold mb-0" style={{ fontSize: '18px' }}>
                                        {t('home.impact_areas_srhr_title')}
                                    </h3>
                                    <p className="impact-area-desc">
                                        {t('home.impact_areas_srhr_desc')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* 4. Education & School Retention */}
                        <div className="col-md-4 mb-3 ftco-animate">
                            <div className="impact-area-card">
                                <div className="impact-bg" style={{ backgroundImage: "url('/images/pic16.jpg')" }}></div>
                                <div className="impact-area-overlay">
                                    <h3 className="text-white font-weight-bold mb-0" style={{ fontSize: '18px' }}>
                                        {t('home.impact_areas_education_title')}
                                    </h3>
                                    <p className="impact-area-desc">
                                        {t('home.impact_areas_education_desc')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* 5. Gender & Protection */}
                        <div className="col-md-4 mb-3 ftco-animate">
                            <div className="impact-area-card">
                                <div className="impact-bg" style={{ backgroundImage: "url('/images/pic11.jpg')" }}></div>
                                <div className="impact-area-overlay">
                                    <h3 className="text-white font-weight-bold mb-0" style={{ fontSize: '18px' }}>
                                        {t('home.impact_areas_gender_title')}
                                    </h3>
                                    <p className="impact-area-desc">
                                        {t('home.impact_areas_gender_desc')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* 6. Human Capital & Resilience */}
                        <div className="col-md-4 mb-3 ftco-animate">
                            <div className="impact-area-card">
                                <div className="impact-bg" style={{ backgroundImage: "url('/images/pic2.jpg')" }}></div>
                                <div className="impact-area-overlay">
                                    <h3 className="text-white font-weight-bold mb-0" style={{ fontSize: '18px' }}>
                                        {t('home.impact_areas_human_title')}
                                    </h3>
                                    <p className="impact-area-desc">
                                        {t('home.impact_areas_human_desc')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="ftco-section bg-light" id="programs">
                <div className="container">
                    <div className="row justify-content-center mb-5 pb-3">
                        <div className="col-md-7 heading-section ftco-animate text-center">
                            <span className="subheading" style={{ color: '#076c5b', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>{t('programs.subheading')}</span>
                            <h2 className="mb-4" style={{ fontWeight: '800' }}>{t('programs.heading')}</h2>
                            <p>{t('programs.desc')}</p>
                        </div>
                    </div>

                    <div className="row">
                        {mockPrograms.map((program, index) => {
                            const programTitle = program.name[language] || program.name.en;
                            const programDesc = program.description[language] || program.description.en;
                            // Map existing data to the new design format using BRAND COLORS
                            interface ProgramDesignInfo {
                                svgPath: string;
                                iconColor: string;
                                title?: string;       // Added optional title override
                                description?: string; // Added optional description override
                                subtitle: string;
                                featuresTitle: string;
                                features: string[];
                                status: string;
                                statusColor: string;
                                statusIconColor: string;
                                borderColor: string;
                                secondaryBorder: string;
                            }

                            const programMap: Record<string, ProgramDesignInfo> = {
                                p1: {
                                    svgPath: 'M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z',
                                    iconColor: '#4FB1A1',
                                    title: t('programs.p1.title'),
                                    description: t('programs.p1.description'),
                                    subtitle: t('programs.p1.subtitle'),
                                    featuresTitle: t('programs.p1.features_title'),
                                    features: [t('programs.p1.feature1'), t('programs.p1.feature2'), t('programs.p1.feature3'), t('programs.p1.feature4')],
                                    status: t('programs.p1.status'),
                                    statusColor: '#4FB1A115',
                                    statusIconColor: '#4FB1A1',
                                    borderColor: '#4FB1A1',
                                    secondaryBorder: '#eacfa2'
                                },
                                p2: {
                                    svgPath: 'M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z',
                                    iconColor: '#076c5b',
                                    title: t('programs.p2.title'),
                                    description: t('programs.p2.description'),
                                    subtitle: t('programs.p2.subtitle'),
                                    featuresTitle: t('programs.p2.features_title'),
                                    features: [t('programs.p2.feature1'), t('programs.p2.feature2'), t('programs.p2.feature3'), t('programs.p2.feature4')],
                                    status: t('programs.p2.status'),
                                    statusColor: '#076c5b15',
                                    statusIconColor: '#076c5b',
                                    borderColor: '#076c5b',
                                    secondaryBorder: '#4FB1A1'
                                },
                                p3: {
                                    svgPath: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z',
                                    iconColor: '#eacfa2',
                                    title: t('programs.p3.title'),
                                    description: t('programs.p3.description'),
                                    subtitle: t('programs.p3.subtitle'),
                                    featuresTitle: t('programs.p3.features_title'),
                                    features: [t('programs.p3.feature1'), t('programs.p3.feature2'), t('programs.p3.feature3'), t('programs.p3.feature4')],
                                    status: t('programs.p3.status'),
                                    statusColor: '#eacfa225',
                                    statusIconColor: '#c4a56e',
                                    borderColor: '#eacfa2',
                                    secondaryBorder: '#4FB1A1'
                                }
                            };

                            const programInfo = programMap[program.id] || {
                                svgPath: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
                                iconColor: '#4FB1A1',
                                subtitle: 'Special Initiative',
                                featuresTitle: 'Highlights:',
                                features: ['Community impact', 'Sustainable growth', 'Strategic alignment'],
                                status: 'Ongoing',
                                statusColor: '#edf2f7',
                                statusIconColor: '#4a5568',
                                borderColor: '#4FB1A1',
                                secondaryBorder: '#076c5b'
                            };

                            return (
                                <div className="col-md-6 col-lg-4 ftco-animate mb-5" key={program.id}>
                                    <div className="program-card overflow-hidden" style={{
                                        borderRadius: '20px',
                                        boxShadow: '0 15px 40px rgba(18, 47, 43, 0.06)',
                                        border: 'none',
                                        height: '100%',
                                        position: 'relative'
                                    }}>
                                        {/* Dual color top border using BRAND COLORS */}
                                        <div className="program-card-border d-flex" style={{ height: '5px' }}>
                                            <div style={{ flex: 1, backgroundColor: programInfo.borderColor }}></div>
                                            <div style={{ flex: 1, backgroundColor: programInfo.secondaryBorder }}></div>
                                        </div>

                                        <div className="p-4">
                                            {/* Header with SVG Icon and Title */}
                                            <div className="d-flex align-items-center mb-3">
                                                <div className="mr-3 d-flex align-items-center justify-content-center" style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    flexShrink: 0
                                                }}>
                                                    <svg className="program-card-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d={programInfo.svgPath} fill={programInfo.iconColor} />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <h3 className="program-card-title mb-0" style={{ fontWeight: 800, fontSize: '18px', color: '#122f2b', lineHeight: '1.2' }}>{programInfo.title || programTitle}</h3>
                                                    <span className="program-card-subtitle" style={{ fontSize: '12px', letterSpacing: '0.3px', color: '#666', fontWeight: 600 }}>{programInfo.subtitle}</span>
                                                </div>
                                            </div>

                                            {/* Description */}
                                            <p className="program-card-desc mb-3" style={{ color: '#444', fontSize: '14px', lineHeight: '1.7' }}>
                                                {programInfo.description || programDesc}
                                            </p>

                                            {/* Features Section */}
                                            <div className="program-card-features-box mb-4 p-3" style={{ backgroundColor: '#f9fbfb', borderRadius: '14px', border: '1px solid #eef2f2' }}>
                                                <h4 className="program-card-features-title mb-2" style={{ fontSize: '13px', fontWeight: 700, color: '#122f2b' }}>{programInfo.featuresTitle}</h4>
                                                <ul className="list-unstyled mb-0">
                                                    {programInfo.features.map((feature: string, fIndex: number) => (
                                                        <li key={fIndex} className="d-flex align-items-start mb-1" style={{ fontSize: '13px' }}>
                                                            <span className="program-card-feature-dot mr-2 mt-1" style={{ width: '6px', height: '6px', backgroundColor: programInfo.borderColor, borderRadius: '50%', flexShrink: 0, display: 'inline-block' }}></span>
                                                            <span className="program-card-feature-text" style={{ lineHeight: '1.5', color: '#555' }}>{feature}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            {/* Footer with Badge */}
                                            <div className="d-flex justify-content-center">
                                                <div className="program-card-status px-3 py-1 d-flex align-items-center" style={{
                                                    backgroundColor: programInfo.statusColor,
                                                    borderRadius: '50px',
                                                    fontSize: '12px',
                                                    fontWeight: '700',
                                                    color: programInfo.statusIconColor
                                                }}>
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                                                        <path d="M7 2v11h3v9l7-12h-4l4-8z" fill={programInfo.statusIconColor} />
                                                    </svg>
                                                    {programInfo.status}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="text-center mt-4">
                        <Link to="/about" className="btn px-5 py-3 font-weight-bold shadow-lg" style={{
                            borderRadius: '50px',
                            letterSpacing: '1px',
                            backgroundColor: '#4FB1A1',
                            color: '#fff'
                        }}>
                            {t('home.programs_view_all')}
                        </Link>
                    </div>
                </div>
            </section>

            <section className="ftco-section" id="stories" style={{ backgroundColor: '#f8faf9', padding: '30px 0 40px 0' }}>
                <style>
                    {`
                    .story-card {
                        position: relative;
                        height: 380px;
                        border-radius: 16px;
                        overflow: hidden;
                        cursor: pointer;
                        box-shadow: none;
                        transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
                    }
                    .story-img {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                        transition: transform 0.8s ease;
                    }
                    .story-card:hover .story-img {
                        transform: scale(1.1);
                    }
                    .story-overlay-glass {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: rgba(255, 255, 255, 0.88);
                        backdrop-filter: blur(8px);
                        -webkit-backdrop-filter: blur(8px);
                        padding: 25px 20px;
                        opacity: 0;
                        display: flex;
                        flex-direction: column;
                        transition: all 0.4s ease;
                        z-index: 10;
                    }
                    .story-card:hover .story-overlay-glass {
                        opacity: 1;
                    }
                    .story-header-text {
                        margin-bottom: 12px;
                        line-height: 1.3;
                    }
                    .story-user-name {
                        color: #076c5b;
                        font-weight: 800;
                        font-size: 16px;
                        margin-right: 5px;
                    }
                    .story-user-headline {
                        color: #122f2b;
                        font-weight: 700;
                        font-size: 16px;
                    }
                    .story-user-quote {
                        color: #444;
                        font-size: 13px;
                        line-height: 1.6;
                        margin-bottom: 0;
                    }
                    .story-footer-location {
                        margin-top: auto;
                        display: flex;
                        align-items: center;
                    }
                    .story-location-badge {
                        display: inline-flex;
                        align-items: center;
                        background: #e2f5f2;
                        color: #076c5b;
                        padding: 4px 12px;
                        border-radius: 50px;
                        font-size: 11px;
                        font-weight: 700;
                        transition: all 0.3s ease;
                    }
                    .story-card:hover .story-location-badge {
                        background: #076c5b;
                        color: #fff;
                    }
                    `}
                </style>
                <div className="container">
                    <div className="row justify-content-center mb-5">
                        <div className="col-md-9 text-center ftco-animate">
                            <span className="subheading mb-2 d-block font-weight-bold" style={{ color: '#4FB1A1', letterSpacing: '2px', textTransform: 'uppercase' }}>{t('stories.subheading')}</span>
                            <h2 className="mb-3 font-weight-bold" style={{ color: '#122f2b', fontSize: '38px' }}>{t('stories.heading')}</h2>
                            <p style={{ color: '#666', fontSize: '18px' }}>{t('stories.desc')}</p>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-12">
                            <div className="carousel-cause owl-carousel">
                                {mockStories.map((story, index) => (
                                    <div className="item px-2" key={`${story.id}-${index}`}>
                                        <div className="story-card">
                                            <img
                                                src={story.media && story.media[0] ? story.media[0].url : '/images/story1.jpg'}
                                                alt={story.authorName}
                                                className="story-img"
                                            />

                                            <div className="story-overlay-glass">
                                                <div className="story-header-text">
                                                    <span className="story-user-name">{story.authorName}</span>
                                                    <span className="story-user-headline">
                                                        {(story.title[language] || story.title.en).replace(story.authorName, '').replace("'s Journey", t('home.stories_journey_suffix'))}
                                                    </span>
                                                </div>

                                                <p className="story-user-quote">
                                                    "{(story.content[language] || story.content.en).length > 320 ? (story.content[language] || story.content.en).substring(0, 320) + '...' : (story.content[language] || story.content.en)}"
                                                </p>

                                                <div className="story-footer-location">
                                                    <div className="story-location-badge">
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                                                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor" />
                                                        </svg>
                                                        {story.metadata?.location || 'Bugesera, Rwanda'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="text-center mt-4">
                        <Link to="/about" className="btn btn-outline-primary px-5 py-3 font-weight-bold" style={{ borderRadius: '50px', borderWidth: '2px', borderColor: '#076c5b', color: '#076c5b' }}>
                            {t('home.stories_read_more')}
                        </Link>
                    </div>
                </div>
            </section>

            <section className="ftco-gallery mt-2">
                <div className="d-md-flex">
                    <a href={galleryImages[0]}
                        onClick={(e) => openLightbox(e, 0)}
                        className="gallery image-popup d-flex justify-content-center align-items-center img ftco-animate"
                        style={{ backgroundImage: `url(${galleryImages[0]})` }}>
                        <div className="icon d-flex justify-content-center align-items-center">
                            <span className="icon-search"></span>
                        </div>
                    </a>
                    <a href={galleryImages[1]}
                        onClick={(e) => openLightbox(e, 1)}
                        className="gallery image-popup d-flex justify-content-center align-items-center img ftco-animate"
                        style={{ backgroundImage: `url(${galleryImages[1]})` }}>
                        <div className="icon d-flex justify-content-center align-items-center">
                            <span className="icon-search"></span>
                        </div>
                    </a>
                    <a href={galleryImages[2]}
                        onClick={(e) => openLightbox(e, 2)}
                        className="gallery image-popup d-flex justify-content-center align-items-center img ftco-animate"
                        style={{ backgroundImage: `url(${galleryImages[2]})` }}>
                        <div className="icon d-flex justify-content-center align-items-center">
                            <span className="icon-search"></span>
                        </div>
                    </a>
                    <a href={galleryImages[3]}
                        onClick={(e) => openLightbox(e, 3)}
                        className="gallery image-popup d-flex justify-content-center align-items-center img ftco-animate"
                        style={{ backgroundImage: `url(${galleryImages[3]})` }}>
                        <div className="icon d-flex justify-content-center align-items-center">
                            <span className="icon-search"></span>
                        </div>
                    </a>
                </div>
                <div className="d-md-flex">
                    <a href={galleryImages[4]}
                        onClick={(e) => openLightbox(e, 4)}
                        className="gallery image-popup d-flex justify-content-center align-items-center img ftco-animate"
                        style={{ backgroundImage: `url(${galleryImages[4]})` }}>
                        <div className="icon d-flex justify-content-center align-items-center">
                            <span className="icon-search"></span>
                        </div>
                    </a>
                    <a href={galleryImages[5]}
                        onClick={(e) => openLightbox(e, 5)}
                        className="gallery image-popup d-flex justify-content-center align-items-center img ftco-animate"
                        style={{ backgroundImage: `url(${galleryImages[5]})` }}>
                        <div className="icon d-flex justify-content-center align-items-center">
                            <span className="icon-search"></span>
                        </div>
                    </a>
                    <a href={galleryImages[6]}
                        onClick={(e) => openLightbox(e, 6)}
                        className="gallery image-popup d-flex justify-content-center align-items-center img ftco-animate"
                        style={{ backgroundImage: `url(${galleryImages[6]})` }}>
                        <div className="icon d-flex justify-content-center align-items-center">
                            <span className="icon-search"></span>
                        </div>
                    </a>
                    <a href={galleryImages[7]}
                        onClick={(e) => openLightbox(e, 7)}
                        className="gallery image-popup d-flex justify-content-center align-items-center img ftco-animate"
                        style={{ backgroundImage: `url(${galleryImages[7]})` }}>
                        <div className="icon d-flex justify-content-center align-items-center">
                            <span className="icon-search"></span>
                        </div>
                    </a>
                </div>
            </section>

            {/* Lightbox Modal */}
            {selectedImage && (
                <div className="lightbox-overlay" style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.95)',
                    zIndex: 99999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(5px)',
                    animation: 'fadeIn 0.3s ease-out'
                }} onClick={closeLightbox}>
                    <button onClick={closeLightbox} style={{
                        position: 'absolute',
                        top: '20px',
                        right: '20px',
                        background: 'transparent',
                        border: 'none',
                        color: 'white',
                        cursor: 'pointer',
                        zIndex: 100000,
                        padding: '10px'
                    }}>
                        <X size={32} />
                    </button>

                    <button onClick={prevImage} style={{
                        position: 'absolute',
                        left: '20px',
                        background: 'rgba(255,255,255,0.1)',
                        border: 'none',
                        color: 'white',
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 100000,
                        transition: 'all 0.2s ease'
                    }}>
                        <ChevronLeft size={32} />
                    </button>

                    <div style={{
                        position: 'relative',
                        maxWidth: '90%',
                        maxHeight: '90%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                    }}>
                        <img
                            src={selectedImage}
                            alt="Gallery Zoom"
                            style={{
                                maxWidth: '100%',
                                maxHeight: '80vh',
                                borderRadius: '8px',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                                objectFit: 'contain',
                                animation: 'zoomIn 0.3s cubic-bezier(0.165, 0.84, 0.44, 1)'
                            }}
                            onClick={(e) => e.stopPropagation()}
                        />
                        <div style={{
                            color: 'white',
                            marginTop: '20px',
                            fontSize: '14px',
                            fontWeight: '600',
                            letterSpacing: '1px'
                        }}>
                            {selectedImageIndex + 1} / {galleryImages.length}
                        </div>
                    </div>

                    <button onClick={nextImage} style={{
                        position: 'absolute',
                        right: '20px',
                        background: 'rgba(255,255,255,0.1)',
                        border: 'none',
                        color: 'white',
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 100000,
                        transition: 'all 0.2s ease'
                    }}>
                        <ChevronRight size={32} />
                    </button>

                    <style>
                        {`
                        @keyframes fadeIn {
                            from { opacity: 0; }
                            to { opacity: 1; }
                        }
                        @keyframes zoomIn {
                            from { transform: scale(0.9); opacity: 0; }
                            to { transform: scale(1); opacity: 1; }
                        }
                        .lightbox-overlay button:hover {
                            background: rgba(255,255,255,0.2) !important;
                            transform: scale(1.1);
                        }
                        `}
                    </style>
                </div>
            )}



            <section className="ftco-section bg-white" style={{ padding: '60px 0 80px', borderTop: '1px solid #f0f0f0' }}>
                <div className="container">
                    <div className="row mb-5">
                        <div className="col-md-12 ftco-animate">
                            <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#111', marginBottom: '10px' }}>
                                {t('home.partners_heading')}
                            </h2>
                        </div>
                    </div>

                    <div className="row">
                        {[
                            {
                                title: 'FAWE RWANDA',
                                subtitle: t('home.partner_fawe_subtitle'),
                                icon: <GraduationCap size={32} strokeWidth={1.5} />,
                                color: '#e2f5f2'
                            },
                            {
                                title: 'ECORYS',
                                subtitle: t('home.partner_ecorys_subtitle'),
                                icon: <Globe size={32} strokeWidth={1.5} />,
                                color: '#f0f9ff'
                            },
                            {
                                title: 'MOR ASSAYAG',
                                subtitle: t('home.partner_mor_subtitle'),
                                icon: <Handshake size={32} strokeWidth={1.5} />,
                                color: '#fff5f0'
                            }
                        ].map((partner, idx) => (
                            <div className="col-md-4 mb-3 ftco-animate" key={idx}>
                                <div className="p-4 d-flex align-items-center h-100 partner-card-hover" style={{ backgroundColor: '#f9f9f9', borderRadius: '4px', transition: 'all 0.3s ease', border: '1px solid transparent' }}>
                                    <div className="mr-3 d-flex align-items-center justify-content-center" style={{
                                        color: '#00594f',
                                        backgroundColor: partner.color,
                                        width: '56px',
                                        height: '56px',
                                        borderRadius: '12px',
                                        flexShrink: 0
                                    }}>
                                        {partner.icon}
                                    </div>
                                    <div className="d-flex flex-column">
                                        <h5 className="mb-1" style={{ fontSize: '16px', fontWeight: '800', color: '#111', letterSpacing: '0.5px' }}>
                                            {partner.title}
                                        </h5>
                                        <span style={{ fontSize: '9px', color: '#666', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', lineHeight: '1.3' }}>
                                            {partner.subtitle}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <style>
                        {`
                            .partner-card-hover:hover {
                                background-color: #fff !important;
                                border-color: #076c5b !important;
                                transform: translateY(-5px);
                            }
                        `}
                    </style>
                </div>
            </section>

            <section className="ftco-section" id="impact-circle" style={{ backgroundColor: '#f8faf9', padding: '60px 0' }}>
                <style>
                    {`
                    .impact-tier-card {
                        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                        cursor: pointer;
                        z-index: 1;
                    }
                    .impact-tier-card:hover {
                        transform: scale(1.02);
                        z-index: 10;
                        box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                    }
                    `}
                </style>
                <div className="container">
                    <div className="row justify-content-center mb-4">
                        <div className="col-md-8 text-center ftco-animate">
                            <span className="badge badge-light px-3 py-2 mb-2 font-weight-bold" style={{ color: '#076c5b', backgroundColor: '#e2f5f2', borderRadius: '50px', fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                                {t('home.impact_circle_badge')}
                            </span>
                            <h2 className="mb-3 font-weight-bold" style={{ fontSize: '36px', color: '#111' }}>{t('home.impact_circle_title')}</h2>
                            <p style={{ fontSize: '16px', color: '#666' }}>{t('home.impact_circle_desc')}</p>
                        </div>
                    </div>

                    <div className="row no-gutters shadow-lg" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                        {/* Tier 1: Dark Style */}
                        <div className="col-md-4 d-flex ftco-animate">
                            <div className="w-100 p-4 py-5 d-flex flex-column align-items-center justify-content-center text-center position-relative overflow-hidden impact-tier-card"
                                style={{ backgroundColor: '#00594f', minHeight: '400px' }}>
                                {/* Background Icon Watermark */}
                                <div style={{ position: 'absolute', opacity: 0.08, transform: 'scale(10)', pointerEvents: 'none' }}>
                                    <Heart size={48} strokeWidth={1} />
                                </div>

                                <div style={{ position: 'relative', zIndex: 1 }}>
                                    <h3 className="mb-3 font-weight-bold text-white" style={{ fontSize: '28px' }}>{t('home.impact_circle_tier1_price')}</h3>
                                    <p className="mb-4 text-white-50" style={{ fontSize: '15px', lineHeight: '1.5' }}>
                                        {t('home.impact_circle_tier1_desc')}
                                    </p>
                                    <Link to="/donate" className="btn px-4 py-2 font-weight-bold" style={{ backgroundColor: 'white', color: '#00594f', borderRadius: '4px', fontSize: '13px' }}>
                                        {t('home.impact_circle_btn')}
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Tier 2: White Style with Thick Border */}
                        <div className="col-md-4 d-flex ftco-animate">
                            <div className="w-100 p-4 py-5 d-flex flex-column align-items-center justify-content-center text-center bg-white impact-tier-card"
                                style={{ border: '12px solid #00594f', minHeight: '400px' }}>
                                <h3 className="mb-3 font-weight-bold" style={{ color: '#00594f', fontSize: '28px' }}>{t('home.impact_circle_tier2_price')}</h3>
                                <p className="mb-4" style={{ color: '#444', fontSize: '15px', lineHeight: '1.5' }}>
                                    {t('home.impact_circle_tier2_desc')}
                                </p>
                                <Link to="/donate" className="btn px-4 py-3 font-weight-bold text-uppercase w-100"
                                    style={{ backgroundColor: '#076c5b', color: 'white', borderRadius: '4px', fontSize: '13px', letterSpacing: '1px' }}>
                                    {t('home.impact_circle_btn_alt')}
                                </Link>
                            </div>
                        </div>

                        {/* Tier 3: Dark Style */}
                        <div className="col-md-4 d-flex ftco-animate">
                            <div className="w-100 p-4 py-5 d-flex flex-column align-items-center justify-content-center text-center position-relative overflow-hidden impact-tier-card"
                                style={{ backgroundColor: '#00594f', minHeight: '400px' }}>
                                {/* Background Icon Watermark */}
                                <div style={{ position: 'absolute', opacity: 0.08, transform: 'scale(10)', pointerEvents: 'none' }}>
                                    <Briefcase size={48} strokeWidth={1} />
                                </div>

                                <div style={{ position: 'relative', zIndex: 1 }}>
                                    <h3 className="mb-3 font-weight-bold text-white" style={{ fontSize: '28px' }}>{t('home.impact_circle_tier3_price')}</h3>
                                    <p className="mb-4 text-white-50" style={{ fontSize: '15px', lineHeight: '1.5' }}>
                                        {t('home.impact_circle_tier3_desc')}
                                    </p>
                                    <Link to="/donate" className="btn px-4 py-2 font-weight-bold" style={{ backgroundColor: 'white', color: '#00594f', borderRadius: '4px', fontSize: '13px' }}>
                                        {t('home.impact_circle_btn')}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="ftco-section" style={{ padding: '60px 0', backgroundColor: '#fff', overflow: 'hidden' }}>
                <div className="container">
                    <div className="row align-items-center">
                        {/* Left Column: SDG Grid with Blobs */}
                        <div className="col-lg-7 position-relative mb-5 mb-lg-0 ftco-animate">
                            {/* Decorative Blobs */}
                            <div style={{
                                position: 'absolute',
                                top: '-10%',
                                left: '-10%',
                                width: '300px',
                                height: '300px',
                                backgroundColor: '#e2f5f2',
                                borderRadius: '50%',
                                filter: 'blur(80px)',
                                zIndex: 0
                            }}></div>
                            <div style={{
                                position: 'absolute',
                                bottom: '-10%',
                                right: '10%',
                                width: '250px',
                                height: '250px',
                                backgroundColor: '#f0f9ff',
                                borderRadius: '50%',
                                filter: 'blur(80px)',
                                zIndex: 0
                            }}></div>

                            <div className="bg-white shadow-lg overflow-hidden position-relative" style={{ borderRadius: '24px', zIndex: 1, border: '1px solid #f0f0f0' }}>
                                <div className="row no-gutters">
                                    {[
                                        {
                                            id: 1, name: t('home.sdg_goal1'), color: '#e5243b',
                                            icon: (
                                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                                                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                                                </svg>
                                            )
                                        },
                                        {
                                            id: 3, name: t('home.sdg_goal3'), color: '#4c9f38',
                                            icon: (
                                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                                                </svg>
                                            )
                                        },
                                        {
                                            id: 4, name: t('home.sdg_goal4'), color: '#c5192d',
                                            icon: (
                                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                                                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                                                </svg>
                                            )
                                        },
                                        {
                                            id: 5, name: t('home.sdg_goal5'), color: '#ff3a21',
                                            icon: (
                                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M12 7V3m-4 4V5m8 2V5"></path>
                                                    <path d="M4 11h16a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1z"></path>
                                                    <path d="M7 15v4a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-4"></path>
                                                </svg>
                                            )
                                        },
                                        {
                                            id: 8, name: t('home.sdg_goal8'), color: '#a21942',
                                            icon: (
                                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                                                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                                                    <path d="M12 11v4"></path>
                                                    <path d="M9 13h6"></path>
                                                </svg>
                                            )
                                        },
                                        {
                                            id: 10, name: t('home.sdg_goal10'), color: '#dd1367',
                                            icon: (
                                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <circle cx="12" cy="12" r="10"></circle>
                                                    <line x1="2" y1="12" x2="22" y2="12"></line>
                                                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                                                </svg>
                                            )
                                        }
                                    ].map((sdg, index) => (
                                        <div className="col-md-4 border-right border-bottom" key={sdg.id} style={{
                                            borderRight: index % 3 === 2 ? 'none' : '1px solid #f0f0f0',
                                            borderBottom: index >= 3 ? 'none' : '1px solid #f0f0f0'
                                        }}>
                                            <div className="p-3 text-center transition-all sdg-card-item h-100 d-flex flex-column align-items-center justify-content-center"
                                                style={{ minHeight: '160px', '--sdg-color': sdg.color } as any}>
                                                <div className="mb-3 sdg-icon-box" style={{ color: '#076c5b' }}>
                                                    {sdg.icon}
                                                </div>
                                                <h5 className="font-weight-bold mb-1 sdg-card-title" style={{ fontSize: '14px', color: '#111', lineHeight: '1.2' }}>{sdg.name}</h5>
                                                <span className="font-weight-bold sdg-card-goal" style={{ color: sdg.color, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('home.sdg_goal_label')} {sdg.id}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Content */}
                        <div className="col-lg-5 pl-lg-5">
                            <style>
                                {`
                                @keyframes revealText {
                                    from { opacity: 0; transform: translateY(20px); }
                                    to { opacity: 1; transform: translateY(0); }
                                }
                                .sdg-text-reveal {
                                    opacity: 0;
                                    animation: revealText 0.8s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
                                }
                                .sdg-delay-1 { animation-delay: 0.1s; }
                                .sdg-delay-2 { animation-delay: 0.2s; }
                                .sdg-delay-3 { animation-delay: 0.3s; }
                                .sdg-delay-4 { animation-delay: 0.4s; }

                                .hover-glow-text {
                                    transition: all 0.3s ease;
                                    cursor: default;
                                }
                                .hover-glow-text:hover {
                                    text-shadow: 0 0 15px rgba(7, 108, 91, 0.2);
                                    transform: translateX(5px);
                                }

                                .sdg-card-item {
                                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                                    cursor: pointer;
                                    position: relative;
                                    background-color: transparent;
                                }
                                .sdg-card-item:hover {
                                    background-color: var(--sdg-color) !important;
                                    transform: scale(1.02);
                                    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
                                    z-index: 2;
                                }
                                .sdg-card-item:hover .sdg-icon-box,
                                .sdg-card-item:hover .sdg-card-title,
                                .sdg-card-item:hover .sdg-card-goal {
                                    color: #fff !important;
                                }
                                @keyframes iconPulse {
                                    0% { transform: scale(1); }
                                    50% { transform: scale(1.15); }
                                    100% { transform: scale(1); }
                                }
                                .sdg-card-item:hover .sdg-icon-box {
                                    animation: iconPulse 1.5s infinite ease-in-out;
                                }
                                .sdg-icon-box { transition: all 0.3s ease; }
                                .sdg-card-title { transition: all 0.3s ease; }
                                .sdg-card-goal { transition: all 0.3s ease; }
                                `}
                            </style>
                            <h2 className="mb-3 font-weight-bold sdg-text-reveal sdg-delay-1 hover-glow-text" style={{ fontSize: '32px', lineHeight: '1.2', color: '#111' }}>
                                {t('home.sdg_title')}
                            </h2>
                            <p className="lead mb-3 sdg-text-reveal sdg-delay-2" style={{ fontSize: '16px', color: '#666', lineHeight: '1.7' }}>
                                {t('home.sdg_desc1')}
                            </p>
                            <p className="mb-3 sdg-text-reveal sdg-delay-3" style={{ fontSize: '14px', color: '#888' }}>
                                {t('home.sdg_desc2')}
                            </p>
                            <div className="sdg-text-reveal sdg-delay-4">
                                <Link to="/about" className="btn px-5 py-3 font-weight-bold shadow-sm" style={{ backgroundColor: '#076c5b', color: '#fff', borderRadius: '12px', fontSize: '15px' }}>
                                    {t('home.sdg_report_btn')}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="ftco-section-3 img" style={{ backgroundImage: "url(/images/pic15.jpg)", padding: '30px 0', position: 'relative' }}>
                <style>
                    {`
                    .movement-card {
                        transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
                        border: 1px solid #f0f2f2 !important;
                    }
                    .movement-card:hover {
                        transform: translateY(-8px);
                        border-color: #076c5b !important;
                        box-shadow: 0 15px 30px rgba(7, 108, 91, 0.1) !important;
                    }
                    .volunteer-form-wrap {
                        transition: all 0.5s ease;
                        border: 1px solid transparent;
                    }
                    .volunteer-form-wrap:hover {
                        border-color: #076c5b;
                        box-shadow: 0 25px 50px rgba(0,0,0,0.15) !important;
                    }
                    .form-animated-input {
                        transition: all 0.3s ease;
                    }
                    .form-animated-input:focus {
                        background-color: #fff !important;
                        border-color: #076c5b !important;
                        box-shadow: 0 0 0 4px rgba(7, 108, 91, 0.05) !important;
                    }
                    .btn-animated {
                        transition: all 0.3s ease;
                    }
                    .btn-animated:hover {
                        transform: scale(1.02);
                        filter: brightness(1.1);
                    }
                    `}
                </style>
                <div className="overlay" style={{ opacity: 0.95, backgroundColor: '#fcfdfd' }}></div>
                <div className="container" style={{ position: 'relative', zIndex: 2 }}>
                    {/* Header matching image structure */}
                    <div className="row justify-content-center mb-3">
                        <div className="col-md-10 text-center ftco-animate">
                            <span style={{ color: '#076c5b', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '12px', display: 'block', marginBottom: '8px' }}>{t('home.movement_badge')}</span>
                            <h2 className="mb-2" style={{ fontSize: '36px', fontWeight: '800', color: '#122f2b', lineHeight: '1.2' }}>
                                {t('home.movement_title')}
                            </h2>
                            <p style={{ fontSize: '16px', color: '#666', maxWidth: '800px', margin: '0 auto' }}>
                                {t('home.movement_desc')}
                            </p>
                        </div>
                    </div>

                    <div className="row">
                        {/* Left Side: 4 Information Cards in 2x2 Grid */}
                        <div className="col-lg-8">
                            <div className="row">
                                {[
                                    {
                                        title: t('home.movement_donor_title'),
                                        desc: t('home.movement_donor_desc')
                                    },
                                    {
                                        title: t('home.movement_volunteer_title'),
                                        desc: t('home.movement_volunteer_desc')
                                    },
                                    {
                                        title: t('home.movement_partner_title'),
                                        desc: t('home.movement_partner_desc')
                                    },
                                    {
                                        title: t('home.movement_advocacy_title'),
                                        desc: t('home.movement_advocacy_desc')
                                    }
                                ].map((item, idx) => (
                                    <div className="col-md-6 mb-3 mt-1" key={idx}>
                                        <div className="p-4 bg-white h-100 shadow-sm movement-card" style={{ borderRadius: '4px' }}>
                                            <h4 style={{ fontSize: '18px', fontWeight: '800', color: '#122f2b', marginBottom: '10px' }}>{item.title}</h4>
                                            <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.6', marginBottom: 0 }}>{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Side: Sidebar Form Card */}
                        <div className="col-lg-4">
                            <div className="bg-white p-4 shadow-lg volunteer-form-wrap" style={{ borderRadius: '8px', position: 'relative', marginTop: '4px' }}>
                                <span style={{ color: '#fbb124', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', fontSize: '10px', display: 'block', marginBottom: '4px' }}>{t('home.movement_form_badge')}</span>
                                <h3 className="mb-3" style={{ fontSize: '22px', fontWeight: '800', color: '#122f2b' }}>{t('home.movement_form_title')}</h3>

                                <form action="#" className="volunteer-form-premium">
                                    <div className="row">
                                        <div className="col-md-6 mb-2">
                                            <input type="text" className="form-control form-animated-input" style={{ backgroundColor: '#f9fbfb', border: '1px solid #eef2f2', borderRadius: '4px', height: '42px', fontSize: '13px' }} placeholder={t('home.movement_name_placeholder')} />
                                        </div>
                                        <div className="col-md-6 mb-2">
                                            <input type="email" className="form-control form-animated-input" style={{ backgroundColor: '#f9fbfb', border: '1px solid #eef2f2', borderRadius: '4px', height: '42px', fontSize: '13px' }} placeholder={t('home.movement_email_placeholder')} />
                                        </div>
                                        <div className="col-md-6 mb-2">
                                            <input type="text" className="form-control form-animated-input" style={{ backgroundColor: '#f9fbfb', border: '1px solid #eef2f2', borderRadius: '4px', height: '42px', fontSize: '13px' }} placeholder={t('home.movement_phone_placeholder')} />
                                        </div>
                                        <div className="col-md-6 mb-2">
                                            <input type="text" className="form-control form-animated-input" style={{ backgroundColor: '#f9fbfb', border: '1px solid #eef2f2', borderRadius: '4px', height: '42px', fontSize: '13px' }} placeholder={t('home.movement_location_placeholder')} />
                                        </div>
                                        <div className="col-md-12 mb-3">
                                            <textarea name="" id="" cols={30} rows={3} className="form-control form-animated-input" style={{ backgroundColor: '#f9fbfb', border: '1px solid #eef2f2', borderRadius: '4px', fontSize: '13px', paddingTop: '10px' }} placeholder={t('home.movement_message_placeholder')}></textarea>
                                        </div>
                                        <div className="col-md-12">
                                            <button type="submit" className="btn py-2 px-4 w-100 shadow-sm btn-animated" style={{ backgroundColor: '#076c5b', color: '#fff', fontWeight: '800', fontSize: '13px', borderRadius: '4px', border: 'none' }}>
                                                {t('home.movement_btn')}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};
