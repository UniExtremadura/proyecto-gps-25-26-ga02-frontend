import PlaysBadge from '../components/plays/PlaysBadge'; // ajusta la ruta si estás en otra carpeta

export default function SongRow({ song }) {
    const songId = song.id ?? song.song_id ?? song._id; // coge el que exista

    return (
        <div className="song-row">
            <div className="left">
                {/* portada, título, artista... */}
            </div>

            <div
                className="right"
                style={{ color: '#000' }}   // todo el texto de esta zona en negro
            >
                <PlaysBadge songId={songId} onlyValid={true} />
            </div>
        </div>
    );
}
