import React, { useEffect, useState } from "react";
import "./SongCarousel.css";
import { cartApi } from "../../api/paymentsApi.js";

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
        console.log("Añadiendo al carrito:", song.title);
        try {
            // Usamos cartApi en lugar de fetch.
            // El interceptor meterá el Token por nosotros automáticamente.
            // Argumentos: (productId, quantity, price)
            await cartApi.addItem(
                song.track_id,
                1,
                song.price || "1.00"
            );

            // Si no da error (catch), es que ha ido bien
            alert(`¡"${song.title}" añadida al carrito!`);

        } catch (error) {
            console.error("Error añadiendo al carrito:", error);
            // Si el error es 401, es que el token caducó
            if (error.response && error.response.status === 401) {
                alert("Tu sesión ha caducado. Por favor, haz login de nuevo.");
            } else {
                alert("Error al conectar con el servidor de pagos.");
            }
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