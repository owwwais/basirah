// script.js — Basira landing page
document.addEventListener('DOMContentLoaded', () => {
    // Icons — a CDN failure must not take the rest of the page down with it
    try {
        if (window.lucide) lucide.createIcons();
    } catch (e) {
        console.warn('lucide icons unavailable', e);
    }

    // Auto year in footer
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Navbar scroll state
    const navbar = document.querySelector('.navbar');
    const onScroll = () => {
        navbar.classList.toggle('scrolled', window.scrollY > 30);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Reveal on scroll
    const revealElements = document.querySelectorAll('.reveal-up');
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealElements.forEach(el => revealObserver.observe(el));

    // Reveal anything already in view on load
    setTimeout(() => {
        revealElements.forEach(el => {
            if (el.getBoundingClientRect().top < window.innerHeight) {
                el.classList.add('active');
            }
        });
    }, 100);

    // Active nav link based on section in view
    const sections = document.querySelectorAll('section[id], header.hero');
    const navLinks = document.querySelectorAll('.nav-link');
    if (sections.length && navLinks.length) {
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    navLinks.forEach(link => {
                        link.classList.toggle('nav-link-active', link.getAttribute('href') === `#${id}`);
                    });
                }
            });
        }, { rootMargin: '-45% 0px -50% 0px' });
        sections.forEach(s => sectionObserver.observe(s));
    }

    // Dynamic Kashida (Tatweel) hover animation — frame-perfect via rAF
    document.querySelectorAll('.kashida-hover').forEach(el => {
        const prefix = el.getAttribute('data-prefix');
        const suffix = el.getAttribute('data-suffix');
        const maxKashidas = parseInt(el.getAttribute('data-count')) || 8;

        let currentKashidas = 0;
        let targetKashidas = 0;
        let animationFrame = null;
        let startTime = null;
        let startKashidas = 0;
        const duration = 250;

        const updateText = () => {
            el.innerText = prefix + 'ـ'.repeat(Math.round(currentKashidas)) + suffix;
        };

        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            currentKashidas = startKashidas + (targetKashidas - startKashidas) * easeProgress;
            updateText();
            if (progress < 1) animationFrame = requestAnimationFrame(animate);
        };

        const triggerAnimation = (target) => {
            if (animationFrame) cancelAnimationFrame(animationFrame);
            targetKashidas = target;
            startKashidas = currentKashidas;
            startTime = null;
            animationFrame = requestAnimationFrame(animate);
        };

        el.addEventListener('mouseenter', () => {
            el.classList.add('is-stretching');
            triggerAnimation(maxKashidas);
        });
        el.addEventListener('mouseleave', () => {
            el.classList.remove('is-stretching');
            triggerAnimation(0);
        });
    });

    // OS detection — dim the non-matching store button on mobile
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const isAndroid = /android/i.test(userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
    const btnAndroid = document.getElementById('btn-android');
    const btnIOS = document.getElementById('btn-ios');

    if (isAndroid && btnIOS) btnIOS.classList.add('dimmed-btn');
    else if (isIOS && btnAndroid) btnAndroid.classList.add('dimmed-btn');
});
