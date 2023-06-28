// sqlite db
// ~/Library/Containers/org.mixxx.mixxx/Data/Library/Application Support/Mixxx

import knexPkg from 'knex'
import { Playlist, PlaylistData } from './types/Types'

const knex = knexPkg({
    client: 'better-sqlite3',
    connection: { filename: 'mixxxdb.sqlite' },
    useNullAsDefault: true
})

const playlists = 'playlists'
const tracks = 'playlisttracks'
const lib = 'library'

const libData = [
    'id', 'title', 'artist', 'album', 'year', 'genre',
    'tracknumber', 'location', 'duration', 'bpm'
]

const playlistData = ['id', 'name', 'position']

// Durstenfeld shuffle (randomize), without mutation
const _shuffle = (list: Playlist) => {
    const copy = list.slice(0)
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]]
    }
    return copy
}

const col = (table: string, column: string) => table.concat('.' + column)

const fetchPlaylist = async (playlist: string): Promise<Playlist> => {
    return await knex(tracks)
        .join(playlists, col(tracks, 'playlist_id'), col(playlists, 'id'))
        .join(lib, col(tracks, 'track_id'), col(lib, 'id'))
        .select(...libData.map(colName => col(lib, colName)), col(tracks, 'position')) // include position col within playlist
        .where(col(playlists, 'name'), playlist)
}

export const playlist = async (p: string) => await fetchPlaylist(p)
export const getPlaylists = async (): Promise<PlaylistData[]> => await knex(playlists).select(...playlistData)

export const shuffleList = (list: Playlist): Playlist => _shuffle(list)

// 3 lists, separated by bpm
export const BPMLists = (list: Playlist): Playlist[] => {
    const ascBPM = [...list].sort(((a, b) => a.bpm - b.bpm))
    // const variance = ascBPM[ascBPM.length - 1].bpm - ascBPM[0].bpm
    const third = Math.round(ascBPM.length / 3)
    return [
        shuffleList(ascBPM.slice(0, third)), 
        shuffleList(ascBPM.slice(third, third * 2)), 
        shuffleList(ascBPM.slice(third * 2, ascBPM.length))
    ]
}

