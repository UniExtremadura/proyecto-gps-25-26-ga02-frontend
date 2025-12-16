import React, { useEffect, useState } from "react";
import "./ArtistCarousel.css";


export default function ArtistCarousel() {
    const [artists, setArtists] = useState([]);
    const [startIndex, setStartIndex] = useState(0);
    const VISIBLE_COUNT = 4;
    const artist_cover = "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fimg.freepik.com%2Ffree-vector%2Fhand-drawn-record-label-logo-design_23-2149464909.jpg&f=1&nofb=1&ipt=82c90091fb3c98797ce8c4f0b3c284c6e47b1abf7d8f124f2bfc1654a16190bf"

    useEffect(() => {
        const fetchArtists = async () => {
            const response = await fetch("http://localhost:8000/api/v1/artists/");
            const data = await response.json();
            setArtists(data);
        };


        fetchArtists();
    }, []);


    const prev = () => {
        setStartIndex((prev) =>
            prev === 0 ? Math.max(artists.length - VISIBLE_COUNT, 0) : prev - 1
        );
    };


    const next = () => {
        setStartIndex((prev) =>
            prev + VISIBLE_COUNT >= artists.length ? 0 : prev + 1
        );
    };


    const visibleArtists = artists.slice(startIndex, startIndex + VISIBLE_COUNT);


    if (!artists.length) return <p>Cargando artistas...</p>;

    return (
        <div className="carousel-wrapper">
            <button className="nav-button" onClick={prev}>◀</button>


            <div className="carousel-grid">
                {visibleArtists.map((artist, index) => (
                    <div className="carousel-card" key={index}>
                        <img src={artist.image_url} alt={artist.name} className="cover" />
                        <h4>{artist.name}</h4>
                        <p>{artist.bio}</p>
                    </div>
                ))}
            </div>


            <button className="nav-button" onClick={next}>▶</button>
        </div>
    );
}