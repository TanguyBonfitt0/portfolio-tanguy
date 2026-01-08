import './styles/style.css'
import gsap from 'gsap'
import LocomotiveScroll from 'locomotive-scroll'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger);

// ----------------------------------------------------
// 0. PRELOADER & INIT
// ----------------------------------------------------
const preloader = document.getElementById('preloader');
const loaderProgress = document.querySelector('.loader-progress');

// Simuler chargement (pour l'effet)
let progress = 0;
const interval = setInterval(() => {
    progress += Math.random() * 10;
    if (progress > 100) progress = 100;
    loaderProgress.style.width = `${progress}%`;

    if (progress === 100) {
        clearInterval(interval);
        // Cacher le preloader
        setTimeout(() => {
            preloader.style.opacity = '0';
            preloader.style.visibility = 'hidden';
            initScroll(); // Lancer le scroll seulement après
        }, 500);
    }
}, 100);


// ----------------------------------------------------
// 1. LOCOMOTIVE SCROLL SETUP
// ----------------------------------------------------
let scroll;

function initScroll() {
    scroll = new LocomotiveScroll({
        el: document.querySelector('[data-scroll-container]'),
        smooth: true,
        lerp: 0.06, // Inertie
        multiplier: 1,
        smartphone: {
            smooth: true // Activer le smooth sur mobile aussi (attention performance)
        },
        tablet: {
            smooth: true
        }
    });

    // Sync ScrollTrigger
    scroll.on("scroll", ScrollTrigger.update);
    ScrollTrigger.scrollerProxy("[data-scroll-container]", {
        scrollTop(value) { return arguments.length ? scroll.scrollTo(value, 0, 0) : scroll.scroll.instance.scroll.y; },
        getBoundingClientRect() { return {top: 0, left: 0, width: window.innerWidth, height: window.innerHeight}; },
        pinType: document.querySelector("[data-scroll-container]").style.transform ? "transform" : "fixed"
    });

    // UPDATE CRITIQUE : Recalculer la hauteur une fois tout chargé
    // (Fixe le bug où on ne peut pas scroller jusqu'en bas)
    const images = document.querySelectorAll('img');
    let loaded = 0;
    if(images.length > 0) {
        images.forEach(img => {
            if(img.complete) {
                loaded++;
                if(loaded === images.length) scroll.update();
            } else {
                img.onload = () => {
                    loaded++;
                    if(loaded === images.length) scroll.update();
                }
            }
        });
    } else {
        scroll.update();
    }

    // Refresh ScrollTrigger
    ScrollTrigger.addEventListener("refresh", () => scroll.update());
    ScrollTrigger.refresh();

    setupBackToTop();
    setupAnimations();
}

// ----------------------------------------------------
// 2. BACK TO TOP
// ----------------------------------------------------
function setupBackToTop() {
    const backToTopBtn = document.getElementById('back-to-top');
    scroll.on('scroll', (instance) => {
        if (instance.scroll.y > 500) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });
    backToTopBtn.addEventListener('click', () => {
        scroll.scrollTo(0, { duration: 1000 });
    });
}

// ----------------------------------------------------
// 3. DARK MODE
// ----------------------------------------------------
const themeBtn = document.getElementById('theme-btn');
const htmlElement = document.documentElement;
const savedTheme = localStorage.getItem('theme');

if (savedTheme) {
    htmlElement.setAttribute('data-theme', savedTheme);
    themeBtn.textContent = savedTheme === 'dark' ? '☀︎' : '☾';
}

themeBtn.addEventListener('click', () => {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    htmlElement.setAttribute('data-theme', newTheme);
    themeBtn.textContent = newTheme === 'dark' ? '☀︎' : '☾';
    localStorage.setItem('theme', newTheme);
});

// ----------------------------------------------------
// 4. ANIMATIONS (GSAP)
// ----------------------------------------------------
function setupAnimations() {
    // Skew Effect
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
}

// ----------------------------------------------------
// 5. CURSEUR
// ----------------------------------------------------
const cursor = document.querySelector('.cursor-blob');
window.addEventListener('mousemove', (e) => {
    gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.1, ease: "power2.out" });
});
document.querySelectorAll('.hover-trigger').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('hovered'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('hovered'));
});


// ----------------------------------------------------
// 6. FORMULAIRE AJAX (Sans rechargement)
// ----------------------------------------------------
const form = document.getElementById('contact-form');
const statusDiv = document.getElementById('form-status');

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    statusDiv.style.opacity = '1';
    statusDiv.innerHTML = "SENDING...";

    const data = new FormData(event.target);

    fetch(event.target.action, {
        method: form.method,
        body: data,
        headers: {
            'Accept': 'application/json'
        }
    }).then(response => {
        if (response.ok) {
            statusDiv.innerHTML = "MESSAGE SENT ! THANKS.";
            statusDiv.style.color = "var(--accent-color)";
            form.reset();
        } else {
            response.json().then(data => {
                if (Object.hasOwn(data, 'errors')) {
                    statusDiv.innerHTML = data["errors"].map(error => error["message"]).join(", ");
                } else {
                    statusDiv.innerHTML = "OOPS! THERE WAS A PROBLEM.";
                }
                statusDiv.style.color = "red";
            })
        }
    }).catch(error => {
        statusDiv.innerHTML = "ERROR CONNECTING TO SERVER.";
        statusDiv.style.color = "red";
    });
});