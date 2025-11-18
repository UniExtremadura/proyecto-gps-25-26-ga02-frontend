// NovaTune/src/App.jsx
import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

import RegisterForm from "./components/auth/RegisterForm.jsx";
import LoginForm from "./components/auth/LoginForm.jsx";
import LogoutButton from "./components/auth/LogoutButton.jsx";

import SongsList from "./pages/SongsList.jsx";
import { useAuth } from "./hooks/useAuth.jsx";

function App() {
    const [count, setCount] = useState(0);
    const [currentView, setCurrentView] = useState("home"); // 'home' | 'register' | 'login' | 'songs'

    const { isAuthenticated, login, logout } = useAuth();

    // --------- CONTENIDO PRINCIPAL SEGÚN LA VISTA ACTUAL ----------
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

                    <p>
                        {isAuthenticated
                            ? "¡Bienvenido! Tu sesión está activa."
                            : "Inicia sesión o regístrate para acceder al panel del artista."}
                    </p>

                    {/* BOTONES DE LOGIN / REGISTRO CUANDO NO ESTÁ AUTENTICADO */}
                    {!isAuthenticated && (
                        <div className="auth-buttons">
                            <button onClick={() => setCurrentView("register")}>
                                Registrarse
                            </button>
                            <button onClick={() => setCurrentView("login")}>
                                Iniciar sesión
                            </button>
                        </div>
                    )}

                    {/* BOTÓN NUEVO: ACCESO DIRECTO A ESTADÍSTICAS CUANDO YA ESTÁ LOGUEADO */}
                    {isAuthenticated && (
                        <div className="stats-shortcut">
                            <button
                                className="primary-button"
                                onClick={() => setCurrentView("songs")}
                            >
                                Ver estadísticas de mis canciones
                            </button>
                        </div>
                    )}
                </div>

                <p className="read-the-docs">
                    Click on the Vite and React logos to learn more
                </p>
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
            />
        );
    } else if (currentView === "login") {
        mainContent = (
            <LoginForm
                onBack={() => setCurrentView("home")}
                onSuccess={(userData) => {
                    console.log("Usuario logueado:", userData);
                    login(userData); // guardamos sesión en el AuthStore
                    setCurrentView("home");
                }}
            />
        );
    } else if (currentView === "songs") {
        // Vista del panel de estadísticas (lista de canciones)
        mainContent = (
            <div className="songs-view">
                <button
                    className="back-button"
                    onClick={() => setCurrentView("home")}
                >
                    ← Volver al inicio
                </button>

                <SongsList />
            </div>
        );
    }

    // --------- BARRA SUPERIOR DE ESTADO DE AUTENTICACIÓN ----------
    return (
        <>
            <header className="auth-bar">
                <div className="auth-status">
          <span
              className={
                  "status-dot " + (isAuthenticated ? "status-on" : "status-off")
              }
          />
                    {isAuthenticated ? "Sesión activa" : "No has iniciado sesión"}
                </div>

                {isAuthenticated && (
                    <LogoutButton
                        onLogout={() => {
                            logout();
                            setCurrentView("home");
                        }}
                    />
                )}
            </header>

            {mainContent}
        </>
    );
}

export default App;
