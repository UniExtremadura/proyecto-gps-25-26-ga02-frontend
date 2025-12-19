import React, { useState, useEffect } from 'react';
import { getUserProfile, updateUserProfile } from '../../services/userApi';
import { useAuth } from '../../hooks/useAuth';
import './ProfilePage.css';
import { getUserOrders } from '../../services/orderApi';

const ProfilePage = ({ onBack }) => {
    const { isAuthenticated } = useAuth();
    const [profile, setProfile] = useState(null);
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');

    // Datos del formulario de edición
    const [formData, setFormData] = useState({
        alias: '',
        avatar_url: '',
        bio: '',
        country: '',
        preferences: {
            language: 'es',
            explicit_filter: true
        }
    });

    // Cargar perfil al montar el componente
    useEffect(() => {
        if (isAuthenticated) {
            loadProfile();
            loadOrders();
        }
    }, [isAuthenticated]);

    const loadProfile = async () => {
        try {
            setIsLoading(true);
            const userProfile = await getUserProfile();
            setProfile(userProfile);

            // Inicializar formulario con datos actuales
            setFormData({
                alias: userProfile.alias || '',
                avatar_url: userProfile.avatar_url || '',
                bio: userProfile.bio || '',
                country: userProfile.country || '',
                preferences: userProfile.preferences || {
                    language: 'es',
                    explicit_filter: true
                }
            });
        } catch (error) {
            console.error('Error cargando perfil:', error);
            setErrors({ general: 'Error al cargar el perfil' });
        } finally {
            setIsLoading(false);
        }
    };

    // Cargar pedidos del usuario
    const loadOrders = async () => {
        try {
            const userOrders = await getUserOrders();
            setOrders(userOrders);
        } catch (error) {
            console.error('Error cargando pedidos:', error);
        }
    };

    const handleDownloadInvoice = async (orderId) => {
        try {
            const token = localStorage.getItem('access_token');
            // Llamada al endpoint de la nueva app invoices en el puerto 8003
            const response = await fetch(`http://localhost:8003/api/v1/invoices/download/${orderId}/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || 'No se pudo generar la factura');
            }

            // Procesar el archivo binario (PDF)
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Factura_NovaTune_${orderId.slice(0, 8)}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();

        } catch (error) {
            console.error('Error al obtener factura:', error);
            alert(error.message || 'Error de conexión con el servicio de facturación');
        }
    };

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
        setErrors({});
        setSuccessMessage('');
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePreferencesChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            preferences: {
                ...prev.preferences,
                [name]: type === 'checkbox' ? checked : value
            }
        }));
    };

    const handleSave = async (e) => {
        e.preventDefault();

        try {
            setIsSaving(true);
            setErrors({});
            setSuccessMessage('');

            const updatedProfile = await updateUserProfile(formData);
            setProfile(updatedProfile);
            setSuccessMessage('Perfil actualizado correctamente');
            setIsEditing(false);

            // Recargar después de un tiempo
            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);

        } catch (error) {
            console.error('Error actualizando perfil:', error);
            if (error.status === 422 && error.data && error.data.details) {
                setErrors(error.data.details);
            } else {
                setErrors({ general: 'Error al actualizar el perfil' });
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        // Restaurar datos originales
        if (profile) {
            setFormData({
                alias: profile.alias || '',
                avatar_url: profile.avatar_url || '',
                bio: profile.bio || '',
                country: profile.country || '',
                preferences: profile.preferences || {
                    language: 'es',
                    explicit_filter: true
                }
            });
        }
        setIsEditing(false);
        setErrors({});
        setSuccessMessage('');
    };

    if (isLoading) {
        return (
            <div className="profile-container">
                <button onClick={onBack} className="back-btn">← Volver</button>
                <div className="loading">Cargando perfil...</div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="profile-container">
                <button onClick={onBack} className="back-btn">← Volver</button>
                <div className="error-message">No se pudo cargar el perfil</div>
            </div>
        );
    }

    return (
        <div className="profile-container">
            <button onClick={onBack} className="back-btn">← Volver</button>

            {/* Mensaje de éxito */}
            {successMessage && (
                <div className="success-message">
                    <div className="success-icon">✓</div>
                    {successMessage}
                </div>
            )}

            {/* Error general */}
            {errors.general && (
                <div className="error-message">
                    <div className="error-icon">⚠</div>
                    {errors.general}
                </div>
            )}

            <div className="profile-header">
                <div className="profile-avatar-section">
                    <div className="avatar-container">
                        {profile.avatar_url ? (
                            <div
                                className="avatar-image"
                                style={{ backgroundImage: `url(${profile.avatar_url})` }}
                            />
                        ) : (
                            <div className="avatar-placeholder">
                                {profile.alias ? profile.alias.charAt(0).toUpperCase() : profile.username.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div className="profile-title-section">
                        <h2>{profile.alias || profile.username}</h2>
                        <p className="profile-bio">{profile.bio || 'Sin biografía'}</p>
                    </div>
                </div>

                {!isEditing && (
                    <button onClick={handleEditToggle} className="edit-btn">
                        ✏️ Editar Perfil
                    </button>
                )}
            </div>

            {isEditing ? (
                // MODO EDICIÓN
                <form onSubmit={handleSave} className="profile-form">
                    <div className="form-card">
                        <h3>Información Básica</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Alias</label>
                                <input
                                    type="text"
                                    name="alias"
                                    value={formData.alias}
                                    onChange={handleInputChange}
                                    className={errors.alias ? 'error' : ''}
                                />
                                {errors.alias && <span className="error-text">{errors.alias}</span>}
                            </div>

                            <div className="form-group">
                                <label>URL del Avatar</label>
                                <input
                                    type="url"
                                    name="avatar_url"
                                    value={formData.avatar_url}
                                    onChange={handleInputChange}
                                    placeholder="https://ejemplo.com/avatar.jpg"
                                />
                            </div>

                            <div className="form-group">
                                <label>País</label>
                                <input
                                    type="text"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Biografía</label>
                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleInputChange}
                                rows="4"
                                placeholder="Cuéntanos sobre ti..."
                            />
                        </div>
                    </div>

                    <div className="form-card">
                        <h3>Preferencias</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Idioma</label>
                                <select
                                    name="language"
                                    value={formData.preferences.language || 'es'}
                                    onChange={handlePreferencesChange}
                                >
                                    <option value="es">Español</option>
                                    <option value="en">English</option>
                                    <option value="fr">Français</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group checkbox-group">
                            <label>
                                <input
                                    type="checkbox"
                                    name="explicit_filter"
                                    checked={formData.preferences.explicit_filter || false}
                                    onChange={handlePreferencesChange}
                                />
                                Filtrar contenido explícito
                            </label>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="cancel-btn"
                            disabled={isSaving}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="save-btn"
                            disabled={isSaving}
                        >
                            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            ) : (
                // MODO VISTA MODERNO
                <div className="profile-content">
                    <div className="info-grid">
                        {/* Tarjeta de Información de Cuenta */}
                        <div className="info-card">
                            <h3>Información de la Cuenta</h3>
                            <div className="info-items">
                                <div className="info-item">
                                    <strong>ID de Usuario:</strong>
                                    <span>{profile.user_id}</span>
                                </div>
                                <div className="info-item">
                                    <strong>Email:</strong>
                                    <span>{profile.email}</span>
                                </div>
                                <div className="info-item">
                                    <strong>Nombre de Usuario:</strong>
                                    <span>{profile.username}</span>
                                </div>
                                <div className="info-item">
                                    <strong>Tipo de Cuenta:</strong>
                                    <span className="user-type-badge">{profile.user_type_display}</span>
                                </div>
                            </div>
                        </div>

                        {/* Tarjeta de Perfil Público */}
                        <div className="info-card">
                            <h3>Perfil Público</h3>
                            <div className="info-items">
                                <div className="info-item">
                                    <strong>Alias:</strong>
                                    <span>{profile.alias || 'No establecido'}</span>
                                </div>
                                <div className="info-item">
                                    <strong>Avatar:</strong>
                                    <span>{profile.avatar_url ? 'Configurado' : 'No establecido'}</span>
                                </div>
                                <div className="info-item">
                                    <strong>Biografía:</strong>
                                    <span>{profile.bio || 'No establecida'}</span>
                                </div>
                                <div className="info-item">
                                    <strong>País:</strong>
                                    <span>{profile.country || 'No establecido'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Tarjeta de Preferencias */}
                        <div className="info-card">
                            <h3>Preferencias</h3>
                            <div className="info-items">
                                <div className="info-item">
                                    <strong>Idioma:</strong>
                                    <span>
                                        {profile.preferences?.language === 'es' && 'Español'}
                                        {profile.preferences?.language === 'en' && 'English'}
                                        {profile.preferences?.language === 'fr' && 'Français'}
                                        {!profile.preferences?.language && 'Español (por defecto)'}
                                    </span>
                                </div>
                                <div className="info-item">
                                    <strong>Filtro de Contenido:</strong>
                                    <span>
                                        {profile.preferences?.explicit_filter ? 'Activado' : 'Desactivado'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* 5. SECCIÓN DE HISTÓRICO DE PEDIDOS */}
                    <div className="info-card orders-section">
                        <h3>📦 Mis Pedidos Recientes</h3>
                        {orders.length === 0 ? (
                            <p className="no-data">No has realizado ninguna compra todavía.</p>
                        ) : (
                            <div className="orders-table-wrapper">
                                <table className="orders-table">
                                    <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Fecha</th>
                                        <th>Total</th>
                                        <th>Estado</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {orders.map(order => (
                                        <tr key={order.order_id}>
                                            <td className="order-id">#{order.order_id.slice(0, 8)}</td>
                                            <td>{new Date(order.created_at).toLocaleDateString()}</td>
                                            <td>{order.amount} {order.currency}</td>
                                            <td>
                                                    <span className={`status-badge ${order.status.toLowerCase()}`}>
                                                        {order.status}
                                                    </span>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;