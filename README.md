# BITE
### quiet fishing at Mud Lake, done honestly · a DIRTY BOY DEVS game
**v1.0 · 2026-08-19 · single-file C-tier house game · bible: `BITE-BIBLE.md` (workspace root)**

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
- `test.mjs` — full Playwright suite (37 checks): every species landed via the real
  pipeline, bobber-grammar timing, the mayor's scripted first break-off and once-per-save
  landing, lure archaeology, sore-mouth memory, winter freeze, save round-trip, zero
  console errors. `npm i playwright` then `node test.mjs`.
- QA handles live on `window.__bite`.

## Ship checklist (per ROADMAP §7 — repo on day one)

1. `kylefriesmarketing/bite` — push this folder.
2. GitHub Pages from default branch → verify live URL.
3. Update the brief's status line in `game-briefs/garage.md` to `shipped (<url>)`.
4. Hub-side: doorway mesh + hint + collectible wiring when the garage opens
   (standalone ship is fine until then — house law).

*cast. wait. read. the lake remembers, and so does the book. — DBD*
