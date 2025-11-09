// En LoginForm.jsx - Solo la estructura básica
import React, { useState } from 'react';
import './LoginForm.css';

const LoginForm = ({ onBack, onSuccess }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Datos del formulario:', formData);
        // Lógica temporal
        alert('Formulario de login enviado. Esto se conectará al backend en la siguiente tarea.');
    };

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

export default LoginForm;