import knexPkg from 'knex'
import "dotenv/config.js"
import { v4 as uuidv4 } from 'uuid';
import { MidiMessage } from '@julusian/midi'
import { BeatEvents, Event, FormattedSet, MidiEvent, MarkedEvents, OutputtedEvent } from './types/Types'

export const addMidiInEvent = async (message: MidiMessage, time: number) => {
    const event = {status: message[0], byte2: message[1], byte3: message[2], time: time}
    return await adaKnex(actionTable).insert(event)
}

export const addMidiOutEvents = async (messages: OutputtedEvent[]) => {
    return await adaKnex.transaction(async trx => {
        for (let m of messages) {
            const formattedActionOut = {
                action_id: uuidv4(),
                set_id: uuidv4(),
                status: m.midi[0],
                byte2: m.midi[1],
                byte3: m.midi[2],
                time: m.time,
                relative_time: m.relativeTime,
                time_error: m.delayError
            }
            await trx(actionTable).insert(formattedActionOut)
        }
    })
}

export const processedSet = async (setId: number): Promise<FormattedSet> => {
    return markedEvents(await fetchSet(setId))
}

// average error (ms) of outputted messages
export const averageError = (messages: OutputtedEvent[]) => {
    const totalError = messages.reduce((acc, curr) => acc + curr.delayError, 0)
    return totalError / messages.length
}

// these are pre-processing status codes!
export const statusByte = (m: number[]): number => m[0]
export const isMidiMessage = (byte: number) => (0xa0 <= byte && byte <= 0xbe)
export const isMarkerMessage = (byte: number) => byte === 0xa0 || byte === 0xb4

const shift = (status: number) => status - 32
const isBeatMessage = (byte: number) => byte == 0xa0
const isPlayMessage = (byte: number) => byte == 0xb4

const fetchSet = async (setId: number): Promise<Event[]> => {
    // add .where for setId
    return await adaKnex(actionTable).orderBy('time')
}

/* ------------------------------------------------------ */

const actionTable = process.env.actionsTable

const mixKnex = knexPkg({
    client: 'better-sqlite3',
    connection: { filename: process.env.mixxxDbName as string },
    useNullAsDefault: false
})

const adaKnex = knexPkg({
    client: 'better-sqlite3',
    connection: { filename: process.env.adaDbName as string },
    useNullAsDefault: false
})

/* ------------------------------------------------------ */

/* 

My thought is that track metadata on the Mixxx side should be saved during the performance, or right after?
(Processing after stopping Ada's recording)
So that they aren't affected by
changes to Mixxx itself, although this does require extra sync and check work during playback

Need a direct mapping between track ID and MIDI signals to load that track
*/


const midiEvents = (events: Event[]) => {
    return events.map((e) => ({
        time: e.time,
        midi: [e.status, e.byte2, e.byte3]
    })
)}

const processedMidiEvents = (events: MidiEvent[]) => {
    const shiftStatusByte = (midi: number[]) => [shift(midi[0]), midi[1], midi[2]]
    return events.map((event: MidiEvent) => ({...event, midi: shiftStatusByte(event.midi)}))
}

const relativeTimes = (beatEvents: BeatEvents): MarkedEvents => {
    const beatTime = beatEvents.beatMarker.time
    const adjustTimes = (e: MidiEvent) => ({...e, relativeTime: e.time - beatTime})
    return {...beatEvents, events: beatEvents.events.map(adjustTimes)}
}

/* 
Before starting playback, Ada needs to make sure that Mixxx is in a state to start playback

What is the necessary info for this verification?
    - Which decks are playing


How do we carry out the verification?
    - On Ada's startup, set up a MIDI listener
    - Ask Mixxx questions?

*/


// relative times are added to each event, and midi status codes are shifted for output
const markedEvent = (beatMarker: MidiEvent, events: MidiEvent[]) => relativeTimes({
    beatMarker: beatMarker,
    events: processedMidiEvents(events)
})

// what to do (properly) with beat and play messages
// change schema for sqlite to include setId
// add separate methods for set recording and for playback of a recording

// events must be sorted
const markedEvents = (rawEvents: Event[]): MarkedEvents[] => {
    let formattedEvents = [] as MarkedEvents[]
    let tempEvents = [] as MidiEvent[]

    let messages = midiEvents(rawEvents)
    let marker = messages[0]
    
    for (let m of messages) {
        // save all messages except beat messages
        if (!isBeatMessage(m.midi[0])) 
            tempEvents.push(m)
        // treat both play and beat messages as a marker
        if (isMarkerMessage(m.midi[0])) {
            formattedEvents.push(markedEvent(marker, tempEvents))
            tempEvents = []
            marker = m
        }
    }
    // to catch last block of messages, since blocks are added with the next marker
    formattedEvents.push(markedEvent(marker, tempEvents))
    return formattedEvents
}