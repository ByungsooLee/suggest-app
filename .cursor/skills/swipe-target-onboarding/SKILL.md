---
name: swipe-target-onboarding
description: Implements Tinder-style swipe classification with fixed left/right drop targets, pointer-safe drag lifecycle, and fast confirm-to-next-card UX. Use when building or fixing swipe card UIs, onboarding card flows, or seen/never-seen style drag classification.
---

# Swipe Target Onboarding

## Purpose

Reuse this skill when implementing a swipe-card decision flow where:
- left and right decisions must be visually explicit
- drag must work on both mouse and touch
- releasing over a lit target should confirm immediately
- card should fly out and next card should appear quickly

## Default UX Contract

- Left target: `NEVER SEEN`
- Right target: `SEEN`
- Card is draggable only with primary pointer input
- Decision confirms when:
  - card center reaches a target zone, or
  - flick velocity passes threshold with minimum travel
- If neither condition is met, card snaps back to center

## Implementation Checklist

Copy this checklist and complete in order:

```text
Swipe Card Checklist
- [ ] Add fixed outer targets (left/right), not inside card
- [ ] Track drag state with both state + ref
- [ ] Use pointer capture on pointerdown
- [ ] Handle pointerup/cancel/lostpointercapture with one finalize path
- [ ] Compute active target by card center against target bounds
- [ ] Confirm on glow(active target) at pointerup
- [ ] Add flick fallback (velocity + min distance)
- [ ] Disable input during settle animation
- [ ] Fly out confirmed card, then advance index
- [ ] Reset drag refs/state in exactly one reset function
```

## Required State and Refs

Use these concepts consistently:
- `drag`: `{ startX, startY, dx, dy, active }`
- `dragRef`: same structure, source of truth inside handlers
- `pointerIdRef`: active pointer id
- `activeDropTarget`: `"left" | "right" | null`
- `isSwipeSettling` (+ ref mirror): blocks double input
- `velocityRef`: tracks terminal horizontal velocity
- `leftTargetRef`, `rightTargetRef`, optional `dropAreaRef`

## Threshold Defaults

Start with these values, then tune:
- `FLICK_VELOCITY_THRESHOLD = 0.75`
- `FLICK_MIN_DISTANCE_PX = 52`
- `SWIPE_OUT_DISTANCE = 440`
- `SWIPE_SETTLE_MS = 140`
- `TARGET_CONFIRM_PADDING_PX = 24`

## Finalize Flow (Single Exit)

In `finalizeSwipe(event)`:
1. Validate `pointerId`
2. Ignore if not active or currently settling
3. Resolve target using current drag position (prefer `activeDropTarget`)
4. If target exists -> confirm immediately
5. Else if flick threshold is met -> confirm by velocity direction
6. Else -> reset to center
7. Release pointer capture only inside finalize path

## Confirm Flow

When confirming:
1. Set settling state
2. Set pending direction for badge/target highlight
3. Apply fly-out transform (`dx = +/- SWIPE_OUT_DISTANCE`)
4. After `SWIPE_SETTLE_MS`:
   - append decision
   - increment card index
   - clear pending direction
   - clear settling
   - call unified `resetDrag()`

## Visual Rules

- Targets must be outside card bounds and always visible
- Active target gets stronger scale/opacity glow
- Card overlays targets (`z-index`) during drag
- During settle, card `pointer-events: none`

## Common Failure Modes

- Card sticks to cursor:
  - finalize path is split across handlers
  - pointer capture released before decision logic
- Glow shown but not confirmed:
  - pointerup ignores `activeDropTarget`
- Double decisions:
  - settling guard missing
- Inverted decisions:
  - left/right mapping differs between UI label and commit mapping

## Verification

Run and verify:
1. Drag left until left target glows, release -> classified as `NEVER SEEN`
2. Drag right until right target glows, release -> classified as `SEEN`
3. Short drag and release without glow -> snaps back
4. Fast flick near center -> direction confirm works as intended
5. Repeated rapid interactions do not stick or double-confirm
6. `npm run lint` and `npm run build` pass
