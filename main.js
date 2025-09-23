// Script JavaScript principal du site

// Insère l'année courante dans le footer
// Recherche de l'élément avec l'id "year"
var anneeElement = document.getElementById('year');
// Vérification de la présence de l'élément
if (anneeElement) {
    // Si oui, je mets l'année actuelle dedans
    var annee = new Date().getFullYear();
    anneeElement.textContent = annee;
}

// Gestion du menu mobile
// Récupération du bouton et du menu
var boutonMenu = document.querySelector('.nav-toggle');
var monMenu = document.querySelector('.main-nav');
var mobileNav = document.querySelector('.mobile-nav');
var mobileNavClose = document.querySelector('.mobile-nav-close');
var navOverlay = document.querySelector('.nav-overlay');
var firstMobileLink = mobileNav ? mobileNav.querySelector('a') : null;
var lastTrigger = null; // élément ayant déclenché l'ouverture (pour restaurer le focus)
// utilitaires pour piéger le focus (focus trap)
function getFocusableElements(container) {
    if (!container) return [];
    return Array.prototype.slice.call(container.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'));
}

function trapFocus(container) {
    var focusable = getFocusableElements(container);
    if (!focusable.length) return;
    var first = focusable[0],
        last = focusable[focusable.length - 1];

    function keyHandler(e) {
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
    }
    container.__focusHandler = keyHandler;
    container.addEventListener('keydown', keyHandler);
}

function releaseFocus(container) {
    if (!container || !container.__focusHandler) return;
    container.removeEventListener('keydown', container.__focusHandler);
    container.__focusHandler = null;
}
var menuStatus = document.getElementById('menuStatus');

// S'assure que les éléments existent pour éviter les erreurs
if (boutonMenu && monMenu) {
    // Ajoute un écouteur 'click' sur le bouton
    boutonMenu.addEventListener('click', function() {
        lastTrigger = this;
        // Si on a une navigation mobile off-canvas, on l'ouvre
        if (mobileNav) {
            mobileNav.classList.add('open');
            if (navOverlay) navOverlay.classList.add('show');
            mobileNav.setAttribute('aria-hidden', 'false');
            if (navOverlay) navOverlay.setAttribute('aria-hidden', 'false');
            boutonMenu.setAttribute('aria-expanded', 'true');
            // lock scroll
            document.body.classList.add('no-scroll');
            // focus first link for keyboard users
            if (firstMobileLink) firstMobileLink.focus();
            // trap focus inside menu
            trapFocus(mobileNav);
            // announce to screen readers
            if (menuStatus) menuStatus.textContent = 'Menu ouvert';
        } else {
            // fallback : bascule l'affichage de la navigation principale
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

// gestionnaires de fermeture pour la navigation mobile
if (mobileNavClose && mobileNav) mobileNavClose.addEventListener('click', closeMobileNav);
if (navOverlay) navOverlay.addEventListener('click', closeMobileNav);

// fermer en cliquant sur un lien à l'intérieur de la navigation mobile
if (mobileNav) mobileNav.querySelectorAll('a').forEach(function(a) {
    a.addEventListener('click', closeMobileNav);
});

// fermer avec la touche Échap (ESC)
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeMobileNav();
});

function closeMobileNav() {
    if (!mobileNav) return;
    mobileNav.classList.remove('open');
    if (navOverlay) navOverlay.classList.remove('show');
    mobileNav.setAttribute('aria-hidden', 'true');
    if (navOverlay) navOverlay.setAttribute('aria-hidden', 'true');
    if (boutonMenu) boutonMenu.setAttribute('aria-expanded', 'false');
    // autoriser à nouveau le défilement de la page
    document.body.classList.remove('no-scroll');
    // restore focus to the element that opened the menu
    try {
        if (lastTrigger && typeof lastTrigger.focus === 'function') lastTrigger.focus();
    } catch (e) {}
    // libérer le focus trap
    releaseFocus(mobileNav);
    if (menuStatus) menuStatus.textContent = 'Menu fermé';
}

// Comportement du bouton de navigation rapide : apparaît quand l'en-tête n'est pas visible, effectue un scroll vers l'en-tête au clic
var quickBtn = document.querySelector('.quick-nav-btn');
var headerEl = document.querySelector('.site-header');
var headerSentinel = document.getElementById('header-sentinel');
if (quickBtn && headerEl) {
    // observe header visibility
    var targetToObserve = headerSentinel || headerEl;
    var io = new IntersectionObserver(function(entries) {
        entries.forEach(function(ent) {
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

    // Fallback: if IntersectionObserver does not behave as expected on some devices,
    // Fallback : si IntersectionObserver ne se comporte pas comme prévu sur certains appareils,
    // utiliser la position de scroll : afficher le bouton quand on a défilé au-delà de la hauteur de l'en-tête.
    function updateQuickVisibilityByScroll() {
        try {
            var threshold = headerEl.offsetHeight || 120;
            if (window.scrollY > threshold) {
                quickBtn.classList.add('show-quick');
            } else {
                quickBtn.classList.remove('show-quick');
            }
        } catch (e) {}
    }
    window.addEventListener('scroll', updateQuickVisibilityByScroll, {
        passive: true
    });
    // initial check
    updateQuickVisibilityByScroll();

    quickBtn.addEventListener('click', function() {
        // faire un scroll fluide jusqu'au tout début de la page (top: 0)
        try {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        } catch (e) {
            // fallback si scrollTo avec options non supporté
            window.scrollTo(0, 0);
        }
        // après un court délai, donner le focus au bouton hamburger pour accessibilité
        setTimeout(function() {
            try {
                if (boutonMenu && typeof boutonMenu.focus === 'function') boutonMenu.focus();
            } catch (e) {}
        }, 600);
    });
    // when menu is closed elsewhere, ensure quickBtn aria state is reset
    document.addEventListener('menuClosed', function() {
        if (quickBtn) quickBtn.setAttribute('aria-expanded', 'false');
    });
}

// Implémentation du défilement fluide pour les liens internes
// Récupération de tous les liens commençant par '#'
var liensInternes = document.querySelectorAll('a[href^="#"]');

// Je parcours chaque lien pour ajouter un écouteur d'événement
for (var i = 0; i < liensInternes.length; i++) {
    liensInternes[i].addEventListener('click', function(event) {
        // Empêche le comportement par défaut
        event.preventDefault();

        // Je trouve l'ID de la cible
        var cibleId = this.getAttribute('href');
        var cibleElement = document.querySelector(cibleId);

        // Si la cible existe, je fais le scroll
        if (cibleElement) {
            cibleElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
}

// Gestion du formulaire de contact
var leFormulaire = document.getElementById('contactForm');
if (leFormulaire) {
    var zoneMessage = document.getElementById('formMessage');

    leFormulaire.addEventListener('submit', function(e) {
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

        // Simulation de l'envoi du formulaire avec un petit délai
        setTimeout(function() {
            if (zoneMessage) {
                zoneMessage.textContent = 'Merci pour votre message ! Nous vous répondrons bientôt.';
            }
            leFormulaire.reset();
        }, 1000); // J'ai mis 1000ms (1 seconde)
    });
}

// Gestion du carrousel de témoignages
// Encapsulation du code dans une fonction pour plus de clarté

function gererCarrousel() {

    // Étape 1 : Je récupère les éléments HTML dont j'ai besoin

    var conteneurCarrousel = document.querySelector('.testimonials');
    // Si je ne trouve pas le carrousel, je m'arrête là pour éviter les erreurs.
    if (!conteneurCarrousel) {
        return;
    }

    var tousLesTemoignages = document.querySelectorAll('.testimonial');

    var boutonPrecedent = document.querySelector('[data-prev]');
    var boutonSuivant = document.querySelector('[data-next]');

    // Étape 2 : conservation de l'index du témoignage affiché

    var indexActuel = 0;

    // Étape 3 : fonction d'affichage d'un témoignage

    function afficherTemoignage(index) {
        // Parcours de tous les témoignages et affichage du bon élément
        for (var i = 0; i < tousLesTemoignages.length; i++) {
            var temoignage = tousLesTemoignages[i];
            if (i === index) {
                temoignage.classList.add('active'); // ajoute la classe 'active'
            } else {
                temoignage.classList.remove('active'); // retire la classe sinon
            }
        }
    }

    // J'affiche le premier témoignage au début
    afficherTemoignage(indexActuel);

    // Étape 4 : J'ajoute des événements aux boutons

    // Quand on clique sur le bouton "Précédent"
    if (boutonPrecedent) {
        boutonPrecedent.addEventListener('click', function() {
            indexActuel--; // Je diminue l'index
            // Si l'index devient négatif, je reviens au dernier témoignage
            if (indexActuel < 0) {
                indexActuel = tousLesTemoignages.length - 1;
            }
            afficherTemoignage(indexActuel); // J'affiche le nouveau témoignage
        });
    }

    // Quand on clique sur le bouton "Suivant"
    if (boutonSuivant) {
        boutonSuivant.addEventListener('click', function() {
            indexActuel++; // J'augmente l'index
            // Si l'index dépasse la fin, je reviens au premier témoignage
            if (indexActuel >= tousLesTemoignages.length) {
                indexActuel = 0;
            }
            afficherTemoignage(indexActuel); // J'affiche le nouveau témoignage
        });
    }

    // Étape 5 : défilement automatique

    var intervalleAutomatique;

    function demarrerCarrouselAutomatique() {
        // utilise setInterval pour changer de témoignage toutes les 6 secondes
        intervalleAutomatique = setInterval(function() {
            indexActuel++;
            if (indexActuel >= tousLesTemoignages.length) {
                indexActuel = 0;
            }
            afficherTemoignage(indexActuel);
        }, 6000);
    }

    function arreterCarrouselAutomatique() {
        clearInterval(intervalleAutomatique);
    }

    // démarrage initial du carrousel
    demarrerCarrouselAutomatique();

    // arrêt du défilement quand la souris est sur le carrousel
    conteneurCarrousel.addEventListener('mouseover', arreterCarrouselAutomatique);
    // reprise du défilement quand la souris quitte le carrousel
    conteneurCarrousel.addEventListener('mouseout', demarrerCarrouselAutomatique);

}

// Je lance la fonction pour démarrer le carrousel
gererCarrousel();