import { Output } from '@julusian/midi'
import { Playlist, playlist } from './Playlist.js'
import * as connection from './MIDI/Connections.js'
import { Deck, Delay, Messages, Question } from './types/Types.js'
import { action } from './MIDI/Action.js'
import { question } from './MIDI/Question.js'

import { MidiAction, MidiQ } from './MIDI/Encodings.js'

// waits a given number of milliseconds
export const delay = async (ms: Delay) => {
    return await new Promise((resolve) => { setTimeout(resolve, ms) })
}
 
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
})

readline.question('Playlist: ', async (name: string) => {
    const list = await playlist(name)
    const ports = connection.openPorts()

    await setup(ports.out)
    await previewPlay(ports.out, list, 10000)

    connection.closePorts(ports.in, ports.out)
    readline.close()
})

const setup = async (out: Output) => await action(init()) (out)

// Runs through list of songs in order and switches songs after a given durationi
const previewPlay = async (out: Output, list: Playlist, previewLength: number) => {
    let deck: Deck = 0
    for (let i = 0; i < list.length; i++) {
        const [nextTrack, activeDuration] = [list[i].position, list[i].duration]
        await action(playAndWait(deck, nextTrack, activeDuration))(out)
        await delay(previewLength)
        deck = nextDeck(deck)
    }
}

/* ------------------------------------------------------------- */

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

const init = (): Messages => {
    return [   
        MidiAction.wait(2000),
        MidiAction.selectPlaylist(1),

        MidiAction.wait(2000),
    ]
}

const playAndWait = (deck: Deck, nextTrack: number, activeDuration: number) => {
    return [
        MidiAction.selectTrack(deck, nextTrack),
        wait(1000),
        pause(nextDeck(deck)),
        play(deck)
    ]
}

const play = (deck: Deck) => MidiAction.play(deck, 1)
const pause = (deck: Deck) => MidiAction.play(deck, 0)
const wait = (delay: Delay) => MidiAction.wait(delay)

const gain = (): Question => MidiQ.gain()
const where = (deck: Deck): Question => MidiQ.position(deck)
const nextDeck = (deck: Deck): Deck => 1 - deck as Deck