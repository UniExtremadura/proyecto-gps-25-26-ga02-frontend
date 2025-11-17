import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import RegisterForm from './components/auth/RegisterForm'
import LoginForm from './components/auth/LoginForm'
import LogoutButton from './components/auth/LogoutButton'
import { useAuth } from './hooks/useAuth'
import './App.css'

function App() {
    const [count, setCount] = useState(0)
    const [currentView, setCurrentView] = useState('home')
    const { isAuthenticated, login, logout } = useAuth()

    return (
        <>
            {/* BARRA DE AUTENTICACIÓN */}
            {isAuthenticated && (
                <div className="auth-bar">
                    <div className="auth-status">
                        <span className="status-dot"></span>
                        Sesión activa
                    </div>
                    <LogoutButton onLogout={logout} />
                </div>
            )}

            {currentView === 'home' ? (
                // PANTALLA INICIAL
                <>
                    <div>
                        <a href="https://vite.dev" target="_blank">
                            <img src={viteLogo} className="logo" alt="Vite logo" />
                        </a>
                        <a href="https://react.dev" target="_blank">
                            <img src={reactLogo} className="logo react" alt="React logo" />
                        </a>
                    </div>
                    <h1>Vite + React + NovaTune</h1>
                    <div className="card">

                        {/* MOSTRAR BOTONES SEGÚN AUTENTICACIÓN */}
                        {!isAuthenticated ? (
                            <>
                                <button
                                    onClick={() => setCurrentView('register')}
                                    style={{marginLeft: '10px', background: '#007bff', color: 'white'}}
                                >
                                    Registrarse
                                </button>
                                <button
                                    onClick={() => setCurrentView('login')}
                                    style={{marginLeft: '10px', background: '#28a745', color: 'white'}}
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
            ) : currentView === 'register' ? (
                <RegisterForm
                    onBack={() => setCurrentView('home')}
                    onSuccess={(userData) => {
                        console.log('Usuario registrado:', userData);
                        setCurrentView('home');
                    }}
                />
            ) : (
                <LoginForm
                    onBack={() => setCurrentView('home')}
                    onSuccess={(userData) => {
                        console.log('Usuario logueado:', userData);
                        login(userData); // Actualizar estado de autenticación
                        setCurrentView('home');
                    }}
                />
            )}
        </>
    )
}

export default App