import React, { useEffect, useState } from "react";
import "./SongCarousel.css";


export default function SongCarousel() {
    const [songs, setSongs] = useState([]);
    const [startIndex, setStartIndex] = useState(0);
    const VISIBLE_COUNT = 4;
    const song_cover = "https://www.navidrome.org/featured-background_hu_11e7e5722ada9c0d.jpg"


    useEffect(() => {
        const fetchSongs = async () => {
            const response = await fetch("http://localhost:8001/api/v1/tracks/");
            const data = await response.json();
            setSongs(data);
        };


        fetchSongs();
    }, []);

    const handleAddToCart = async (song) => {
        console.log("DATOS DE LA CANCIÓN:", song);
        try {
            // Nota: Asegúrate de que esta URL sea la correcta de tu backend
            const response = await fetch("http://localhost:8003/api/v1/cart/items/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    // Hemos quitado el Token como pediste
                },
                body: JSON.stringify({
                    product_id: song.track_id,          // El ID de la canción
                    quantity: 1,                  // Cantidad (por defecto 1)
                    // OJO: Asumimos que la canción trae el precio.
                    // Si el precio es fijo, cámbialo aquí.
                    price_at_addition: song.price || "1.00"
                })
            });

            if (response.ok) {
                alert(`¡"${song.title}" añadida al carrito!`);
            } else {
                console.error("Error del servidor:", response.statusText);
                alert("Error al añadir al carrito.");
            }

        } catch (error) {
            console.error("Error de red:", error);
            alert("No se pudo conectar con el servidor.");
        }
    };

    const prev = () => {
        setStartIndex((prev) =>
            prev === 0 ? Math.max(songs.length - VISIBLE_COUNT, 0) : prev - 1
        );
    };


    const next = () => {
        setStartIndex((prev) =>
            prev + VISIBLE_COUNT >= songs.length ? 0 : prev + 1
        );
    };


    const visibleSongs = songs.slice(startIndex, startIndex + VISIBLE_COUNT);


    if (!songs.length) return <p>Cargando canciones...</p>;


    return (
        <div className="carousel-wrapper">
            <button className="nav-button" onClick={prev}>◀</button>


            <div className="carousel-grid">
                {visibleSongs.map((song, index) => (
                    <div className="carousel-card" key={index}>
                        <img src={song.album.cover_url} alt={song.title} className="cover" />
                        <h4>{song.title}</h4>
                        <p>{song.artist.name}</p>

                        <button
                            className="btn-add-cart"
                            onClick={() => handleAddToCart(song)}
                        >
                            Añadir al carrito +
                        </button>

                    </div>
                ))}
            </div>


            <button className="nav-button" onClick={next}>▶</button>
        </div>
    );
}