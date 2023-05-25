// sqlite db
// ~/Library/Containers/org.mixxx.mixxx/Data/Library/Application Support/Mixxx

import knexPkg from 'knex'
const knex = knexPkg({
    client: 'better-sqlite3',
    connection: { filename: 'mixxxdb.sqlite' },
    useNullAsDefault: true
})

type Track = {
    track_id: number
    position: number
    title?: string
    artist?: string
    album?: string
    year?: string
    genre?: string
    tracknumber?: string
    location?: number
    duration?: number
    bpm?: number
    wavesummaryhex?: Blob
}
export type Playlist = Track[]

const col = (table: string, column: string) => table.concat('.' + column)
const playlists = 'playlists'
const tracks = 'playlisttracks'
const lib = 'library'

const LibData = [
    'id', 'title', 'artist', 'album', 'year', 'genre',
    'tracknumber', 'location', 'duration', 'bpm', 'wavesummaryhex'
]

const fetchPlaylist = async (playlist: string): Promise<Playlist> => {
    return await knex(tracks)
        .join(playlists, col(tracks, 'playlist_id'), col(playlists, 'id'))
        .join(lib, col(tracks, 'track_id'), col(lib, 'id'))
        .select(...LibData.map(colName => col(lib, colName)), col(tracks, 'position'))
        .where(col(playlists, 'name'), playlist)
}

export const playlist = async (p: string) => await fetchPlaylist(p)
