import { loadComponents } from './loader.js';
import { headerBehavior } from './headerBehavior.js';
import { burgerMenu } from './burgerMenu.js';

async function init() {
    const splash = document.querySelector('#splash-screen');
    const percentage = document.querySelector('#loading-percentage');
    const status = document.querySelector('#loading-status');

    function updateLoadingPercentage(value) {
        if (percentage) percentage.textContent = `${value}%`;
    }

    let hasLoadingError = false;

    function showLoadingStatus(message) {
        if (!status) return;
        hasLoadingError = true;
        status.hidden = false;
        status.textContent = message;
    }

    let dismissTimer;

    function dismissSplash() {
        if (!splash) return;
        clearTimeout(dismissTimer);
        splash.style.display = 'none';
    }

    try {
        await loadComponents();
    } catch (error) {
        showLoadingStatus('Algunos elementos no pudieron cargarse.');
    }

    updateLoadingPercentage(0);

    const resources = [
        ...document.images,
        ...document.querySelectorAll("video")
    ];

    let loadedResources = 0;
    let failedResources = 0;
    const totalResources = resources.length;
    const settledResources = new WeakSet();

    dismissTimer = setTimeout(() => {
        showLoadingStatus('La carga está tardando más de lo esperado.');
        setTimeout(dismissSplash, 300);
    }, 5000);

    function resourceLoaded(resource, failed = false) {
        if (settledResources.has(resource)) return;
        settledResources.add(resource);
        loadedResources++;
        if (failed) failedResources++;

        const progress = totalResources
            ? Math.round((loadedResources / totalResources) * 100)
            : 100;

        updateLoadingPercentage(progress);

        if (loadedResources >= totalResources) {
            updateLoadingPercentage(100);
            if (failedResources) {
                showLoadingStatus('Algunos recursos no pudieron cargarse.');
            }

            setTimeout(dismissSplash, hasLoadingError ? 1200 : 300);
        }
    }

    if (!totalResources) dismissSplash();

    resources.forEach(resource => {

        if (resource.tagName === "IMG") {

            if (resource.complete) {
                resourceLoaded(resource, !resource.naturalWidth);
            } else {
                resource.addEventListener("load", () => resourceLoaded(resource), {
                    once: true
                });

                resource.addEventListener("error", () => resourceLoaded(resource, true), {
                    once: true
                });
            }

            return;
        }

        if (resource.tagName === "VIDEO") {

            if (resource.readyState >= 3) {
                resourceLoaded(resource);
            } else {
                resource.addEventListener("loadeddata", () => resourceLoaded(resource), {
                    once: true
                });

                resource.addEventListener("error", () => resourceLoaded(resource, true), {
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
