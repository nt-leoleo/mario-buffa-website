import { loadComponents } from './loader.js';
import { headerBehavior } from './headerBehavior.js';
import { burgerMenu } from './burgerMenu.js';

async function init() {
    await loadComponents();

    headerBehavior();
    burgerMenu();
}

init();
const stats = document.querySelector(".stats");

if (stats) {
    const counters = stats.querySelectorAll("[data-to-value]");

    const observer = new IntersectionObserver(
        (entries, observer) => {
            if (!entries[0].isIntersecting) return;

            counters.forEach(counter => {
                const target = Number(counter.dataset.toValue);
                const duration = Number(counter.dataset.duration) || 2000;
                const from = Number(counter.dataset.fromValue) || 0;

                let startTime = null;

                function updateCounter(timestamp) {
                    if (!startTime) startTime = timestamp;

                    const progress = Math.min(
                        (timestamp - startTime) / duration,
                        1
                    );

                    const currentValue = Math.floor(
                        from + (target - from) * progress
                    );

                    counter.textContent = formatValue(
                        currentValue,
                        counter
                    );

                    if (progress < 1) {
                        requestAnimationFrame(updateCounter);
                    }
                }

                requestAnimationFrame(updateCounter);
            });

            observer.unobserve(stats);
        },
        {
            threshold: 0.5
        }
    );

    observer.observe(stats);
}


const form = document.querySelector("#contact-form");

if (form) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const data = {
            name: form.name.value,
            email: form.email.value,
            phone: form.phone.value,
            message: form.message.value
        };

        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message);
            }

            alert("Mensaje enviado correctamente.");
            form.reset();

        } catch (error) {
            console.error(error);
            alert("No se pudo enviar el mensaje. Intentá nuevamente.");
        }
    });
}
const track = document.querySelector(".categories-track");
const cards = document.querySelectorAll(".category-card");

const prevButton = document.querySelector(".slider-prev");
const nextButton = document.querySelector(".slider-next");

let currentPosition = 0;
function getVisibleCards() {
    const viewport = document.querySelector(".categories-viewport");

    return Math.floor(
        viewport.offsetWidth / cards[0].offsetWidth
    );
}
function updateSlider() {

    const cardWidth = cards[0].offsetWidth;

    track.style.transform =
        `translateX(-${currentPosition * cardWidth}px)`;
}
nextButton.addEventListener("click", () => {

    const visibleCards = getVisibleCards();
    const maxPosition = cards.length - visibleCards;

    if (currentPosition < maxPosition) {
        currentPosition++;
        updateSlider();
    }

});
prevButton.addEventListener("click", () => {

    if (currentPosition > 0) {
        currentPosition--;
        updateSlider();
    }

});