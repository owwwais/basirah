// script.js
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons
    lucide.createIcons();
    
    // Navbar Scroll Effect
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Reveal Animations on Scroll
    const revealElements = document.querySelectorAll('.reveal-up');
    
    const revealCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    };
    
    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };
    
    const revealObserver = new IntersectionObserver(revealCallback, revealOptions);
    
    revealElements.forEach(el => {
        revealObserver.observe(el);
    });
    
    // Trigger animations for elements already in view on load
    setTimeout(() => {
        revealElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight) {
                el.classList.add('active');
            }
        });
    }, 100);

    // Dynamic Kashida (Tatweel) Hover Animation
    // Uses requestAnimationFrame for a buttery-smooth, 60fps+ frame-perfect stretch.
    document.querySelectorAll('.kashida-hover').forEach(el => {
        const prefix = el.getAttribute('data-prefix');
        const suffix = el.getAttribute('data-suffix');
        const maxKashidas = parseInt(el.getAttribute('data-count')) || 8;
        
        let currentKashidas = 0;
        let targetKashidas = 0;
        let animationFrame = null;
        let startTime = null;
        let startKashidas = 0;
        const duration = 250; // Total ms for a full stretch/shrink

        const updateText = () => {
            el.innerText = prefix + 'ـ'.repeat(Math.round(currentKashidas)) + suffix;
        };

        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            
            // Ease-out cubic for a smooth snap feel
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            
            currentKashidas = startKashidas + (targetKashidas - startKashidas) * easeProgress;
            updateText();

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
            }
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

    // OS Detection for Download Buttons
    // Dims the button that does not match the user's mobile OS.
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const isAndroid = /android/i.test(userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
    
    const btnAndroid = document.getElementById('btn-android');
    const btnIOS = document.getElementById('btn-ios');

    if (isAndroid) {
        if (btnIOS) btnIOS.classList.add('dimmed-btn');
    } else if (isIOS) {
        if (btnAndroid) btnAndroid.classList.add('dimmed-btn');
    }
    // If desktop (neither), leave both buttons fully visible.
});
