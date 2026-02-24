import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLegacyScripts } from '../hooks/UseLegacyScripts';
import { HelpCircle, MessageCircle, Mail, Phone, MapPin, ChevronRight, ChevronDown, Plus, Minus } from 'lucide-react';

export const HelpFaqPage = () => {
    useLegacyScripts();

    // State for tracking active regular FAQ item
    const [activeIndex, setActiveIndex] = useState<number | null>(0);

    const toggleAccordion = (index: number) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    const faqs = [
        {
            question: "How can I become a volunteer with LCEO?",
            answer: "You can become a volunteer by filling out the application form on our Home page or Contact page. Our team reviews all applications to match skills with our current program needs, ensuring a meaningful experience for both you and the community."
        },
        {
            question: "Where do my donations go?",
            answer: "100% of public donations directly fund our core programs: scholarships for girls, business grants for mothers, and mental health counseling sessions in Bugesera District. We maintain full transparency with regular impact reports."
        },
        {
            question: "How do you select your beneficiaries?",
            answer: "We work closely with local community leaders to identify vulnerable young women and girls who are most in need of education or economic support. Final selection is based on our holistic merit-and-need framework."
        },
        {
            question: "Can I visit the LCEO project sites?",
            answer: "Yes, we welcome pre-arranged visits from partners and donors. Please contact our main office in Kigali or use our contact form to schedule a site visit in Bugesera."
        },
        {
            question: "Is my donation tax-deductible?",
            answer: "LCEO is a registered non-profit organization in Rwanda. We provide official receipts for all donations which can be used for tax purposes according to local regulations."
        }
    ];

    return (
        <div style={{ backgroundColor: '#fff', minHeight: '100vh', paddingBottom: '100px' }}>

            {/* 1. New Two-Column Hero Section */}
            <div className="container" style={{ paddingTop: '120px', paddingBottom: '80px' }}>
                <div className="row align-items-center">
                    {/* Left Column: Text Content */}
                    <div className="col-lg-6 mb-5 mb-lg-0 pr-lg-5 ftco-animate">
                        <h1 style={{
                            fontSize: '3.5rem',
                            fontWeight: '700',
                            lineHeight: '1.1',
                            color: '#122f2b',
                            marginBottom: '20px',
                            letterSpacing: '-1px'
                        }}>
                            Frequently Asked<br />
                            Questions & Support
                        </h1>
                        <p style={{
                            fontSize: '1.1rem',
                            color: '#555',
                            lineHeight: '1.6',
                            marginBottom: '30px',
                            maxWidth: '90%'
                        }}>
                            Find answers to common questions about our mission, programs, and how you can get involved.
                            We are dedicated to transparency and are here to help you understand our impact.
                        </p>
                        <Link to="/contact" className="btn btn-primary px-4 py-3" style={{
                            backgroundColor: '#076c5b',
                            borderColor: '#076c5b',
                            borderRadius: '4px',
                            fontWeight: '600',
                            fontSize: '1rem',
                            boxShadow: '0 4px 6px rgba(7, 108, 91, 0.2)'
                        }}>
                            Contact Support Team
                        </Link>
                    </div>

                    {/* Right Column: Image */}
                    <div className="col-lg-6 ftco-animate">
                        <div style={{
                            borderRadius: '24px',
                            overflow: 'hidden',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                            position: 'relative',
                            height: '500px'
                        }}>
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundImage: "url('/images/testimonial1.jpg')",
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                            }}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Minimal Accordion Section */}
            <div className="container" style={{ paddingBottom: '100px' }}>
                <div className="row mb-5">
                    <div className="col-md-12">
                        <h3 style={{
                            fontSize: '1.5rem',
                            fontWeight: '600',
                            color: '#333',
                            marginBottom: '10px'
                        }}>
                            Common questions about our impact
                        </h3>
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-12">
                        <div className="faq-list">
                            {faqs.map((faq, index) => {
                                const isOpen = activeIndex === index;
                                return (
                                    <div key={index} style={{
                                        borderTop: '1px solid #e5e7eb',
                                        transition: 'all 0.3s ease'
                                    }}>
                                        <div
                                            onClick={() => toggleAccordion(index)}
                                            style={{
                                                padding: '25px 0',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between'
                                            }}
                                        >
                                            <div className="d-flex align-items-center">
                                                <span style={{
                                                    color: isOpen ? '#076c5b' : '#076c5b',
                                                    fontWeight: '600',
                                                    marginRight: '15px',
                                                    fontSize: '1.2rem'
                                                }}>
                                                    {isOpen ? <Minus size={24} strokeWidth={1.5} /> : <Plus size={24} strokeWidth={1.5} />}
                                                </span>
                                                <h4 className="mb-0" style={{
                                                    fontSize: '1.1rem',
                                                    fontWeight: '600',
                                                    color: '#122f2b',
                                                    lineHeight: '1.4'
                                                }}>
                                                    {index + 1}. {faq.question}
                                                </h4>
                                            </div>
                                        </div>

                                        <div style={{
                                            height: isOpen ? 'auto' : '0',
                                            overflow: 'hidden',
                                            transition: 'height 0.3s ease'
                                        }}>
                                            <div style={{
                                                padding: '0 0 30px 40px',
                                                color: '#4b5563',
                                                lineHeight: '1.7',
                                                fontSize: '1rem',
                                                maxWidth: '900px'
                                            }}>
                                                {faq.answer}
                                                <ul className="mt-3 mb-0 pl-3" style={{ listStyleType: 'disc', color: '#4b5563' }}>
                                                    <li className="mb-1">Detailed response available in our reports.</li>
                                                    <li className="mb-1">Contact us for more specific information.</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div style={{ borderTop: '1px solid #e5e7eb' }}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Elements (Retained as per general practice unless removed) */}
            {/* Floating Book Demo (Red Ribbon) UI Replacement */}
            <div style={{ position: 'fixed', right: '0', top: '50%', transform: 'translateY(-50%)', zIndex: 1000 }} className="d-none d-lg-block">
                <div className="d-flex align-items-center">
                    <div style={{ backgroundColor: '#fff', padding: '10px', border: '1px solid #eee', borderRight: 'none', borderBottomLeftRadius: '8px', borderTopLeftRadius: '8px', boxShadow: '-5px 0 15px rgba(0,0,0,0.05)' }}>
                        <ChevronRight size={16} strokeWidth={1.5} />
                    </div>
                    <div style={{
                        backgroundColor: '#e91e63',
                        color: '#fff',
                        padding: '15px 10px',
                        writingMode: 'vertical-rl',
                        textTransform: 'uppercase',
                        fontWeight: 'bold',
                        letterSpacing: '2px',
                        fontSize: '12px',
                        cursor: 'pointer'
                    }}>
                        Support LCEO
                    </div>
                </div>
            </div>
        </div>
    );
};
