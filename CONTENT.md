# What the site still needs

Everything below is a placeholder in the code. Bracketed amber text on the page
marks the gaps visually, so nothing fake can ship by accident.

## Words

- [ ] **Five track titles and durations.** `index.html`, the `.pieces` list.
      If the set is not five pieces, add or delete `<li class="piece">` blocks.
- [ ] **The third paragraph of "The record."** The two above it are written from
      the studio notes. The third is a placeholder in your voice about the night
      itself, and should be replaced with two sentences you actually mean.
- [ ] **Recording date** and **format** (digital only, or vinyl too).
- [ ] Confirm the venue line reads the way you want it to.

## Links

- [ ] **Contact address.** Search `REPLACE@EXAMPLE.COM` in `index.html`.
- [ ] **Listen link.** Both "Listen" buttons point at `#`. Private SoundCloud
      is fine for now; swap for the real release link later.
- [ ] **Footer profiles:** Bandcamp, Instagram, YouTube.

## Images

Three slots, all in the `.gal-track` gallery. Replace each
`<div class="slot">` with an `<img>` and delete the `.slot` rule from the CSS
once all three are real.

- [ ] **Performance, wide.** The hall mid-set. Landscape, roughly 1600x1100.
- [ ] **Stick and pedalboard.** The signal chain, lit low.
- [ ] **Portrait, low light.** Something usable as a press photo.

Dark, grainy, and underexposed will sit better than anything bright and clean.
The whole page is built around low-key imagery.

Also needed for link previews:

- [ ] **Open Graph image**, 1200x630. Add it as `og:image` in `<head>`.

## Facts to double check before this goes public

The Hassell credits currently read "recorded and produced" for *Seeing Through
Sound* (2020) and *Listening to Pictures* (2018), plus band membership through
the 2010s. That matches the positioning note in the studio files, but it is the
single most load-bearing claim on the page. Confirm the exact credit wording you
want before the site is indexed.
