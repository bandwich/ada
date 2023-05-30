import { MidiMessage, Output } from "@julusian/midi";
import { Delay, Message, Messages } from "../types/Types";
import { delay } from "../Ada";

// Separates control flow on message type, outputs message as MIDI
export const action = (ms: Messages) => async (output: Output): Promise<void> => {
    const _isDelay = (m: Message) => !Array.isArray(m)
    for (let m of ms) {
        if (_isDelay(m)) await delay(m as Delay)
        else output.send(m as MidiMessage)
    }
}