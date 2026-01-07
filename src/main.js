import './styles/style.css'
import gsap from 'gsap'
import LocomotiveScroll from 'locomotive-scroll'

// Initialisation du scroll fluide
const scroll = new LocomotiveScroll({
    el: document.querySelector('[data-scroll-container]'),
    smooth: true
});

// Animation d'entrée avec GSAP
window.addEventListener('load', () => {
    const tl = gsap.timeline();

    tl.from(".reveal", {
        y: 100,
        opacity: 0,
        duration: 1.2,
        stagger: 0.2, // Délai entre chaque élément
        ease: "power4.out"
    })
        .from(".parallax-circle", {
            scale: 0,
            duration: 1,
            ease: "elastic.out(1, 0.3)"
        }, "-=0.5"); // Commence un peu avant la fin de l'anim précédente
});