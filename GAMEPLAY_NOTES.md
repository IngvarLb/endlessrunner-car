# Gameplay Notes

## Boost Obstacle Destroy VFX

> Status: still open (2026-06-26). Boost / 赤 Striker Boost and the 藍 shield still hide a destroyed car immediately (no impact VFX yet).

When the boost destroys an obstacle, the current implementation hides the obstacle immediately. Later, replace that with a short stylized impact:

- small low-poly debris chunks using the obstacle color
- short orange/white spark burst at contact point
- quick shockwave ring
- slightly stronger camera shake
- temporary bigger boost exhaust flames

