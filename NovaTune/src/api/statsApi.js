// src/api/statsApi.js
import axios from 'axios';

const STATS_BASE = import.meta.env.VITE_STATS_API_BASE || '/api/stats';

/**
 * GET: cuenta reproducciones
 */
export async function fetchSongPlays(songId) {
    const url = `${STATS_BASE}/songs/${encodeURIComponent(songId)}/plays`;
    try {
        const { data } = await axios.get(url, { timeout: 5000 });
        if (data && typeof data.plays === 'number') {
            return { ok: true, plays: data.plays };
        }
        return { ok: false, error: 'Respuesta inesperada de estadísticas.' };
    } catch (err) {
        if (err.response) {
            if (err.response.status === 404) {
                return { ok: true, plays: 0, notFound: true };
            }
            return { ok: false, error: `Error ${err.response.status} desde estadísticas.` };
        }
        if (err.request) {
            return { ok: false, error: 'No se puede conectar con el backend de estadísticas.' };
        }
        return { ok: false, error: 'Error desconocido en la petición de estadísticas.' };
    }
}

/**
 * POST: sumar 1 reproducción
 */
export async function incrementSongPlay(songId) {
    const url = `${STATS_BASE}/songs/${encodeURIComponent(songId)}/plays`;
    try {
        const { data } = await axios.post(url, {}, { timeout: 5000 });
        if (data && typeof data.plays === 'number') {
            return { ok: true, plays: data.plays };
        }
        return { ok: false, error: 'Respuesta inesperada al incrementar.' };
    } catch (err) {
        if (err.response) {
            return { ok: false, error: `Error ${err.response.status} al incrementar.` };
        }
        if (err.request) {
            return { ok: false, error: 'No se puede conectar para incrementar.' };
        }
        return { ok: false, error: 'Error desconocido al incrementar.' };
    }
}

/**
 * DELETE: restar 1 reproducción (elimina la más reciente)
 */
export async function decrementSongPlay(songId) {
    const url = `${STATS_BASE}/songs/${encodeURIComponent(songId)}/plays`;
    try {
        const { data } = await axios.delete(url, { timeout: 5000 });
        if (data && typeof data.plays === 'number') {
            return { ok: true, plays: data.plays };
        }
        return { ok: false, error: 'Respuesta inesperada al decrementar.' };
    } catch (err) {
        if (err.response) {
            return { ok: false, error: `Error ${err.response.status} al decrementar.` };
        }
        if (err.request) {
            return { ok: false, error: 'No se puede conectar para decrementar.' };
        }
        return { ok: false, error: 'Error desconocido al decrementar.' };
    }
}
