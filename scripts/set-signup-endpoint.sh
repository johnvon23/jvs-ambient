#!/usr/bin/env bash
#
# Point the mailing-list form at a real endpoint.
#
# The signup form lives in the contact section of all three pages, so the
# URL appears three times. This rewrites all of them at once, and it is
# idempotent: run it again with a different URL to move the list to a
# different host.
#
#   ./scripts/set-signup-endpoint.sh 'https://buttondown.com/api/emails/embed-subscribe/<name>'
#   ./scripts/set-signup-endpoint.sh --show    # what is wired up now
#
# Copy the URL out of the list host's own embed snippet rather than
# typing it from memory; the path has changed before.
#
# Until a real URL is set the form carries SIGNUP_ENDPOINT_NOT_SET, and
# site.js disables it so a half-built form cannot swallow an address.
#
set -euo pipefail
cd "$(dirname "$0")/.."

PAGES=(index.html prs.html fourth-world.html)
PLACEHOLDER=SIGNUP_ENDPOINT_NOT_SET

show() {
  echo "signup endpoint currently in the pages:"
  grep -h -A1 '<form class="signup' "${PAGES[@]}" \
    | grep -o 'action="[^"]*"' | sort -u | sed 's/^/  /'
}

if [ $# -eq 0 ]; then
  show; echo; echo "usage: $0 '<form-post-url>'"; exit 1
fi
if [ "$1" = "--show" ]; then
  show; exit 0
fi

export SIGNUP_URL=$1

# https only, and nothing that would break out of the HTML attribute or
# smuggle in markup. A bad URL here would ship on every page.
case "$SIGNUP_URL" in
  https://*) ;;
  *) echo "refusing: the endpoint must be an https:// URL (got: $SIGNUP_URL)" >&2; exit 1 ;;
esac
case "$SIGNUP_URL" in
  *'"'*|*"'"*|*'<'*|*'>'*|*' '*|*'&'*)
    echo "refusing: the URL contains a character that is unsafe in an HTML attribute" >&2
    exit 1 ;;
esac

for page in "${PAGES[@]}"; do
  # only the action on the signup form; every other action and href on
  # the page is left alone. $ENV{} keeps the URL out of the regex, so
  # dots and slashes in it are never treated as syntax.
  perl -0pi -e 's{(<form class="signup[^>]*?\baction=")[^"]*(")}{$1$ENV{SIGNUP_URL}$2}gs' "$page"
  echo "  $page"
done

echo
if grep -q "$PLACEHOLDER" "${PAGES[@]}"; then
  echo "FAILED: $PLACEHOLDER is still in the pages; nothing was wired." >&2
  exit 1
fi
show
echo
echo "Now test it: submit a real address and confirm it lands in the list host."
