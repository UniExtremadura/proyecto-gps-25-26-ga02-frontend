import React from 'react'
import { Routes, Route, Navigate, Link } from 'react-router-dom'
import SongsList from './pages/SongsList.jsx'

export default function App() {
    return (
        <div style={{ padding: 24, background: '#111', minHeight: '100vh', color: '#eaeaea' }}>
            <nav style={{ marginBottom: 16 }}>
                <Link to="/songs">Canciones</Link>
            </nav>

            <Routes>
                <Route path="/" element={<Navigate to="/songs" replace />} />
                <Route path="/songs" element={<SongsList />} />
                <Route path="*" element={<div>404</div>} />
            </Routes>
        </div>
    )
}
