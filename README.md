# BITE
### quiet fishing at Mud Lake, done honestly · a DIRTY BOY DEVS game
**v1.2 · 2026-08-19 · single-file C-tier house game · bible: `BITE-BIBLE.md` (workspace root)**
**Live: https://kylefriesmarketing.github.io/bite/**

The tackle box in the garage is dad's. Inside it: a red-and-white bobber, a coffee can's
worth of worms, and a lake. The bobber is a language — every species bites differently and
the skill is reading, then knowing when to strike. The lake is one persistent population of
128 individual fish that grow on the real calendar *because you release everything*. And one
legend, a muskie the whole town calls **the mayor**, has been following lures to the bank
and sinking away since before you were born.

Nothing dies at the lake. Catch, look, let go. The journal keeps the glory.

## Play

Open `index.html` in a browser. That's it — no build step, no dependencies, boots from
`file://` or any static server. Playable with one pointer, lying down, phone-perfect.

- **Cast:** press the water where you want the bobber, release.
- **The wait:** watch the bobber. Or close your eyes and listen — every species has its own
  bite sound, and fishing by ear genuinely works.
- **The set:** tap. But *when* is the whole skill — bluegills lie for thirty seconds,
  crappies lift the bobber instead of sinking it, a bass just makes it vanish (count three),
  pike give you no time at all, walleye want a slow lean (press and hold).
- **The fight:** hold to reel, let go when she runs, drag sideways to steer her off the
  weeds. The rod is the tension meter. When she surfaces, wait for the flat-side float —
  netting a green fish is how trophies are lost.
- **Lures:** there's no shop. The lake keeps what everyone lost — snag the bottom at the
  sunken rowboat and reel up tackle from previous generations, each with a story. Each lure
  is a different retrieve rhythm (steady wind · twitch · hop · frog-walk).
- **Keyboard:** space = reel/set · arrows = steer (and figure-eights) · J journal · B box ·
  M mute · Enter = net/continue.

The lake runs on the **real clock and real seasons**. Dawn and dusk are gold. Night belongs
to the catfish. The barometer in the box lid tells you the day's odds — the gray drizzle
before a storm is the best fishing of the year, and the postcard-blue day after it is the
worst. In December the lake freezes and the doorway is gone until thaw. That's the point.

## The house contract

- **Save key:** `bite-save` — `{ started, casts, journal:{}, lures:{},
  mayor:{sightings,follows,hooked,landed,spoon}, released, ... }`
  The room reads `journal` count, `released`, and `mayor.landed`.
- **Collectible:** *the scale (the size of a poker chip)* — earn condition `mayor.landed`.
- **Doorway hint:** *"the tackle box — the bobber will tell you. everyone's seen the mayor once."*
- **Contracts read (all with fallbacks):** `nightcrawlers-save` (your jar is the bait box;
  fallback: dig by the hose) · `sundaydriver-save` (opens the far bank; fallback: 10 journal
  species) · `goodboy-save` (the dog naps on the dock, and barks at exactly one thing).
- Audio all-synth WebAudio, mute persists · `prefers-reduced-motion` honored ·
  back-link to the house · zero deps · ~1,950 lines.

## Dev / QA

- `?debug=1` — chip row: force hour/weather/month, mayor conditions, +lures, +book, wipe.
  `&ts=N` speeds the sim.
