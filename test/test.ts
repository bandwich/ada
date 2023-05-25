import { playlist } from '../src/Playlist.js'
import { runSignalTest } from '../src/Encoder.js'

import * as dotenv from 'dotenv'
dotenv.config()

const expect = require('chai').expect
  
describe('Playlist format', function() {
    it('1. Playlist not empty and of correct type', async function() {
        const p = await playlist(process.env.defaultPlaylist as string)
        expect(p.length).to.not.equal(0)
        expect(Array.isArray(p)).to.equal(true)
    })
})

describe('MIDI connections', function() {
    it('2. All MIDI signals were read', async function() {
        const signals = await runSignalTest()
        const signalMatch = JSON.stringify(signals[0]) === JSON.stringify(signals[1]) 
        expect(signalMatch).to.equal(true)
    })
})