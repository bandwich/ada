import { Input, MidiMessage, Output } from '@julusian/midi'
import { getPlaylists, playlist, shuffleList } from './Playlist.js'
import { Playlist } from './types/Types.js'
import { processedSet } from './data.js'
import * as connection from './MIDI/Connections.js'
import { Deck, Messages, Question } from './types/Types.js'
import { action } from './MIDI/Action.js'
import { on } from "events"
import { createInterface } from 'readline'

import { MidiAction, MidiQ } from './MIDI/Encodings.js'


const readline = createInterface({
    input: process.stdin,
    output: process.stdout
})

const printPlaylists = async () => {
    console.log('Playlists:')
    const lists = await getPlaylists()
    lists.map(list => console.log(list.name))
}

const printSet = async () => {
    const set = await processedSet(0)
    set.map((events) => {
        console.log("New bucket at " + events.beatMarker.time + " "  + events.beatMarker.midi[0] + "\n")
        events.events.map((e) => console.log(e))
    })
}

// main function
readline.question('Mode?\n', async (mode: string) => {
    const ports = await connection.openPorts(mode)(0, 0)
        readline.question('Type anything to end.\n', async (input: string) => {
            connection.closePorts(ports.in, ports.out)
            readline.close()
            printSet()
        })
})

/* ------------------------------------------------------------- */


// const receiveMessage = async (input: Input) =>  on(input, 'mixxx')

// // Runs through list of songs in order and switches songs after a given duration
// const previewPlay = async (out: Output, list: Playlist, previewLength: number) => {
//     let deck: Deck = 0
//     for (let track of list) {
//         // await action(crossfade(deck, track.position))(out)
//         await delay(previewLength)
//         deck = nextDeck(deck)
//     }
// }

// const volumePush = (deck: Deck) => {
//     const volume = (delay: MidiMessage, x: number) => {
//         if (x % 2 !== 0) return MidiAction.setVolume(0, x)
//         else return delay
//     }
//     const delay = MidiAction.wait(20)
//     return Array(100).fill(delay).map(volume)
// }


// const play = (deck: Deck) => MidiAction.play(deck, 1)
// const pause = (deck: Deck) => MidiAction.play(deck, 0)
// const wait = (delay: Delay) => MidiAction.wait(delay)

// const gain = (): Question => MidiQ.gain()
// const where = (deck: Deck): Question => MidiQ.position(deck)
// const nextDeck = (deck: Deck): Deck => 1 - deck as Deck