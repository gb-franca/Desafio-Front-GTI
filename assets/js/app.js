// Importa a lista de produtos e funções utilitárias do carrinho
import products from './data.js';
import { 
    loadCart, 
    addItemToCart, 
    removeItemFromCart, 
    calculateTotals, 
    updateItemQuantity, 
    clearCart 
} from './cart.js';

// ===============================
// VARIÁVEIS GLOBAIS DO DOM
// ===============================
const productsContainer = document.getElementById('products-container');
const cartModal = document.getElementById('cart-modal');
const cartButton = document.getElementById('cart-button');
const closeCartButton = document.getElementById('close-cart-button');
const cartItemsContainer = document.getElementById('cart-items-container');
const cartCounter = document.getElementById('cart-counter');
const cartDiscountSpan = document.getElementById('cart-discount');
const cartTotalSpan = document.getElementById('cart-total');

// ===============================
// FUNÇÕES DE UTILIDADE E RENDERIZAÇÃO
// ===============================

/**
 * Formata um número como valor monetário em BRL.
 * @param {number} value - Valor numérico.
 * @returns {string} Valor formatado (ex: R$ 10,00)
 */
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
}

/**
 * Cria o card de um produto na vitrine.
 * @param {Object} product - Objeto do produto (id, name, price, image)
 * @returns {HTMLElement} Elemento DOM representando o card do produto.
 */
function createProductCard(product) {
    const card = document.createElement('div');
    card.classList.add('product-card');

    card.innerHTML = `
        <img src="${product.image}" alt="${product.name}" class="product-image">
        <p class="product-name">${product.name}</p>
        <p class="product-price">${formatCurrency(product.price)}</p>
        <button 
            class="add-to-cart-btn" 
            data-product-id="${product.id}"
        >
            Adicionar ao Carrinho
        </button>
    `;

    // Evento de adicionar o produto ao carrinho
    card.querySelector('.add-to-cart-btn')
        .addEventListener('click', () => handleAddToCart(product));

    return card;
}

/**
 * Renderiza todos os produtos na página.
 */
function renderProducts() {
    productsContainer.innerHTML = ''; 
    products.forEach(product => {
        const card = createProductCard(product);
        productsContainer.appendChild(card);
    });
}

/**
 * Cria o elemento visual de um item dentro do carrinho.
 * @param {Object} item - Item do carrinho (id, name, price, discount, quantity)
 * @returns {HTMLElement} Elemento DOM do item no carrinho.
 */
function createCartItem(item) {
    const itemElement = document.createElement('div');
    itemElement.classList.add('cart-item');
    itemElement.dataset.productId = item.id;
    
    // Calcula preço unitário com desconto e subtotal
    const priceAfterDiscount = item.price - (item.discount || 0);
    const itemTotalPrice = priceAfterDiscount * item.quantity;

    itemElement.innerHTML = `
        <div class="item-info">
            <p class="item-name">${item.name}</p>
            <p class="item-price-unit">Preço Unit.: ${formatCurrency(priceAfterDiscount)}</p>
            
            <div class="item-qty-controls">
                <button class="qty-btn" data-action="decrease" data-product-id="${item.id}">-</button>
                <span class="item-quantity">${item.quantity}</span>
                <button class="qty-btn" data-action="increase" data-product-id="${item.id}">+</button>
            </div>
        </div>
        
        <div class="item-total-price">${formatCurrency(itemTotalPrice)}</div>
        
        <button class="remove-item-btn" data-product-id="${item.id}">
            <i class="fas fa-trash-alt"></i>
        </button>
    `;

    // Botão para remover item
    itemElement.querySelector('.remove-item-btn')
        .addEventListener('click', () => handleRemoveFromCart(item.id));

    // Botões de quantidade (+ e -)
    itemElement.querySelectorAll('.qty-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const action = event.target.dataset.action;
            handleUpdateQuantity(item.id, item.quantity, action);
        });
    });

    return itemElement;
}

/**
 * Renderiza o conteúdo do carrinho (itens e totais).
 */
function renderCart() {
    const cart = loadCart(); 
    const totals = calculateTotals(cart); 

    cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Seu carrinho está vazio.</p>';
    } else {
        cart.forEach(item => {
            cartItemsContainer.appendChild(createCartItem(item));
        });
    }

    // Atualiza totais e contador de itens
    cartDiscountSpan.textContent = formatCurrency(totals.totalDiscount);
    cartTotalSpan.textContent = formatCurrency(totals.finalTotal);
    cartCounter.textContent = totals.totalItems;
}

/**
 * Alterna a visibilidade do modal do carrinho.
 */
function toggleCartModal() {
    cartModal.classList.toggle('open');
    if (cartModal.classList.contains('open')) {
        renderCart();
    }
}

// ===============================
// EVENT HANDLERS
// ===============================

/**
 * Adiciona um produto ao carrinho.
 * @param {Object} product - Produto a ser adicionado.
 */
function handleAddToCart(product) {
    addItemToCart(product); 
    renderCart();   
}

/**
 * Remove um item do carrinho.
 * @param {number|string} productId - ID do produto a ser removido.
 */
function handleRemoveFromCart(productId) {
    removeItemFromCart(productId);
    renderCart();    
}

/**
 * Atualiza a quantidade de um item no carrinho.
 * @param {number|string} productId 
 * @param {number} currentQuantity 
 * @param {'increase'|'decrease'} action 
 */
function handleUpdateQuantity(productId, currentQuantity, action) {
    const newQuantity = action === 'increase' 
        ? currentQuantity + 1 
        : Math.max(currentQuantity - 1, 0); // Evita valores negativos

    updateItemQuantity(productId, newQuantity);
    renderCart();
}

// ===============================
// INICIALIZAÇÃO DA APLICAÇÃO
// ===============================

function initApp() {
    renderProducts();
    renderCart();

    // Abre/fecha modal do carrinho
    cartButton.addEventListener('click', toggleCartModal);
    closeCartButton.addEventListener('click', toggleCartModal);

    // Fecha o carrinho ao clicar fora da área de conteúdo
    cartModal.addEventListener('click', (event) => {
        if (event.target === cartModal) toggleCartModal();
    });

    // Evento de finalização de compra
    const checkoutButton = document.getElementById('checkout-button');
    checkoutButton.addEventListener('click', () => {
        const cart = loadCart();

        if (cart.length > 0) {
            alert("Compra finalizada com sucesso! O carrinho será limpo.");
            clearCart();
            renderCart();
            toggleCartModal(); 
        } else {
            alert("Seu carrinho está vazio!");
        }
    });
}

// Inicializa a aplicação
initApp();
