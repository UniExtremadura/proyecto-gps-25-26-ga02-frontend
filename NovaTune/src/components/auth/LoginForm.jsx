// En LoginForm.jsx - Solo la estructura básica
import React, { useState } from 'react';
import './LoginForm.css';

const LoginForm = ({ onBack, onSuccess }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

// Validación en tiempo real
    const validateField = (name, value) => {
        const newErrors = { ...errors };

        switch (name) {
            case 'email':
                if (!value.trim()) {
                    newErrors.email = 'El email es requerido';
                } else if (!/\S+@\S+\.\S+/.test(value)) {
                    newErrors.email = 'Formato de email inválido';
                } else {
                    delete newErrors.email;
                }
                break;

            case 'password':
                if (!value) {
                    newErrors.password = 'La contraseña es requerida';
                } else {
                    delete newErrors.password;
                }
                break;

            default:
                break;
        }

        setErrors(newErrors);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        validateField(name, value);
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched({
            ...touched,
            [name]: true
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validar todos los campos antes de enviar
        Object.keys(formData).forEach(key => {
            validateField(key, formData[key]);
        });

        // Marcar todos los campos como tocados
        setTouched({
            email: true,
            password: true
        });

        // Si hay errores, no enviar
        if (Object.keys(errors).length > 0) {
            return;
        }

        console.log('Formulario válido, listo para conectar con el backend');
    };

// Helper para mostrar errores
    const showError = (field) => touched[field] && errors[field];

    return (
        <div className="login-container">
            <button onClick={onBack} className="back-btn">← Volver</button>
            <h2>Iniciar Sesión en NovaTune</h2>

            <form onSubmit={handleSubmit} className="login-form">
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="tu@email.com"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="password">Contraseña</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Tu contraseña"
                    />
                </div>

                <button type="submit" className="submit-btn">
                    Iniciar Sesión
                </button>

                <div className="login-links">
                    <p>¿No tienes cuenta? <button type="button" className="link-btn">Regístrate aquí</button></p>
                </div>
            </form>
        </div>
    );
};

// Añadir states para mensajes
const [successMessage, setSuccessMessage] = useState('');
const [showSuccess, setShowSuccess] = useState(false);

// En el bloque try del handleSubmit:
const response = await loginUser(formData);

// ✅ ÉXITO - Mostrar mensaje y guardar tokens
setSuccessMessage(`¡Bienvenido de nuevo! Sesión iniciada correctamente.`);
setShowSuccess(true);

// Guardar tokens en localStorage
localStorage.setItem('access_token', response.access_token);
localStorage.setItem('refresh_token', response.refresh_token);

// Limpiar formulario
setFormData({
    email: '',
    password: ''
});

// En el bloque catch:
if (error.status === 422 && error.data && error.data.details) {
    // Errores de validación del servidor
    setErrors(error.data.details);
} else if (error.status === 0) {
    // Error de conexión
    setErrors({ general: 'Error de conexión con el servidor. Intenta nuevamente.' });
} else {
    // Error inesperado
    setErrors({ general: error.data?.message || 'Ha ocurrido un error inesperado.' });
}
setShowSuccess(false);

// Añadir en el JSX los mensajes:
{showSuccess && (
    <div className="success-message">
        <div className="success-icon">✓</div>
        <div className="success-content">
            <strong>¡Sesión Iniciada!</strong>
            <p>{successMessage}</p>
            <small>Redirigiendo...</small>
        </div>
    </div>
)}

{errors.general && !showSuccess && (
    <div className="error-message">
        <div className="error-icon">⚠</div>
        {errors.general}
    </div>
)}

export default LoginForm;