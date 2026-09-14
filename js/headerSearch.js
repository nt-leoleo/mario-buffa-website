const searchCatalogs = [
    "/data/retenes.json",
    "/data/bronce.json",
    "/data/dir-hidraulica.json",
    "/data/mangueras-conectores-racores.json",
    "/data/sensores-actuadores-valvulas.json"
];

const MAX_RESULTS = 8;

const FIELD_WEIGHTS = {
    name: 1000,
    category: 100,
    description: 10,
    characteristics: 5
};

let searchIndex = [];
let searchReady = false;

function normalizeText(value) {
    return String(value ?? "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function compactText(value) {
    return normalizeText(value).replace(/\s/g, "");
}

function getArrayText(value) {
    return Array.isArray(value)
        ? value.filter(Boolean).join(" ")
        : String(value ?? "");
}

function getCharacteristicsText(characteristics = []) {
    if (!Array.isArray(characteristics)) {
        return "";
    }

    return characteristics
        .flatMap(item => [
            item?.title,
            item?.description
        ])
        .filter(Boolean)
        .join(" ");
}

function normalizeProduct(id, product, source) {
    const baseProductKey = `${source}::${id}`;

    const base = {
        id,
        baseId: id,
        source,
        productKey: baseProductKey,
        baseProductKey,
        variantIndex: 0,
        category: product.category ?? "",
        name: product.name ?? "",
        description: getArrayText(product.description),
        characteristics: getCharacteristicsText(product.characteristics),
        image: product.images?.[0] ?? product.src ?? "",
        href: product.href ?? ""
    };

    if (Array.isArray(product.variants)) {
        return product.variants.map((variant, index) => ({
            ...base,
            id: `${id}-${index}`,
            baseId: id,
            productKey: `${baseProductKey}::${index}`,
            baseProductKey,
            variantIndex: index,
            name: variant.name ?? base.name,
            description:
                getArrayText(variant.description) ||
                base.description,
            characteristics:
                getCharacteristicsText(variant.characteristics) ||
                base.characteristics,
            image: variant.image ?? base.image,
            href: variant.href ?? base.href
        }));
    }

    return [base];
}

function createIndexedProduct(product) {
    const normalizedName = normalizeText(product.name);
    const normalizedCategory = normalizeText(product.category);
    const normalizedDescription = normalizeText(product.description);
    const normalizedCharacteristics = normalizeText(
        product.characteristics
    );

    return {
        ...product,

        _name: normalizedName,
        _category: normalizedCategory,
        _description: normalizedDescription,
        _characteristics: normalizedCharacteristics,

        _compactName: compactText(product.name),
        _compactCategory: compactText(product.category),
        _compactDescription: compactText(product.description),
        _compactCharacteristics: compactText(
            product.characteristics
        )
    };
}

async function loadSearchCatalogs() {
    const catalogs = await Promise.all(
        searchCatalogs.map(async source => {
            try {
                const response = await fetch(source);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                return {
                    source,
                    data: await response.json()
                };
            } catch (error) {
                console.error(
                    `Error cargando ${source}:`,
                    error
                );

                return {
                    source,
                    data: null
                };
            }
        })
    );

    searchIndex = catalogs
        .filter(catalog => catalog.data)
        .flatMap(({ source, data }) =>
            Object.entries(data).flatMap(
                ([id, product]) =>
                    normalizeProduct(
                        id,
                        product,
                        source
                    )
            )
        )
        .map(createIndexedProduct);

    searchReady = true;

    console.log(
        `Productos indexados: ${searchIndex.length}`
    );
}

function isSubsequence(query, text) {
    if (!query || !text) {
        return {
            matched: 0,
            consecutive: 0,
            span: Infinity,
            positions: []
        };
    }

    let queryIndex = 0;
    let firstIndex = -1;
    let previousIndex = -1;
    let currentConsecutive = 0;
    let bestConsecutive = 0;

    const positions = [];

    for (
        let i = 0;
        i < text.length && queryIndex < query.length;
        i++
    ) {
        if (text[i] !== query[queryIndex]) {
            continue;
        }

        if (firstIndex === -1) {
            firstIndex = i;
            currentConsecutive = 1;
        } else if (i === previousIndex + 1) {
            currentConsecutive++;
        } else {
            currentConsecutive = 1;
        }

        bestConsecutive = Math.max(
            bestConsecutive,
            currentConsecutive
        );

        positions.push(i);
        previousIndex = i;
        queryIndex++;
    }

    if (!positions.length) {
        return {
            matched: 0,
            consecutive: 0,
            span: Infinity,
            positions: []
        };
    }

    return {
        matched: queryIndex,
        consecutive: bestConsecutive,
        span:
            positions[positions.length - 1] -
            firstIndex +
            1,
        positions
    };
}

function emptyMatch() {
    return {
        score: 0,
        matched: 0,
        exact: false,
        prefix: false,
        contains: false,
        consecutive: 0,
        span: Infinity,
        positions: []
    };
}

function matchField(
    query,
    normalizedText,
    compactNormalizedText
) {
    if (!query || !normalizedText) {
        return emptyMatch();
    }

    const compactQuery = compactText(query);

    const exact =
        normalizedText === query;

    const prefix =
        normalizedText.startsWith(query);

    const contains =
        normalizedText.includes(query);

    const compactContains =
        compactNormalizedText.includes(
            compactQuery
        );

    if (exact) {
        return {
            score: 100000,
            matched: query.length,
            exact: true,
            prefix: true,
            contains: true,
            consecutive: query.length,
            span: query.length,
            positions: Array.from(
                { length: query.length },
                (_, index) => index
            )
        };
    }

    if (prefix) {
        return {
            score: 50000,
            matched: query.length,
            exact: false,
            prefix: true,
            contains: true,
            consecutive: query.length,
            span: query.length,
            positions: Array.from(
                { length: query.length },
                (_, index) => index
            )
        };
    }

    if (contains) {
        const start =
            normalizedText.indexOf(query);

        return {
            score: 25000,
            matched: query.length,
            exact: false,
            prefix: false,
            contains: true,
            consecutive: query.length,
            span: query.length,
            positions: Array.from(
                { length: query.length },
                (_, index) =>
                    start + index
            )
        };
    }

    if (compactContains) {
        return {
            score: 18000,
            matched: query.length,
            exact: false,
            prefix: false,
            contains: true,
            consecutive: query.length,
            span: query.length,
            positions: []
        };
    }

    const fuzzy = isSubsequence(
        compactQuery,
        compactNormalizedText
    );

    if (!fuzzy.matched) {
        return emptyMatch();
    }

    const coverage =
        fuzzy.matched / compactQuery.length;

    if (coverage < 0.6) {
        return emptyMatch();
    }

    let score = 0;

    score += fuzzy.matched * 100;
    score += fuzzy.consecutive * 250;
    score += coverage * 1000;
    score +=
        Math.max(0, 100 - fuzzy.span) * 5;

    return {
        score,
        matched: fuzzy.matched,
        exact: false,
        prefix: false,
        contains: false,
        consecutive: fuzzy.consecutive,
        span: fuzzy.span,
        positions: []
    };
}

function calculateMatchScore(query, product) {
    const fields = {
        name: matchField(
            query,
            product._name,
            product._compactName
        ),

        category: matchField(
            query,
            product._category,
            product._compactCategory
        ),

        description: matchField(
            query,
            product._description,
            product._compactDescription
        ),

        characteristics: matchField(
            query,
            product._characteristics,
            product._compactCharacteristics
        )
    };

    const hasMatch = Object.values(fields).some(
        field => field.matched > 0
    );

    if (!hasMatch) {
        return null;
    }

    let score = 0;

    for (
        const [field, match]
        of Object.entries(fields)
    ) {
        if (!match.matched) {
            continue;
        }

        score +=
            match.score *
            FIELD_WEIGHTS[field];
    }

    const name = fields.name;
    const category = fields.category;

    if (name.exact) {
        score += 1000000000;
    } else if (name.prefix) {
        score += 100000000;
    } else if (name.contains) {
        score += 10000000;
    }

    if (category.exact) {
        score += 5000000;
    } else if (category.prefix) {
        score += 1000000;
    }

    score +=
        name.consecutive *
        100000;

    score +=
        name.matched *
        10000;

    return {
        score,
        nameMatch: name,
        categoryMatch: category,
        descriptionMatch: fields.description,
        characteristicsMatch:
            fields.characteristics
    };
}

function searchProductsByQuery(value) {
    const query =
        normalizeText(value);

    if (!query || !searchReady) {
        return [];
    }

    const results = [];

    for (const product of searchIndex) {
        const match =
            calculateMatchScore(
                query,
                product
            );

        if (!match) {
            continue;
        }

        results.push({
            ...product,
            ...match
        });
    }

    results.sort((a, b) => {
        if (
            b.nameMatch.exact !==
            a.nameMatch.exact
        ) {
            return (
                Number(b.nameMatch.exact) -
                Number(a.nameMatch.exact)
            );
        }

        if (
            b.nameMatch.prefix !==
            a.nameMatch.prefix
        ) {
            return (
                Number(b.nameMatch.prefix) -
                Number(a.nameMatch.prefix)
            );
        }

        if (
            b.nameMatch.contains !==
            a.nameMatch.contains
        ) {
            return (
                Number(b.nameMatch.contains) -
                Number(a.nameMatch.contains)
            );
        }

        if (
            b.nameMatch.consecutive !==
            a.nameMatch.consecutive
        ) {
            return (
                b.nameMatch.consecutive -
                a.nameMatch.consecutive
            );
        }

        if (
            b.nameMatch.matched !==
            a.nameMatch.matched
        ) {
            return (
                b.nameMatch.matched -
                a.nameMatch.matched
            );
        }

        if (
            a.nameMatch.span !==
            b.nameMatch.span
        ) {
            return (
                a.nameMatch.span -
                b.nameMatch.span
            );
        }

        return b.score - a.score;
    });

    return results;
}

function highlightText(text, query) {
    const fragment =
        document.createDocumentFragment();

    if (!query) {
        fragment.appendChild(
            document.createTextNode(text)
        );

        return fragment;
    }

    const normalizedQuery =
        normalizeText(query);

    if (!normalizedQuery) {
        fragment.appendChild(
            document.createTextNode(text)
        );

        return fragment;
    }

    const normalizedText =
        normalizeText(text);

    const start =
        normalizedText.indexOf(
            normalizedQuery
        );

    if (start === -1) {
        fragment.appendChild(
            document.createTextNode(text)
        );

        return fragment;
    }

    const before =
        text.slice(0, start);

    const matched =
        text.slice(
            start,
            start + normalizedQuery.length
        );

    const after =
        text.slice(
            start + normalizedQuery.length
        );

    if (before) {
        fragment.appendChild(
            document.createTextNode(before)
        );
    }

    const highlighted =
        document.createElement("span");

    highlighted.className =
        "search-match";

    highlighted.textContent =
        matched;

    fragment.appendChild(
        highlighted
    );

    if (after) {
        fragment.appendChild(
            document.createTextNode(after)
        );
    }

    return fragment;
}

function renderSearchResults(
    results,
    query
) {
    const container =
        document.querySelector(
            "#headerSearchResults"
        );

    if (!container) {
        return;
    }

    container.innerHTML = "";

    const unique = [];
    const seen = new Set();

    for (const product of results) {
        const key =
            product.productKey;

        if (seen.has(key)) {
            continue;
        }

        seen.add(key);
        unique.push(product);

        if (
            unique.length >=
            MAX_RESULTS
        ) {
            break;
        }
    }

    if (!unique.length) {
        container.hidden = true;
        return;
    }

    for (const product of unique) {
        const button =
            document.createElement("button");

        button.type = "button";
        button.className =
            "header-search-result";

        button.dataset.productKey =
            product.productKey;

        const name =
            document.createElement("span");

        name.className =
            "header-search-result-name";

        name.appendChild(
            highlightText(
                product.name,
                query
            )
        );

        button.appendChild(name);

        if (product.category) {
            const category =
                document.createElement("span");

            category.className =
                "header-search-result-category";

            category.textContent =
                product.category;

            button.appendChild(category);
        }

        container.appendChild(button);
    }

    container.hidden = false;
}

function setupSearchResultEvents() {
    const container =
        document.querySelector(
            "#headerSearchResults"
        );

    if (!container) {
        return;
    }

    container.addEventListener(
        "click",
        event => {
            const result =
                event.target.closest(
                    ".header-search-result"
                );

            if (!result) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();

            const productKey =
                result.dataset.productKey;

            if (!productKey) {
                return;
            }

            window.location.href =
                `products.html?product=${encodeURIComponent(
                    productKey
                )}`;
        }
    );
}

function setupSearchEvents() {
    const input =
        document.querySelector(
            "#headerProductSearch"
        );

    const results =
        document.querySelector(
            "#headerSearchResults"
        );

    const clearButton =
        document.querySelector(
            "#headerSearchClear"
        );

    if (!input) {
        return;
    }

    input.addEventListener(
        "input",
        () => {
            const query =
                input.value.trim();

            if (!query) {
                if (results) {
                    results.innerHTML = "";
                    results.hidden = true;
                }

                return;
            }

            const matches =
                searchProductsByQuery(
                    query
                );

            renderSearchResults(
                matches,
                query
            );
        }
    );

    if (clearButton) {
        clearButton.addEventListener(
            "click",
            event => {
                event.stopPropagation();

                input.value = "";
                input.focus();

                if (results) {
                    results.innerHTML = "";
                    results.hidden = true;
                }
            }
        );
    }
}

function setupHeaderBehavior() {
    const header =
        document.querySelector("header");

    const preHeader =
        document.querySelector(
            ".pre-header"
        );

    const searchInput =
        document.querySelector(
            "#headerProductSearch"
        );

    const search =
        document.querySelector(
            ".header-search"
        );

    if (
        !header ||
        !preHeader ||
        !searchInput ||
        !search
    ) {
        return;
    }

    let searchActive = false;

    const headerOffsetHeight =
        preHeader.offsetHeight +
        header.offsetHeight;

    document.documentElement.style.setProperty(
        "--preHeader-height",
        `${preHeader.offsetHeight}px`
    );

    document.documentElement.style.setProperty(
        "--header-height",
        `${header.offsetHeight}px`
    );

    function updateHeader() {
        const scrolled =
            window.scrollY >
            headerOffsetHeight;

        const active =
            scrolled ||
            searchActive;

        header.classList.toggle(
            "active",
            active
        );

        preHeader.classList.toggle(
            "disabled",
            active
        );
    }

    function setSearchActive(active) {
        searchActive = active;

        search.classList.toggle(
            "active",
            active
        );

        updateHeader();

        if (active) {
            searchInput.focus();
        }
    }

    window.addEventListener(
        "scroll",
        updateHeader,
        { passive: true }
    );

    searchInput.addEventListener(
        "focus",
        () => {
            setSearchActive(true);
        }
    );

    document.addEventListener(
        "click",
        event => {
            if (
                header.contains(
                    event.target
                )
            ) {
                return;
            }

            setSearchActive(false);
        }
    );

    searchInput.addEventListener(
        "keydown",
        event => {
            if (
                event.key !== "Escape"
            ) {
                return;
            }

            searchInput.value = "";

            const results =
                document.querySelector(
                    "#headerSearchResults"
                );

            if (results) {
                results.innerHTML = "";
                results.hidden = true;
            }

            setSearchActive(false);
            searchInput.blur();
        }
    );

    updateHeader();
}

export async function headerSearch() {
    if (!searchReady) {
        await loadSearchCatalogs();
    }

    setupSearchEvents();
    setupSearchResultEvents();
}

export function headerBehavior() {
    setupHeaderBehavior();
}