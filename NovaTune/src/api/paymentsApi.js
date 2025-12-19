import axios from 'axios';

// 1. AJUSTE CLAVE: Apuntamos directamente a tu backend en el puerto 8003
// (Asegúrate de que este es el puerto donde corre tu Django "python manage.py runserver 8003")
const BASE_URL = 'http://localhost:8003/api/v1';

const paymentsApi = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

// Interceptor para agregar el token de autenticación
paymentsApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');

    // --- LOGS DE PRUEBA ---
    console.log("--> INTERCEPTOR: Token leído del storage:", token);

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log("--> INTERCEPTOR: Header enviado:", config.headers.Authorization);
    } else {
        console.warn("--> INTERCEPTOR: ¡No hay token! Se envía petición anónima.");
    }
    // ------------------------

    return config;
});

// Funciones para interactuar con la API de pagos (Carrito)
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

// --- AQUÍ ESTABA EL ERROR ---
export const paymentsService = {
    // 1. Guardar método: Usamos la URL nueva y el nombre de variable correcto
    savePaymentMethod: (paymentMethodId) => {
        return paymentsApi.post('/payments/save-method/', {
            payment_method_id: paymentMethodId
        });
    },

    // 2. Confirmar pago: Usamos la URL nueva '/payments/confirm/'
    confirmPayment: (orderId, paymentMethodId, customerId) => {
        return paymentsApi.post('/payments/confirm/', {
            order_id: orderId,
            payment_method_id: paymentMethodId,
            customer_id: customerId
        });
    }
};

export default paymentsApi;