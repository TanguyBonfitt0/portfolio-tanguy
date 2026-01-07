import '@splinetool/viewer'; // <--- AJOUTE CETTE LIGNE EN PREMIER
import './styles/style.css'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import LocomotiveScroll from 'locomotive-scroll'

// ... le reste de ton code ne change pas ...

// 1. Enregistrer le plugin
gsap.registerPlugin(ScrollTrigger);

// 2. Initialiser Locomotive Scroll
const scroll = new LocomotiveScroll({
    el: document.querySelector('[data-scroll-container]'),
    smooth: true,
    lerp: 0.06 // Un peu plus "smooth" pour l'effet Ciao Kombucha
});

// 3. Connecter Locomotive et ScrollTrigger
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

// 4. CHANGEMENT DE COULEUR AU SCROLL
// On sélectionne toutes les sections
const sections = document.querySelectorAll('[data-bgcolor]');

sections.forEach((section) => {
    // On récupère la couleur définie dans le HTML
    const color = section.getAttribute('data-bgcolor');

    ScrollTrigger.create({
        trigger: section,
        scroller: "[data-scroll-container]",
        start: "top 50%", // Quand le haut de la section arrive au milieu de l'écran
        end: "bottom 50%",
        onEnter: () => gsap.to("body", { backgroundColor: color, duration: 0.5 }),
        onEnterBack: () => gsap.to("body", { backgroundColor: color, duration: 0.5 })
    });
});

// 5. Animation d'intro
gsap.from(".reveal", {
    y: 100,
    opacity: 0,
    duration: 1.5,
    ease: "power3.out",
    delay: 0.2
});

// Refresh nécessaire pour que tout se cale bien
ScrollTrigger.addEventListener("refresh", () => scroll.update());
ScrollTrigger.refresh();