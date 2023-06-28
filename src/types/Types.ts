import { Input, MidiMessage, Output } from "@julusian/midi"

export type Port = Input | Output
export type Ports = {in: Input, out: Output}

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

// groups sorted ascending bpm
export type BPMList = Playlist[]

export type Delay = number

export type Message = MidiMessage | Delay
export type Messages = Message[]

export type Answer = number
export type Question = MidiMessage

// 2-deck mixing for now
export type Deck = 0 | 1