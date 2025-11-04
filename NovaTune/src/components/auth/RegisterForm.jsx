import React, { useState } from 'react';
import './RegisterForm.css';

const RegisterForm = ({ onBack }) => {  // ← AÑADIDO onBack prop
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });

    return (
        <div className="register-container">
            <button onClick={onBack} className="back-btn">← Volver</button>
            <h2>Crear Cuenta en NovaTune</h2>
            <form className="register-form">
                <div className="form-group">
                    <label htmlFor="username">Nombre de usuario</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="password">Contraseña</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                </div>

                <button type="submit" className="submit-btn">
                    Registrarse
                </button>
            </form>
        </div>
    );
};

export default RegisterForm;