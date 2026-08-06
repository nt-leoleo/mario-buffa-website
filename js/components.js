async function loadComponents() {
    const components = document.querySelectorAll('[data-component]');
    for (const component of components) {
        const file = component.dataset.component;
        const response = await fetch(file);
        component.innerHTML = await response.text();
    }
}

loadComponents();