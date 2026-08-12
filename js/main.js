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

        // Ejecutar la animación solo una vez
        observer.unobserve(stats);
    },
    {
        threshold: 0.5
    }
);

observer.observe(stats);


function formatValue(value, counter) {
    const id = counter.id;

    if (id === "years-experience") {
        return `+${value}`;
    }

    if (id === "good-garant") {
        return `${value}%`;
    }

    if (id === "maked-instalations") {
        return `+${value.toLocaleString("es-AR")}`;
    }

    return value;
}