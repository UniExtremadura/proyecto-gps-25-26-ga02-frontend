// components/auth/LogoutButton.jsx
import React, { useState } from 'react';
import { logoutUser } from '../../services/userApi';
import './LogoutButton.css';

const LogoutButton = ({ onLogout }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const showMessage = (text, type = 'info') => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 5000);
    };

    const handleLogout = async () => {
        setIsLoading(true);
        setShowConfirm(false);

        try {
            // Enviar solicitud al backend
            await logoutUser();

            // Actualizar el estado global
            onLogout();

            // Mostrar confirmación
            showMessage('Sesión cerrada correctamente', 'success');

            // Redirigir al usuario
            setTimeout(() => {
                window.location.href = '/';
            }, 1500);

        } catch (error) {
            console.error('Error al cerrar sesión:', error);

            if (error.status === 422 || error.status === 401) {
                // Token inválido - limpiar igualmente
                onLogout();
                showMessage('Sesión expirada', 'info');
                setTimeout(() => window.location.href = '/', 1000);
            } else {
                showMessage('Error al cerrar sesión. Intenta nuevamente.', 'error');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmLogout = () => {
        setShowConfirm(true);
    };

    const handleCancelLogout = () => {
        setShowConfirm(false);
        setMessage({ text: '', type: '' });
    };

    return (
        <div className="logout-container">
            {!showConfirm ? (
                <button
                    onClick={handleConfirmLogout}
                    className="logout-btn"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <span className="loading-spinner">⟳</span>
                    ) : (
                        <span className="logout-icon">🚪</span>
                    )}
                    Cerrar Sesión
                </button>
            ) : (
                <div className="confirm-dialog">
                    <p>¿Estás seguro de que quieres cerrar sesión?</p>
                    <div className="confirm-buttons">
                        <button
                            onClick={handleLogout}
                            className="confirm-btn confirm-yes"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Cerrando...' : 'Sí, cerrar'}
                        </button>
                        <button
                            onClick={handleCancelLogout}
                            className="confirm-btn confirm-no"
                            disabled={isLoading}
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}

            {/* Mensajes de confirmación/error */}
            {message.text && (
                <div className={`message ${message.type}`}>
                    {message.type === 'success' && '✓ '}
                    {message.type === 'error' && '⚠ '}
                    {message.text}
                </div>
            )}
        </div>
    );
};

export default LogoutButton;