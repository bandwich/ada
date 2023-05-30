import { Input, MidiMessage, Output } from "@julusian/midi"

export type Ports = {in: Input, out: Output}

export type Delay = number

export type Message = MidiMessage | Delay
export type Messages = Message[]

export type Answer = number
export type Question = MidiMessage

// 2-deck mixing for now
export type Deck = 0 | 1