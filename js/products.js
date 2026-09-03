const modal = document.querySelector("#productModal");

const modalImage = document.querySelector("#modalImage");
const modalCategory = document.querySelector("#modalCategory");
const modalName = document.querySelector("#modalName");
const modalDescription = document.querySelector("#modalDescription");
const modalCharacteristics = document.querySelector("#modalCharacteristics");
const modalWhatsapp = document.querySelector("#modalWhatsapp");

const leftImageButton = document.querySelector("#leftImage");
const rightImageButton = document.querySelector("#rightImage");

const closeModal = document.querySelector("#closeModal");
const productModal = document.querySelector(".product-modal");

const indicatorContainer = document.querySelector(
    ".active-img-indicator-container"
);

const rightArrowBlue = `
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#0a91c6" stroke-width="1.272"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M9.71069 18.2929C10.1012 18.6834 10.7344 18.6834 11.1249 18.2929L16.0123 13.4006C16.7927 12.6195 16.7924 11.3537 16.0117 10.5729L11.1213 5.68254C10.7308 5.29202 10.0976 5.29202 9.70708 5.68254C9.31655 6.07307 9.31655 6.70623 9.70708 7.09676L13.8927 11.2824C14.2833 11.6729 14.2833 12.3061 13.8927 12.6966L9.71069 16.8787C9.32016 17.2692 9.32016 17.9023 9.71069 18.2929Z" fill="#0a91c6"></path> </g></svg>
    `
const leftArrowBlue = `
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#0a91c6" stroke-width="1.272" transform="matrix(-1, 0, 0, 1, 0, 0)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M9.71069 18.2929C10.1012 18.6834 10.7344 18.6834 11.1249 18.2929L16.0123 13.4006C16.7927 12.6195 16.7924 11.3537 16.0117 10.5729L11.1213 5.68254C10.7308 5.29202 10.0976 5.29202 9.70708 5.68254C9.31655 6.07307 9.31655 6.70623 9.70708 7.09676L13.8927 11.2824C14.2833 11.6729 14.2833 12.3061 13.8927 12.6966L9.71069 16.8787C9.32016 17.2692 9.32016 17.9023 9.71069 18.2929Z" fill="#0a91c6"></path> </g></svg>
    `


// ─────────────────────────────────────────────
// MODAL
// ─────────────────────────────────────────────
let currentImages = [];
let imagePosition = 0;
function openProductModal() {
    modal.classList.add("active");
    document.body.classList.add("modal-open");
}

function closeProductModal() {
    currentImages = [];
    imagePosition = 0;
    modal.classList.remove("active");
    document.body.classList.remove("modal-open");

    indicatorContainer.innerHTML = "";
}


// ─────────────────────────────────────────────
// SLIDER
// ─────────────────────────────────────────────

function updateSlider() {

    modalImage.src = currentImages[imagePosition];

    const dots = indicatorContainer.querySelectorAll(".dot");

    dots.forEach((dot, index) => {
        dot.classList.toggle(
            "activeDot",
            index === imagePosition
        );
    });
}


function changeImage(direction) {

    if (!currentImages.length) return;

    imagePosition += direction;

    if (imagePosition < 0) {
        imagePosition = currentImages.length - 1;
    }

    if (imagePosition >= currentImages.length) {
        imagePosition = 0;
    }

    updateSlider();
}


// ─────────────────────────────────────────────
// PRODUCTOS
// ─────────────────────────────────────────────

fetch("./data/products.json")
    .then(response => response.json())
    .then(products => {

        const productCards = document.querySelectorAll(
            ".products .card:not(#all-products), .main-products .card, .other-products .card"
        );

        productCards.forEach(card => {

            card.addEventListener("click", () => {

                const product = products[card.id];
                const currentDescriptiveParagraphs = Object.values(product.description);
                const currentCharacteristics = Object.values(product.characteristics);

                currentImages = Object.values(product.images);
                imagePosition = 0;

                indicatorContainer.innerHTML = "";

                currentImages.forEach(() => {
                    const dot = document.createElement("div");
                    dot.classList.add("dot");
                    indicatorContainer.appendChild(dot);
                });

                modalCategory.textContent = product.category;
                modalName.textContent = product.name;
                modalImage.alt = product.name;

                modalDescription.innerHTML = "";
                currentDescriptiveParagraphs.forEach((text) => {
                    const paragraph = document.createElement("p");
                    paragraph.classList.add('paragraph');
                    paragraph.textContent = text;
                    modalDescription.appendChild(paragraph);
                });

                modalCharacteristics.innerHTML = "";
                currentCharacteristics.forEach((characteristic) => {
                    const feature = document.createElement('div');
                    const svgIco = document.createElement('img');
                    const title = document.createElement('h3');
                    const description = document.createElement('p');
                    const titleDescription = document.createElement('div');
                    feature.classList.add('modalFeature');
                    svgIco.classList.add('modalFeatureSvgIco')
                    title.classList.add('modalFeatureTitle');
                    description.classList.add('modalFeatureDescription')
                    titleDescription.classList.add('modalFeatureTitleDescription');

                    svgIco.src = characteristic.svg;
                    svgIco.alt = characteristic.title;
                    title.textContent = characteristic.title;
                    description.textContent = characteristic.description;

                    feature.appendChild(svgIco);
                    titleDescription.appendChild(title);
                    titleDescription.appendChild(description);
                    feature.appendChild(titleDescription);
                    modalCharacteristics.appendChild(feature);
                });
                updateSlider();
                openProductModal();

                const message =
                    `Hola, quisiera consultar por el producto ${product.name}.`;

                modalWhatsapp.href =
                    `https://wa.me/5492664327955?text=${encodeURIComponent(message)}`;
            });
        });
    });


