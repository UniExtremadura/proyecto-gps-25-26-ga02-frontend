import axios from 'axios';

// Configura la URL base de la API desde las variables de entorno
const BASE_URL = import.meta.env.VITE_PAYMENTS_API_BASE || '/api/payments';

// Crea una instancia de Axios para las solicitudes relacionadas con pagos
const paymentsApi = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

// Interceptor para agregar el token de autenticación a cada solicitud
paymentsApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('token'); // Ajusta según tu Auth
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Funciones para interactuar con la API de pagos
export const cartApi = {
    getCart: () => paymentsApi.get('/cart/'),
    addItem: (productId, quantity, price) => paymentsApi.post('/cart/items/', {
        product_id: productId,
        quantity,
        price_at_addition: price
    }),
    removeItem: (itemId) => paymentsApi.delete(`/cart/items/${itemId}/`),
};

// Funciones para manejar pedidos
export const ordersApi = {
    createOrder: () => paymentsApi.post('/orders/', {}),
    getOrder: (orderId) => paymentsApi.get(`/orders/${orderId}/`),
};

// Funciones para manejar métodos de pago y confirmación de pagos
export const paymentsService = {
    savePaymentMethod: (token) => paymentsApi.post('/payment-methods/', {
        provider: 'stripe', token: stripeToken, make_default: true
    }),
    confirmPayment: (orderId, pmId) => paymentsApi.post('/payments/intent/', {
        order_id: orderId, payment_method_id: pmId
    })
};

export default paymentsApi;