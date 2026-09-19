(function ($) {
    "use strict";

    // Spinner
    var spinner = function () {
        setTimeout(function () {
            if ($('#spinner').length > 0) {
                $('#spinner').removeClass('show');
            }
        }, 1);
    };
    spinner();

    // Keep the More menu in document flow on phones so Popper cannot
    // park it off-screen or clip it against overflow-x: clip.
    $('.navbar .dropdown-toggle').attr('data-bs-display', 'static').on('click', function (e) {
        var href = this.getAttribute('href') || '';
        if (href === '#' || href === '#!') {
            e.preventDefault();
        }
    });
    
    
    // Sticky Navbar — pin the gold bar after the topbar leaves the viewport
    var $navBar = $('.nav-bar');
    var $navWrap = $navBar.parent();
    var pinNav = function () {
        if (!$navBar.length) return;
        var topBarH = $('.top-bar').outerHeight() || 90;
        var y = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
        if (y > topBarH) {
            if (!$navBar.hasClass('fixed-top')) {
                $navWrap.css('min-height', $navBar.outerHeight());
            }
            $navBar.addClass('fixed-top').css({
                padding: '0',
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                width: '100%',
                zIndex: 1030,
                transform: 'none'
            });
        } else {
            $navBar.removeClass('fixed-top').css({
                padding: '',
                position: '',
                top: '',
                left: '',
                right: '',
                width: '',
                zIndex: '',
                transform: ''
            });
            $navWrap.css('min-height', '');
        }
    };
    $(window).on('scroll resize', pinNav);
    document.addEventListener('scroll', pinNav, { passive: true });
    pinNav();

    // Initiate the wowjs
    try { new WOW().init(); } catch (err) {}
    
    
    // Back to top button
    $(window).scroll(function () {
        if ($(this).scrollTop() > 300) {
            $('.back-to-top').stop(true, true).fadeIn('slow').css('display', 'flex');
        } else {
            $('.back-to-top').stop(true, true).fadeOut('slow');
        }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
        return false;
    });
    // Show immediately if page is already scrolled (e.g. refresh mid-page)
    if ($(window).scrollTop() > 300) {
        $('.back-to-top').css('display', 'flex').show();
    }

    // Modal Video
    $(document).ready(function () {
        var $videoSrc;
        $('.btn-play').click(function () {
            $videoSrc = $(this).data("src");
        });
        console.log($videoSrc);

        $('#videoModal').on('shown.bs.modal', function (e) {
            $("#video").attr('src', $videoSrc + "?autoplay=1&amp;modestbranding=1&amp;showinfo=0");
        })

        $('#videoModal').on('hide.bs.modal', function (e) {
            $("#video").attr('src', $videoSrc);
        })
    });


    // Facts counter
    $('[data-toggle="counter-up"]').counterUp({
        delay: 10,
        time: 2000
    });


    // Donation progress
    $('.donation-item .donation-progress').waypoint(function () {
        $('.donation-item .progress .progress-bar').each(function () {
            $(this).css("height", $(this).attr("aria-valuenow") + '%');
        });
    }, {offset: '80%'});


    // Header carousel
    $(".header-carousel").owlCarousel({
        animateOut: 'rotateOutUpRight',
        animateIn: 'rotateInDownLeft',
        items: 1,
        autoplay: true,
        smartSpeed: 1000,
        dots: false,
        loop: true,
        nav : true,
        navText : [
            '<i class="bi bi-chevron-left"></i>',
            '<i class="bi bi-chevron-right"></i>'
        ]
    });


    // Testimonials carousel
    $(".testimonial-carousel").owlCarousel({
        items: 1,
        autoplay: true,
        smartSpeed: 1000,
        animateIn: 'fadeIn',
        animateOut: 'fadeOut',
        dots: false,
        loop: true,
        nav: true,
        navText : [
            '<i class="bi bi-chevron-left"></i>',
            '<i class="bi bi-chevron-right"></i>'
        ]
    });

    
})(jQuery);
