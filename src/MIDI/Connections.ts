// https://github.com/julusian/node-midi
// https://cmtext.indiana.edu/MIDI/chapter3_controller_change.php

import { Input, Output } from '@julusian/midi'
import { Ports } from '../types/Types'
import { isAnswerMessage, statusByte } from './Encodings'

export const openPorts = (): Ports => _setupConnections(new Input(), new Output())
export const closePorts = (input: Input, output: Output): void => {
    input.closePort()
    output.closePort()
}

// handles side-effects from setup
const _setupConnections = (input: Input, output: Output): Ports => {
    _openPort(input)
    _openPort(output)
    _listenForInputs(input)
    return {in: input, out: output}
}

const _openPort = (put: Input | Output): void => put.openPort(0)

// Emits separate message for Q&A responses
const _listenForInputs = (input: Input): void => {
    input.on('message', (deltaTime, message) => {
        const status = statusByte(message)
        if (isAnswerMessage(status)) {
            input.emit('answer', message)
        }
    })
}
