import axios from 'axios'
const STATS_BASE = import.meta.env.VITE_STATS_BASE_URL || '/api/stats'

export async function getPlaysBySong(songIdOrSlug) {
    const url = `${STATS_BASE}/songs/${encodeURIComponent(songIdOrSlug)}/plays`
    const { data } = await axios.get(url)
    return data?.plays ?? 0
}
