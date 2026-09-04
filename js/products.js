const WHATSAPP_NUMBER = "5492664327955";

const rightArrowBlue = `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#0a91c6" stroke-width="1.272">
        <path d="M9.71069 18.2929C10.1012 18.6834 10.7344 18.6834 11.1249 18.2929L16.0123 13.4006C16.7927 12.6195 16.7924 11.3537 16.0117 10.5729L11.1213 5.68254C10.7308 5.29202 10.0976 5.29202 9.70708 5.68254C9.31655 6.07307 9.31655 6.70623 9.70708 7.09676L13.8927 11.2824C14.2833 11.6729 14.2833 12.3061 13.8927 12.6966L9.71069 16.8787C9.32016 17.2692 9.32016 17.9023 9.71069 18.2929Z" fill="#0a91c6"></path>
    </svg>
`;

const productCatalogs = [
    { data: "/data/retenes.json", selector: ".retenes" },
    { data: "/data/bronce.json", selector: ".bronce" }
];

const previewCatalogs = [
    { data: "/data/mangueras-conectores-racores.json", selector: "#conectoresPreview" },
    { data: "/data/sensores-actuadores-valvulas.json", selector: "#sensoresActuadoresValvulasPreview" }
];

const modalElements = {
    root: document.querySelector("#productModal"),
    content: document.querySelector(".product-modal"),
    image: document.querySelector("#modalImage"),
    category: document.querySelector("#modalCategory"),
    name: document.querySelector("#modalName"),
    description: document.querySelector("#modalDescription"),
    characteristics: document.querySelector("#modalCharacteristics"),
    whatsapp: document.querySelector("#modalWhatsapp"),
    indicators: document.querySelector(".active-img-indicator-container"),
    previous: document.querySelector("#leftImage"),
    next: document.querySelector("#rightImage"),
    close: document.querySelector("#closeModal")
};

const productState = {
    products: new Map(),
    initialized: false
};

async function loadJson(url) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`No se pudo cargar ${url}: ${response.status}`);
    }

    return response.json();
}

function normalizeProduct(id, product) {
    if (!product || typeof product !== "object") return null;

    const sharedData = {
        category: product.category || "",
        description: Array.isArray(product.description)
            ? product.description.filter(text => typeof text === "string")
            : [],
        characteristics: Array.isArray(product.characteristics)
            ? product.characteristics.filter(characteristic => characteristic && typeof characteristic === "object")
            : []
    };

    const variants = Array.isArray(product.variants)
        ? product.variants.filter(variant => variant && typeof variant === "object")
        : [];
    const images = Array.isArray(product.images)
        ? product.images.filter(image => typeof image === "string")
        : [];
    const productTitle = product.name || id;

    const items = variants.length
        ? variants.map(variant => ({
            title: variant.name || productTitle,
            image: variant.image,
            description: Array.isArray(variant.description) ? variant.description : sharedData.description,
            characteristics: Array.isArray(variant.characteristics) ? variant.characteristics : sharedData.characteristics
        }))
        : images.map(image => ({
            title: productTitle,
            image,
            description: sharedData.description,
            characteristics: sharedData.characteristics
        }));

    return {
        id,
        category: sharedData.category,
        title: productTitle,
        items: items.filter(item => item.image)
    };
}

function normalizeCatalog(catalog) {
    if (!catalog || typeof catalog !== "object" || Array.isArray(catalog)) return [];
    return Object.entries(catalog)
        .map(([id, product]) => normalizeProduct(id, product))
        .filter(product => product?.items.length);
}

function createProductCard(product, productKey) {
    const card = document.createElement("article");
    const imageContainer = document.createElement("div");
    const image = document.createElement("img");
    const name = document.createElement("h3");
    const label = document.createElement('label');

    card.className = "card";
    card.id = product.id;
    card.dataset.productKey = productKey;
    card.tabIndex = 0;
    card.setAttribute("role", "button");

    imageContainer.className = "img-container";
    image.src = product.items[0]?.image || "";
    image.alt = product.title;

    name.className = "card-label";
    name.textContent = product.title;

    label.textContent = "Consultar ";

    const arrow = document.createElement("span");
    arrow.innerHTML = rightArrowBlue;

    label.appendChild(arrow);
    name.appendChild(label);

    imageContainer.appendChild(image);
    card.append(imageContainer, name);

    return card;
}

