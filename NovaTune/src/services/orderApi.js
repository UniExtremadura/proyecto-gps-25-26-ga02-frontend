const API_URL = 'http://localhost:8003/api/v1/orders';

/**
 * Obtiene el historial de pedidos del usuario autenticado.
 */
export const getUserOrders = async () => {
    const token = localStorage.getItem('access_token');

    if (!token) {
        throw new Error('No se encontró token de autenticación');
    }

    const response = await fetch(`${API_URL}/me/`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw {
            status: response.status,
            message: errorData.error || 'Error al obtener los pedidos',
            data: errorData
        };
    }

    return await response.json();
};