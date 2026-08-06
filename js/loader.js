export async function loadComponents() {
    const components = document.querySelectorAll('[data-component]');

    await Promise.all(
        [...components].map(async component => {
            const response = await fetch(component.dataset.component);

            if (!response.ok) {
                throw new Error(`No se pudo cargar ${component.dataset.component}`);
            }

            component.innerHTML = await response.text();
        })
    );
}

// loadComponents();    