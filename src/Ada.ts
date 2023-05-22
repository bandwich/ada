/* 
Ada + Mixxx
5/11/23

Ada is nothing other than a custom data pipeline that uses a playlist to create a series of actions meant for DJ software.
A custom MIDI encoder and decoder are also necessary for use with any DJ software (otherwise Ada is fairly useless)

Mixxx (https://mixxx.org/) is perfect for this, as it has no native controllers but rather uses custom mappings for existing ones.
It exposes its inner workings via Javascript to allow for controller mapping. It also exposes getters and setters, although
they are questionable in performance. 
Along with its support for virtual MIDI I/O, Mixxx's features give it all the connections to interface with Ada. It is unclear
if other DJ software exposes enough of an interface to properly connect with Ada. 

A proposed complete blueprint is as follows: 
    Ada is provided with a formatted playlist of tracks and a 2 way connection to an encoder.
    Ada computes the actions and sends them to the encoder.
    The encoder converts these actions to MIDI signals and outputs them to a virtual MIDI port.
    The decoder (Mixxx script) receives and decodes these MIDI signals from the virtual port
    into time-accurate adjustments of Mixxx controls.

        * Note: After some thought, both Ada and Mixxx just need a box that takes in a control adjustment, flips the encoding,
                and sends the data further in the same direction.
                
        * Accurate timing of actions requires sync logic in the implementations of BOTH the emitter and the receiver
            - Edit: The Mixxx engine reports timed reactions have a resolution of 20ms, which is more than good enough.
            - The emitter simply needs a lookahead window, and can leave accurate timing responsibility to the receiver.

    Ada can also receive callback signals from the emitter (outputted by Mixxx), which are useful for validation and sync logic.
    Once engineered, Ada's decision pipeline should be transparent and allow for custom input connections to this pipeline.
    Ada then has the potential to respond to real-time feedback and other additional input.

...
... Obviously the end goal is to toss the middleware and inject Ada into Mixxx directly. Could be a costly
    integration, but worth investigating. There's potential to dissect Mixxx and assemble a version free of
    anything Ada doesn't need. For a later date?

*/

import { fetchPlaylist } from './Playlist.js'
const playlist = async (p: string) => {
    // const test = await fetchPlaylist(p)
    // console.log(test)
    return await fetchPlaylist(p)
}
playlist('2023-05 Latin')