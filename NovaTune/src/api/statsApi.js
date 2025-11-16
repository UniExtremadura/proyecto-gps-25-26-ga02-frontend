import axios from 'axios'

const STATS_BASE = import.meta.env.VITE_STATS_API_BASE || '/api/stats'

// GET contador de reproducciones
export async function fetchSongPlays(songId) {
    const url = `${STATS_BASE}/songs/${encodeURIComponent(songId)}/plays`
    const { data } = await axios.get(url)
    return Number(data?.plays || 0)
}

// POST registrar una reproducción
export async function registerPlay(songId) {
    const url = `${STATS_BASE}/songs/${encodeURIComponent(songId)}/plays`
    await axios.post(url) // el views.py ya acepta POST sin body
}
