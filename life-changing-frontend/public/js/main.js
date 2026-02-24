// loader dismissal - move to top for immediate execution
(function () {
	var removeLoader = function () {
		var loader = document.getElementById('ftco-loader');
		if (loader) {
			loader.classList.remove('show');
		}
	};
	setTimeout(removeLoader, 100);
	window.addEventListener('load', removeLoader);
	setTimeout(removeLoader, 2000);
})();

AOS.init({
	duration: 800,
	easing: 'slide'
});

(function ($) {

	"use strict";

	$(window).stellar({
		responsive: false,
		parallaxBackgrounds: true,
		parallaxElements: true,
		horizontalScrolling: false,
		hideDistantElements: false,
		scrollProperty: 'scroll'
	});


	var fullHeight = function () {

		$('.js-fullheight').css('height', $(window).height());
		$(window).resize(function () {
			$('.js-fullheight').css('height', $(window).height());
		});

	};
	fullHeight();

	// Scrollax
	$.Scrollax();

	var carousel = function () {
		$('.carousel-cause').owlCarousel({
			autoplay: true,
			center: true,
			loop: true,
			items: 1,
			margin: 30,
			stagePadding: 0,
			nav: true,
			navText: ['<span class="ion-ios-arrow-back">', '<span class="ion-ios-arrow-forward">'],
			responsive: {
				0: {
					items: 1,
					stagePadding: 0
				},
				600: {
					items: 2,
					stagePadding: 50
				},
				1000: {
					items: 3,
					stagePadding: 100
				}
			}
		});

	};
	carousel();

	$('nav .dropdown').hover(function () {
		var $this = $(this);
		// 	 timer;
		// clearTimeout(timer);
		$this.addClass('show');
		$this.find('> a').attr('aria-expanded', true);
		// $this.find('.dropdown-menu').addClass('animated-fast fadeInUp show');
		$this.find('.dropdown-menu').addClass('show');
	}, function () {
		var $this = $(this);
		// timer;
		// timer = setTimeout(function(){
		$this.removeClass('show');
		$this.find('> a').attr('aria-expanded', false);
		// $this.find('.dropdown-menu').removeClass('animated-fast fadeInUp show');
		$this.find('.dropdown-menu').removeClass('show');
		// }, 100);
	});


	$('#dropdown04').on('show.bs.dropdown', function () {
		console.log('show');
	});

	// scroll
	var scrollWindow = function () {
		$(window).scroll(function () {
			var $w = $(this),
				st = $w.scrollTop(),
				navbar = $('.ftco_navbar'),
				sd = $('.js-scroll-wrap');

			if (st > 150) {
				if (!navbar.hasClass('scrolled')) {
					navbar.addClass('scrolled');
				}
			}
			if (st < 150) {
				if (navbar.hasClass('scrolled')) {
					navbar.removeClass('scrolled sleep');
				}
			}
			if (st > 350) {
				if (!navbar.hasClass('awake')) {
					navbar.addClass('awake');
				}

				if (sd.length > 0) {
					sd.addClass('sleep');
				}
			}
			if (st < 350) {
				if (navbar.hasClass('awake')) {
					navbar.removeClass('awake');
					navbar.addClass('sleep');
				}
				if (sd.length > 0) {
					sd.removeClass('sleep');
				}
			}
		});
	};
	scrollWindow();

	var isMobile = {
		Android: function () {
			return navigator.userAgent.match(/Android/i);
		},
		BlackBerry: function () {
			return navigator.userAgent.match(/BlackBerry/i);
		},
		iOS: function () {
			return navigator.userAgent.match(/iPhone|iPad|iPod/i);
		},
		Opera: function () {
			return navigator.userAgent.match(/Opera Mini/i);
		},
		Windows: function () {
			return navigator.userAgent.match(/IEMobile/i);
		},
		any: function () {
			return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
		}
	};


	var counter = function () {

		$('#section-counter').waypoint(function (direction) {

			if (direction === 'down' && !$(this.element).hasClass('ftco-animated')) {

				var comma_separator_number_step = $.animateNumber.numberStepFactories.separator(',')
				$('.number').each(function () {
					var $this = $(this),
						num = $this.data('number');
					console.log(num);
					$this.animateNumber(
						{
							number: num,
							numberStep: comma_separator_number_step
						}, 7000
					);
				});

			}

		}, { offset: '95%' });

	}
	counter();

	var contentWayPoint = function () {
		var i = 0;
		$('.ftco-animate').waypoint(function (direction) {

			if (direction === 'down' && !$(this.element).hasClass('ftco-animated')) {

				i++;

				$(this.element).addClass('item-animate');
				setTimeout(function () {

					$('body .ftco-animate.item-animate').each(function (k) {
						var el = $(this);
						setTimeout(function () {
							var effect = el.data('animate-effect');
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
						}, k * 50, 'easeInOutExpo');
					});

				}, 100);

			}

		}, { offset: '95%' });
	};
	contentWayPoint();


	var OnePageNav = function () {
		$(".smoothscroll[href^='#'], #ftco-nav ul li a[href^='#']:not([data-toggle])").on('click', function (e) {
			e.preventDefault();

			var hash = this.hash,
				navToggler = $('.navbar-toggler');
			$('html, body').animate({
				scrollTop: $(hash).offset().top
			}, 700, 'easeInOutExpo', function () {
				window.location.hash = hash;
			});


			if (navToggler.is(':visible')) {
				navToggler.click();
			}
		});
		$('body').on('activate.bs.scrollspy', function () {
			console.log('nice');
		})
	};
	OnePageNav();


	// magnific popup
	$('.image-popup').magnificPopup({
		type: 'image',
		closeOnContentClick: true,
		closeBtnInside: false,
		fixedContentPos: true,
		mainClass: 'mfp-no-margins mfp-with-zoom', // class to remove default margin from left and right side
		gallery: {
			enabled: true,
			navigateByImgClick: true,
			preload: [0, 1] // Will preload 0 - before current, and 1 after the current image
		},
		image: {
			verticalFit: true
		},
		zoom: {
			enabled: true,
			duration: 300 // don't foget to change the duration also in CSS
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


	$('#appointment_date').datepicker({
		'format': 'm/d/yyyy',
		'autoclose': true
	});

	$('#appointment_time').timepicker();




	$('.search-form').on('submit', function (e) {
		e.preventDefault();
		var query = $(this).find('input').val();
		if (query) {
			alert('Searching for: ' + query + '\n(Search results would appear here in a production environment)');
		}
	});

	// Scroll to Top Logic
	var $scrollToTopBtn = $('#scrollToTop');
	$(window).scroll(function () {
		if ($(this).scrollTop() > 150) {
			$scrollToTopBtn.addClass('show');
		} else {
			$scrollToTopBtn.removeClass('show');
		}
	});

	$scrollToTopBtn.on('click', function (e) {
		e.preventDefault();
		$('html, body').animate({ scrollTop: 0 }, '300');
	});

	// Donation Amount Selection Logic - Copies selected amount to the input field
	var syncDonationAmount = function () {
		$('.donation-form').each(function () {
			var $form = $(this);
			var $activeBtn = $form.find('.btn-group-toggle .btn.active');
			if ($activeBtn.length > 0) {
				var amount = $activeBtn.find('input').val();
				$form.find('input[name="custom_amount"]').val(amount);
			}
		});
	};

	$('.donation-form .btn-group-toggle .btn').on('click', function () {
		var amount = $(this).find('input').val();
		$(this).closest('.donation-form').find('input[name="custom_amount"]').val(amount);
	});

	// Payment Method Switcher
	$(document).on('click', '.payment-box', function () {
		const method = $(this).data('method');
		const $parent = $(this).closest('.payment-methods');

		// Update UI
		$parent.find('.payment-box').removeClass('active').css({
			'background': 'transparent',
			'border-color': '#dee2e6'
		});

		let bgColor = 'rgba(108, 117, 125, 0.1)';
		let borderColor = '#6c757d';

		if (method === 'MoMo') { bgColor = 'rgba(255, 204, 0, 0.1)'; borderColor = '#FFCC00'; }
		else if (method === 'Bank Card') { bgColor = 'rgba(0, 123, 255, 0.1)'; borderColor = '#007bff'; }
		else if (method === 'Bank Account') { bgColor = 'rgba(40, 167, 69, 0.1)'; borderColor = '#28a745'; }

		$(this).addClass('active').css({
			'background': bgColor,
			'border-color': borderColor + ' !important'
		});

		$('#selectedPaymentMethod').val(method);

		// Update details container
		let detailsHtml = '';
		if (method === 'MoMo') {
			detailsHtml = `<div class="form-group momo-details"><input type="text" class="form-control" placeholder="MTN/Airtel Phone Number" style="border-radius: 8px;"></div>`;
		} else if (method === 'Bank Card') {
			detailsHtml = `
				<div class="row no-gutters">
					<div class="col-8 pr-1"><input type="text" class="form-control mb-2" placeholder="Card Number" style="border-radius: 8px;"></div>
					<div class="col-4 pl-1"><input type="text" class="form-control mb-2" placeholder="EXP" style="border-radius: 8px;"></div>
				</div>`;
		} else if (method === 'Bank Account') {
			detailsHtml = `<div class="form-group"><input type="text" class="form-control" placeholder="Account Name / Number" style="border-radius: 8px;"></div>`;
		} else {
			detailsHtml = `<p class="small text-muted mb-0">Please bring cash to our office in Bugesera.</p>`;
		}
		$('#payment-details-container').html(detailsHtml);
	});

	// Step Navigation Logic
	$(document).on('click', '#btn-goto-step-2', function () {
		// Simple validation for Step 1
		const fullName = $('input[name="full_name"]').val();
		const email = $('input[name="email"]').val();
		const amount = $('input[name="custom_amount"]').val();

		if (!fullName || !email || !amount) {
			alert('Please fill in all required fields (Name, Email, Amount).');
			return;
		}

		$('#donation-step-1').hide();
		$('#donation-step-2').fadeIn();
	});

	$(document).on('click', '#btn-back-to-step-1', function () {
		$('#donation-step-2').hide();
		$('#donation-step-1').fadeIn();
	});

	// Handle Donation Form Submission
	$(document).on('submit', '#donationForm', function (e) {
		e.preventDefault();
		const formData = {
			donorName: $(this).find('input[name="full_name"]').val(),
			email: $(this).find('input[name="email"]').val(),
			amount: $(this).find('input[name="custom_amount"]').val() || $(this).find('input[name="amount_pre"]:checked').val(),
			paymentMethod: $('#selectedPaymentMethod').val(),
			message: $(this).find('textarea[name="message"]').val(),
			cause: "General Fund"
		};

		if (typeof CMS !== 'undefined') {
			CMS.addDonation(formData);
			alert('Thank you, ' + formData.donorName + '! Your donation of $' + formData.amount + ' via ' + formData.paymentMethod + ' has been received.');
			$('#donationModal').modal('hide');

			// Reset form and steps
			this.reset();
			$('#donation-step-2').hide();
			$('#donation-step-1').show();

			// If on admin dashboard, sync it
			CMS.renderRecentDonations(CMS.getDonations());
		} else {
			alert('CMS not found. Donation saved locally.');
		}
	});

	// Sync when donation modal is shown
	$('#donationModal').on('shown.bs.modal', function () {
		syncDonationAmount();
		// Ensure we start at step 1 for re-opens without reload
		$('#donation-step-2').hide();
		$('#donation-step-1').show();
	});

	// Initial sync for non-modal forms if any
	syncDonationAmount();

})(jQuery);

