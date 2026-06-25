# Procedural Music and SFX Plan

> Status: **implemented** (2026-06-26) — the procedural AudioSystem follows this spec (menu/garage/run music states; coin, boost, collision, weak-fail, click, garage-switch and countdown SFX; master/music/SFX/mute settings respected). Kept as the reference for the audio design.

## Musical Direction

Mood: stylized low-poly feudal Japan, arcade racing pressure, and a modern instrumental rap/hip-hop beat. The soundtrack should feel energetic during a run without becoming busy enough to fight the engine, UI, or gameplay SFX.

Tempo: 96 BPM. The core loop is a four-bar pattern built from 16th-note scheduling, so it can repeat cleanly during long runs.

## Beat

- Kick: deep but short, with hip-hop placement on downbeats and syncopated pushes.
- Snare/clap: backbeat on beats 2 and 4, layered from filtered noise and a short body tone.
- Closed hats: steady 8th/16th grid with subtle velocity accents.
- Open hat: occasional bar-end lift to signal forward motion.
- Bass: sub/808-style sine bass with short slides and restrained sustain, mixed below the drums.

## Japanese Flavor

The hook uses short pentatonic plucks synthesized with oscillators, envelopes, and band-pass filtering. The tone should suggest shamisen/koto-like attack and decay without using any real-world recordings or recognizable melodies. The melodic material stays sparse: short D minor pentatonic phrases, mostly in call-and-response with the drums.

## Dynamic States

- Menu: calmer version with reduced drum density, no aggressive bass, and occasional plucks.
- Garage: medium calm, more mechanical UI feel, light hats/plucks, minimal kick.
- Run: full beat with kick, snare/clap, hats, open hats, bass, and pentatonic plucks.
- Game over: music should be stopped by integration and paired with the collision hit. A short stop or hit is preferable to a long stinger.

## SFX

- Coin: bright two-note synthetic chime with quick decay.
- Boost: rising oscillator plus filtered noise sweep, short and punchy.
- Traffic collision/game over: low thud, filtered noise burst, and quick downward pitch motion.
- Weak fail/stumble: softer descending bloop with a small noise tick.
- Menu click: tight filtered tick.
- Garage switch: short servo-like sweep with a subtle click.
- Countdown/start: clear synthetic beep suitable for repeated countdown calls.

## Mix Rules

- Master, music, SFX, and muted settings must be respected.
- Music should sit lower than SFX by default, with enough headroom for gameplay feedback.
- Avoid harsh peaks through conservative gains, short envelopes, filtering, and a light master compressor.
- SFX should remain legible over the beat but not clip when several effects happen close together.

## Browser and Lifecycle Edgecases

- Browser autoplay restrictions mean the AudioContext must be created/resumed after a user gesture via `unlock()`.
- `startMusic()` should be safe before unlock, but sound may not happen until the context is resumed.
- Pause/resume must stop sequencer scheduling without destroying settings.
- Stop must clear timers and reset sequencer state so a later start is clean.
- Dispose must stop music, disconnect persistent nodes, close the AudioContext, and release buffers/references.
