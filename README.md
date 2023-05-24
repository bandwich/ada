## Ada

Ada (in progress) is an inteliigent, virtual DJ system built on top of Node.js, designed to interface with DJ software Mixxx through MIDI signals.

Ada's core logic is written in TypeScript in a pure and functional style. Ada reads playlists and outputs
timestamped actions, which are then processed into MIDI. 

The Mixxx virtual controller is written in JavaScript (or QtScript, to be exact), and decodes MIDI signals into
corresponding actions within Mixxx.

Testing is done with Mocha and Chai. 
