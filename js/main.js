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


const contactForm = document.querySelector("#contact-form");

if (contactForm) {
    contactForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const formData = new FormData(contactForm);

        const data = {
            name: formData.get("name"),
            email: formData.get("email"),
            phone: formData.get("phone"),
            message: formData.get("message")
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

            console.log(result);

        } catch (error) {
            console.error("Error:", error);
        }
    });
}