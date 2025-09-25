// Script JavaScript principal du site

// Insère l'année courante dans le footer
const anneeElement = document.getElementById('year');
if (anneeElement) {
    const annee = new Date().getFullYear();
    anneeElement.textContent = annee;
}

// Gestion du menu mobile
const boutonMenu = document.querySelector('.nav-toggle');
const monMenu = document.querySelector('.main-nav');
const mobileNav = document.querySelector('.mobile-nav');
const mobileNavClose = document.querySelector('.mobile-nav-close');
const navOverlay = document.querySelector('.nav-overlay');
const firstMobileLink = mobileNav ? mobileNav.querySelector('a') : null;
let lastTrigger = null;

const getFocusableElements = (container) => {
    if (!container) return [];
    return Array.from(container.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'));
};

const trapFocus = (container) => {
    const focusable = getFocusableElements(container);
    if (!focusable.length) return;
    const [first, last] = [focusable[0], focusable[focusable.length - 1]];

    const keyHandler = (e) => {
        if (e.key !== 'Tab') return;
        if (e.shiftKey) {
            if (document.activeElement === first) {
                e.preventDefault();
                last.focus();
            }
        } else {
            if (document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    };
    container.__focusHandler = keyHandler;
    container.addEventListener('keydown', keyHandler);
};

const releaseFocus = (container) => {
    if (!container || !container.__focusHandler) return;
    container.removeEventListener('keydown', container.__focusHandler);
    container.__focusHandler = null;
};

const menuStatus = document.getElementById('menuStatus');

const closeMobileNav = () => {
    if (!mobileNav) return;
    mobileNav.classList.remove('open');
    if (navOverlay) navOverlay.classList.remove('show');
    mobileNav.setAttribute('aria-hidden', 'true');
    if (navOverlay) navOverlay.setAttribute('aria-hidden', 'true');
    if (boutonMenu) boutonMenu.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('no-scroll');
    try {
        if (lastTrigger && typeof lastTrigger.focus === 'function') lastTrigger.focus();
    } catch (e) {}
    releaseFocus(mobileNav);
    if (menuStatus) menuStatus.textContent = 'Menu fermé';
};

if (boutonMenu && monMenu) {
    boutonMenu.addEventListener('click', () => {
        lastTrigger = boutonMenu;
        if (mobileNav) {
            mobileNav.classList.add('open');
            if (navOverlay) navOverlay.classList.add('show');
            mobileNav.setAttribute('aria-hidden', 'false');
            if (navOverlay) navOverlay.setAttribute('aria-hidden', 'false');
            boutonMenu.setAttribute('aria-expanded', 'true');
            document.body.classList.add('no-scroll');
            if (firstMobileLink) firstMobileLink.focus();
            trapFocus(mobileNav);
            if (menuStatus) menuStatus.textContent = 'Menu ouvert';
        } else {
            if (monMenu.style.display === 'block') {
                monMenu.style.display = '';
                boutonMenu.setAttribute('aria-expanded', 'false');
            } else {
                monMenu.style.display = 'block';
                boutonMenu.setAttribute('aria-expanded', 'true');
            }
        }
    });
}

if (mobileNavClose && mobileNav) mobileNavClose.addEventListener('click', closeMobileNav);
if (navOverlay) navOverlay.addEventListener('click', closeMobileNav);
if (mobileNav) {
    mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMobileNav));
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMobileNav();
});

// Comportement du bouton de navigation rapide
const quickBtn = document.querySelector('.quick-nav-btn');
const headerEl = document.querySelector('.site-header');
const headerSentinel = document.getElementById('header-sentinel');

