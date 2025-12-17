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
                    </div>
                ))}
            </div>


            <button className="nav-button" onClick={next}>▶</button>
        </div>
    );
}