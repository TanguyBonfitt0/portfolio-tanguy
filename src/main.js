import './styles/style.css'
import gsap from 'gsap'
import LocomotiveScroll from 'locomotive-scroll'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger);

// 1. LOCOMOTIVE SCROLL INIT
const scroll = new LocomotiveScroll({
    el: document.querySelector('[data-scroll-container]'),
    smooth: true,
    lerp: 0.06,
    multiplier: 1
});

// Sync ScrollTrigger avec Locomotive
scroll.on("scroll", ScrollTrigger.update);
ScrollTrigger.scrollerProxy("[data-scroll-container]", {
    scrollTop(value) { return arguments.length ? scroll.scrollTo(value, 0, 0) : scroll.scroll.instance.scroll.y; },
    getBoundingClientRect() { return {top: 0, left: 0, width: window.innerWidth, height: window.innerHeight}; },
    pinType: document.querySelector("[data-scroll-container]").style.transform ? "transform" : "fixed"
});

// ----------------------------------------------------
// 2. GESTION DU BACK TO TOP (Apparition au scroll)
// ----------------------------------------------------
const backToTopBtn = document.getElementById('back-to-top');

scroll.on('scroll', (instance) => {
    // Si on a scrollé plus de 500px, on affiche le bouton
    if (instance.scroll.y > 500) {
        backToTopBtn.classList.add('visible');
    } else {
        backToTopBtn.classList.remove('visible');
    }
});

// Clic pour remonter
backToTopBtn.addEventListener('click', () => {
    scroll.scrollTo(0, { duration: 1000 }); // Remonte tout en haut
});


// ----------------------------------------------------
// 3. DARK / LIGHT MODE
// ----------------------------------------------------
const themeBtn = document.getElementById('theme-btn');
const htmlElement = document.documentElement;

// Vérifier si un thème est déjà sauvegardé
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    htmlElement.setAttribute('data-theme', savedTheme);
    themeBtn.textContent = savedTheme === 'dark' ? '☀︎' : '☾';
}

themeBtn.addEventListener('click', () => {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    // Appliquer le thème
    htmlElement.setAttribute('data-theme', newTheme);

    // Changer l'icône
    themeBtn.textContent = newTheme === 'dark' ? '☀︎' : '☾';

    // Sauvegarder
    localStorage.setItem('theme', newTheme);
});


// ----------------------------------------------------
// 4. ANIMATIONS & CURSEUR
// ----------------------------------------------------

// Skew Effect (Déformation au scroll)
let proxy = { skew: 0 },
    skewSetter = gsap.quickSetter("[data-scroll-container]", "skewY", "deg"),
    clamp = gsap.utils.clamp(-10, 10);

scroll.on("scroll", (obj) => {
    let skew = clamp(obj.scroll.y - obj.scroll.currentY);
    if (Math.abs(skew) > 0.1) {
        gsap.to(proxy, {
            skew: skew * 0.5,
            duration: 0.8,
            ease: "power3",
            overwrite: true,
            onUpdate: () => skewSetter(proxy.skew)
        });
    }
});

// Curseur Custom
const cursor = document.querySelector('.cursor-blob');
window.addEventListener('mousemove', (e) => {
    gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.1, ease: "power2.out" });
});

document.querySelectorAll('.hover-trigger').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('hovered'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('hovered'));
});

// Parallaxe Images
gsap.utils.toArray('.project-image-container').forEach(container => {
    let image = container.querySelector('img');
    gsap.to(image, {
        y: '20%',
        ease: "none",
        scrollTrigger: {
            trigger: container,
            scroller: "[data-scroll-container]",
            start: "top bottom",
            end: "bottom top",
            scrub: true
        }
    });
});

ScrollTrigger.addEventListener("refresh", () => scroll.update());
ScrollTrigger.refresh();