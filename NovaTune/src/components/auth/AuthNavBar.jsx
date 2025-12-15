import LogoutButton from './LogoutButton.jsx';

export default function AuthNavBar({ isAuthenticated = false }) {
    return (
        <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-200 px-8 py-3 flex justify-between items-center z-100">
            <div className="flex items-center gap-2 text-sm font-semibold">
                <span
                    className={`w-2 h-2 rounded-full animate-pulse ${isAuthenticated ? "bg-green-600" : "bg-gray-400"}`}
                />
                <span className={isAuthenticated ? "text-green-600" : "text-gray-500"}>
                    {isAuthenticated ? "Sesión activa" : "No has iniciado sesión"}
                </span>
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
    );
}