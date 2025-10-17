// Chave usada no localStorage para salvar o carrinho
const STORAGE_KEY = 'ecommerceCart';

/**
 * Carrega o carrinho do localStorage.
 * @returns {Array} Lista de itens do carrinho ou array vazio se não houver dados.
 */
function loadCart() {
    try {
        const storedCart = localStorage.getItem(STORAGE_KEY);
        // Retorna o carrinho convertido de JSON ou um array vazio se não existir
        return storedCart ? JSON.parse(storedCart) : [];
    } catch (error) {
        console.error("Erro ao carregar o carrinho do localStorage:", error);
        return [];
    }
}

/**
 * Salva o carrinho no localStorage.
 * @param {Array} cart - Lista de itens do carrinho.
 */
function saveCart(cart) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
        console.error("Erro ao salvar o carrinho no localStorage:", error);
    }
}

/**
 * Calcula os totais do carrinho (subtotal, desconto total, total final e quantidade total de itens).
 * @param {Array} cart - Lista de itens do carrinho.
 * @returns {Object} Objeto com os totais calculados.
 */
function calculateTotals(cart) {
    let subtotal = 0;
    let totalDiscount = 0;
    let totalItems = 0;

    // Percorre todos os itens para somar valores
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;

        // Aplica desconto caso exista
        const itemDiscount = (item.discount || 0) * item.quantity;
        totalDiscount += itemDiscount;

        totalItems += item.quantity;
    });

    // Calcula o valor final com desconto
    const finalTotal = subtotal - totalDiscount;

    return { subtotal, totalDiscount, finalTotal, totalItems };
}

/**
 * Adiciona um produto ao carrinho.
 * Se já existir, apenas incrementa a quantidade.
 * @param {Object} product - Produto a ser adicionado.
 * @returns {Array} Carrinho atualizado.
 */
function addItemToCart(product) {
    const cart = loadCart();
    const existingItemIndex = cart.findIndex(item => item.id === product.id);

    if (existingItemIndex > -1) {
        // Produto já existe → incrementa a quantidade
        cart[existingItemIndex].quantity += 1;
    } else {
        // Adiciona novo produto
        const newItem = {
            id: product.id,
            name: product.name,
            price: product.price,
            discount: product.discounts || 0, 
            quantity: 1,
        };
        cart.push(newItem);
    }

    saveCart(cart);
    return cart;
}

/**
 * Atualiza a quantidade de um item no carrinho.
 * Se a quantidade for menor ou igual a 0, o item é removido.
 * @param {number|string} productId - ID do produto a ser atualizado.
 * @param {number} newQuantity - Nova quantidade do produto.
 * @returns {Array} Carrinho atualizado.
 */
function updateItemQuantity(productId, newQuantity) {
    const cart = loadCart();
    const itemIndex = cart.findIndex(item => item.id === productId);

    if (itemIndex > -1) {
        if (newQuantity <= 0) {
            // Quantidade inválida → remove o item
            return removeItemFromCart(productId);
        }

        // Atualiza a quantidade do item
        cart[itemIndex].quantity = newQuantity;
        saveCart(cart);
    }

    return cart;
}

/**
 * Remove todos os itens do carrinho.
 * @returns {Array} Carrinho vazio.
 */
function clearCart() {
    saveCart([]);
    return [];
}

/**
 * Remove um item específico do carrinho.
 * @param {number|string} productId - ID do produto a ser removido.
 * @returns {Array} Carrinho atualizado sem o item.
 */
function removeItemFromCart(productId) {
    const cart = loadCart();
    const updatedCart = cart.filter(item => item.id !== productId);

    saveCart(updatedCart);
    return updatedCart;
}

// Exporta todas as funções para uso em outros módulos
export { 
    loadCart, 
    saveCart, 
    addItemToCart, 
    removeItemFromCart,
    updateItemQuantity,
    clearCart,
    calculateTotals
};
