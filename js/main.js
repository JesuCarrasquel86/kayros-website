/* ============================================================
   KAYROS AI TECHNOLOGIES — Shared JavaScript
   ============================================================ */

/* ─── Load Global Components (Header & Footer) ─────────────── */
/**
 * Carga header.html y footer.html desde /components/ e inyecta
 * su HTML en los placeholders #site-header y #site-footer.
 * Después de la carga inicializa los módulos que dependen del DOM.
 */
async function loadComponents() {
    // Detectar la ruta base relativa según la profundidad de la URL
    const depth = window.location.pathname.split('/').filter(Boolean).length;
    const base = depth <= 1 ? './' : '../'.repeat(depth - 1);

    const targets = [
        { id: 'site-header', file: `${base}components/header.html` },
        { id: 'site-footer', file: `${base}components/footer.html` },
    ];

    await Promise.all(targets.map(async ({ id, file }) => {
        const el = document.getElementById(id);
        if (!el) return;
        try {
            const res = await fetch(file);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            el.innerHTML = await res.text();
        } catch (err) {
            console.warn(`[Kayros] No se pudo cargar ${file}:`, err);
        }
    }));

    // Inits que dependen del header/footer ya cargado
    setActiveNav();
    initMobileMenu();
    initScrollEffects();
}

/* ─── Active Nav Link ──────────────────────────────────────── */
function setActiveNav() {
    const rawPath = window.location.pathname.split('/').pop();
    const path = rawPath === '' ? 'index.html' : rawPath;

    document.querySelectorAll('.nav-link').forEach(link => {
        const href = (link.getAttribute('href') || '').split('/').pop();
        const isHome = (path === 'index.html' || path === '') && (href === 'index.html' || href === '');
        const isMatch = href === path;
        link.classList.toggle('active', isHome || isMatch);
    });
}

/* ─── Mobile Menu ──────────────────────────────────────────── */
function initMobileMenu() {
    const btn = document.getElementById('mobileMenuBtn');
    const nav = document.getElementById('mobileNav');
    if (!btn || !nav) return;

    btn.addEventListener('click', () => {
        nav.classList.toggle('open');
        const isOpen = nav.classList.contains('open');
        btn.setAttribute('aria-expanded', isOpen);
        const spans = btn.querySelectorAll('span');
        if (isOpen) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
        } else {
            spans[0].style.transform = '';
            spans[1].style.opacity = '';
            spans[2].style.transform = '';
        }
    });

    nav.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('open');
        });
    });
}

