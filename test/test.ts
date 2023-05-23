import { fetchPlaylist } from '../src/Playlist.js'
const getPlaylist = async (p: string) =>  await fetchPlaylist(p)

const expect = require('chai').expect
describe('Playlist format', async function() {
    const playlist = await getPlaylist('2023-05 Latin')
    it('1. Type of playlist', function(done) {
        expect(playlist.length).to.not.equal(0)
        done()
    })
    it('2. Length of playlist greater than zero', function(done) {
        expect(Array.isArray(playlist)).to.equal(true)
        done()
    })
})