// components/auth/LogoutButton.jsx
import React, { useState } from 'react';
import './LogoutButton.css';

const LogoutButton = ({ onLogout }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const showMessage = (text, type = 'info') => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 5000);
    };
};

export default LogoutButton;