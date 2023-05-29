import { playlist } from '../src/Playlist.js'
import { Messages, MidiAction, MidiQ, Question, delay, action, openPorts, question } from '../src/Transform.js'

import * as dotenv from 'dotenv'
dotenv.config()

const expect = require('chai').expect

const begin: (pos: number) => Messages = (pos: number) => [
    MidiAction.wait(2000),
    MidiAction.selectPlaylist(1),
    MidiAction.wait(2000),
    MidiAction.selectTrack(0, pos)
]
const bpm: Question = MidiQ.bpm(0)
const duration: Question = MidiQ.duration(0)
const testTrackPos = 37
  
describe('Playlist format', function() {
    const pList = async () => await playlist(process.env.defaultPlaylist as string)
    it('1. Playlist not empty and of correct type', async function() {
        const playlist = await pList()
        expect(playlist.length).to.not.equal(0)
        expect(Array.isArray(playlist)).to.equal(true)
    })
})

describe('MIDI actions', function() {
    const ports = openPorts()
    const pList = async () => await playlist(process.env.defaultPlaylist as string)
    it('2. First track in playlist loaded on deck 1', async function() {  
        const playlist = await pList()
        await action(begin(testTrackPos + 1))(ports.out)
        await delay(1000)
        
        const bpmAnswer = await question(bpm)(ports.in, ports.out)
        const durationAnswer = await question(duration)(ports.in, ports.out)

        expect(bpmAnswer).to.be.equal(Math.round(playlist[testTrackPos - 1].bpm))
        expect(durationAnswer).to.equal(Math.round(playlist[testTrackPos - 1].duration))
    })
})