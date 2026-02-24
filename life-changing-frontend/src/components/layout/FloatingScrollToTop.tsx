import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
    isFooter?: boolean;
}

export const FloatingScrollToTop = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // Check multiple potential scrolling elements
            const winScroll = window.scrollY || window.pageYOffset;
            const docScroll = document.documentElement.scrollTop;
            const bodyScroll = document.body.scrollTop;
            const mainScroll = document.querySelector('main')?.scrollTop || 0;
            const appScroll = document.querySelector('.app-container')?.scrollTop || 0;

            const scroll = Math.max(winScroll, docScroll, bodyScroll, mainScroll, appScroll);
            setIsVisible(scroll > 150);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        // Also listen on potential containers
        const main = document.querySelector('main');
        const app = document.querySelector('.app-container');
        if (main) main.addEventListener('scroll', handleScroll, { passive: true });
        if (app) app.addEventListener('scroll', handleScroll, { passive: true });

        const interval = setInterval(handleScroll, 400);

        handleScroll();
        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (main) main.removeEventListener('scroll', handleScroll);
            if (app) app.removeEventListener('scroll', handleScroll);
            clearInterval(interval);
        };
    }, []);

    const scrollToTop = () => {
        // Attempt smoothing on all major scroll targets
        const targets = [window, document.documentElement, document.body, document.querySelector('main'), document.querySelector('.app-container')];

        targets.forEach(target => {
            if (target) {
                try {
                    target.scrollTo({ top: 0, behavior: 'smooth' });
                } catch (e) {
                    // Fallback for older browsers
                    if ('scrollTop' in target) {
                        (target as HTMLElement).scrollTop = 0;
                    } else if (target === window) {
                        window.scrollTo(0, 0);
                    }
                }
            }
        });
    };

    return (
        <motion.button
            onClick={scrollToTop}
            initial={false}
            animate={{
                opacity: isVisible ? 1 : 0,
                scale: isVisible ? 1 : 0.8,
                pointerEvents: isVisible ? 'auto' : 'none',
                y: isVisible ? 0 : 20
            }}
            transition={{ duration: 0.3 }}
            style={{
                position: 'fixed',
                bottom: '145px',
                right: '25px',
                width: '55px',
                height: '55px',
                borderRadius: '50%',
                backgroundColor: '#122f2b', // Match premium theme
                color: '#17d1ac', // Match emerald icon color
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid rgba(23, 209, 172, 0.3)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                cursor: 'pointer',
                zIndex: 999999,
                outline: 'none'
            }}
            whileHover={{ scale: 1.1, backgroundColor: '#17d1ac', color: '#122f2b' }}
            whileTap={{ scale: 0.9 }}
            title="Scroll to Top"
        >
            <ArrowUp size={28} />
        </motion.button>
    );
};