async function loadProductCatalog(config) {
    const container = document.querySelector(config.selector);
    if (!container) return;

    try {
        const products = normalizeCatalog(await loadJson(config.data));

        const fragment = document.createDocumentFragment();

        products.forEach(product => {
            const productKey = `${config.data}::${product.id}`;
            productState.products.set(productKey, product);
            fragment.appendChild(createProductCard(product, productKey));
        });

        container.replaceChildren(fragment);
    } catch (error) {
        console.error(`Error al cargar productos desde ${config.data}:`, error);
        container.textContent = "No se pudieron cargar los productos.";
    }
}

function createDescription(description) {
    const fragment = document.createDocumentFragment();

    description.forEach(text => {
        const paragraph = document.createElement("p");
        paragraph.className = "paragraph";
        paragraph.textContent = text;
        fragment.appendChild(paragraph);
    });

    return fragment;
}

function createCharacteristics(characteristics) {
    const fragment = document.createDocumentFragment();

    characteristics.forEach(characteristic => {
        const feature = document.createElement("div");
        const icon = document.createElement("img");
        const titleDescription = document.createElement("div");
        const title = document.createElement("h3");
        const description = document.createElement("p");

        feature.className = "modalFeature";
        icon.className = "modalFeatureSvgIco";
        icon.src = characteristic.svg;
        icon.alt = characteristic.title;
        titleDescription.className = "modalFeatureTitleDescription";
        title.className = "modalFeatureTitle";
        title.textContent = characteristic.title;
        description.className = "modalFeatureDescription";
        description.textContent = characteristic.description;

        titleDescription.append(title, description);
        feature.append(icon, titleDescription);
        fragment.appendChild(feature);
    });

    return fragment;
}

function createIndicators(count, activeIndex, onSelect) {
    const fragment = document.createDocumentFragment();

    for (let index = 0; index < count; index += 1) {
        const indicator = document.createElement("button");
        indicator.type = "button";
        indicator.className = "dot";
        indicator.classList.toggle("activeDot", index === activeIndex);
        indicator.setAttribute("aria-label", `Ver elemento ${index + 1}`);
        indicator.addEventListener("click", () => onSelect(index));
        fragment.appendChild(indicator);
    }

    return fragment;
}

function createProductModal(elements) {
    const state = {
        currentProduct: null,
        currentItems: [],
        currentIndex: 0,
        isOpen: false
    };

    function renderImage() {
        const item = state.currentItems[state.currentIndex];
        if (!item) return;

        elements.image.src = item.image;
        elements.image.alt = item.title;
        elements.indicators.replaceChildren(
            createIndicators(state.currentItems.length, state.currentIndex, selectItem)
        );
    }

    function renderDetails() {
        const product = state.currentProduct;
        const item = state.currentItems[state.currentIndex];
        if (!product || !item) return;

        elements.category.textContent = product.category;
        elements.name.textContent = item.title;
        elements.description.replaceChildren(createDescription(item.description));
        elements.characteristics.replaceChildren(createCharacteristics(item.characteristics));

        const message = `Hola, quisiera consultar por el producto ${item.title}.`;
        elements.whatsapp.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    }

    function render() {
        renderImage();
        renderDetails();
    }

    function selectItem(index) {
        if (!state.currentItems[index]) return;
        state.currentIndex = index;
        render();
    }

    function changeItem(direction) {
        if (!state.currentItems.length) return;
        const nextIndex = state.currentIndex + direction;
        state.currentIndex = (nextIndex + state.currentItems.length) % state.currentItems.length;
        render();
    }

    function open(product) {
        if (!product?.items.length) return;

        state.currentProduct = product;
        state.currentItems = product.items;
        state.currentIndex = 0;
        state.isOpen = true;
        render();
        elements.root.classList.add("active");
        document.body.classList.add("modal-open");
    }

    function close() {
        state.currentProduct = null;
        state.currentItems = [];
        state.currentIndex = 0;
        state.isOpen = false;
        elements.root.classList.remove("active");
        document.body.classList.remove("modal-open");
        elements.indicators.replaceChildren();
    }

    elements.previous.addEventListener("click", () => changeItem(-1));
    elements.next.addEventListener("click", () => changeItem(1));
    elements.close.addEventListener("click", close);
    elements.root.addEventListener("click", close);
    elements.content.addEventListener("click", event => event.stopPropagation());
    document.addEventListener("keydown", event => {
        if (!state.isOpen) return;
        if (event.key === "Escape") close();
        if (event.key === "ArrowLeft") changeItem(-1);
        if (event.key === "ArrowRight") changeItem(1);
    });

    return { open };
}