// ─────────────────────────────────────────────
// CONTROLES DEL SLIDER
// ─────────────────────────────────────────────

leftImageButton.addEventListener("click", () => {
    changeImage(-1);
});

rightImageButton.addEventListener("click", () => {
    changeImage(1);
});


// ─────────────────────────────────────────────
// CIERRE DEL MODAL
// ─────────────────────────────────────────────

modal.addEventListener("click", closeProductModal);

productModal.addEventListener("click", event => {
    event.stopPropagation();
});

closeModal.addEventListener("click", closeProductModal);

document.addEventListener("keydown", event => {

    if (event.key === "Escape") {
        closeProductModal();
    }

});

const catalogGrid = document.querySelector(".catalog-grid");
const showMoreButton = document.querySelector(".catalog-show-more");
const showMoreArrow = document.querySelector(".catalog-show-more-arrow");
const showMoreText = showMoreButton.querySelector("span");

showMoreButton.addEventListener("click", () => {

    const isExpanded = catalogGrid.classList.toggle("is-expanded");

    if (isExpanded) {
        showMoreText.textContent = "Mostrar menos";
        showMoreArrow.src = "assets/images/arrow-up.svg";
    } else {
        showMoreText.textContent = "Mostrar más";
        showMoreArrow.src = "assets/images/arrow-down.svg";
    }

});


const carousels = document.querySelectorAll(".categories-viewport");

function loadCarousels() {
    carousels.forEach((viewport) => {

        const track = viewport.querySelector(".categories-track");
        const cards = track.querySelectorAll(".category-card");

        const leftButton = viewport.querySelector(".carousel-button-left");
        const rightButton = viewport.querySelector(".carousel-button-right");

        let currentIndex = 0;
        function getVisibleCards() {
            if (window.innerWidth <= 768) return 4;
            if (window.innerWidth <= 1199) return 5;

            return 6;
        }

        function updateCarousel() {
            const visibleCards = getVisibleCards();
            const maxIndex = Math.max(0, cards.length - visibleCards);
            if (cards.length === 0) return;

            currentIndex = Math.min(
                Math.max(currentIndex, 0),
                maxIndex
            );

            const cardWidth = cards[0].offsetWidth;

            const gap = parseFloat(
                getComputedStyle(track).gap
            ) || 0;

            const movement = (cardWidth + gap) * currentIndex;

            track.style.transform = `translateX(-${movement}px)`;

            leftButton.disabled = currentIndex === 0;
            rightButton.disabled = currentIndex === maxIndex;
        }


        rightButton.addEventListener("click", () => {
            currentIndex++;
            updateCarousel();
        });

        leftButton.addEventListener("click", () => {
            currentIndex--;
            updateCarousel();
        });

        window.addEventListener("resize", updateCarousel);

        updateCarousel();
    });
}

// catalogGrid

async function loadCatalog() {
    try {

        const response = await fetch("/data/categories.json");
        const catalog = await response.json();

        const categories = Object.values(catalog);

        categories.forEach(category => {

            const card = document.createElement('a');
            const image = document.createElement('img');
            const name = document.createElement('span');

            card.classList.add('catalog-card');
            card.href = category.href;
            card.target = "_blank";
            card.rel = "noopener noreferrer";

            image.src = category.src;
            image.alt = category.name;

            name.textContent = category.name;

            card.appendChild(image);
            card.appendChild(name);

            catalogGrid.appendChild(card);
        });

    } catch (error) {
        console.error('Error al cargar las categorías: ', error);
    }
}

async function loadProductsPreview(fetchInfo, previewClass) {
    try {
        const response = await fetch(fetchInfo);
        const catalog = await response.json();
        const products = Object.values(catalog);
        const categoriesTrack = document.querySelector(previewClass);

        products.forEach(product => {
            const card = document.createElement('a')

            const image = document.createElement('img');
            const name = document.createElement('span');
            const br = document.createElement('br');
            const description = document.createElement('b');
            const detailedInfo = document.createElement('p');

            card.href = product.href;
            card.target = 'blank';
            card.rel = "noopener noreferrer";
            card.classList.add('category-card');

            image.src = product.src;
            image.alt = product.name;
            image.classList.add('category-image')

            name.textContent = product.name;
            description.textContent = product.description;

            detailedInfo.innerHTML = `
                    Información Detallada ${rightArrowBlue}
                `;
            detailedInfo.classList.add("see-more");

            card.append(image, name, br, description, detailedInfo);
            categoriesTrack.appendChild(card);

            loadCarousels();
        })
    } catch (error) {
        console.error(`Error al cargar artículos: ${error}`);
        const categoriesTrack = document.querySelector(previewClass);
        categoriesTrack.textContent = `
                Error al cargar los artículos ${error}
            `;
    }
}

loadCatalog();
loadProductsPreview('/data/mangueras-conectores-racores.json', '#conectoresPreview');
loadProductsPreview('/data/sensores-actuadores-valvulas.json', '#sensoresActuadoresValvulasPreview');