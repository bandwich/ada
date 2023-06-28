import { Output } from '@julusian/midi'
import { playlist, shuffleList } from './Playlist.js'
import { Playlist } from './types/Types.js'
import * as connection from './MIDI/Connections.js'
import { Deck, Delay, Messages, Question } from './types/Types.js'
import { action } from './MIDI/Action.js'
import { question } from './MIDI/Question.js'
import { createInterface } from 'readline'

import { MidiAction, MidiQ } from './MIDI/Encodings.js'

export const delay = async (ms: Delay) => {
    return await new Promise((resolve) => { setTimeout(resolve, ms) })
}
 
const readline = createInterface({
    input: process.stdin,
    output: process.stdout
})

readline.question('Playlist: ', async (name: string) => {
    const list = shuffleList(await playlist(name))
    const ports = connection.openPorts()(0, 0) // take port numbers from command line, or from saved config

    await setup(ports.out)
    await previewPlay(ports.out, list, 10000)

    connection.closePorts(ports.in, ports.out)
    readline.close()
})

const setup = async (out: Output) => await action(init()) (out)

// Runs through list of songs in order and switches songs after a given duration
const previewPlay = async (out: Output, list: Playlist, previewLength: number) => {
    let deck: Deck = 0
    for (let track of list) {
        await action(crossfade(deck, track.position))(out)
        await delay(previewLength)
        deck = nextDeck(deck)
    }
}

/* ------------------------------------------------------------- */

const init = (): Messages => {
    return [   
        MidiAction.wait(2000),
        MidiAction.selectPlaylist(1),
        MidiAction.wait(2000)
    ]
}

const crossfade = (deck: Deck, nextTrack: number) => {
    const next = nextDeck(deck)
    return [
        MidiAction.selectTrack(deck, nextTrack),
        wait(1000),
        MidiAction.setVolume(deck, 0),
        MidiAction.nudgeVolume(next, 32),
        MidiAction.nudgeVolume(deck, 96),
        play(deck),
        wait(2000),
        MidiAction.cancelNudgeVolume(deck),
        MidiAction.cancelNudgeVolume(next),
        pause(next)
    ]
}

/* 

Basic, arbitrary BPM matching
BPM groups in increments of 10, that way they can average out somewhere

Sort playlist into these groups
A set, in reality, should stay within a maximum of 3 of these groups

After 64 beats, hard cut to next song
To find 64 beats:
    set timer for 60 beats converted to seconds, wait, ask Mixxx for the position, set a timeout for the hardcut based on position to 64 beats
*/


const play = (deck: Deck) => MidiAction.play(deck, 1)
const pause = (deck: Deck) => MidiAction.play(deck, 0)
const wait = (delay: Delay) => MidiAction.wait(delay)

const gain = (): Question => MidiQ.gain()
const where = (deck: Deck): Question => MidiQ.position(deck)
const nextDeck = (deck: Deck): Deck => 1 - deck as Deck