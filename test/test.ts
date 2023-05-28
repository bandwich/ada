import { playlist } from '../src/Playlist.js'
import { Messages, MidiAction, MidiQ, Questions, delay, action, openPorts, question } from '../src/Transform.js'

import * as dotenv from 'dotenv'
dotenv.config()

const expect = require('chai').expect
  
describe('Playlist format', function() {
    it('1. Playlist not empty and of correct type', async function() {
        const pList = await playlist(process.env.defaultPlaylist as string)
        expect(pList.length).to.not.equal(0)
        expect(Array.isArray(pList)).to.equal(true)
    })
})

describe('MIDI actions', function() {
    const ports = openPorts()
    it('2. First track in playlist loaded on deck 1', async function() {
        const testTrackPos = 37
        const pList = await playlist(process.env.defaultPlaylist as string)
        const begin: Messages = [
            MidiAction.wait(2000),
            MidiAction.selectPlaylist(1),
            MidiAction.wait(2000),
            MidiAction.selectTrack(0, testTrackPos)
        ]
        const bpm: Questions = [MidiQ.bpm(0)]
        const duration: Questions = [MidiQ.duration(0)]
        
        await action(begin)(ports.out)
        await delay(1000)

        expect((await question(bpm)(ports.in, ports.out))[0])
            .to.be.equal(Math.round(pList[testTrackPos - 1].bpm))

        expect((await question(duration)(ports.in, ports.out))[0])
            .to.equal(Math.round(pList[testTrackPos - 2].duration))
    })
})