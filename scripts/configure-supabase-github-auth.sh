#!/usr/bin/env bash
# Enables GitHub OAuth on your hosted Supabase project via Management API.
# You still must create a GitHub OAuth App once (callback = Supabase URL below).
#
# Usage:
#   export SUPABASE_ACCESS_TOKEN="sbp_..."   # https://supabase.com/dashboard/account/tokens
#   export PROJECT_REF="exsgywpbpslgxzbccbjh"
#   export GITHUB_CLIENT_ID="Iv1...."
#   export GITHUB_CLIENT_SECRET="...."
#   chmod +x scripts/configure-supabase-github-auth.sh
#   ./scripts/configure-supabase-github-auth.sh
#
# Docs: https://supabase.com/docs/guides/auth/social-login/auth-github

set -euo pipefail

: "${SUPABASE_ACCESS_TOKEN:?Set SUPABASE_ACCESS_TOKEN (Dashboard → Account → Access Tokens)}"
: "${PROJECT_REF:?Set PROJECT_REF (Settings → General → Reference ID)}"
: "${GITHUB_CLIENT_ID:?Set GITHUB_CLIENT_ID from GitHub OAuth App}"
: "${GITHUB_CLIENT_SECRET:?Set GITHUB_CLIENT_SECRET from GitHub OAuth App}"

BODY=$(python3 -c '
import json, os
print(json.dumps({
  "external_github_enabled": True,
  "external_github_client_id": os.environ["GITHUB_CLIENT_ID"],
  "external_github_secret": os.environ["GITHUB_CLIENT_SECRET"],
}))
')

echo "Patching auth config for project ${PROJECT_REF}..."

curl -sS -X PATCH "https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth" \
  -H "Authorization: Bearer ${SUPABASE_ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "${BODY}"

echo
echo
echo "Done. Check: Supabase → Authentication → Providers → GitHub should be enabled."
echo "GitHub OAuth App → Authorization callback URL:"
echo "  https://${PROJECT_REF}.supabase.co/auth/v1/callback"
