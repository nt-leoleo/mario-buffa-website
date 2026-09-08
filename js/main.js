import { loadComponents } from './loader.js';
import { headerBehavior } from './headerBehavior.js';
import { burgerMenu } from './burgerMenu.js';

async function init() {
    console.log("ANTES DE CARGAR COMPONENTES");

    await loadComponents();

    console.log("DESPUÉS DE CARGAR COMPONENTES");

    const percentage = document.querySelector('#loading-percentage');

    function updateLoadingPercentage(value) {
        percentage.textContent = `${value}%`;
    }

    updateLoadingPercentage(0);

    const resources = [
        ...document.images,
        ...document.querySelectorAll("video")
    ];

    console.log("Recursos detectados:", resources.length);

    let loadedResources = 0;
    const totalResources = resources.length;

    console.log("Total de recursos:", totalResources);

    function resourceLoaded() {
        loadedResources++;

        const progress = Math.round(
            (loadedResources / totalResources) * 100
        );

        updateLoadingPercentage(progress);

        console.log(
            "Recursos cargados:",
            loadedResources,
            "/",
            totalResources,
            `(${progress}%)`
        );
        if (loadedResources === totalResources) {
            updateLoadingPercentage(100);

            setTimeout(() => {
                document.querySelector("#splash-screen").style.display = "none";
            }, 300);
        }
    }

    resources.forEach(resource => {

        if (resource.tagName === "IMG") {

            if (resource.complete) {
                resourceLoaded();
            } else {
                resource.addEventListener("load", resourceLoaded, {
                    once: true
                });

                resource.addEventListener("error", resourceLoaded, {
                    once: true
                });
            }

            return;
        }

        if (resource.tagName === "VIDEO") {

            if (resource.readyState >= 3) {
                resourceLoaded();
            } else {
                resource.addEventListener("canplaythrough", resourceLoaded, {
                    once: true
                });

                resource.addEventListener("error", resourceLoaded, {
                    once: true
                });
            }
        }
    });

    headerBehavior();
    burgerMenu();
}

init();

function formatValue(value, counter) {
    if (counter.id === "years-experience") return `+${value}`;
    if (counter.id === "good-garant") return `${value}%`;
    if (counter.id === "maked-instalations") return `+${value.toLocaleString("es-AR")}`;
    return value;
}

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
