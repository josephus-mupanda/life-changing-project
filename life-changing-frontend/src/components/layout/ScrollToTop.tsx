import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        const scrollToTop = () => {
            const targets = [
                window,
                document.documentElement,
                document.body,
                document.querySelector('main'),
                document.querySelector('.app-container')
            ];

            targets.forEach(target => {
                if (target) {
                    if ('scrollTop' in target) {
                        (target as HTMLElement).scrollTop = 0;
                    } else if (target === window) {
                        window.scrollTo(0, 0);
                    }
                }
            });
        };

        // Immediate scroll
        scrollToTop();

        // Delayed scroll as a failsafe for late-rendering content
        const timeout = setTimeout(scrollToTop, 100);
        const longTimeout = setTimeout(scrollToTop, 300);

        return () => {
            clearTimeout(timeout);
            clearTimeout(longTimeout);
        };
    }, [pathname]);

    return null;
};
