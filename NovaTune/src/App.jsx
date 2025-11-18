// NovaTune/src/App.jsx
import { useState } from 'react'
import { Routes, Route, Navigate, Link } from 'react-router-dom'

import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'

import SongsList from './pages/SongsList.jsx'
import RegisterForm from './components/auth/RegisterForm'
import LoginForm from './components/auth/LoginForm'
import LogoutButton from './components/auth/LogoutButton'
import { useAuth } from './hooks/useAuth'

import './App.css'

// Pantalla 404 del ga02-28
function NotFound() {
    return (
        <div style={{ padding: 24 }}>
            <h2>404</h2>
            <p>Ruta no encontrada.</p>
            <p>
                <Link to="/songs">Ir a Canciones</Link>
            </p>
        </div>
    )
}

// Pantalla inicial + login / registro (código del develop)
function Home() {
    const [currentView, setCurrentView] = useState('home')
    const { isAuthenticated, login } = useAuth()

    // Vista de registro
    if (currentView === 'register') {
        return (
            <RegisterForm
                onBack={() => setCurrentView('home')}
                onSuccess={(userData) => {
                    console.log('Usuario registrado:', userData)
                    setCurrentView('home')
                }}
            />
        )
    }

    // Vista de login
    if (currentView === 'login') {
        return (
            <LoginForm
                onBack={() => setCurrentView('home')}
                onSuccess={(userData) => {
                    console.log('Usuario logueado:', userData)
                    login(userData) // Actualizar estado de autenticación
                    setCurrentView('home')
                }}
            />
        )
    }

    // Vista "home" original del develop
    return (
        <>
            <div>
                <a href="https://vite.dev" target="_blank" rel="noreferrer">
                    <img src={viteLogo} className="logo" alt="Vite logo" />
                </a>
                <a href="https://react.dev" target="_blank" rel="noreferrer">
                    <img src={reactLogo} className="logo react" alt="React logo" />
                </a>
            </div>

            <h1>Vite + React + NovaTune</h1>

            <div className="card">
                {/* Botones según autenticación */}
                {!isAuthenticated ? (
                    <>
                        <button
                            onClick={() => setCurrentView('register')}
                            style={{ marginLeft: '10px', background: '#007bff', color: 'white' }}
                        >
                            Registrarse
                        </button>
                        <button
                            onClick={() => setCurrentView('login')}
                            style={{ marginLeft: '10px', background: '#28a745', color: 'white' }}
                        >
                            Iniciar Sesión
                        </button>
                    </>
                ) : (
                    <div className="welcome-message">
                        <p>¡Bienvenido! Tu sesión está activa.</p>
                    </div>
                )}

                <p>
                    Edit <code>src/App.jsx</code> and save to test HMR
                </p>
            </div>

            <p className="read-the-docs">
                Click on the Vite and React logos to learn more
            </p>
        </>
    )
}

export default function App() {
    const { isAuthenticated, logout } = useAuth()

    return (
        <div style={{ minHeight: '100vh', background: '#111', color: '#ddd' }}>
            {/* Barra de autenticación del develop */}
            {isAuthenticated && (
                <div className="auth-bar">
                    <div className="auth-status">
                        <span className="status-dot"></span>
                        Sesión activa
                    </div>
                    <LogoutButton onLogout={logout} />
                </div>
            )}

            {/* Navegación superior (inicio + canciones) */}
            <div style={{ padding: '12px 16px' }}>
                <Link to="/" style={{ color: '#8ab4f8', marginRight: 12 }}>
                    Inicio
                </Link>
                {isAuthenticated && (
                    <Link to="/songs" style={{ color: '#8ab4f8' }}>
                        Canciones
                    </Link>
                )}
            </div>

            {/* Rutas */}
            <Routes>
                <Route path="/" element={<Home />} />
                <Route
                    path="/songs"
                    element={
                        isAuthenticated ? <SongsList /> : <Navigate to="/" replace />
                    }
                />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </div>
    )
}
