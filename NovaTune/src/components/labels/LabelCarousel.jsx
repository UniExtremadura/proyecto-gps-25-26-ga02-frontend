import React, { useEffect, useState } from "react";
import "./LabelCarousel.css";


export default function LabelCarousel() {
    const [labels, setLabels] = useState([]);
    const [startIndex, setStartIndex] = useState(0);
    const VISIBLE_COUNT = 4;
    const label_cover = "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fimg.freepik.com%2Ffree-vector%2Fhand-drawn-record-label-logo-design_23-2149464909.jpg&f=1&nofb=1&ipt=82c90091fb3c98797ce8c4f0b3c284c6e47b1abf7d8f124f2bfc1654a16190bf"


    useEffect(() => {
        const fetchLabels = async () => {
            const response = await fetch("http://localhost:8000/api/v1/labels/");
            const data = await response.json();
            setLabels(data);
        };


        fetchLabels();
    }, []);


    const prev = () => {
        setStartIndex((prev) =>
            prev === 0 ? Math.max(labels.length - VISIBLE_COUNT, 0) : prev - 1
        );
    };


    const next = () => {
        setStartIndex((prev) =>
            prev + VISIBLE_COUNT >= labels.length ? 0 : prev + 1
        );
    };


    const visibleLabels = labels.slice(startIndex, startIndex + VISIBLE_COUNT);


    if (!labels.length) return <p>Cargando discográficas...</p>;
    return (
        <div className="carousel-wrapper">
            <button className="nav-button" onClick={prev}>◀</button>


            <div className="carousel-grid">
                {visibleLabels.map((label, index) => (
                    <div className="carousel-card" key={index}>
                        <img src={label_cover} alt={label.name} className="cover" />
                        <h4>{label.name}</h4>
                        <p>{label.contact}</p>
                    </div>
                ))}
            </div>


            <button className="nav-button" onClick={next}>▶</button>
        </div>
    );
}