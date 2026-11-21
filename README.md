# VIGIL

VIGIL is a full-body desktop sentinel concept for the Jarvis agent. It keeps watch while Jarvis works, perches on a window edge, and powers down when the day is done.

This repository contains the Three.js design preview used to develop the character. The final Windows runtime will use pre-rendered frames in a lightweight transparent overlay, targeting under 50 MB of RAM.

## Preview locally

From this folder:

```bash
python -m http.server 8765
```

Then open `http://127.0.0.1:8765/jarvis-vigil-preview.html`.

The preview loads Three.js from a CDN, so an internet connection is required.

## Behaviour states

Idle, Walk, Watch, Sit, Work, Rest, Blocked, Error, and Done. Use the buttons on the preview page to switch states.

## Files

- `jarvis-vigil-preview.html` — preview page and controls
- `jarvis-vigil.css` — page design system
- `jarvis-vigil.js` — scene, state machine, poses, and movement
- `vigil-character.js` — procedural armoured character rig
- `vigil-hologram.js` — task hologram panel
