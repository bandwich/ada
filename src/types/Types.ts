import { Input, MidiMessage, Output } from "@julusian/midi"

export type Port = Input | Output
export type Ports = {in: Input, out: Output}

export type Event = {
    status: number 
    byte2: number
    byte3: number
    time: number
}


export type BeatEvents = {
    marker: Event
    events: Event[]
}

type ProcessedEvent = Event & {relativeTime: number}
export type ProcessedBeatEvents = BeatEvents & {events: ProcessedEvent[]}

export type FormattedSet = BeatEvents[]

export type Track = {
    track_id: number
    position: number
    title: string
    artist: string
    album: string
    year: string
    genre: string
    tracknumber: string
    location: number
    duration: number
    bpm: number
}
export type Playlist = Track[]
export type PlaylistData = {
    id: number
    name: string
    position: number
}

// groups sorted by ascending bpm
export type BPMList = Playlist[]

export type Delay = number

export type Message = MidiMessage | Delay
export type Messages = Message[]

export type Answer = number
export type Question = MidiMessage

// 2-deck mixing for now
export type Deck = 0 | 1