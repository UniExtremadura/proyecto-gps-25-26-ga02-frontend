import LoginForm from "../components/auth/LoginForm.jsx";
import AuthNavBar from "../components/auth/AuthNavBar.jsx";
import { useAuth } from "../hooks/useAuth.jsx";
import { useState, useEffect } from "react";

export default function NovaTune() {
    const { isAuthenticated, login, logout, getCurrentUserRole } = useAuth();

    return (
        <div className={" w-screen h-screen flex grow flex-col items-center justify-center"}>
            <AuthNavBar isAuthenticated={isAuthenticated} />
            <img src={"/images/novatune_logo_nobg.png"} alt={"Logo"} height={256} width={256} />
            <div className={"mt-8"}>
                <LoginForm></LoginForm>
            </div>
        </div>
    )
}