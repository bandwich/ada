import { Playlist, playlist } from './Playlist.js'
import { MidiAction, MidiQ, Messages, Questions, puts, question, action, closePorts } from './Transform.js'

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  })

// steps: read in playlist, shuffle it, get begin messages, get output, read the messages
// easy as pie
readline.question('Playlist: ', async (name: string) => {
    const list = await playlist(name)
    const shuffled = shuffleList(list)
    const ps = puts()
    
    await action(begin(shuffled)) (ps.out)
    await question(where(0)) (ps.in, ps.out)

    closePorts(ps.in, ps.out)
    readline.close()
})

/* ------------------------------------------------------------- */

type Action = (list: Playlist) => Messages

type DeckQ = (deck: number) => Questions
type MasterQ = () => Questions

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
        MidiAction.wait(2000),
        MidiAction.selectPlaylist(1),

        MidiAction.wait(2000),
        MidiAction.selectTrack(0, list[0].position),
        
        MidiAction.wait(500),
        MidiAction.play(0, 1)
    ]
}

const loadNext: Action = (list: Playlist): Messages => {
    return [
        
    ]
}

const gain: MasterQ = (): Questions => [MidiQ.gain()]
const where: DeckQ = (deck: number): Questions => [MidiQ.position(deck)]
