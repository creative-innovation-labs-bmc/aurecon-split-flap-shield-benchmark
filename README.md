# Aurecon split-flap Shield benchmark

Performance lab for the 3840 × 804 Aurecon split-flap wall. Production clock repositories remain untouched.

## Tests

- A: current-style DOM 3D control
- B: lightweight DOM 2D flap animation
- C: Canvas 2D at 2560 × 536 internally
- D: Canvas 2D at 1920 × 402 internally

All four share the same 49 × 7 logical wall, Open Sans Bold small text, original 4 × 5 Melbourne clock patterns, office data and 30-second stress sequence.

Run each page with `?bench=1` on the same Enplug / NVIDIA Shield player. Compare visible smoothness first, then frames over 33 ms, frames over 50 ms, p95 frame time and worst frame time.

Automated desktop QC is stored in `qc/report.json`. It is a development reference only. The physical Shield result is the decision-maker.