function setupProductEvents(modalController) {
    document.addEventListener("click", event => {
        const card = event.target.closest("[data-product-key]");
        if (card) modalController.open(productState.products.get(card.dataset.productKey));
    });

    document.addEventListener("keydown", event => {
        if (event.key !== "Enter" && event.key !== " ") return;
        const card = event.target.closest("[data-product-key]");
        if (!card) return;
        event.preventDefault();
        modalController.open(productState.products.get(card.dataset.productKey));
    });
}

async function loadCatalog() {
    const grid = document.querySelector(".catalog-grid");
    if (!grid) return;

    try {
        const catalog = await loadJson("/data/categories.json");
        Object.values(catalog).forEach(category => {
            const card = document.createElement("a");
            const image = document.createElement("img");
            const name = document.createElement("span");

            card.className = "catalog-card";
            card.href = category.href;
            card.target = "_blank";
            card.rel = "noopener noreferrer";
            image.src = category.src;
            image.alt = category.name;
            name.textContent = category.name;
            card.append(image, name);
            grid.appendChild(card);
        });
    } catch (error) {
        console.error("Error al cargar las categorías:", error);
        grid.textContent = "No se pudieron cargar las categorías.";
    }
}

async function loadPreview(config) {
    const track = document.querySelector(config.selector);
    if (!track) return;

    try {
        const products = Object.values(await loadJson(config.data));
        products.forEach(product => {
            const card = document.createElement("a");
            const imageContainer = document.createElement("div");
            const image = document.createElement("img");
            const name = document.createElement("span");
            const description = document.createElement("b");
            const detailedInfo = document.createElement("p");

            card.href = product.href;
            card.target = "_blank";
            card.rel = "noopener noreferrer";
            card.className = "category-card";
            image.src = product.src;
            image.alt = product.name;
            imageContainer.className = "category-image";
            name.textContent = product.name;
            description.textContent = product.description;
            detailedInfo.className = "see-more";
            detailedInfo.innerHTML = `Información Detallada ${rightArrowBlue}`;

            imageContainer.appendChild(image);
            card.append(imageContainer, name, document.createElement("br"), description, detailedInfo);
            track.appendChild(card);
        });
    } catch (error) {
        console.error(`Error al cargar artículos desde ${config.data}:`, error);
        track.textContent = "No se pudieron cargar los artículos.";
    }
}

function getVisibleCards() {
    if (window.innerWidth <= 768) return 4;
    if (window.innerWidth <= 1199) return 5;
    return 6;
}

function initializeCarousel(viewport) {
    const track = viewport.querySelector(".categories-track");
    const cards = [...track.querySelectorAll(".category-card")];
    const previous = viewport.querySelector(".carousel-button-left");
    const next = viewport.querySelector(".carousel-button-right");
    let currentIndex = 0;

    function update() {
        if (!cards.length) {
            previous.disabled = true;
            next.disabled = true;
            return;
        }

        const maxIndex = Math.max(0, cards.length - getVisibleCards());
        currentIndex = Math.min(Math.max(currentIndex, 0), maxIndex);
        const cardWidth = cards[0].offsetWidth;
        const gap = parseFloat(getComputedStyle(track).gap) || 0;
        track.style.transform = `translateX(-${(cardWidth + gap) * currentIndex}px)`;
        previous.disabled = currentIndex === 0;
        next.disabled = currentIndex === maxIndex;
    }

    previous.addEventListener("click", () => {
        currentIndex -= 1;
        update();
    });
    next.addEventListener("click", () => {
        currentIndex += 1;
        update();
    });
    window.addEventListener("resize", update);
    update();
}

function initializeCarousels() {
    document.querySelectorAll(".categories-viewport").forEach(initializeCarousel);
}

function initializeShowMore() {
    const grid = document.querySelector(".catalog-grid");
    const button = document.querySelector(".catalog-show-more");
    const arrow = document.querySelector(".catalog-show-more-arrow");
    const text = button?.querySelector("span");
    if (!grid || !button || !arrow || !text) return;

    button.addEventListener("click", () => {
        const expanded = grid.classList.toggle("is-expanded");
        text.textContent = expanded ? "Mostrar menos" : "Mostrar más";
        arrow.src = expanded ? "assets/images/arrow-up.svg" : "assets/images/arrow-down.svg";
    });
}

async function initializeProductsPage() {
    if (!modalElements.root || productState.initialized) return;
    productState.initialized = true;

    const modalController = createProductModal(modalElements);
    setupProductEvents(modalController);

    await Promise.all([
        ...productCatalogs.map(loadProductCatalog),
        loadCatalog(),
        ...previewCatalogs.map(loadPreview)
    ]);

    initializeCarousels();
    initializeShowMore();
}

initializeProductsPage();