if (quickBtn && headerEl) {
    const targetToObserve = headerSentinel || headerEl;
    const io = new IntersectionObserver((entries) => {
        entries.forEach(ent => {
            if (!ent.isIntersecting) {
                quickBtn.classList.add('show-quick');
            } else {
                quickBtn.classList.remove('show-quick');
            }
        });
    }, {
        root: null,
        threshold: 0
    });
    io.observe(targetToObserve);

    const updateQuickVisibilityByScroll = () => {
        try {
            const threshold = headerEl.offsetHeight || 120;
            if (window.scrollY > threshold) {
                quickBtn.classList.add('show-quick');
            } else {
                quickBtn.classList.remove('show-quick');
            }
        } catch (e) {}
    };

    window.addEventListener('scroll', updateQuickVisibilityByScroll, {
        passive: true
    });
    updateQuickVisibilityByScroll();

    quickBtn.addEventListener('click', () => {
        try {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        } catch (e) {
            window.scrollTo(0, 0);
        }
        setTimeout(() => {
            try {
                if (boutonMenu && typeof boutonMenu.focus === 'function') boutonMenu.focus();
            } catch (e) {}
        }, 600);
    });
    document.addEventListener('menuClosed', () => {
        if (quickBtn) quickBtn.setAttribute('aria-expanded', 'false');
    });
}

// Implémentation du défilement fluide pour les liens internes
const liensInternes = document.querySelectorAll('a[href^="#"]');
liensInternes.forEach(lien => {
    lien.addEventListener('click', (event) => {
        event.preventDefault();
        const cibleId = lien.getAttribute('href');
        const cibleElement = document.querySelector(cibleId);
        if (cibleElement) {
            cibleElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Gestion du formulaire de contact
const leFormulaire = document.getElementById('contactForm');
if (leFormulaire) {
    const zoneMessage = document.getElementById('formMessage');

    leFormulaire.addEventListener('submit', (e) => {
        e.preventDefault();

        if (!leFormulaire.checkValidity()) {
            leFormulaire.reportValidity();
            if (zoneMessage) {
                zoneMessage.textContent = 'Veuillez remplir correctement le formulaire, s\'il vous plaît.';
            }
            return;
        }

        if (zoneMessage) {
            zoneMessage.textContent = 'Envoi en cours... un instant...';
        }

        setTimeout(() => {
            if (zoneMessage) {
                zoneMessage.textContent = 'Merci pour votre message ! Nous vous répondrons bientôt.';
            }
            leFormulaire.reset();
        }, 1000);
    });
}

// Gestion du carrousel de témoignages
const gererCarrousel = () => {
    const conteneurCarrousel = document.querySelector('.testimonials');
    if (!conteneurCarrousel) return;

    const tousLesTemoignages = document.querySelectorAll('.testimonial');
    const boutonPrecedent = document.querySelector('[data-prev]');
    const boutonSuivant = document.querySelector('[data-next]');
    let indexActuel = 0;

    const afficherTemoignage = (index) => {
        tousLesTemoignages.forEach((temoignage, i) => {
            if (i === index) {
                temoignage.classList.add('active');
            } else {
                temoignage.classList.remove('active');
            }
        });
    };

    afficherTemoignage(indexActuel);

    if (boutonPrecedent) {
        boutonPrecedent.addEventListener('click', () => {
            indexActuel--;
            if (indexActuel < 0) {
                indexActuel = tousLesTemoignages.length - 1;
            }
            afficherTemoignage(indexActuel);
        });
    }

    if (boutonSuivant) {
        boutonSuivant.addEventListener('click', () => {
            indexActuel++;
            if (indexActuel >= tousLesTemoignages.length) {
                indexActuel = 0;
            }
            afficherTemoignage(indexActuel);
        });
    }

    let intervalleAutomatique;

    const demarrerCarrouselAutomatique = () => {
        intervalleAutomatique = setInterval(() => {
            indexActuel++;
            if (indexActuel >= tousLesTemoignages.length) {
                indexActuel = 0;
            }
            afficherTemoignage(indexActuel);
        }, 6000);
    };

    const arreterCarrouselAutomatique = () => {
        clearInterval(intervalleAutomatique);
    };

    demarrerCarrouselAutomatique();

    conteneurCarrousel.addEventListener('mouseover', arreterCarrouselAutomatique);
    conteneurCarrousel.addEventListener('mouseout', demarrerCarrouselAutomatique);
};

gererCarrousel();