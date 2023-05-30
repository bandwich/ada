import { Input, MidiMessage, Output } from "@julusian/midi"
import { Answer, Question } from "../types/Types"
import { once } from "events"
import { extractSingleVal, extractTimeVal, statusByte, timeAnswerStatus, valueAnswerStatus } from "./Encodings"

export const question = (q: Question) => async (input: Input, output: Output): Promise<Answer> => {
    output.send(q)
    const answerMessage = await _waitForAnswer(input) as MidiMessage
    return _parseAnswer(answerMessage)
}

const _parseAnswer = (a: MidiMessage) => {
    const isValue = statusByte(a) === valueAnswerStatus
    const isTime = statusByte(a) === timeAnswerStatus

    if (isValue) return extractSingleVal(a)
    else if (isTime) return extractTimeVal(a)
    else return -1
}

const _waitForAnswer = async (input: Input): Promise<unknown> => {
    const answer = await once(input, 'answer')
    return answer.flat()
}


