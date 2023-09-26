// https://github.com/julusian/node-midi
// https://cmtext.indiana.edu/MIDI/chapter3_controller_change.php

import "dotenv/config.js"
import { Input, MidiMessage, Output } from '@julusian/midi'
import { ListenerAction, Port, Ports } from '../types/Types'
import { isMidiMessage, statusByte, processedSet, isMarkerMessage, addMidiInEvent, addMidiOutEvents } from "../data"
import { once } from "events"
import { action } from "./Action"

export const getPorts = (portType: Port) => {
    const count = portType.getPortCount()
    const portName = (v: any, x: number) => portType.getPortName(x)
    return Array(count).fill('').map(portName)
}

// openPorts is curried: setupConnections returns func accepting port numbers
export const openPorts = (mode: string) => setupConnections(new Input(), new Output(), mode)
export const closePorts = (input: Input, output: Output): void => {
    input.closePort()
    output.closePort()
}

/* ----------------------------------------------------------------------------------------
            Setup
*/

const setupInputConnection = (input: Input, lAction: ListenerAction): void => {
    const actionCallback = async (deltaTime: number, message: number[]) => lAction(message)
    input.on('message', actionCallback)   
}

const setupPlaybackConnection = async (input: Input, output: Output) => {
    const set = await processedSet(0)
    let beatNumber = 0;
    input.on('message', async (deltaTime: number, message: number[]) => {
        // console.log([...message, performance.now()])
        if (isMarkerMessage(statusByte(message)) && beatNumber < set.length) {
            const actionsOut = await action(set[beatNumber].events)(output)
            addMidiOutEvents(actionsOut)
            beatNumber += 1
        }
    })
}

const setupConnections = (input: Input, output: Output, mode: string) => {
    const _openPort = (port: Port, portNumber: number): void => port.openPort(portNumber)
    
    // handles side-effects from connection setup
    return async (inPort: number, outPort: number): Promise<Ports> => {
        input.ignoreTypes(false, false, false)
        switch(mode) {
            case 'playback':
                setupPlaybackConnection(input, output)
                break;
            case 'record': 
                setupInputConnection(input, record)
                break;
            default: setupInputConnection(input, listen)
        }
        _openPort(input, inPort)
        _openPort(output, outPort)
        return {in: input, out: output}
    }
}

// const _waitForAnswer = async (input: Input) => (await once(input, 'answer')).flat()

/* ----------------------------------------------------------------------------------------
Actions!
*/

const record: ListenerAction = async (message: number[]) => {
    if (isMidiMessage(statusByte(message)))
        addMidiInEvent(message as MidiMessage, performance.now())
}

const listen: ListenerAction = (message: number[]): void => {
    console.log([...message, performance.now()])
}