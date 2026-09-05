#!/usr/bin/env bash
#
# Removes every resource the study lab created.
#
#   ./teardown.sh              dry run, shows what would be deleted
#   ./teardown.sh --yes        actually delete
#   ./teardown.sh --yes --repo also delete the GitHub repo
#   ./teardown.sh --yes --token also revoke the Vercel API token
#
# Deleting a Vercel project also removes its deployments, aliases,
# environment variables, firewall config and analytics data. Stores,
# webhooks and Edge Configs live at team level and must go separately.

set -uo pipefail

TOKEN_FILE="${TOKEN_FILE:-$HOME/.vercel_study_token}"
TEAM_ID="${TEAM_ID:-team_2XwKa7nl6RY1cLlkVA6QBqrd}"
GH_OWNER="dayntan34"
GH_REPO="vercel-study-lab"

APPLY=0
DO_REPO=0
DO_TOKEN=0
for arg in "$@"; do
  case "$arg" in
    --yes) APPLY=1 ;;
    --repo) DO_REPO=1 ;;
    --token) DO_TOKEN=1 ;;
    *) echo "Unknown flag: $arg" >&2; exit 2 ;;
  esac
done

[ -f "$TOKEN_FILE" ] || { echo "No token at $TOKEN_FILE" >&2; exit 1; }
VT="$(cat "$TOKEN_FILE")"

api()  { curl -sS -H "Authorization: Bearer $VT" "https://api.vercel.com/$1"; }
code() { curl -sS -o /dev/null -w '%{http_code}' -X "$1" -H "Authorization: Bearer $VT" "https://api.vercel.com/$2"; }

if [ "$APPLY" -eq 0 ]; then
  echo "=== DRY RUN — nothing will be deleted. Re-run with --yes to apply. ==="
fi
echo

# These names are the only projects the lab created. Anything else in the
# team is left alone.
LAB_PROJECTS="next-lab static-lab vite-lab api-lab broken-lab"

echo "--- projects ---"
for name in $LAB_PROJECTS; do
  id="$(api "v9/projects/$name?teamId=$TEAM_ID" | jq -r '.id // empty')"
  if [ -z "$id" ]; then
    printf '  %-12s already gone\n' "$name"
    continue
  fi
  if [ "$APPLY" -eq 1 ]; then
    printf '  %-12s deleting… HTTP %s\n' "$name" "$(code DELETE "v9/projects/$id?teamId=$TEAM_ID")"
  else
    printf '  %-12s would delete (%s)\n' "$name" "$id"
  fi
done

echo
echo "--- webhooks ---"
api "v1/webhooks?teamId=$TEAM_ID" | jq -r '.[]? | "\(.id) \(.url)"' | while read -r id url; do
  [ -z "$id" ] && continue
  case "$url" in
    *study-lab*|*acme-415b1.vercel.app*)
      if [ "$APPLY" -eq 1 ]; then
        printf '  %-42s deleting… HTTP %s\n' "$id" "$(code DELETE "v1/webhooks/$id?teamId=$TEAM_ID")"
      else
        printf '  %-42s would delete (%s)\n' "$id" "$url"
      fi ;;
    *) printf '  %-42s SKIPPED, not a study-lab webhook\n' "$id" ;;
  esac
done

echo
echo "--- blob stores ---"
api "v1/storage/stores?teamId=$TEAM_ID" | jq -r '.stores[]? | select(.type=="blob") | "\(.id) \(.name)"' | while read -r id name; do
  [ -z "$id" ] && continue
  case "$name" in
    study-lab*)
      if [ "$APPLY" -eq 1 ]; then
        # Endpoint shape has moved around; try the typed route then the generic one.
        s="$(code DELETE "v1/storage/stores/blob/$id?teamId=$TEAM_ID")"
        [ "$s" = "200" ] || [ "$s" = "204" ] || s="$(code DELETE "v1/storage/stores/$id?teamId=$TEAM_ID")"
        printf '  %-28s deleting… HTTP %s\n' "$name" "$s"
      else
        printf '  %-28s would delete (%s)\n' "$name" "$id"
      fi ;;
    *) printf '  %-28s SKIPPED, not a study-lab store\n' "$name" ;;
  esac
