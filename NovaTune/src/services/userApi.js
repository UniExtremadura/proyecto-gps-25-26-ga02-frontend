const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

// Función para registrar usuario
export const registerUser = async (userData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        const data = await response.json();

        if (!response.ok) {
            // Si el servidor devuelve un error
            throw {
                status: response.status,
                data: data
            };
        }

        return data;
    } catch (error) {
        if (error.status) {
            // Error del servidor (422, 409, etc.)
            throw error;
        } else {
            // Error de conexión
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

// Función para login de usuario
export const loginUser = async (userData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
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