- `?probe=1` — seeded 30-day weather table, per-spot heat, and a 1,000-draw species
  distribution (bite tables are tuned from the probe, not vibes).
  ⚠️ `test.mjs` used to hardcode a Linux container's chromium path, so `npm i playwright
  && node test.mjs` could never pass on Kyle's machine. On Windows run:
  `npm i playwright` then `PW_CHANNEL=chrome node test.mjs` (uses installed Chrome — no
  130MB browser download). `PW_CHROMIUM=<path>` overrides; the old container path still
  wins when it actually exists.
- `test.mjs` — full Playwright suite (41 checks, **41/41 green on Windows 2026-08-19**):
  every species landed via the real
  pipeline, bobber-grammar timing, the mayor's scripted first break-off and once-per-save
  landing, lure archaeology, sore-mouth memory, winter freeze, save round-trip, zero
  console errors. `npm i playwright` then `node test.mjs`.
- QA handles live on `window.__bite`.

## Milestones (this README is the authority)

**M1 ✅ THE SLICE — shipped 2026-08-19, live, 41/41.**
Audited against the bible 2026-08-19 and it is content-complete, not a slice:
all **15 species** with signatures + fight shapes (incl. the unhookable gar and the
mayor), **8 spots** (the bible specced 7 — the sunken rowboat became its own), **12
lures** with retrieve verbs, **128 fish** across the population table, the seasonal
month curves (crappie spring feast ×1.6, bowfin August, carp summer, pike summer
slowdown, Dec–Feb freeze), the live surface tells (heron on the hottest spot, nervous
water, predator swirls, gar basking on clear summer noons), 9 loss lessons, 5
superstitions, the old timer, the turtle, the census, sore-mouth memory, the figure-8,
and the mayor's full arc. Repo + Pages + brief + catalog all green.

**M2 ⬜ MOVE-IN — due now.** The garage opened in the hub on 2026-08-19 (`games-hub`
commit 7403827), which retired this game's "when the garage opens" deferral. Needs, in
`games-hub`: the tackle-box doorway mesh + `tag()` hint in `js/hallway.js` (in
`enterGarage`'s space), the list-view card in `index.html`, and the collectible —
*the scale (the size of a poker chip)*, earn condition `mayor.landed` from `bite-save`.
The poster texture is already cut and committed at `games-hub/assets/tex/poster-bite.jpg`
(512×768 q85, house recipe). ⚠️ those three hub files are the workspace's hottest
collision surface — check mtimes and land it in one small commit.

**M3 ✅ THE PAINTED LAKE — done 2026-08-19, from Kyle's playtest: "the wait dragged and
the lake looked flat."** Both were real and both were measurable.

*The lake was flat because it had no depth cues*, not because it lacked detail:
- Everything beyond the water was **two silhouettes inside a 26px sliver**. Three planes
  now, each lighter and slower than the one in front (aerial perspective).
- **Atmospheric haze** on the horizon, so the treeline recedes instead of sitting on the
  water like a sticker. Drifting **mist** in the cool hours.
- The ripple and sun-glitter rows were spaced **evenly** — the single biggest reason
  painted water reads as a flat sheet. They now compress toward the horizon and open out
  at your feet, and so do row pitch, ripple width, stroke weight, wave height and alpha.
- **A near plane at last**: reeds you stand behind, framing both edges. Sky, far shore and
  water were all mid-to-far, so the eye had nothing to measure distance against.
- ⚠️ Fixed while in there: the drop-off and mud-flat tints were hard-edged `fillRect`s —
  a visible translucent BOX with a vertical seam across the water. Caught in a
  before/after capture; soft-ended and vertically stepped now.

*The wait dragged because of the GAPS, not the bite share* — my first guess was the bite
share and the measurement said no. Real activity at any decent spot sums to heat ~61, so
`eff` saturates the curve; a kinder curve changed almost nothing except deleting blank
casts entirely (0%), which pillar 2 does not want. Measured before→after, same seeds,
150 casts per cell: median time to a bite **16.8s→10.1s** at dawn, **17.8s→10.3s** midday,
**29.8s→16.5s** at night, **25.7s→13.9s** at the drop-off; a cast now runs ~57s instead of
~74s, and the honest blank tail survives at night (9%→3%). All four numbers came from
`eventGap` and `events`; the bite curve is back at its shipped values and is now in `TUNE`
rather than hardcoded inline.

**M3b ⬜ Species portraits — still open, still Kyle's call.** Bible §13 reserves "the art
budget" for 15 painted catch-card portraits. The build ships **zero external assets**:
one procedural `drawFish()` off each species' `pal` + `shape` serves the swimming fish,
the catch card and the journal alike. §13 also says "primitives over asset packs" is house
style, so this may be correct as-is. Note it would fix neither thing Kyle reported.

**M4 ⬜ THE SECOND SEASON — ice fishing.** The bible defers it by name (§7): "deliberately
NOT in v1 — it's the obvious second-season expansion: the shanty, the auger, the perch
kings." The lake already goes dark Dec–Feb, so the doorway for it is literally built.

**M5 ⬜ THE CONTRACTS COME ALIVE.** All three sibling games BITE reads are still `status:
idea` — NIGHT CRAWLERS (`front-yard.md`), SUNDAY DRIVER (`parents-room.md`), GOOD BOY
(`backyard.md`). BITE runs on its fallbacks today (dig by the hose · far bank at 10
journal species · a quieter dock). Each one that ships retires a fallback and makes the
jar, the drive and the dog real. Not BITE's work — BITE is already holding up its end.

**M6 ⬜ LOOSE THREAD.** The gar's frayed-rope lure (§5) — real angling's answer to a bony
beak, filed in the bible as "a possible far-future easter egg." The one page in the
journal that is supposed to stay empty, with a way in.

*cast. wait. read. the lake remembers, and so does the book. — DBD*
