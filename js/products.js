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

let currentImages = [];
let imagePosition = 0;


// ─────────────────────────────────────────────
// MODAL
// ─────────────────────────────────────────────

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