import ImageLink from "./ImageLink";
import ProfilePicture from "./ProfilePicture";
import LogoutButton from "./LogoutButton";
import { useAuth } from "../hooks/useAuth.jsx";
import useAuthUser from "../hooks/useAuthUser";
import LoadingPage from "./LoadingPage";
import { useState } from "react";

export default function NavBar() {
    const { isAuthenticated, login, logout, getCurrentUserRole } = useAuth();
    const [isLogout, setIsLogout] = useState(false);
    const { isLoggedIn, isLoadingInfo } = useAuthUser(isLogout);
    if (isLoadingInfo || !isLoggedIn) return <LoadingPage text={"Cargando tu información..."} />
    return (
        <div className={"mb-4"}>
            <header className="bg-neutral-800 drop-shadow-md">
                <nav className={"px-6 py-3 flex justify-between items-center w-full"}>
                    <div className={"flex"}>
                        <ImageLink imageUrl={"/images/novatune_logo_nobg.png"}
                            linkUrl={isAuthenticated ? "/home" : "/"}
                            size={52}
                            altText={"Logo de NovaTune"}
                            props={<h1 className={"text-3xl font-bold content-center ml-4"}>NovaTune</h1>}
                        ></ImageLink>
                    </div>
                    <div className="flex justify-between space-x-12">
                        <div>
                            <ImageLink imageUrl={"/images/home.svg"}
                                linkUrl={isAuthenticated ? "/home" : "/"}
                                size={30}
                                altText={"Botón de home"}
                            ></ImageLink>
                        </div>
                        <div>
                            <ImageLink imageUrl={"/images/search.svg"}
                                linkUrl={isAuthenticated ? "/search" : "/"}
                                size={30}
                                altText={"Botón de búsqueda"}
                            ></ImageLink>
                        </div>
                        <div>
                            <ImageLink imageUrl={"/images/music-library.png"}
                                linkUrl={isAuthenticated ? "/library" : "/"}
                                size={30}
                                altText={"Botón de librería"}
                            ></ImageLink>
                        </div>
                    </div>
                    {isAuthenticated && user ? (
                        <div className={"flex items-center gap-x-4"}>
                            <ProfilePicture imageUrl={user.picture} size={52} userId={sessionStorage.getItem("userId")} />
                            <LogoutButton setIsLogout={setIsLogout}></LogoutButton>
                        </div>
                    ) : (
                        <div>
                            <div className={"flex items-center"}>
                                <LoginButton></LoginButton>
                            </div>
                        </div>
                    )}
                </nav>
            </header>
        </div>
    )
}