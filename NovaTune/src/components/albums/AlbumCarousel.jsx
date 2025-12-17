import React, { useEffect, useState } from "react";
import "./AlbumCarousel.css";


export default function AlbumCarousel() {
    const [albums, setAlbums] = useState([]);
    const [startIndex, setStartIndex] = useState(0);
    const VISIBLE_COUNT = 4;
    const album_cover = "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fmarketplace.canva.com%2FEAE25MFy9wQ%2F1%2F0%2F1600w%2Fcanva-music-logo-design-S0x32skUQb4.jpg&f=1&nofb=1&ipt=97690a579caf30636056f3d819f71076aab67d849569d10b468a1b7df0b82272"

    useEffect(() => {
        const fetchAlbums = async () => {
            const response = await fetch("http://localhost:8001/api/v1/albums/");
            const data = await response.json();
            setAlbums(data);
        };


        fetchAlbums();
    }, []);


    const prev = () => {
        setStartIndex((prev) =>
            prev === 0 ? Math.max(albums.length - VISIBLE_COUNT, 0) : prev - 1
        );
    };


    const next = () => {
        setStartIndex((prev) =>
            prev + VISIBLE_COUNT >= albums.length ? 0 : prev + 1
        );
    };


    const visibleAlbums = albums.slice(startIndex, startIndex + VISIBLE_COUNT);


    if (!albums.length) return <p>Cargando álbumes...</p>;

    return (
        <div className="carousel-wrapper">
            <button className="nav-button" onClick={prev}>◀</button>


            <div className="carousel-grid">
                {visibleAlbums.map((album, index) => (
                    <div className="carousel-card" key={index}>
                        <img src={album_cover} alt={album.title} className="cover" />
                        <h4>{album.title}</h4>
                        <p>Canciones: {album.total_tracks}</p>
                        <p>Artista: {album.artist.name}</p>
                    </div>
                ))}
            </div>


            <button className="nav-button" onClick={next}>▶</button>
        </div>
    );
}