import { Input, MidiMessage, Output } from '@julusian/midi'
import { getPlaylists, playlist, shuffleList } from './Playlist.js'
import { Playlist } from './types/Types.js'
import { processedSet } from './data.js'
import * as connection from './MIDI/Connections.js'
import { Deck, Delay, Messages, Question } from './types/Types.js'
import { action } from './MIDI/Action.js'
import { on } from "events"
import { createInterface } from 'readline'

import { MidiAction, MidiQ } from './MIDI/Encodings.js'

/* 

// /Applications/Mixxx.app/Contents/MacOS/mixxx --controller-debug

TOOO

write as Electron app - use this as a library
build React frontend
First UI features 
    - display IAC driver (or instructions to turn on, if missing)
    - display signal light (green / red) for connection to Mixxx (run signal test every second)

Recorder
Ada listens on IAC port
However when using a physical controller, Mixxx outputs signals to the controller
Mixxx can use 2 controllers, so run both
It's not necessary to grab the actual signal from the physical controller!
Since Ada is hooked in as a virtual controller, it has access to Mixxx callbacks and state
Whenever state changes, take that information and construct a signal 
:) :) :)

record action as MIDI, with timestamp
Timestamp representations
    - absolute time in set
    - times relative to current tracks
*/

export const delay = async (ms: Delay) => {
    return await new Promise((r) => setTimeout(r, ms))
}

const readline = createInterface({
    input: process.stdin,
    output: process.stdout
})

// const printPlaylists = async () => {
//     console.log('Playlists:')
//     const lists = await getPlaylists()
//     lists.map(list => console.log(list.name))
// }

const printSet = async () => {
    const set = await processedSet(0)
    set.map((events) => {
        console.log("new bucket at " + events.marker.time)
        events.events.map((e) => console.log(e))
    })
}

readline.question('Start', async (name: string) => {
    connection.closePorts(ports.in, ports.out)
    readline.close()
})

const ports = connection.openPorts()(0, 0) // take port numbers from command line, or from saved config
const test = async (out: Output) => await action(init())(out)

const receiveMessage = async (input: Input) =>  on(input, 'mixxx')

// Runs through list of songs in order and switches songs after a given duration
const previewPlay = async (out: Output, list: Playlist, previewLength: number) => {
    let deck: Deck = 0
    for (let track of list) {
        // await action(crossfade(deck, track.position))(out)
        await delay(previewLength)
        deck = nextDeck(deck)
    }
}

/* ------------------------------------------------------------- */

const init = (): Messages => {
    return [   
        MidiAction.wait(2000),
        ...volumePush(0),
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

const volumePush = (deck: Deck) => {
    const volume = (delay: MidiMessage, x: number) => {
        if (x % 2 !== 0) return MidiAction.setVolume(0, x)
        else return delay
    }
    const delay = MidiAction.wait(20)
    return Array(100).fill(delay).map(volume)
}

/* 

record each event's time
        record each beat's time
        that's all that's needed! everything else can be calculated in post
        one necessary step: if there's more than one track playing, we should listen only to one tracks' beats
        Begin by listening to the first track played. That track will send beat messages until its paused, presumably
        On pause: 
            - if there's another deck playing, start listening to beat callbacks for that deck.
            - if not, the following messages shouldn't need to be highly precise, and can be scheduled in relation to the pause

        that should be enough info for necessary precision. for playback:
            - check time at beat relative to play, compare with recorded beat times to calibrate
            - schedule all events happening within 2000ms
            - check times at beats - make sure they are very close to recorded times (what are reasons they wouldn't be?)
            - lock in scheduling for all events starting on the next beat

    So we have an table of messages and times
    Separate data out: library messages, beat messages, play messages, eq messages, volume messages, etc

    Track selection:
        - the set needs to be contained within one playlist or in tracks, so we only ever deal with tracks in one place
        - but theoretically if connections can be hooked into library and playlist controls, we can deal with moving around
        - 

    Organize the data:
        - connect each play message with its following beats
        - connect each beat message with its following events
        - compute difference between event time and beat time
        - compute beat length in ms
        - construct knob / fader actions using interleaved delays calculated from time between events
        - on each beat, send the MidiAction for the next beat by using an initial delay of 1 beat

/* 

PlaylistProfile
    BPMProfile: quantitative
        - start with array of bpms, sorted ascending
        - analyze bpms for: 
            - mean 
            - standard deviation (high SD is bad)

    GenreProfile: qualitative
        - start with array of subgenres
        - create genre buckets with a count for each genre
        - mode (subgenre)
        - mode (genre)

    - BPMProfile for most common subgenre and genre

Basic, arbitrary BPM matching
BPM groups in increments of 10, that way they can average out somewhere

Sort playlist into these groups
A set, in reality, should stay within a maximum of 3 of these groups

After 64 beats, hard cut to next song
To find 64 beats:
    set timer for 60 beats converted to seconds, wait, ask Mixxx for the position, set a timeout for the hardcut based on position to 64 beats

Then, replace 64 beats with beats until mix out point
Depending on the genre profile, the transition (mix in point, mix out point, interplay) will differ

*/

const play = (deck: Deck) => MidiAction.play(deck, 1)
const pause = (deck: Deck) => MidiAction.play(deck, 0)
const wait = (delay: Delay) => MidiAction.wait(delay)

const gain = (): Question => MidiQ.gain()
const where = (deck: Deck): Question => MidiQ.position(deck)
const nextDeck = (deck: Deck): Deck => 1 - deck as Deck