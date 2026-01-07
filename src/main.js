import './styles/style.css'

// 1. Import des librairies
import LocomotiveScroll from 'locomotive-scroll';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

// 2. Enregistrement du plugin GSAP
gsap.registerPlugin(ScrollTrigger);


// 3. Initialisation du Smooth Scroll (Locomotive)
const scroll = new LocomotiveScroll({
    el: document.querySelector('[data-scroll-container]'),
    smooth: true,
    multiplier: 1, // Vitesse du scroll (ex: 1.5 pour plus rapide)
    class: 'is-revealed' // Classe ajoutée automatiquement aux éléments data-scroll quand ils sont visibles
});

// --- LA CONNEXION IMPORTANTE ---
// Locomotive Scroll détourne le scroll natif. Il faut dire à GSAP ScrollTrigger
// de se baser sur Locomotive et non sur le navigateur.
scroll.on("scroll", ScrollTrigger.update);

ScrollTrigger.scrollerProxy("[data-scroll-container]", {
    scrollTop(value) {
        return arguments.length ? scroll.scrollTo(value, 0, 0) : scroll.scroll.instance.scroll.y;
    },
    getBoundingClientRect() {
        return {top: 0, left: 0, width: window.innerWidth, height: window.innerHeight};
    },
    pinType: document.querySelector("[data-scroll-container]").style.transform ? "transform" : "fixed"
});


// 4. Création des animations GSAP

// Exemple : Animer le titre du Hero au chargement
gsap.from(".title-animate", {
    y: 100, // Vient de 100px plus bas
    opacity: 0,
    duration: 1.5,
    ease: "power4.out",
    delay: 0.5
});

// Exemple : Faire apparaître les cartes projets quand on scrolle dessus
// On sélectionne tous les éléments avec la classe .gsap-reveal
gsap.utils.toArray('.gsap-reveal').forEach((elem) => {

    // Pour chaque élément, on crée une animation
    gsap.fromTo(elem,
        {
            // État de départ (caché, légèrement plus bas)
            autoAlpha: 0, // Combine opacity:0 et visibility:hidden
            y: 50
        },
        {
            // État d'arrivée (visible, à sa place)
            duration: 1,
            autoAlpha: 1,
            y: 0,
            ease: 'power2.out',
            // Le déclencheur :
            scrollTrigger: {
                trigger: elem, // C'est cet élément qui déclenche
                scroller: "[data-scroll-container]", // IMPORTANT : définir le conteneur Locomotive
                start: "top 80%", // L'animation commence quand le haut de l'élément atteint 80% de la hauteur de l'écran
                // markers: true, // <-- Décommente ça pour voir les repères de déclenchement en mode dev !
                toggleActions: "play none none reverse" // Joue l'anim à l'entrée, la joue à l'envers si on remonte
            }
        }
    );
});


// IMPORTANT : Rafraîchir ScrollTrigger après que tout soit chargé et calculé
ScrollTrigger.addEventListener("refresh", () => scroll.update());
ScrollTrigger.refresh();
