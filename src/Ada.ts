import { Output } from '@julusian/midi'
import { Playlist, playlist } from './Playlist.js'
import * as transform from './Transform.js'

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  })

readline.question('Playlist: ', async (name: string) => {
    const list = await playlist(name)
    const ports = transform.openPorts()

    await setup(ports.out)
    await basicPlay(ports.out, list)

    transform.closePorts(ports.in, ports.out)
    readline.close()
})

const setup = async (out: Output) => await transform.action(init()) (out)

// The most basic player
// Runs through list of songs in order and simply switches songs at song end
const basicPlay = async (out: Output, list: Playlist) => {
    let deck = 1
    for (let i = 1; i < list.length; i++) {
        const [nextTrack, activeDuration] = [list[i].position, list[i].duration]
        await transform.action(playAndWait(deck, nextTrack, activeDuration))(out)
        deck = nextDeck(deck)
    }
}

/* ------------------------------------------------------------- */

type DeckQ = (deck: transform.Deck) => transform.Question
type MasterQ = () => transform.Question

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

const init = (): transform.Messages => {
    return [   
        transform.MidiAction.wait(2000),
        transform.MidiAction.selectPlaylist(1),

        transform.MidiAction.wait(2000),
        transform.MidiAction.selectTrack(0, 1),

        transform.MidiAction.wait(500),
        transform.MidiAction.play(0, 1)
    ]
}

// Once transitions are more defined, replace and separate pauseOther into its own definition
const playNext = (deck: transform.Deck): transform.Messages => {
    return [
        play(deck),
        pause(nextDeck(deck)),
        wait(1000)
    ]
}

const playAndWait = (deck: transform.Deck, nextTrack: number, activeDuration: number) => {
    return [
        transform.MidiAction.selectTrack(deck, nextTrack),
        wait(1000),
        pause(nextDeck(deck)),
        play(deck),
        wait(30000) // or track duration

    ]
}

const play = (deck: transform.Deck) => transform.MidiAction.play(deck, 1)
const pause = (deck: transform.Deck) => transform.MidiAction.play(deck, 0)
const wait = (delay: number) => transform.MidiAction.wait(delay)

const gain: MasterQ = (): transform.Question => transform.MidiQ.gain()
const where: DeckQ = (deck: number): transform.Question => transform.MidiQ.position(deck)
const nextDeck = (deck: transform.Deck): transform.Deck => 1 - deck