import { useState, useEffect } from "react";
import "./App.css";

import RegisterForm from "./components/auth/RegisterForm.jsx";
import LoginForm from "./components/auth/LoginForm.jsx";
import ForgotPasswordForm from "./components/auth/ForgotPasswordForm.jsx";
import ResetPasswordForm from "./components/auth/ResetPasswordForm.jsx";
import LogoutButton from "./components/auth/LogoutButton.jsx";
import OrderSuccess from "./pages/OrderSuccess.jsx";
import SongsList from "./pages/SongsList.jsx";
import SongCarousel from "./components/songs/SongCarousel.jsx";
import LabelCarousel from "./components/labels/LabelCarousel.jsx";
import ArtistCarousel from "./components/artists/ArtistCarousel.jsx";
import AlbumCarousel from "./components/albums/AlbumCarousel.jsx";
import LabelStatsDashboard from "./pages/LabelStatsDashboard.jsx";
import Ratings from "./pages/Ratings.jsx";
import Cart from "./pages/Cart.jsx";
import PaymentsDashboard from "./pages/PaymentsDashboard.jsx";
import { useAuth } from "./hooks/useAuth.jsx";
import Checkout from "./pages/Checkout.jsx";

function App() {
    const [currentView, setCurrentView] = useState("home");
    const [resetToken, setResetToken] = useState("");
    const { isAuthenticated, login, logout, getCurrentUserRole } = useAuth();
    const [currentRole, setCurrentRole] = useState(null)
    const [pendingOrderId, setPendingOrderId] = useState(null);

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

    // Resolve current user role when auth state changes
    useEffect(() => {
        let cancelled = false
        const loadRole = async () => {
            if (!isAuthenticated) { setCurrentRole(null); return }
            try {
                const r = await getCurrentUserRole()
                if (!cancelled) setCurrentRole(r)
            } catch (e) {
                if (!cancelled) setCurrentRole(null)
            }
        }
        void loadRole()
        return () => { cancelled = true }
    }, [isAuthenticated])

    let mainContent;

    if (currentView === "home") {
        mainContent = (
            <div className="root-container">
                <div className="logos-strip">
                    <img src="images/novatune_logo_nobg.png" className="logo react" alt="React logo" />
                </div>

                <div className="card">
                    <p>
                        {isAuthenticated
                            ? "¡Bienvenido! Tu sesión está activa."
                            : "Inicia sesión o regístrate para acceder al panel del artista y de la discográfica."}
                    </p>

                    {!isAuthenticated && (
                        <>
                            <div className="auth-buttons">
                                <button onClick={() => setCurrentView("register")}>Registrarse</button>
                                <button onClick={() => setCurrentView("login")}>Iniciar sesión</button>
                            </div>
                        </>
                    )}

                    <div className="auth-buttons">
                        <button onClick={() => setCurrentView("artists")}>Ver artistas</button>
                        <button onClick={() => setCurrentView("tracks")}>Ver canciones</button>
                        <button onClick={() => setCurrentView("albums")}>Ver álbumes</button>
                        <button onClick={() => setCurrentView("labels")}>Ver discográficas</button>
                    </div>

                    {isAuthenticated && (
                        <div className="stats-shortcut">
                            <p>Accede rápidamente a tus paneles de gestión:</p>
                            <div className="stats-shortcut-buttons">
                                {/* Show Artist panel for artist+label roles */}
                                {(currentRole === 'artist' || currentRole === 'label' || currentRole === 'discografica') && (
                                    <button className="primary-button" onClick={() => setCurrentView("songs")}>
                                        Panel de artista
                                    </button>
                                )}

                                {/* Show Label panel for label role only */}
                                {(currentRole === 'label' || currentRole === 'discografica') && (
                                    <button className="secondary-button" onClick={() => setCurrentView("label_stats")}>
                                        Panel de discográfica
                                    </button>
                                )}

                                {/* --- NUEVO BOTÓN PARA PAGOS --- */}
                                {/* Visible para artistas y discográficas */}
                                {(currentRole === 'artist' || currentRole === 'label' || currentRole === 'discografica') && (
                                    <button className="secondary-button" onClick={() => setCurrentView("payments")}>
                                        Gestión de Pagos
                                    </button>
                                )}

                                {/* Show Ratings for users, artists and labels */}
                                {(currentRole === 'user' || currentRole === 'artist' || currentRole === 'label' || currentRole === 'discografica') && (
                                    <button className="secondary-button" onClick={() => setCurrentView("ratings")}>
                                        Valoraciones de usuarios
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
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
    } else if (currentView === "songs") {
        if (currentRole === 'artist' || currentRole === 'label' || currentRole === 'discografica') {
            mainContent = (
                <div className="songs-view">
                    <button className="back-button" onClick={() => setCurrentView("home")}>
                        ← Volver al inicio
                    </button>
                    <SongsList />
                </div>
            );
        } else {
            mainContent = (
                <div className="songs-view">
                    <button className="back-button" onClick={() => setCurrentView("home")}>
                        ← Volver al inicio
                    </button>
                    <div style={{ padding: 20 }}>Acceso denegado: tu cuenta no tiene permiso para ver el Panel de artista.</div>
                </div>
            )
        }
    } else if (currentView === "label_stats") {
        if (currentRole === 'label' || currentRole === 'discografica') {
            mainContent = (
                <div className="songs-view">
                    <button className="back-button" onClick={() => setCurrentView("home")}>
                        ← Volver al inicio
                    </button>
                    <LabelStatsDashboard />
                </div>
            );
        } else {
            mainContent = (
                <div className="songs-view">
                    <button className="back-button" onClick={() => setCurrentView("home")}>
                        ← Volver al inicio
                    </button>
                    <div style={{ padding: 20 }}>Acceso denegado: tu cuenta no tiene permiso para ver el Panel de discográfica.</div>
                </div>
            )
        }
    } else if (currentView === "payments") {
        // Permitir acceso a artists, labels y discograficas
        if (currentRole === 'artist' || currentRole === 'label' || currentRole === 'discografica') {
            mainContent = (
                <div className="songs-view">
                    <button className="back-button" onClick={() => setCurrentView("home")}>
                        ← Volver al inicio
                    </button>
                    <PaymentsDashboard />
                </div>
            );
        } else {
            mainContent = (
                <div className="songs-view">
                    <button className="back-button" onClick={() => setCurrentView("home")}>
                        ← Volver al inicio
                    </button>
                    <div style={{ padding: 20 }}>Acceso denegado: No tienes permisos para ver la sección de Pagos.</div>
                </div>
            )
        }
    }
    else if (currentView === "ratings") {
        if (currentRole === 'user' || currentRole === 'artist' || currentRole === 'label' || currentRole === 'discografica') {
            mainContent = (
                <div className="songs-view">
                    <button className="back-button" onClick={() => setCurrentView("home")}>
                        ← Volver al inicio
                    </button>
                    <Ratings />
                </div>
            );
        } else {
            mainContent = (
                <div className="songs-view">
                    <button className="back-button" onClick={() => setCurrentView("home")}>
                        ← Volver al inicio
                    </button>
                    <div style={{ padding: 20 }}>Acceso denegado: tu cuenta no tiene permiso para ver las Valoraciones de usuarios.</div>
                </div>
            )
        }
    } else if (currentView === "artists") {
        mainContent = (
            <div className="songs-view">
                <button className="back-button" onClick={() => setCurrentView("home")}>
                    ← Volver al inicio
                </button>
                <ArtistCarousel />
            </div>
        );
    } else if (currentView === "tracks") {
        mainContent = (
            <div className="songs-view">
                <button className="back-button" onClick={() => setCurrentView("home")}>
                    ← Volver al inicio
                </button>
                <SongCarousel />
            </div>
        );
    } else if (currentView === "albums") {
        mainContent = (
            <div className="songs-view">
                <button className="back-button" onClick={() => setCurrentView("home")}>
                    ← Volver al inicio
                </button>
                <AlbumCarousel />
            </div>
        );
    } else if (currentView === "labels") {
        mainContent = (
            <div className="songs-view">
                <button className="back-button" onClick={() => setCurrentView("home")}>
                    ← Volver al inicio
                </button>
                <LabelCarousel />
            </div>
        );
    } else if (currentView === "cart") {
        mainContent = (
            <div className="songs-view">
                <button className="back-button" onClick={() => setCurrentView("home")}>
                    ← Volver al inicio
                </button>
                {/* Aquí renderizamos tu página del carrito */}
                <Cart
                    onCheckout={(orderId) => {
                        console.log("Pedido creado, yendo al pago:", orderId);
                        setPendingOrderId(orderId); // 1. Guardamos el ID
                        setCurrentView("checkout"); // 2. Cambiamos de pantalla
                    }}
                />
            </div>
        );
    } else if (currentView === "checkout") {
        mainContent = (
            <div className="songs-view">
                <button className="back-button" onClick={() => setCurrentView("cart")}>
                    ← Volver al carrito
                </button>

                {/* Renderizamos tu componente Checkout existente */}
                <Checkout
                    orderId={pendingOrderId}
                    onSuccess={() => {
                        setPendingOrderId(null);
                        setCurrentView("order_success");
                    }}
                    onBack={() => setCurrentView("cart")}
                />
            </div>
        );
    } else if (currentView === "order_success") {
        // --- NUEVA VISTA DE ÉXITO ---
        mainContent = (
            <div className="songs-view">
                {/* No ponemos botón de "volver atrás" para evitar reenvíos */}
                <OrderSuccess
                    onNavigateHome={() => setCurrentView("home")}
                />
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

                {/* Agrupamos los elementos de la derecha en un div con flex */}
                {isAuthenticated && (
                    <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>

                        {/* Botón del Carrito */}
                        <button
                            className="secondary-button"
                            style={{ padding: "8px 15px", display: "flex", alignItems: "center", gap: "5px" }}
                            onClick={() => setCurrentView("cart")}
                        >
                            🛒 Carrito
                        </button>

                        {/* Botón de Logout */}
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