// Función para logout de usuario - NUEVA FUNCIÓN
export const logoutUser = async () => {
    const refresh_token = localStorage.getItem('refresh_token');

    if (!refresh_token) {
        throw new Error('No hay token de refresh disponible');
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            },
            body: JSON.stringify({ refresh_token })
        });

        const data = await response.json();

        if (!response.ok) {
            throw {
                status: response.status,
                data: data
            };
        }

        return data;
    } catch (error) {
        if (error.status) {
            throw error;
        } else {
            throw {
                status: 0,
                data: {
                    code: 'NETWORK_ERROR',
                    message: 'Error de conexión. Verifica tu internet e intenta nuevamente.'
                }
            };
        }
    }
};