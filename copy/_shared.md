# Shared copy

Words that appear on every page: the nav bar, the footer, the skip link.
Edit a block below and run `node build.js` to push it to all three pages.

Syntax: `*italic*`, `**bold**`, `[link text](https://url)`, `{{ placeholder }}`
for a visible TODO marker, a trailing `\` for a line break, and `%% ... %%`
for a note to yourself that never reaches the page.

## skip.label
Skip to content

## brand.name
John von Seggern

## brand.sub
Ambient producer and performer

## nav.about
About

## nav.prs
Live at the PRS

## nav.fourthworld
Fourth World

## nav.cta
Get in touch

## foot.name
John von Seggern


%% ── mailing list ─ the signup form in the contact section of all three
   pages. The form posts straight to Buttondown; there is no backend
   here and no list stored in this repo. The endpoint is set in the HTML
   (see CONTENT.md), not here: this file is words only. %%

## signup.label
Hear about the next record

## signup.placeholder
you@example.com

## signup.button
Subscribe

## signup.note
A few emails a year, when there is a record or a show. Unsubscribe any time.
