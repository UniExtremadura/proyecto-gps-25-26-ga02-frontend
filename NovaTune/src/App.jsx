import React from 'react'
import { Routes, Route, Navigate, Link } from 'react-router-dom'
import SongsList from './pages/SongsList.jsx'

function NotFound() {
    return (
        <div style={{ padding: 24 }}>
            <h2>404</h2>
            <p>Ruta no encontrada.</p>
            <p><Link to="/songs">Ir a Canciones</Link></p>
        </div>
    )
}

export default function App() {
    return (
        <div style={{ minHeight: '100vh', background: '#111', color: '#ddd' }}>
            <div style={{ padding: '12px 16px' }}>
                <Link to="/songs" style={{ color: '#8ab4f8' }}>Canciones</Link>
            </div>
            <Routes>
                <Route path="/" element={<Navigate to="/songs" replace />} />
                <Route path="/songs" element={<SongsList />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </div>
    )
}