/* ─── Fixed Header & Socials on Scroll ─────────────────────── */
function initScrollEffects() {
    const navbar = document.getElementById('navbar');
    const fixedSocials = document.getElementById('fixedSocials');
    let lastScrollY = 0;

    window.addEventListener('scroll', () => {
        const current = window.scrollY;

        // Header transparency toggle (Home only)
        if (navbar && document.body.classList.contains('home-transparent-header')) {
            if (current > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }

        // Socials show/hide
        if (fixedSocials) {
            if (current > lastScrollY + 8) {
                fixedSocials.classList.add('hidden');
            } else if (current < lastScrollY - 8) {
                fixedSocials.classList.remove('hidden');
            }
        }

        lastScrollY = current <= 0 ? 0 : current;
    }, { passive: true });
}

/* ─── Modal ────────────────────────────────────────────────── */
function openModal() {
    const overlay = document.getElementById('modalOverlay');
    if (!overlay) return;
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const overlay = document.getElementById('modalOverlay');
    if (!overlay) return;
    overlay.classList.remove('active');
    document.body.style.overflow = '';
}

function initModal() {
    const overlay = document.getElementById('modalOverlay');
    if (!overlay) return;

    overlay.addEventListener('click', e => {
        if (e.target === overlay) closeModal();
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeModal();
    });
}

/* ─── Form Submit ──────────────────────────────────────────── */
async function handleFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const btn = form.querySelector('.form-submit');

    const name    = (form.querySelector('input[type="text"]') || {}).value?.trim() || '';
    const email   = (form.querySelector('input[type="email"]') || {}).value?.trim() || '';
    const phone   = (form.querySelector('input[type="tel"]') || {}).value?.trim() || '';
    const message = (form.querySelector('textarea') || {}).value?.trim() || '';

    btn.disabled = true;
    btn.textContent = 'Sending...';

    try {
        const res = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({
                access_key: '6e55a641-0b70-417e-93b4-6c8a3087d88d',
                subject: 'New Contact — Kayros AI Technology',
                from_name: name,
                email: email,
                to: 'info@kayrostech.com',
                message: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\n\nMessage:\n${message}`
            })
        });
        const data = await res.json();
        if (data.success) {
            btn.textContent = '✓ Message Sent!';
            btn.style.background = 'linear-gradient(135deg,#22c55e,#16a34a)';
            setTimeout(() => {
                closeModal();
                form.reset();
                btn.disabled = false;
                btn.textContent = 'Send Message →';
                btn.style.background = '';
            }, 2200);
        } else {
            throw new Error(data.message || 'Send failed');
        }
    } catch (err) {
        btn.textContent = '✗ Try again';
        btn.style.background = 'linear-gradient(135deg,#ef4444,#b91c1c)';
        setTimeout(() => {
            window.location.href = `mailto:info@kayrostech.com?subject=Contact%20%E2%80%94%20Kayros&body=Name:%20${encodeURIComponent(name)}%0AEmail:%20${encodeURIComponent(email)}%0APhone:%20${encodeURIComponent(phone)}%0A%0AMessage:%0A${encodeURIComponent(message)}`;
            btn.disabled = false;
            btn.textContent = 'Send Message →';
            btn.style.background = '';
        }, 2000);
    }
}

/* ─── Expandable Panels ────────────────────────────────────── */
function initExpandables() {
    document.querySelectorAll('.expand-trigger').forEach(trigger => {
        trigger.addEventListener('click', () => {
            const targetId = trigger.getAttribute('data-target');
            const panel = document.getElementById(targetId);
            if (!panel) return;

            const isOpen = panel.classList.contains('open');
            panel.classList.toggle('open', !isOpen);
            trigger.classList.toggle('open', !isOpen);

            const label = trigger.querySelector('.expand-label');
            if (label) {
                label.textContent = isOpen ? trigger.getAttribute('data-open-text') || 'Learn More' : (trigger.getAttribute('data-close-text') || 'Show Less');
            }
        });
    });
}

/* ─── Scroll-triggered Fade Animations ─────────────────────── */
function initScrollAnimations() {
    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.6s ease both';
                io.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    document.querySelectorAll('.scroll-reveal').forEach(el => {
        el.style.opacity = '0';
        io.observe(el);
    });
}

/* ─── Core Values Wheel ────────────────────────────────────── */
function initValuesWheel() {
    const nodes = document.querySelectorAll('.value-node');
    const detailTitle = document.getElementById('valueTitle');
    const detailText  = document.getElementById('valueText');
    if (!nodes.length || !detailTitle) return;

    nodes.forEach(node => {
        node.addEventListener('click', () => {
            nodes.forEach(n => n.classList.remove('active'));
            node.classList.add('active');
            detailTitle.textContent = node.getAttribute('data-title') || '';
            detailText.textContent  = node.getAttribute('data-desc') || '';
        });
    });

    if (nodes[0]) nodes[0].click();
}

/* ─── Countdown Timer ─────────────────────────────────────── */
function initCountdown() {
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    if (!daysEl) return;

    const target = new Date("2026-04-19T00:00:00").getTime();
    
    function tick() {
        const now = Date.now();
        const dist = target - now;
        if (dist < 0) return;
        
        const d = Math.floor(dist / 86400000);
        const h = Math.floor((dist % 86400000) / 3600000);
        const m = Math.floor((dist % 3600000) / 60000);
        const s = Math.floor((dist % 60000) / 1000);
        
        daysEl.textContent = String(d).padStart(2, '0');
        hoursEl.textContent = String(h).padStart(2, '0');
        minutesEl.textContent = String(m).padStart(2, '0');
        secondsEl.textContent = String(s).padStart(2, '0');
    }
    
    setInterval(tick, 1000);
    tick();
}

/* ─── High-Tech Reveal Animations ────────────────────────── */
function initHighTechAnimations() {
    if (typeof anime === 'undefined') return;

    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            const t = entry.target;

            if (t.classList.contains('features-grid')) {
                anime({
                    targets: '.feature-card',
                    translateY: [50, 0],
                    opacity: [0, 1],
                    easing: 'easeOutElastic(1, .6)',
                    duration: 1400,
                    delay: anime.stagger(120)
                });
            }
            if (t.id === 'featuresHeader' || t.id === 'countdownHeader') {
                anime({
                    targets: t,
                    translateY: [30, 0],
                    opacity: [0, 1],
                    easing: 'easeOutExpo',
                    duration: 900
                });
            }
            if (t.classList.contains('countdown-timer')) {
                anime({
                    targets: '.countdown-item',
                    translateY: [40, 0],
                    opacity: [0, 1],
                    easing: 'easeOutElastic(1, .5)',
                    duration: 1200,
                    delay: anime.stagger(150, { start: 200 })
                });
            }

            io.unobserve(t);
        });
    }, { threshold: 0.15 });

    const fGrid = document.querySelector('.features-grid');
    if (fGrid) io.observe(fGrid);

    const fHeader = document.getElementById('featuresHeader');
    if (fHeader) io.observe(fHeader);

    const cHeader = document.getElementById('countdownHeader');
    if (cHeader) io.observe(cHeader);

    const cTimer = document.querySelector('.countdown-timer');
    if (cTimer) io.observe(cTimer);
}

/* ─── DOMContentLoaded Init ────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Cargar header y footer globales (async)
    //    setActiveNav, initMobileMenu e initScrollSocials se ejecutan
    //    dentro de loadComponents() después del fetch.
    await loadComponents();

    // 2. Resto de funcionalidades de la página
    initModal();
    initExpandables();
    initScrollAnimations();
    initValuesWheel();
    initCountdown();
    initHighTechAnimations();
    // initScrollEffects(); // se llama dentro de loadComponents()
});
