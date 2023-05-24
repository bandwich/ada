import { playlist } from '../src/Playlist.js'
import { init } from '../src/Encoder.js'

const expect = require('chai').expect
describe('Playlist format', function() {
    it('1. Playlist not empty and of correct type', async function() {
        const p = await playlist('2023-05 Latin')
        expect(p.length).to.not.equal(0)
        expect(Array.isArray(p)).to.equal(true)
    })
})

describe('MIDI connections', function() {
    it('2. All MIDI signals were read and processed', async function() {
        const activeSignals = await init()
        const signalSum = Object.values(activeSignals).reduce((acc, curr) => acc && curr, false)
        expect(signalSum).to.equal(false)
    })
})