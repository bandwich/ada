import { Playlist, playlist } from './Playlist.js'
import { MidiOut, Messages, puts, read, closePorts } from './Encoder.js'

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  })

// steps: read in playlist, shuffle it, get begin messages, get output, read the messages
// easy as pie
readline.question('Playlist: ', async (name: string) => {
    const list = await playlist(name)
    const ps = puts()
    await read(ps.out, begin(shuffleList(list)))
    closePorts(ps.in, ps.out)
    readline.close()
})

/* ------------------------------------------------------------- */

type Action = (list: Playlist) => Messages

const shuffleList = (list: Playlist): Playlist => {
    // Durstenfeld shuffle (randomize)
    const _shuffle = (list: Playlist) => {
        const copy = list.slice(0)
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]]
        }
        return copy
    }
    return _shuffle(list)
}

const begin: Action = (list: Playlist): Messages => {
    return [
        MidiOut.delay(2000),
        MidiOut.selectPlaylist(1),
        MidiOut.delay(2000),
        MidiOut.selectTrack(0, list[0].position),
        MidiOut.delay(500),
        MidiOut.play(0, 1)
    ]
}

