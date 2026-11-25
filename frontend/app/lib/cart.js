const CART_KEY = 'techmart-cart';

export function isUserLoggedIn() {
  if (typeof window === 'undefined') return false;
  const raw = window.localStorage.getItem('currentUser') || window.localStorage.getItem('adminUser');
  if (!raw) return false;
  try {
    return Boolean(JSON.parse(raw));
  } catch {
    return false;
  }
}

export function readCart() {
  if (typeof window === 'undefined') return [];
  try {
    const value = JSON.parse(window.localStorage.getItem(CART_KEY) || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function saveCart(items) {
  window.localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event('cart-updated'));
}

export function addToCart(product, color) {
  const items = readCart();
  const key = `${product.sku}-${color}`;
  const existing = items.find((item) => item.key === key);
  if (existing) existing.quantity += 1;
  else items.push({ key, id: product.id, sku: product.sku, name: product.name, price: product.price, image_url: product.image_url, color, quantity: 1 });
  saveCart(items);
  return items;
}

export function updateCartQuantity(key, quantity) {
  const items = readCart().map((item) => item.key === key ? { ...item, quantity } : item).filter((item) => item.quantity > 0);
  saveCart(items);
  return items;
}

export function removeFromCart(key) {
  const items = readCart().filter((item) => item.key !== key);
  saveCart(items);
  return items;
}
