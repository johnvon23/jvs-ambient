# What the site still needs

## New since the main-page refocus (2026-08-09)

The home page now leads with what John has already done: a curated releases
grid (Ambient Bass Guitar, the two Hassell records, Simplexity), a trimmed
timeline (LA underground, film, Hassell band, now), and an On Stage section
for promoters. The Two Records section is gone; the forthcoming albums live
only in the nav tabs.

- [ ] **Release cover art (4).** Drop source images anywhere in `assets/img/`
      for: Ambient Bass Guitar, Listening to Pictures, Seeing Through Sound,
      Extreme Measures. They get processed to `assets/web/img/cover-*.jpg`.
      Amber `[ cover ]` slots mark them on the page.
- [ ] **Simplexity role credit.** The card reads `[ role credit ]`. What
      should it say: bass and production? co-founder?
- [ ] **LA underground details.** `[ aliases, nights, releases to name ]` in
      the timeline. Or keep it general.
- [ ] **Film work.** WALL-E (sound design and effects, Thomas Newman's score)
      is on the page from John's published bios; confirm wording. Other
      soundtrack credits marked `[ other soundtrack work ]`.
- [ ] **Upcoming live release.** A commented slot is reserved in the releases
      grid; add the card when it is announced.
- [ ] **On Stage copy.** Written to pitch promoters (solo sets now, Fourth
      World live coming). John should confirm the framing.
- [ ] **Routines to keep the site current** (John's ask): not built yet.
      Candidate: a periodic check that compares working-self/board state
      against the site's status pills and drafts updates.

Bracketed amber text on the page marks placeholders visually, so nothing fake
can ship by accident.

## Words

- [ ] **PRS recording date** and **format** (digital only, or vinyl too).
- [ ] **Track titles.** The set list section was removed until real titles
      exist; it can return to the PRS section when they do.
- [ ] **Video titles.** The tiles currently say "Portal III", "Portal VI",
      "Walking", and the hero tile says "Wanderers", taken from the source
      filenames. Confirm or rename.
- [ ] **Fourth World copy.** The two paragraphs are written from studio notes
      and one line of John's own framing ("everything is going into this one").
      John should read the three story paragraphs and make them his own words.
- [ ] **Demo player on the PRS page** is a labeled placeholder slot.

## Links

- [ ] **Contact address.** Search `REPLACE@EXAMPLE.COM` in all three pages.
- [x] **Listen link.** Now points at johnvon.bandcamp.com. The PRS demo link
      is still open.
- [ ] **Footer profiles:** Bandcamp done (johnvon.bandcamp.com); Instagram
      and YouTube still `#`. Any others (Spotify, SoundCloud)?
- [ ] **Hassell record links.** The two Hassell release cards are unlinked;
      add Bandcamp/label URLs if John wants them clickable.

## Assets in use

Everything on the page comes from `assets/web/` (committed, web-weight).
The source files in `assets/img/` and `assets/video/` are gitignored and stay
on this machine only.

| On the page | Source |
|---|---|
| Hero background | abstractbassguitarstrings.JPG |
| Hero video tile | wanderers_square.mov |
| PRS section background | jvsplayingcomputerliveatPRSending.JPG |
| PRS cover | ambientbassguitar.jpg |
| Fourth World background | jvstraversingdesertseenfromabove.jpeg |
| Fourth World cover | afourthworldisstillpossible.tiff |
| Visions tiles | Portal III, Portal VI, jvswalkingindesert (CSS grayscale) |
| Lineage figure | jvsplayingbassguitarinfrontofscreenliveatPRS.JPG |

Unused so far: evocationi.mp4 (reads as nearly black at web size), the color
studio shots (EXIF-rotated, casual), greek waterfront, desert x installation,
foggy palm street, desert mountains at dusk, Trona pinnacles (processed to
web/img/pinnacles.jpg, available), taking shasta mountain, garden wall,
pensive in desert.

## Facts to double check before this goes public

- The Hassell credits read "recorded and produced" for *Seeing Through Sound*
  (2020) and *Listening to Pictures* (2018), plus band membership through the
  2010s and the final concert, London 2015. Confirm exact wording before the
  site is indexed.
- Simplexity facts on the page (Extreme Measures, 2010, with John Beasley,
  Steve Tavaglione, Gary Novak, Walt Fowler) come from Discogs/press; John
  confirms.
- WALL-E credit wording comes from John's published bios; John confirms.
