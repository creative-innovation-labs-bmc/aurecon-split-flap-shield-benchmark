# Project brief

## Description

NVIDIA Shield and Enplug performance benchmark for the Aurecon 3840 × 804 split-flap wall, comparing DOM 3D, DOM 2D and two Canvas 2D renderers.

## Build brief

Purpose:
Create a separate performance-development repository so the existing production split-flap repositories remain untouched while we benchmark alternative renderers on the actual NVIDIA Shield through Enplug.

Source visual/behaviour reference:
- https://github.com/creative-innovation-labs-bmc/aurecon-split-flap-wall-open-sans
- Preserve the current Open Sans Bold small-flap typography and original 4 × 5 Melbourne macro-clock design.
- Preserve the current 49 × 7 geometry, 8 | 33 | 8 layout, office data, random non-repeating office logic, Melbourne weather metadata, live launch-clock behaviour and changed-digit-only updates.

Create four directly comparable test pages:

A. `a-dom-3d.html`
- Baseline renderer based on the current CSS 3D production architecture.
- Keep it as close as practical to the current wall so it provides a meaningful control.

B. `b-dom-2d.html`
- Same visual layout and data.
- Replace perspective/rotateX/backface 3D flap motion with a lightweight 2D split-flap illusion using clipped halves and scaleY/opacity/shading only.
- Avoid CSS filters during animation.
- Avoid forced layout reads such as offsetWidth wherever possible.
- Use one central animation scheduler rather than per-flap animation timers where practical.

C. `c-canvas-2560.html`
- Canvas 2D renderer.
- Internal render resolution 2560 × 536, displayed/scaled to the exact 3840 × 804 stage.
- Target stable 30 fps while animations are active.
- Sleep the requestAnimationFrame loop completely when nothing is animating.
- Use one scheduler for all active flaps.
- Pre-render/cache all Open Sans glyphs and static flap surfaces where practical.
- Only redraw regions/cells affected by animation or data changes if that improves performance.
- Reproduce the established split-flap look closely, including hinge, top/bottom shading, macro white cells and green colon dots.

D. `d-canvas-1920.html`
- Same Canvas 2D engine as C.
- Internal render resolution 1920 × 402, displayed/scaled to 3840 × 804.
- Otherwise identical behaviour so only internal pixel workload differs.

Shared functional requirements:
- Native display target 3840 × 804.
- 49 columns × 7 rows, 343 flap positions.
- All smaller text uses self-hosted Open Sans Bold.
- Large Melbourne HH:MM:SS uses the established chunky 4 × 5 illuminated-flap matrix, not font numerals.
- Melbourne time is always live.
- During entrance, already-active clock cells continue tracking current time.
- Unchanged hour/minute/second digit blocks do not animate unnecessarily.
- Random office mode does not repeat an office until every office has appeared.
- Preserve the established right-side alignment rules.
- Keep the same green split colons and office mini-colons.
- Keep browser/mobile viewport scaling for desktop and phone testing.
- No analytics or third-party runtime frameworks.
- Open Sans must be self-hosted in this repository with OFL licence.
- Add noindex/nofollow/noarchive/nosnippet/noimageindex and no-referrer controls.
- Include `.nojekyll` and GitHub Pages.

Benchmark mode:
- Each renderer must have the same deterministic benchmark sequence, enabled with `?bench=1`.
- Default benchmark duration approximately 30 seconds.
- Include launch/build animation, seconds updates, a forced `59 → 00` rollover, minute rollover, one four-card office replacement, and a stress burst with many simultaneous flap changes.
- The deterministic benchmark should use synthetic test time/data so all four renderers receive the same workload.
- Production/live mode should still use actual Melbourne time.

On-screen diagnostics in benchmark mode only:
- renderer name
- internal resolution
- current FPS
- average frame interval
- p95 or worst frame interval
- number of frames over 33 ms
- number of frames over 50 ms
- active animation count
- total benchmark elapsed time
- browser user-agent
- optional approximate devicePixelRatio

Benchmark result export:
- At the end of the benchmark expose a JSON result on `window.__benchmarkResult`.
- Provide a visible `COPY RESULT` button or text area in benchmark mode so results from the Shield can be photographed/copied.
- Include renderer name, dimensions, elapsed time, frame statistics, dropped/slow-frame counts and user-agent.

Selector page:
- `index.html` should clearly link to all four tests.
- Include normal links and separate benchmark links with `?bench=1`.
- Make the four test choices large and easy to tap from a phone or Shield browser.

QC:
- Chromium native 3840 × 804 screenshots for all four renderers.
- Verify 343 logical flap positions.
- Verify macro 4 × 5 state matches the source build for a fixed test time.
- Verify small text is Open Sans Bold.
- Verify random office deck uniqueness.
- Verify benchmark JSON is produced by all four pages.
- Verify Canvas C is internally 2560 × 536 and Canvas D is 1920 × 402 while both occupy the full 3840 × 804 stage.
- Record automated desktop benchmark numbers for reference, but make clear the actual NVIDIA Shield/Enplug results are the decision-maker.

README:
- Explain the purpose of A/B/C/D.
- Give exact Enplug test links.
- Explain how to run the benchmark and which metrics matter most.
- Recommend comparing consistency and >33 ms / >50 ms frames rather than peak FPS alone.
- Do not claim a winning renderer until tested on the physical Shield.
