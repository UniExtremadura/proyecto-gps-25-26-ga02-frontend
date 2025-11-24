// NovaTune/src/App.jsx
import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

import RegisterForm from "./components/auth/RegisterForm.jsx";
import LoginForm from "./components/auth/LoginForm.jsx";
import ForgotPasswordForm from "./components/auth/ForgotPasswordForm.jsx";
import ResetPasswordForm from "./components/auth/ResetPasswordForm.jsx";
import LogoutButton from "./components/auth/LogoutButton.jsx";
import ProfilePage from "./components/profile/ProfilePage.jsx";

import SongsList from "./pages/SongsList.jsx";
import LabelStatsDashboard from "./pages/LabelStatsDashboard.jsx";
import { useAuth } from "./hooks/useAuth.jsx";

function App() {
    const [currentView, setCurrentView] = useState("home");
    const [resetToken, setResetToken] = useState("");
    const { isAuthenticated, isLoading, login, logout } = useAuth();
    const [count, setCount] = useState(0);

    const getTokenFromURL = () => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get("token");
    };

    useEffect(() => {
        const token = getTokenFromURL();
        if (token) {
            setResetToken(token);
            setCurrentView("reset-password");
        }
    }, []);

    // Mostrar loading mientras verifica autenticación
    if (isLoading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                fontSize: '18px'
            }}>
                Verificando autenticación...
            </div>
        );
    }

    let mainContent;

    if (currentView === "home") {
        mainContent = (
            <div className="root-container">
                <div className="logos-strip">
                    <a href="https://vite.dev" target="_blank" rel="noreferrer">
                        <img src={viteLogo} className="logo" alt="Vite logo" />
                    </a>
                    <a href="https://react.dev" target="_blank" rel="noreferrer">
                        <img src={reactLogo} className="logo react" alt="React logo" />
                    </a>
                </div>

                <h1>Vite + React + NovaTune</h1>

                <div className="card">
                    <button onClick={() => setCount((count) => count + 1)}>
                        count is {count}
                    </button>

                    <p>
                        {isAuthenticated
                            ? "¡Bienvenido! Tu sesión está activa."
                            : "Inicia sesión o regístrate para acceder al panel del artista y de la discográfica."}
                    </p>

                    {!isAuthenticated && (
                        <div className="auth-buttons">
                            <button
                                onClick={() => setCurrentView("register")}
                                className="auth-button"
                            >
                                Registrarse
                            </button>
                            <button
                                onClick={() => setCurrentView("login")}
                                className="auth-button"
                            >
                                Iniciar sesión
                            </button>
                        </div>
                    )}

                    {isAuthenticated && (
                        <div className="authenticated-options">
                            <button
                                className="primary-button"
                                onClick={() => setCurrentView("profile")}
                            >
                                Mi Perfil
                            </button>
                            <button
                                className="primary-button"
                                onClick={() => setCurrentView("songs")}
                            >
                                Panel de artista
                            </button>
                            <button
                                className="secondary-button"
                                onClick={() => setCurrentView("label_stats")}
                            >
                                Panel de discográfica
                            </button>
                        </div>
                    )}
                </div>

                <p className="read-the-docs">Click on the Vite and React logos to learn more</p>
            </div>
        );
    } else if (currentView === "register") {
        mainContent = (
            <RegisterForm
                onBack={() => setCurrentView("home")}
                onSuccess={(userData) => {
                    console.log("Usuario registrado:", userData);
                    setCurrentView("home");
                }}
                onNavigateToLogin={() => setCurrentView("login")}
            />
        );
    } else if (currentView === "login") {
        mainContent = (
            <LoginForm
                onBack={() => setCurrentView("home")}
                onSuccess={(userData) => {
                    console.log("Usuario logueado:", userData);
                    login(userData);
                    setCurrentView("home");
                }}
                onNavigateToForgotPassword={() => setCurrentView("forgot-password")}
                onNavigateToRegister={() => setCurrentView("register")}
            />
        );
    } else if (currentView === "forgot-password") {
        mainContent = (
            <ForgotPasswordForm
                onBack={() => setCurrentView("login")}
                onSuccess={(token) => {
                    setResetToken(token);
                    setCurrentView("reset-password");
                }}
            />
        );
    } else if (currentView === "reset-password") {
        mainContent = (
            <ResetPasswordForm
                token={resetToken}
                onBack={() => {
                    window.history.replaceState({}, document.title, window.location.pathname);
                    setResetToken("");
                    setCurrentView("home");
                }}
                onSuccess={() => {
                    window.history.replaceState({}, document.title, window.location.pathname);
                    setResetToken("");
                    setCurrentView("login");
                }}
            />
        );
    } else if (currentView === "profile") {
        mainContent = (
            <ProfilePage
                onBack={() => setCurrentView("home")}
            />
        );
    } else if (currentView === "songs") {
        mainContent = (
            <div className="songs-view">
                <button className="back-button" onClick={() => setCurrentView("home")}>
                    ← Volver al inicio
                </button>
                <SongsList />
            </div>
        );
    } else if (currentView === "label_stats") {
        mainContent = (
            <div className="songs-view">
                <button className="back-button" onClick={() => setCurrentView("home")}>
                    ← Volver al inicio
                </button>
                <LabelStatsDashboard />
            </div>
        );
    }

    return (
        <>
            <header className="auth-bar">
                <div className="auth-status">
                    <span className={"status-dot " + (isAuthenticated ? "status-on" : "status-off")} />
                    {isAuthenticated ? "Sesión activa" : "No has iniciado sesión"}
                </div>

                {isAuthenticated && (
                    <div className="auth-actions">
                        <button
                            className="profile-link"
                            onClick={() => setCurrentView("profile")}
                        >
                            Mi Perfil
                        </button>
                        <LogoutButton
                            onLogout={() => {
                                logout();
                                setCurrentView("home");
                            }}
                        />
                    </div>
                )}
            </header>

            {mainContent}
        </>
    );
}

export default App;