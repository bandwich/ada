import { MidiMessage, Output } from "@julusian/midi";
import { Delay, Messages, OutputtedEvent } from "../types/Types";

// Separates control flow on message type, outputs message as MIDIx

const delay = async (ms: Delay) => {
    return await new Promise((r) => setTimeout(r, ms))
}

export const action = (ms: Messages) => async (output: Output): Promise<OutputtedEvent[]> => {
    // interleave a delay after each message
    let actionsOut: OutputtedEvent[] = []
    let prevTime = 0;

    for (let m of ms) {
        const timeToWait = m.relativeTime - prevTime
        const timeBefore = performance.now() 
        await delay(timeToWait)
        const actualDelay = performance.now() - timeBefore
    
        output.send(m.midi as MidiMessage)
        actionsOut.push({
            ...m,
            delayError: actualDelay - timeToWait
        })
        prevTime = m.relativeTime
    }
    return actionsOut
}