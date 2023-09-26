import { Input, MidiMessage, Output } from "@julusian/midi"

export type Port = Input | Output
export type Ports = {in: Input, out: Output}

// ListenerActions handle all MIDI related side-effects
export type ListenerAction = (m: number[]) => void

export type Event = {
    status: number 
    byte2: number
    byte3: number
    time: number
}

export type MidiEvent = {
    midi: number[]
    time: number
}

export type BeatEvents = {
    beatMarker: MidiEvent
    events: MidiEvent[]
}

export type ProcessedEvent = MidiEvent & { relativeTime: number }
export type OutputtedEvent = ProcessedEvent & {delayError: number}
export type MarkedEvents = BeatEvents & { events: ProcessedEvent[] }

export type FormattedSet = MarkedEvents[]

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

export type Messages = ProcessedEvent[]

export type Answer = number
export type Question = MidiMessage

// 2-deck mixing for now
export type Deck = 0 | 1