import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../../lib/language-context';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Globe, User as UserIcon, LogOut, LayoutDashboard, ChevronDown, Menu, Search } from 'lucide-react';
import { useAuth } from '../../lib/auth-context';
import { UserType } from '../../lib/types';

export const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const isDonationPage = location.pathname === '/donate';
    const isLoginPage = location.pathname === '/login';
    const dashboardRoutes = ['/admin', '/beneficiary', '/donor', '/dashboard'];
    const isDashboard = dashboardRoutes.some(route => location.pathname.startsWith(route));
    const { language, setLanguage, t } = useLanguage();
    const { user, isAuthenticated, logout } = useAuth();
    const [isScrolled, setIsScrolled] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [clickedDropdown, setClickedDropdown] = useState<string | null>(null);
    const navbarRef = useRef<HTMLElement>(null);

    const isHelpFaqPage = location.pathname === '/help-faq';
    const hasLightBackground = isDonationPage || isLoginPage || isDashboard;
    const hasSolidBackground = hasLightBackground || isScrolled;

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        handleScroll();
        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // Add click-outside handler to close dropdowns
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (navbarRef.current && !navbarRef.current.contains(event.target as Node)) {
                setClickedDropdown(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Handle dropdown toggle on click
    const handleDropdownToggle = (dropdownName: string) => {
        setClickedDropdown(clickedDropdown === dropdownName ? null : dropdownName);
    };

    // Handle clicking on dropdown links to close the menu
    const handleDropdownLinkClick = () => {
        setClickedDropdown(null);
    };

    const languages = [
        { code: 'en', name: 'English' },
        { code: 'rw', name: 'Kinyarwanda' }
    ] as const;

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const getDashboardLink = () => {
        if (!user) return '/';
        switch (user.userType) {
            case UserType.ADMIN: return '/admin';
            case UserType.DONOR: return '/donor';
            case UserType.BENEFICIARY: return '/beneficiary';
            default: return '/';
        }
    };

    return (
        <>
            <style>{`
                .lceo-highlight {
                    font-weight: 900 !important;
                    font-size: 26px !important;
                    color: #076c5b !important;
                    display: inline-block;
                    letter-spacing: 1.5px !important;
                    transition: all 0.3s ease;
                    filter: drop-shadow(0 2px 4px rgba(7, 108, 91, 0.1));
                }
                
                .navbar-scrolled .lceo-highlight {
                    color: #bef264 !important;
                    filter: drop-shadow(0 0 8px rgba(190, 242, 100, 0.3));
                }

                .navbar-dark-links .lceo-highlight {
                    color: #076c5b !important;
                }

                /* Solid navbar for donation/login/dashboard pages – keep white */
                .navbar.navbar-donation-steps {
                    background: #ffffff !important;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.08) !important;
                    top: 0 !important;
                }
                .navbar-donation-steps .nav-link {
                    color: #076c5b !important;
                    font-weight: 600 !important;
                    opacity: 1 !important;
                    transition: all 0.3s ease !important;
                }
                .navbar-donation-steps .nav-link:hover {
                    color: #17d1ac !important;
                    transform: translateY(-1px);
                }
                .navbar-donation-steps .navbar-brand {
                    color: #076c5b !important;
                    font-weight: 700 !important;
                }
                .navbar-donation-steps .navbar-brand span {
                    color: #076c5b !important;
                    font-weight: 700 !important;
                }
                .navbar-donation-steps .navbar-toggler {
                    color: #076c5b !important;
                    border-color: rgba(7, 108, 91, 0.1) !important;
                }
                .navbar-donation-steps .navbar-toggler .oi-menu {
                    color: #076c5b !important;
                }
                
                .navbar-donation-steps .nav-item.cta .nav-link {
                    background: #17D1AC !important;
                    border: 1px solid #17D1AC !important;
                    color: #ffffff !important;
                    border-radius: 30px !important;
                }
                .navbar-donation-steps .nav-item.cta .nav-link:hover {
                    background: #14b392 !important;
                    border-color: #14b392 !important;
                    color: #ffffff !important;
                    transform: translateY(-1px) !important;
                    box-shadow: 0 4px 10px rgba(23, 209, 172, 0.3) !important;
                }
                
                .navbar-donation-steps .nav-item:hover .nav-link:not(.btn) {
                    opacity: 1 !important;
                    color: #17d1ac !important;
                }

                /* Dark links on transparent background (HelpFaq) */
                .navbar-dark-links .nav-link {
                    color: #076c5b !important;
                }
                .navbar-dark-links .nav-link:hover {
                    color: #17d1ac !important;
                }
                .navbar-dark-links .navbar-brand,
                .navbar-dark-links .navbar-brand span {
                    color: #076c5b !important;
                }
                .navbar-dark-links .navbar-toggler {
                    color: #076c5b !important;
                    border-color: rgba(7, 108, 91, 0.1) !important;
                }
                .navbar-dark-links .navbar-toggler .oi-menu {
                    color: #076c5b !important;
                }

                /* Green-themed navbar when scrolled on hero/other white sections */
                .navbar.navbar-scrolled,
                .ftco_navbar.navbar-scrolled {
                    background: #0f3d34 !important;
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15) !important;
                    top: 0 !important;
                    transition: background 0.3s ease, box-shadow 0.3s ease;
                }
                .navbar.navbar-scrolled .navbar-nav .nav-link,
                .ftco_navbar.navbar-scrolled .navbar-nav .nav-link {
                    color: #f8f9fa !important;
                    font-weight: 600 !important;
                    opacity: 1 !important;
                    transition: all 0.3s ease !important;
                }
                .navbar.navbar-scrolled .navbar-nav .nav-link:hover,
                .ftco_navbar.navbar-scrolled .navbar-nav .nav-link:hover {
                    color: #e3fff9 !important;
                    transform: translateY(-1px);
                }
                .navbar.navbar-scrolled .navbar-brand,
                .navbar.navbar-scrolled .navbar-brand span,
                .ftco_navbar.navbar-scrolled .navbar-brand,
                .ftco_navbar.navbar-scrolled .navbar-brand span {
                    color: #ffffff !important;
                    font-weight: 700 !important;
                }
                .navbar.navbar-scrolled .navbar-toggler,
                .ftco_navbar.navbar-scrolled .navbar-toggler {
                    color: #ffffff !important;
                    border-color: rgba(255,255,255,0.3) !important;
                }
                .navbar.navbar-scrolled .navbar-toggler .oi-menu,
                .ftco_navbar.navbar-scrolled .navbar-toggler .oi-menu {
                    color: #ffffff !important;
                }
                .navbar.navbar-scrolled .nav-item.cta .nav-link,
                .ftco_navbar.navbar-scrolled .nav-item.cta .nav-link {
                    background: #ffffff !important;
                    border: 1px solid #ffffff !important;
                    color: #0f3d34 !important;
                    border-radius: 30px !important;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18) !important;
                }
                .navbar.navbar-scrolled .nav-item.cta .nav-link:hover,
                .ftco_navbar.navbar-scrolled .nav-item.cta .nav-link:hover {
                    background: #e3fff9 !important;
                    border-color: #e3fff9 !important;
                    color: #0b2d26 !important;
                    transform: translateY(-1px) !important;
                }

                /* Language Switcher Styling */
                @media (min-width: 992px) {
                    .lang-switcher:hover > .dropdown-menu,
                    .lang-switcher.is-active > .dropdown-menu {
                        display: block !important;
                        opacity: 1 !important;
                        visibility: visible !important;
                        margin-top: 0 !important;
                    }
                    .lang-switcher .dropdown-menu {
                        border-top: 3px solid #076c5b !important;
                        border-radius: 0 0 15px 15px !important;
                        box-shadow: 0 15px 40px rgba(0,0,0,0.12) !important;
                        border: none !important;
                        padding: 10px 0 !important;
                    }
                    /* Line for language switcher */
                    .lang-switcher:hover > .nav-link::after,
                    .lang-switcher.is-active > .nav-link::after {
                        content: '';
                        position: absolute;
                        bottom: 0;
                        left: 50%;
                        transform: translateX(-50%) scaleX(1);
                        width: 20px;
                        height: 4px;
                        background-color: #076c5b;
                        border-radius: 2px;
                        transition: transform 0.3s ease;
                    }
                    .lang-switcher > .nav-link::after {
                        content: '';
                        position: absolute;
                        bottom: 0;
                        left: 50%;
                        transform: translateX(-50%) scaleX(0);
                        width: 20px;
                        height: 4px;
                        background-color: #076c5b;
                        border-radius: 2px;
                        transition: transform 0.3s ease;
                    }
                }

                .lang-switcher .dropdown-item {
                    font-size: 0.85rem;
                    padding: 0.5rem 1.2rem;
                    font-weight: 500;
                }
                .lang-switcher .dropdown-item.active {
                    background-color: #4FB1A1;
                    color: #fff;
                }
                .lang-switcher .dropdown-item.active {
                    background-color: #4FB1A1;
                    color: #fff;
                }
                .search-icon:hover {
                    color: #4FB1A1 !important;
                    transform: scale(1.1);
                    transition: all 0.2s ease;
                }

                /* Dark mode overrides for navbar */
                /* Keep login/register header light even in dark mode */
                
                /* Mega Menu Styles */
                @media (min-width: 992px) {
                    .nav-item.dropdown:hover > .dropdown-menu,
                    .nav-item.dropdown.is-active > .dropdown-menu {
                        display: block !important;
                        opacity: 1 !important;
                        visibility: visible !important;
                        margin-top: 0 !important;
                    }
                    .nav-item.dropdown .dropdown-menu {
                        display: none !important;
                        opacity: 0 !important;
                        visibility: hidden !important;
                        transition: all 0.3s ease !important;
                    }
                    .nav-item.dropdown:hover > .nav-link,
                    .nav-item.dropdown.is-active > .nav-link {
                        color: #17d1ac !important;
                    }
                    .nav-item.dropdown .nav-link {
                        position: relative;
                    }
                    .nav-item.dropdown:hover > .nav-link::after,
                    .nav-item.dropdown.is-active > .nav-link::after {
                        content: '';
                        position: absolute;
                        bottom: 0;
                        left: 50%;
                        transform: translateX(-50%) scaleX(1);
                        width: 30px;
                        height: 4px;
                        background-color: #076c5b;
                        border-radius: 2px;
                        transition: transform 0.3s ease;
                    }
                    .nav-item.dropdown > .nav-link::after {
                        content: '';
                        position: absolute;
                        bottom: 0;
                        left: 50%;
                        transform: translateX(-50%) scaleX(0);
                        width: 30px;
                        height: 4px;
                        background-color: #17d1ac;
                        border-radius: 2px;
                        transition: transform 0.3s ease;
                    }
                    .dropdown-toggle::after {
                        display: none !important;
                    }
                    .dropdown-chevron {
                        transition: transform 0.3s ease;
                    }
                    .nav-item.dropdown:hover .dropdown-chevron,
                    .nav-item.dropdown.is-active .dropdown-chevron {
                        transform: rotate(180deg);
                    }
                    .nav-item.dropdown.mega-dropdown {
                        position: static !important;
                    }
                    .mega-dropdown .dropdown-menu {
                        width: 90% !important;
                        left: 5% !important;
                        right: 5% !important;
                        top: 100% !important;
                        margin-top: 0 !important;
                        padding: 0 !important; /* Managed by inner content */
                        border-radius: 0 0 20px 20px !important;
                        box-shadow: 0 15px 40px rgba(0,0,0,0.12) !important;
                        border: none !important;
                        border-top: 4px solid #076c5b !important;
                        background: #fff !important;
                        overflow: hidden;
                    }
                    .mega-menu-container {
                        display: flex;
                        flex-direction: column;
                    }
                    @media (min-width: 992px) {
                        .mega-menu-container {
                            flex-direction: row;
                        }
                    }
                    .mega-featured-side {
                        background-color: #e9e9db;
                        padding: 20px 25px;
                        width: 100%;
                    }
                    @media (min-width: 992px) {
                        .mega-featured-side {
                            width: 240px;
                            min-height: 260px;
                        }
                    }
                    .mega-links-side {
                        flex-grow: 1;
                        padding: 25px 35px;
                        background: #fff;
                    }
                    .mega-menu-content {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 20px;
                        justify-content: space-between;
                    }
                    .mega-column {
                        flex: 1;
                        min-width: 200px;
                        padding: 0 20px;
                        border-right: 1.5px solid #e2e8f0;
                    }
                    .mega-column:last-child {
                        border-right: none;
                    }
                    .mega-title {
                        font-size: 17px;
                        font-weight: 700;
                        color: #122f2b;
                        margin-bottom: 20px;
                        display: flex;
                        align-items: center;
                    }
                    .mega-title::before {
                        content: '';
                        display: inline-block;
                        width: 10px;
                        height: 10px;
                        margin-right: 12px;
                        border-right: 3px solid #17d1ac;
                        border-bottom: 3px solid #17d1ac;
                        transform: rotate(-45deg);
                    }
                    .mega-link {
                        display: block;
                        font-size: 15px;
                        color: #555 !important;
                        padding: 6px 0 !important;
                        transition: all 0.3s ease;
                        background: transparent !important;
                        border: none !important;
                        text-align: left;
                        position: relative;
                        padding-left: 20px !important;
                    }
                    .mega-link::before {
                        content: '';
                        position: absolute;
                        left: 0;
                        top: 50%;
                        width: 6px;
                        height: 6px;
                        border-right: 2px solid #4FB1A1;
                        border-bottom: 2px solid #4FB1A1;
                        transform: translateY(-50%) rotate(-45deg);
                        opacity: 0.6;
                        transition: all 0.3s ease;
                    }
                    .mega-link:hover {
                        color: #076c5b !important;
                        transform: translateX(5px);
                        text-decoration: none;
                    }
                    .mega-link:hover::before {
                        opacity: 1;
                        color: #076c5b;
                    }
                }
                
                /* Mobile adjustments for mega menu */
                @media (max-width: 991px) {
                    .navbar-collapse {
                        background: #ffffff !important;
                        margin-top: 15px;
                        border-radius: 16px;
                        box-shadow: 0 15px 40px rgba(0,0,0,0.15) !important;
                        padding: 10px !important;
                        max-height: 85vh;
                        overflow-y: auto;
                        border: 1px solid rgba(0,0,0,0.05);
                    }
                    .navbar-scrolled .navbar-collapse {
                        background: #0f3d34 !important;
                        border-color: rgba(255,255,255,0.1);
                    }
                    .nav-link {
                        padding: 12px 20px !important;
                        font-weight: 600 !important;
                        border-radius: 10px;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                    .dropdown-toggle::after {
                        transition: transform 0.3s ease;
                        margin-left: 10px;
                    }
                    .dropdown.show .dropdown-toggle::after {
                        transform: rotate(180deg);
                    }
                    .dropdown-menu {
                        background: rgba(0,0,0,0.02) !important;
                        border: none !important;
                        box-shadow: none !important;
                        padding: 0 0 10px 15px !important;
                        margin: 0 10px 10px 10px !important;
                        border-left: 2px solid #17d1ac !important;
                        border-radius: 0 !important;
                        display: none;
                    }
                    .navbar-scrolled .dropdown-menu {
                        background: rgba(255,255,255,0.05) !important;
                    }
                    .dropdown-menu.show {
                        display: block !important;
                    }
                    .mega-menu-container {
                        flex-direction: column !important;
                    }
                    .mega-featured-side {
                        display: none !important;
                    }
                    .mega-links-side {
                        padding: 5px 0 !important;
                        background: transparent !important;
                    }
                    .mega-menu-content {
                        flex-direction: column !important;
                        gap: 15px !important;
                    }
                    .mega-column {
                        padding: 0 !important;
                        border: none !important;
                        margin-bottom: 10px;
                    }
                    .mega-column:last-child {
                        margin-bottom: 0;
                    }
                    .mega-title {
                        font-size: 12px !important;
                        font-weight: 700 !important;
                        text-transform: uppercase !important;
                        letter-spacing: 1px !important;
                        margin-bottom: 8px !important;
                        color: #076c5b !important;
                        opacity: 0.8;
                        padding-left: 5px;
                    }
                    .navbar-scrolled .mega-title {
                        color: #17d1ac !important;
                    }
                    .mega-link {
                        padding: 10px 12px !important;
                        font-size: 14px !important;
                        border-radius: 8px;
                        color: #444 !important;
                        display: block;
                        transition: all 0.2s ease;
                        margin-left: 0 !important;
                        background: transparent !important;
                    }
                    .mega-link::before {
                        content: none !important;
                    }
                    .mega-link:active, .mega-link:hover {
                        background: rgba(23, 209, 172, 0.1) !important;
                        color: #076c5b !important;
                    }
                    
                    /* Scrolled mobile colors */
                    .navbar-scrolled .nav-link,
                    .navbar-scrolled .mega-link {
                        color: #ffffff !important;
                    }
                    .navbar-scrolled .mega-link:active,
                    .navbar-scrolled .mega-link:hover {
                        background: rgba(255, 255, 255, 0.1) !important;
                        color: #17d1ac !important;
                    }
                }
            `}</style>

            <nav
                onMouseLeave={() => setActiveDropdown(null)}
                className={
                    `navbar navbar-expand-lg ftco_navbar ftco-navbar-light ` +
                    `${hasLightBackground ? 'navbar-donation-steps ' : ''}` +
                    `${!hasLightBackground && !isScrolled && isHelpFaqPage ? 'navbar-dark-links ' : ''}` +
                    `${!hasLightBackground && isScrolled ? 'navbar-scrolled ' : ''}`
                }
                style={
                    hasLightBackground
                        ? { background: '#ffffff', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', top: 0, zIndex: 100 }
                        : isScrolled
                            ? { background: '#0f3d34', boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)', top: 0, zIndex: 100 }
                            : { zIndex: 100 }
                }
                id="ftco-navbar"
                ref={navbarRef}
            >
                <div className="container">
                    <Link className="navbar-brand d-flex align-items-center" to="/">
                        <img src="/images/logo.png" alt="LCEO Logo" style={{ height: '40px', marginRight: '10px' }} />
                        <span><span className="lceo-highlight">LCEO</span></span>
                    </Link>
                    <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#ftco-nav"
                        aria-controls="ftco-nav" aria-expanded="false" aria-label="Toggle navigation">
                        <Menu size={24} strokeWidth={1.5} className="oi-menu" /> {t('nav.menu') || 'Menu'}
                    </button>

                    <div className="collapse navbar-collapse" id="ftco-nav">
                        <ul className="navbar-nav ml-auto">

                            <li
                                className={`nav-item dropdown mega-dropdown ${activeDropdown === 'about' || clickedDropdown === 'about' ? 'is-active' : ''}`}
                                onMouseEnter={() => setActiveDropdown('about')}
                                onMouseLeave={() => clickedDropdown === null && setActiveDropdown(null)}
                            >
                                <a className="nav-link dropdown-toggle d-flex align-items-center" href="#" id="whoWeAreDropdown" role="button"
                                    aria-haspopup="true" aria-expanded={activeDropdown === 'about' || clickedDropdown === 'about'}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleDropdownToggle('about');
                                    }}>
                                    {t('nav.about')}
                                    <ChevronDown size={14} className="ml-2 dropdown-chevron" />
                                </a>
                                <div className="dropdown-menu shadow-xl" aria-labelledby="whoWeAreDropdown" onClick={(e) => e.stopPropagation()}>
                                    <div className="mega-menu-container">
                                        {/* Left: Featured Donation Side */}
                                        <div className="mega-featured-side d-flex flex-column">
                                            <div className="mb-2 overflow-hidden rounded shadow-sm" style={{ height: '80px' }}>
                                                <img src="/images/cause-1.jpg" alt="Donate" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            </div>
                                            <h4 className="font-weight-bold mb-1" style={{ fontSize: '15px', color: '#111' }}>{t('navbar.mega.donate_title')}</h4>
                                            <p className="small mb-2 text-muted" style={{ lineHeight: '1.3', fontSize: '11px' }}>{t('navbar.mega.donate_desc')}</p>
                                            <Link to="/donate" className="btn px-4 py-2 mt-auto font-weight-bold shadow-sm" onClick={handleDropdownLinkClick} style={{ backgroundColor: '#076c5b', color: '#fff', borderRadius: '30px', fontSize: '14px' }}>
                                                {t('navbar.mega.donate_btn')}
                                            </Link>
                                        </div>

                                        {/* Right: Main Mega Menu Links */}
                                        <div className="mega-links-side">
                                            <div className="mega-menu-content">
                                                {/* Column 1: Our Approach */}
                                                <div className="mega-column">
                                                    <h5 className="mega-title">{t('navbar.mega.who_we_are')}</h5>
                                                    <Link className="mega-link" to="/about" onClick={handleDropdownLinkClick}>{t('nav.about')}</Link>
                                                    <Link className="mega-link" to="/how-we-work" onClick={handleDropdownLinkClick}>{t('nav.how_we_work')}</Link>
                                                </div>

                                                {/* Column 2: Our Strategy */}
                                                <div className="mega-column">
                                                    <h5 className="mega-title">{t('navbar.mega.our_strategy')}</h5>
                                                    <Link className="mega-link" to="/strategic-direction" onClick={handleDropdownLinkClick}>{t('nav.strategic_direction')}</Link>
                                                </div>

                                                {/* Column 3: Impact Hub */}
                                                <div className="mega-column" style={{ borderRight: 'none' }}>
                                                    <h5 className="mega-title">{t('navbar.mega.knowledge_hub')}</h5>
                                                    <Link className="mega-link" to="/resources" onClick={handleDropdownLinkClick}>{t('nav.resources')}</Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </li>
                            <li
                                className={`nav-item dropdown mega-dropdown ${activeDropdown === 'impact' || clickedDropdown === 'impact' ? 'is-active' : ''}`}
                                onMouseEnter={() => setActiveDropdown('impact')}
                                onMouseLeave={() => clickedDropdown === null && setActiveDropdown(null)}
                            >
                                <a className="nav-link dropdown-toggle d-flex align-items-center" href="#" id="impactDropdown" role="button"
                                    aria-haspopup="true" aria-expanded={activeDropdown === 'impact' || clickedDropdown === 'impact'}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleDropdownToggle('impact');
                                    }}>
                                    {t('nav.impact')}
                                    <ChevronDown size={14} className="ml-2 dropdown-chevron" />
                                </a>
                                <div className="dropdown-menu shadow-xl" aria-labelledby="impactDropdown" onClick={(e) => e.stopPropagation()}>
                                    <div className="mega-menu-container">
                                        {/* Left: Featured Report Side */}
                                        <div className="mega-featured-side d-flex flex-column">
                                            <div className="mb-2 overflow-hidden rounded shadow-sm" style={{ height: '80px' }}>
                                                <img src="/images/img1.jpg" alt="Annual Report" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            </div>
                                            <h4 className="font-weight-bold mb-1" style={{ fontSize: '15px', color: '#111' }}>{t('navbar.mega.report_title')}</h4>
                                            <p className="small mb-2 text-muted" style={{ lineHeight: '1.3', fontSize: '11px' }}>{t('navbar.mega.report_desc')}</p>
                                            <Link to="/resources" className="btn px-4 py-2 mt-auto font-weight-bold shadow-sm" onClick={handleDropdownLinkClick} style={{ backgroundColor: '#076c5b', color: '#fff', borderRadius: '30px', fontSize: '14px' }}>
                                                {t('navbar.mega.report_btn')}
                                            </Link>
                                        </div>

                                        {/* Right: Main Mega Menu Links */}
                                        <div className="mega-links-side">
                                            <div className="mega-menu-content">
                                                {/* Column 1 */}
                                                <div className="mega-column">
                                                    <h5 className="mega-title">{t('navbar.mega.real_impact')}</h5>
                                                    <Link className="mega-link" to="/impact-stories" onClick={handleDropdownLinkClick}>{t('nav.impact')}</Link>
                                                </div>

                                                {/* Column 2 */}
                                                <div className="mega-column">
                                                    <h5 className="mega-title">{t('navbar.mega.help_support')}</h5>
                                                    <Link className="mega-link" to="/help-faq" onClick={handleDropdownLinkClick}>{t('navbar.mega.help_faq')}</Link>
                                                </div>

                                                {/* Column 3 */}
                                                <div className="mega-column" style={{ borderRight: 'none' }}>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </li>
                            <li
                                className={`nav-item dropdown mega-dropdown ${activeDropdown === 'contact' || clickedDropdown === 'contact' ? 'is-active' : ''}`}
                                onMouseEnter={() => setActiveDropdown('contact')}
                                onMouseLeave={() => clickedDropdown === null && setActiveDropdown(null)}
                            >
                                <a className="nav-link dropdown-toggle d-flex align-items-center" href="#" id="getInvolvedDropdown" role="button"
                                    aria-haspopup="true" aria-expanded={activeDropdown === 'contact' || clickedDropdown === 'contact'}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleDropdownToggle('contact');
                                    }}>
                                    {t('nav.contact')}
                                    <ChevronDown size={14} className="ml-2 dropdown-chevron" />
                                </a>
                                <div className="dropdown-menu shadow-xl" aria-labelledby="getInvolvedDropdown" onClick={(e) => e.stopPropagation()}>
                                    <div className="mega-menu-container">
                                        {/* Left: Featured Mission Side */}
                                        <div className="mega-featured-side d-flex flex-column">
                                            <div className="mb-2 overflow-hidden rounded shadow-sm" style={{ height: '80px' }}>
                                                <img src="/images/pic12.jpg" alt="Join Mission" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            </div>
                                            <h4 className="font-weight-bold mb-1" style={{ fontSize: '15px', color: '#111' }}>{t('navbar.mega.join_mission_title')}</h4>
                                            <p className="small mb-2 text-muted" style={{ lineHeight: '1.3', fontSize: '11px' }}>{t('navbar.mega.join_mission_desc')}</p>
                                            <Link to="/contact" className="btn px-4 py-2 mt-auto font-weight-bold shadow-sm" onClick={handleDropdownLinkClick} style={{ backgroundColor: '#076c5b', color: '#fff', borderRadius: '30px', fontSize: '14px' }}>
                                                {t('navbar.mega.get_involved_btn')}
                                            </Link>
                                        </div>

                                        {/* Right: Main Mega Menu Links */}
                                        <div className="mega-links-side">
                                            <div className="mega-menu-content">
                                                {/* Column 1 */}
                                                <div className="mega-column">
                                                    <h5 className="mega-title">{t('navbar.mega.get_in_touch')}</h5>
                                                    <Link className="mega-link" to="/contact" onClick={handleDropdownLinkClick}>{t('nav.contact')}</Link>
                                                </div>

                                                {/* Column 2 */}
                                                <div className="mega-column">
                                                    <h5 className="mega-title">{t('navbar.mega.support_lceo')}</h5>
                                                    <Link className="mega-link" to="/get-involved" onClick={handleDropdownLinkClick}>Get Involved</Link>
                                                    <Link className="mega-link" to="/donate" onClick={handleDropdownLinkClick}>{t('btn.donate')}</Link>
                                                </div>

                                                {/* Column 3 */}
                                                <div className="mega-column" style={{ borderRight: 'none' }}>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </li>

                            {!isAuthenticated ? (
                                <li className="nav-item ml-lg-2">
                                    <Link className="nav-link" to="/login" style={{ fontWeight: 600 }}>
                                        {t('nav.login')}
                                    </Link>
                                </li>
                            ) : (
                                <li
                                    className={`nav-item dropdown ml-lg-2 d-flex align-items-center ${activeDropdown === 'user' ? 'is-active' : ''}`}
                                    onMouseEnter={() => setActiveDropdown('user')}
                                >
                                    <Link className="nav-link pr-1" to="/profile">
                                        <div className="d-flex align-items-center bg-emerald-light rounded-pill px-3 py-1 shadow-sm hover:opacity-80 transition-all border border-emerald-light" style={{ backgroundColor: 'rgba(23, 209, 172, 0.1)', border: '1px solid rgba(23, 209, 172, 0.2)' }}>
                                            <UserIcon size={16} className="text-emerald mr-2" style={{ color: '#17D1AC' }} />
                                            <span className="font-weight-bold" style={{ color: '#122f2b', fontSize: '0.9rem' }}>{user?.fullName?.split(' ')[0]}</span>
                                        </div>
                                    </Link>
                                    <a className="nav-link dropdown-toggle pl-1 d-flex align-items-center" href="#" id="userDropdown" role="button" data-toggle="dropdown"
                                        aria-haspopup="true" aria-expanded="false">
                                        <ChevronDown size={14} className="dropdown-chevron" />
                                    </a>
                                    <div className="dropdown-menu dropdown-menu-right shadow-lg border-0 py-2 mt-2" aria-labelledby="userDropdown" style={{ borderRadius: '12px', minWidth: '180px' }}>
                                        <div className="px-4 py-2 border-bottom mb-2">
                                            <div className="small text-muted">{t('navbar.user.role')}</div>
                                            <div className="font-weight-bold text-capitalize" style={{ fontSize: '0.85rem' }}>{user?.userType}</div>
                                        </div>
                                        <Link className="dropdown-item py-2 d-flex align-items-center" to={getDashboardLink()}>
                                            <LayoutDashboard size={16} className="mr-2 opacity-70" /> {t('nav.dashboard')}
                                        </Link>
                                        <Link className="dropdown-item py-2 d-flex align-items-center" to="/profile">
                                            <UserIcon size={16} className="mr-2 opacity-70" /> {t('nav.profile')}
                                        </Link>
                                        <div className="dropdown-divider"></div>
                                        <button className="dropdown-item py-2 d-flex align-items-center text-danger" onClick={handleLogout}>
                                            <LogOut size={16} className="mr-2 opacity-70" /> {t('nav.logout')}
                                        </button>
                                    </div>
                                </li>
                            )}

                            <li className="nav-item ml-lg-1">
                                <a href="#" className="nav-link search-icon d-flex align-items-center justify-content-center" data-toggle="modal" data-target="#searchModal" style={{ padding: '15px 10px' }}>
                                    <Search size={20} strokeWidth={2} />
                                </a>
                            </li>

                            <li className="nav-item cta ml-md-2 active">
                                <Link to="/donate" className="nav-link btn btn-primary px-4 py-3">
                                    {t('nav.donate')}
                                </Link>
                            </li>

                            {/* Language Switcher at the very end */}
                            <li
                                className={`nav-item dropdown lang-switcher ml-lg-2 ${activeDropdown === 'lang' ? 'is-active' : ''}`}
                                onMouseEnter={() => setActiveDropdown('lang')}
                            >
                                <a className="nav-link dropdown-toggle d-flex align-items-center" href="#" id="langDropdown" role="button"
                                    data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style={{ padding: '15px 10px' }}>
                                    <Globe
                                        size={20}
                                        className={
                                            hasLightBackground || (isHelpFaqPage && !isScrolled)
                                                ? 'text-dark'
                                                : 'text-white'
                                        }
                                    />
                                    <ChevronDown size={14} className={"ml-1 dropdown-chevron " + (hasLightBackground || (isHelpFaqPage && !isScrolled) ? 'text-dark' : 'text-white')} />
                                </a>
                                <div className="dropdown-menu dropdown-menu-right shadow border-0" aria-labelledby="langDropdown">
                                    {languages.map((lang) => (
                                        <button
                                            key={lang.code}
                                            className={"dropdown-item " + (language === lang.code ? 'active' : '')}
                                            onClick={() => setLanguage(lang.code as any)}
                                        >
                                            {lang.name}
                                        </button>
                                    ))}
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        </>
    );
};