done

echo
echo "--- edge configs ---"
api "v1/edge-config?teamId=$TEAM_ID" | jq -r '.[]? | "\(.id) \(.slug)"' | while read -r id slug; do
  [ -z "$id" ] && continue
  case "$slug" in
    study-lab*)
      if [ "$APPLY" -eq 1 ]; then
        printf '  %-28s deleting… HTTP %s\n' "$slug" "$(code DELETE "v1/edge-config/$id?teamId=$TEAM_ID")"
      else
        printf '  %-28s would delete (%s)\n' "$slug" "$id"
      fi ;;
    *) printf '  %-28s SKIPPED, not a study-lab config\n' "$slug" ;;
  esac
done

if [ "$DO_REPO" -eq 1 ]; then
  echo
  echo "--- github repo ---"
  if [ "$APPLY" -eq 1 ]; then
    if gh repo delete "$GH_OWNER/$GH_REPO" --yes 2>/dev/null; then
      echo "  deleted $GH_OWNER/$GH_REPO"
    else
      echo "  FAILED. The $GH_OWNER token needs the delete_repo scope:"
      echo "    gh auth refresh -h github.com -u $GH_OWNER -s delete_repo"
      echo "  or delete it in the browser:"
      echo "    https://github.com/$GH_OWNER/$GH_REPO/settings"
    fi
  else
    echo "  would delete $GH_OWNER/$GH_REPO"
  fi
fi

echo
echo "--- verification ---"
if [ "$APPLY" -eq 1 ]; then
  sleep 3
  printf '  projects remaining:     %s\n' "$(api "v9/projects?teamId=$TEAM_ID&limit=100" | jq '.projects|length')"
  printf '  deployments remaining:  %s\n' "$(api "v6/deployments?teamId=$TEAM_ID&limit=100" | jq '.deployments|length')"
  printf '  stores remaining:       %s\n' "$(api "v1/storage/stores?teamId=$TEAM_ID" | jq '.stores|length')"
  printf '  edge configs remaining: %s\n' "$(api "v1/edge-config?teamId=$TEAM_ID" | jq 'length')"
  printf '  webhooks remaining:     %s\n' "$(api "v1/webhooks?teamId=$TEAM_ID" | jq 'length')"
else
  echo "  (dry run, nothing changed)"
fi

if [ "$DO_TOKEN" -eq 1 ] && [ "$APPLY" -eq 1 ]; then
  echo
  echo "--- vercel api token ---"
  # Identify this token by its own id, then revoke it. This must run last,
  # because every call above depends on it.
  # The token issued for this lab is named "UI Design Learn". Fall back to the
  # sole token only when exactly one exists, so we never revoke an unrelated one.
  tokens="$(api "v5/user/tokens")"
  tid="$(echo "$tokens" | jq -r '.tokens[]? | select(.name=="UI Design Learn") | .id' | head -1)"
  if [ -z "$tid" ] && [ "$(echo "$tokens" | jq '.tokens|length')" = "1" ]; then
    tid="$(echo "$tokens" | jq -r '.tokens[0].id')"
  fi
  if [ -n "$tid" ]; then
    printf '  revoking %s … HTTP %s\n' "$tid" "$(code DELETE "v3/user/tokens/$tid")"
  else
    echo "  could not identify the token by name; revoke it here:"
    echo "    https://vercel.com/account/tokens"
  fi
  rm -f "$TOKEN_FILE" && echo "  removed $TOKEN_FILE"
fi

echo
if [ "$APPLY" -eq 1 ]; then
  echo "Teardown complete."
  echo "Local leftovers you may also want to remove:"
  echo "  rm -rf $(cd "$(dirname "$0")" && pwd)"
  echo "  rm -rf ~/Library/Caches/ms-playwright   # ~90 MB of Chromium"
  echo "  npm rm -g vercel"
else
  echo "Dry run finished. Re-run with --yes to delete."
fi
