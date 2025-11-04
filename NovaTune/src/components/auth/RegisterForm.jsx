import React, { useState } from 'react';
import './RegisterForm.css';

const RegisterForm = ({ onBack }) => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    // Validación en tiempo real
    const validateField = (name, value) => {
        const newErrors = { ...errors };

        switch (name) {
            case 'username':
                if (!value.trim()) {
                    newErrors.username = 'El nombre de usuario es requerido';
                } else if (value.length < 3) {
                    newErrors.username = 'Mínimo 3 caracteres';
                } else {
                    delete newErrors.username;
                }
                break;

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
                } else if (value.length < 8) {
                    newErrors.password = 'Mínimo 8 caracteres';
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

        // Validar campo después de cambiar
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
            username: true,
            email: true,
            password: true
        });

        // Si no hay errores, proceder (lo conectaremos en el PASO 3)
        if (Object.keys(errors).length === 0) {
            console.log('Formulario válido, listo para enviar:', formData);
            // Aquí irá la conexión con el backend
        }
    };

    // Helper para mostrar errores solo si el campo fue tocado
    const showError = (field) => touched[field] && errors[field];

    return (
        <div className="register-container">
            <button onClick={onBack} className="back-btn">← Volver</button>
            <h2>Crear Cuenta en NovaTune</h2>

            <form onSubmit={handleSubmit} className="register-form">
                <div className="form-group">
                    <label htmlFor="username">Nombre de usuario</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={showError('username') ? 'error' : ''}
                    />
                    {showError('username') && (
                        <span className="error-text">{errors.username}</span>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={showError('email') ? 'error' : ''}
                    />
                    {showError('email') && (
                        <span className="error-text">{errors.email}</span>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="password">Contraseña</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={showError('password') ? 'error' : ''}
                    />
                    {showError('password') && (
                        <span className="error-text">{errors.password}</span>
                    )}
                </div>

                <button type="submit" className="submit-btn">
                    Registrarse
                </button>
            </form>
        </div>
    );
};

export default RegisterForm;