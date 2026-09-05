#!/usr/bin/env bash
# Snapshots every study-lab resource currently live on Vercel into
# inventory.json, so teardown works from observed state rather than memory.
set -euo pipefail

TOKEN_FILE="${TOKEN_FILE:-$HOME/.vercel_study_token}"
TEAM_ID="${TEAM_ID:-team_2XwKa7nl6RY1cLlkVA6QBqrd}"
OUT="${1:-inventory.json}"

[ -f "$TOKEN_FILE" ] || { echo "No token at $TOKEN_FILE" >&2; exit 1; }
VT="$(cat "$TOKEN_FILE")"
api() { curl -sS -H "Authorization: Bearer $VT" "https://api.vercel.com/$1"; }

echo "Collecting inventory for team ${TEAM_ID}" >&2

projects="$(api "v9/projects?teamId=$TEAM_ID&limit=100" | jq '[.projects[] | {id, name, framework}]')"
deployments="$(api "v6/deployments?teamId=$TEAM_ID&limit=100" | jq '[.deployments[] | {uid, name, state, target, url}]')"
aliases="$(api "v4/aliases?teamId=$TEAM_ID&limit=100" | jq '[.aliases[] | {uid, alias, deploymentId: (.deployment.id // .deploymentId)}]')"
stores="$(api "v1/storage/stores?teamId=$TEAM_ID" | jq '[.stores[]? | {id: (.id // .store.id), type, name}]')"
edgeconfigs="$(api "v1/edge-config?teamId=$TEAM_ID" | jq '[.[]? | {id, slug}]')"
webhooks="$(api "v1/webhooks?teamId=$TEAM_ID" | jq '[.[]? | {id, url, events}]')"

# Firewall config is per project, so walk them.
firewall="$(
  echo "$projects" | jq -r '.[].id' | while read -r pid; do
    cfg="$(api "v1/security/firewall/config/active?projectId=$pid&teamId=$TEAM_ID")"
    if echo "$cfg" | jq -e '.rules? // empty' >/dev/null 2>&1; then
      echo "$cfg" | jq --arg pid "$pid" '{projectId:$pid, firewallEnabled, ruleCount:(.rules|length), ipCount:(.ips|length)}'
    fi
  done | jq -s '.'
)"

jq -n \
  --argjson projects "$projects" \
  --argjson deployments "$deployments" \
  --argjson aliases "$aliases" \
  --argjson stores "$stores" \
  --argjson edgeConfigs "$edgeconfigs" \
  --argjson webhooks "$webhooks" \
  --argjson firewall "$firewall" \
  --arg teamId "$TEAM_ID" \
  --arg capturedAt "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  '{capturedAt:$capturedAt, teamId:$teamId,
    counts:{projects:($projects|length), deployments:($deployments|length),
            aliases:($aliases|length), stores:($stores|length),
            edgeConfigs:($edgeConfigs|length), webhooks:($webhooks|length)},
    projects:$projects, deployments:$deployments, aliases:$aliases,
    stores:$stores, edgeConfigs:$edgeConfigs, webhooks:$webhooks,
    firewall:$firewall,
    github:{owner:"dayntan34", repo:"vercel-study-lab"}}' > "$OUT"

echo "Wrote $OUT" >&2
jq -c '.counts' "$OUT" >&2
