# What the site still needs

## New since the main-page refocus (2026-08-09)

The home page now leads with what John has already done: a curated releases
grid (Ambient Bass Guitar, the two Hassell records, Simplexity), a trimmed
timeline (LA underground, film, Hassell band, now), and an On Stage section
for promoters. The Two Records section is gone; the forthcoming albums live
only in the nav tabs.

- [x] **Release cover art (4).** Pulled from Bandcamp and the album pages,
      processed to `assets/web/img/cover-*.jpg`.
- [x] **Simplexity role credit.** "Recorded, produced, electronics and beats."
- [x] **LA underground details.** Performed as Electro Tech Services and
      under his own name. NOTE: spelling of "Electro Tech Services" came from
      a voice transcript; confirm before launch.
- [x] **Film work.** "Numerous films, including Thomas Newman's
      Oscar-nominated score for Pixar's WALL-E." No other titles named, per
      John.
- [ ] **YouTube track links.** The two Hassell cards and Extreme Measures
      need the track links John picks (he supplies; do not choose for him).
- [ ] **Upcoming live release.** A Hassell live record on Ndeya; details on
      hold until it is announced (John has them). The timeline mentions it
      generically. A commented slot is reserved in the releases grid.
- [ ] **Social URLs.** Footer icons (Bandcamp, Instagram, YouTube) are in;
      Bandcamp is live, the other two point at `#` until John supplies his
      socials.
- [ ] **Routines to keep the site current** (John's ask): not built yet.
      Candidate: a periodic check that compares working-self/board state
      against the site's status pills and drafts updates.
- [ ] **Press quotes.** A press strip was considered and skipped: only one
      independent quotable source found (Bass Magazine). Revisit when
      Live at the PRS or the live record draws reviews.
- [ ] **New timeline facts to confirm** (from John's published bios): New
      School scholarship, Gary Peacock / Reggie Workman, M.A.
      ethnomusicology UC Riverside, Native Instruments training Herbie
      Hancock and Steve Vai. The Tokyo (1991-94), Hong Kong (1995-2001),
      and Digital Cut-Up Lounge eras were added 2026-08-09 in John's own
      words. Still deliberately omitted: Futureproof Music School (school
      brand kept off the artist page; John's call to add).

Bracketed accent-color text on the page marks placeholders visually, so nothing fake
can ship by accident.

## Words

- [ ] **PRS recording date** and **format** (digital only, or vinyl too).
- [ ] **Track titles.** The set list section was removed until real titles
      exist; it can return to the PRS section when they do.
- [ ] **Video titles.** The tiles currently say "Portal III", "Portal VI",
      "Walking", and the hero tile also uses "Portal VI", taken from the source
      filenames. Confirm or rename.
- [ ] **Fourth World copy.** Rewritten 2026-08-10 around Jon's handwritten
      definition (now on the page, photographed on the wall of his house):
      "vision" not "method", music described as ideas from across Jon's
      career moved forward with today's technology. John should still read
      the story paragraphs and make them his own words.
- [x] **Demo player on the PRS page.** Live, playing the original
      Antechamber of the Mind master (copied as-is, 2026-08-10; the
      192kbps transcode is gone, per John: never re-encode).
- [x] **Fourth World demos.** Two players: "Kujutu" then "Tinaja"
      (`assets/web/audio/kujutu.mp3`, `tinaja.mp3`, original masters
      copied as-is). NOTE: John typed the first title as "Kajutu" once;
      the filename and his earlier message both say **Kujutu**, which is
      what shipped. Confirm the spelling before launch.

## Mailing list

The signup form is live in the contact section of all three pages, wired
to Buttondown (newsletter `johnvon23`, wired 2026-08-10). To move the
list to a different host, run:

```
./scripts/set-signup-endpoint.sh 'https://<new-host>/<path>'
```

- [x] **Buttondown account and endpoint.** Wired and verified: the real
      username reaches Buttondown's subscribe flow, a bogus one 404s. The
      wording lives in `copy/_shared.md` under `signup.*`.
- [ ] **One human test.** An automated POST hits Buttondown's bot
      verification, which an agent will not complete, so the last step is
      John's: submit his own address in a browser, finish the
      verification, and confirm the subscriber appears. Nothing else is
      blocking.
- [ ] **Newsletter name.** Still Buttondown's default, "My Awesome
      Newsletter". It shows on the verification page a subscriber sees,
      so rename it in Buttondown's settings before the site launches.
- [ ] **Where else to ask.** The form is only in the contact section. A
      second placement (after the demo player, say) is worth testing once
      the list is real and there are numbers to compare.

No subscriber data touches this repo: the form posts straight to
Buttondown and there is no backend here.

## Links

- [x] **Contact address.** johnvon23@gmail.com, wired on all three pages.
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
| Hero video tile | Portal VI-edit.mp4 |
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
