import knexPkg from 'knex'
import "dotenv/config.js"
import { MidiMessage } from '@julusian/midi'
import { BeatEvents, Event, FormattedSet, ProcessedBeatEvents } from './types/Types'

export const addMidiEvent = async (message: MidiMessage, time: number) => {
    const event = {status: message[0], byte2: message[1], byte3: message[2], time: time}
    return await adaKnex(actionTable).insert(event)
}

export const processedSet = async (setId: number): Promise<FormattedSet> => {
    return beatEvents(await fetchSet(setId))
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

const fetchSet = async (setId: number): Promise<Event[]> => {
    // add .where for setId
    return await adaKnex(actionTable).orderBy('time')
}

// events must be sorted
const beatEvents = (events: Event[]): ProcessedBeatEvents[] => {
    let formattedEvents = [] as ProcessedBeatEvents[]
    let tempEvents = [] as Event[]
    let marker = events[0]
    for (let e of events) {
        if (!_isBeatStatus(e.status)) 
            tempEvents.push(e)
        else {
            formattedEvents.push(relativeTimes({marker: marker, events: tempEvents}))
            tempEvents = []
            marker = e
        }
    }
    return formattedEvents
}

const relativeTimes = (beatEvents: BeatEvents): ProcessedBeatEvents => {
    const beatTime = beatEvents.marker.time
    const adjustTimes = (e: Event) => ({...e, relativeTime: e.time - beatTime})
    return {...beatEvents, events: beatEvents.events.map(adjustTimes)}
}

const _isBeatStatus = (a: number) => a === 0x82