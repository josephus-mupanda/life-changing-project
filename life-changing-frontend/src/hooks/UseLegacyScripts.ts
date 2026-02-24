import { useEffect } from 'react';

declare global {
    interface Window {
        $: any;
        jQuery: any;
        AOS: any;
    }
}

export function useLegacyScripts(dependencies: any[] = []) {
    useEffect(() => {
        const $ = window.jQuery;
        if (!$) return;

        // Helper to ensure plugins are loaded
        const safeExecute = (name: string, fn: () => void) => {
            try {
                fn();
            } catch (e) {
                console.warn(`Legacy script error in ${name}:`, e);
            }
        };

        // AOS Init - Optimized for smooth animations
        if (window.AOS) {
            window.AOS.init({
                duration: 600, // Reduced from 800ms for snappier animations
                easing: 'ease-out-cubic', // Changed from 'slide' for smoother motion
                once: true, // Animate only once for better performance
                offset: 100, // Trigger animations earlier
                delay: 0, // Remove default delay
                disable: false
            });
        }

        // Stellar (Parallax)
        safeExecute('Stellar', () => {
            if ($(window).data('plugin_stellar')) {
                $(window).data('plugin_stellar').destroy();
                $(window).off('stellar');
            }
            $(window).stellar({
                responsive: false,
                parallaxBackgrounds: true,
                parallaxElements: true,
                horizontalScrolling: false,
                hideDistantElements: false,
                scrollProperty: 'scroll'
            });
        });

        // Full Height
        const fullHeight = function () {
            $('.js-fullheight').css('height', $(window).height());
            $(window).resize(function () {
                $('.js-fullheight').css('height', $(window).height());
            });
        };
        fullHeight();

        // Scrollax
        safeExecute('Scrollax', () => {
            $.Scrollax();
        });

        // Carousel - Fixed initialization
        safeExecute('OwlCarousel', () => {
            const $carousel = $('.carousel-cause');

            // Only destroy if carousel is actually initialized
            if ($carousel.length && $carousel.hasClass('owl-loaded')) {
                try {
                    $carousel.trigger('destroy.owl.carousel');
                    $carousel.removeClass('owl-loaded owl-drag owl-grab');
                } catch (e) {
                    console.warn('OwlCarousel destroy warning:', e);
                }
            }

            // Initialize carousel
            if ($carousel.length) {
                $carousel.owlCarousel({
                    autoplay: true,
                    center: true,
                    loop: true,
                    items: 1,
                    margin: 30,
                    stagePadding: 0,
                    nav: true,
                    navText: ['<span class="ion-ios-arrow-back">', '<span class="ion-ios-arrow-forward">'],
                    responsive: {
                        0: { items: 1, stagePadding: 0 },
                        600: { items: 2, stagePadding: 50 },
                        1000: { items: 3, stagePadding: 100 }
                    }
                });
            }
        });

        // Counter
        safeExecute('Counter', () => {
            $('#section-counter').waypoint(function (this: any, direction: string) {
                if (direction === 'down' && !$(this.element).hasClass('ftco-animated')) {
                    const comma_separator_number_step = $.animateNumber.numberStepFactories.separator(',')
                    $('.number').each(function (this: any) {
                        const $this = $(this),
                            num = $this.data('number');
                        $this.animateNumber(
                            {
                                number: num,
                                numberStep: comma_separator_number_step
                            }, 7000
                        );
                    });
                }
            }, { offset: '95%' });
        });

        // Content Waypoint - Optimized for smoother animations
        safeExecute('ContentWaypoint', () => {
            $('.ftco-animate').waypoint(function (this: any, direction: string) {
                if (direction === 'down' && !$(this.element).hasClass('ftco-animated')) {
                    // Remove item-animate if it exists from previous run
                    $(this.element).removeClass('item-animate');

                    $(this.element).addClass('item-animate');
                    setTimeout(function () {
                        $('body .ftco-animate.item-animate').each(function (this: any, k: number) {
                            const el = $(this);
                            setTimeout(function () {
                                const effect = el.data('animate-effect');
                                if (effect === 'fadeIn') {
                                    el.addClass('fadeIn ftco-animated');
                                } else if (effect === 'fadeInLeft') {
                                    el.addClass('fadeInLeft ftco-animated');
                                } else if (effect === 'fadeInRight') {
                                    el.addClass('fadeInRight ftco-animated');
                                } else {
                                    el.addClass('fadeInUp ftco-animated');
                                }
                                el.removeClass('item-animate');
                            }, k * 30, 'easeInOutExpo'); // Reduced from 50ms to 30ms for smoother cascade
                        });
                    }, 50); // Reduced from 100ms to 50ms for faster initial trigger
                }
            }, { offset: '85%' }); // Changed from 95% to 85% so animations trigger earlier
        });

        // Magnific Popup
        safeExecute('MagnificPopup', () => {
            $('.image-popup').magnificPopup({
                type: 'image',
                closeOnContentClick: true,
                closeBtnInside: false,
                fixedContentPos: true,
                mainClass: 'mfp-no-margins mfp-with-zoom',
                gallery: {
                    enabled: true,
                    navigateByImgClick: true,
                    preload: [0, 1]
                },
                image: {
                    verticalFit: true
                },
                zoom: {
                    enabled: true,
                    duration: 300
                }
            });

            $('.popup-youtube, .popup-vimeo, .popup-gmaps').magnificPopup({
                disableOn: 700,
                type: 'iframe',
                mainClass: 'mfp-fade',
                removalDelay: 160,
                preloader: false,
                fixedContentPos: false
            });
        });

        // Datepicker & Timepicker
        safeExecute('Pickers', () => {
            if ($('#appointment_date').length) {
                $('#appointment_date').datepicker({
                    'format': 'm/d/yyyy',
                    'autoclose': true
                });
            }
            if ($('#appointment_time').length) {
                $('#appointment_time').timepicker();
            }
        });

    }, dependencies);
}
