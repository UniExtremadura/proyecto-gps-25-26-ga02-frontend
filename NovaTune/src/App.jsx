// NovaTune/src/App.jsx
import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

import RegisterForm from "./components/auth/RegisterForm.jsx";
import LoginForm from "./components/auth/LoginForm.jsx";
import LogoutButton from "./components/auth/LogoutButton.jsx";

import SongsList from "./pages/SongsList.jsx";
import LabelStatsDashboard from "./pages/LabelStatsDashboard.jsx";
import Ratings from "./pages/Ratings.jsx";
import Cart from "./pages/Cart.jsx";
import Checkout from "./pages/Checkout.jsx";
import { useAuth } from "./hooks/useAuth.jsx";
import {useCart } from "./context/CartContext.jsx";

function App() {
    // count se queda por si lo necesitas más adelante (plantilla de Vite)
    const [count, setCount] = useState(0);
    const [currentView, setCurrentView] = useState("home"); // 'home' | 'register' | 'login' | 'songs' | 'label_stats'
    const [resetToken, setResetToken] = useState("");
    const [activeOrderId, setActiveOrderId] = useState(null);
    const { cartCount } = useCart();

    const { isAuthenticated, login, logout, getCurrentUserRole } = useAuth();
    const [currentRole, setCurrentRole] = useState(null);

    useEffect(() => {
        let mounted = true;
        (async () => {
            if (!isAuthenticated) {
                setCurrentRole(null);
                return;
            }
            try {
                const role = await getCurrentUserRole();
                if (mounted) setCurrentRole(role);
            } catch (e) {
                if (mounted) setCurrentRole(null);
            }
        })();
        return () => { mounted = false };
    }, [isAuthenticated, getCurrentUserRole]);

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

                    {isAuthenticated && (
                        <div className="dashboard-buttons">
                            <button onClick={() => setCurrentView("songs")}>
                                Ver estadísticas
                            </button>
                            <button className="primary" onClick={() => setCurrentView("cart")}>
                                🛒 Ir a mi Carrito
                            </button>
                        </div>
                    )}

                    <p>
                        {isAuthenticated
                            ? "¡Bienvenido! Tu sesión está activa."
                            : "Inicia sesión o regístrate para acceder al panel del artista y de la discográfica."}
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

                    {/* ACCESOS DIRECTOS A LOS PANELES CUANDO YA ESTÁ LOGUEADO */}
                    {isAuthenticated && (
                        <div className="stats-shortcut">
                            <p>Accede rápidamente a tus paneles de estadísticas:</p>
                            <div className="stats-shortcut-buttons">
                                {/* Show only the panel corresponding to the current role */}
                                {(() => {
                                    const r = currentRole ? String(currentRole).toLowerCase() : null;
                                    if (!r) return null; // still loading role
                                    if (r.includes('artist') || r.includes('artista')) {
                                        return (
                                            <button className="primary-button" onClick={() => setCurrentView('songs')}>
                                                Panel de artista
                                            </button>
                                        );
                                    }
                                    if (r.includes('label') || r.includes('discograf')) {
                                        return (
                                            <button className="secondary-button" onClick={() => setCurrentView('label_stats')}>
                                                Panel de discográfica
                                            </button>
                                        );
                                    }
                                    // default: normal user
                                    return (
                                        <button className="secondary-button" onClick={() => setCurrentView('ratings')}>
                                            Valoraciones de usuarios
                                        </button>
                                    );
                                })()}
                            </div>
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
                    // guardamos sesión en el AuthStore
                    login(userData);
                    setCurrentView("home");
                }}
            />
        );
    } else if (currentView === "songs") {
        // Vista del panel de estadísticas (lista de canciones del artista)
        mainContent = (
            <div className="songs-view">
                <button className="back-button" onClick={() => setCurrentView("home")}>
                    ← Volver al inicio
                </button>

                <SongsList />
            </div>
        );
    } else if (currentView === "label_stats") {
        // Vista del panel de estadísticas agregadas de la discográfica
        mainContent = (
            <div className="songs-view">
                <button className="back-button" onClick={() => setCurrentView("home")}>
                    ← Volver al inicio
                </button>

                <LabelStatsDashboard />
            </div>
        );
    } else if (currentView === "cart") {
        mainContent = (
            <Cart
                onBack={() => setCurrentView("home")}
                onCheckout={(orderId) => {
                    setActiveOrderId(orderId); // Guardamos el ID
                    setCurrentView("checkout"); // Navegamos al pago
                }}
            />
        );
    } else if (currentView === "checkout") {
        mainContent = (
            <Checkout
                orderId={activeOrderId}
                onBack={() => setCurrentView("cart")}
                onPaymentSuccess={() => {
                    alert("¡Pago realizado con éxito! Recibirás tu factura en breve.");
                    setCurrentView("home");
                }}
            />
        );
    }
    else if (currentView === "ratings") {
        mainContent = (
            <div className="songs-view">
                <button className="back-button" onClick={() => setCurrentView("home")}>
                    ← Volver al inicio
                </button>

                <Ratings />
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
                    <div style = {{ display: "flex", alignItems: "center", gap: "15px" }}>
                        {/* --- MINI-CARRITO (GA02-71) --- */}
                        <button
                            onClick={() => setCurrentView("cart")}
                            style={{ fontSize: '0.9em', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                            🛒 Carrito ({cartCount})
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
