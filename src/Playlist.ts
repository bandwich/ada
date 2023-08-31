// sqlite db
// ~/Library/Containers/org.mixxx.mixxx/Data/Library/Application Support/Mixxx

import knexPkg from 'knex'
import "dotenv/config.js";
import { Playlist, PlaylistData } from './types/Types'

const mixKnex = knexPkg({
    client: 'better-sqlite3',
    connection: { filename: process.env.mixxxDbName as string },
    useNullAsDefault: false
})

const playlists = 'playlists'
const tracks = 'playlisttracks'
const lib = 'library'

// columns needed
const libData = [
    'id', 'title', 'artist', 'album', 'year', 'genre',
    'tracknumber', 'location', 'duration', 'bpm'
]

const playlistData = ['name']

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

/* 
    For cleanliness - these methods should be moved into a database layer, that way Playlist doesn't have to actually
    deal with where they come from
*/
const fetchPlaylist = async (playlist: string): Promise<Playlist> => {
    return await mixKnex(tracks)
        .join(playlists, col(tracks, 'playlist_id'), col(playlists, 'id'))
        .join(lib, col(tracks, 'track_id'), col(lib, 'id'))
        .select(...libData.map(colName => col(lib, colName)), col(tracks, 'position')) // include position col within playlist
        .where(col(playlists, 'name'), playlist)
}

export const getPlaylists = async (): Promise<PlaylistData[]> => {
    return await mixKnex(playlists).select(...playlistData)
}

export const playlist = async (p: string) => await fetchPlaylist(p)

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

