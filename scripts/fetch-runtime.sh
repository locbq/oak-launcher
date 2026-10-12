#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
RUNTIME_DIR="${ROOT_DIR}/runtime"
BINARIES_DIR="${ROOT_DIR}/src-tauri/binaries"

mkdir -p "${RUNTIME_DIR}"
mkdir -p "${BINARIES_DIR}"

echo "==> Fetching mkxp-z macOS arm64 runtime..."

if [ -f "${RUNTIME_DIR}/mkxp-z/mkxp-z.aarch64" ]; then
    echo "==> Native mkxp-z binary already exists at ${RUNTIME_DIR}/mkxp-z/mkxp-z.aarch64"
else
    if command -v gh >/dev/null 2>&1; then
        echo "==> Finding latest successful macOS build on mkxp-z/mkxp-z..."
        RUN_ID=$(gh run list --repo mkxp-z/mkxp-z --status success --limit 1 --json databaseId -q '.[0].databaseId')
        echo "==> Found workflow run: ${RUN_ID}"
        
        ARTIFACT_ID=$(gh api "/repos/mkxp-z/mkxp-z/actions/runs/${RUN_ID}/artifacts" --jq '.artifacts[] | select(.name | test("macos.arm64.standalone")) | .id')
        
        if [ -n "${ARTIFACT_ID}" ]; then
            echo "==> Downloading artifact ID: ${ARTIFACT_ID}"
            gh api "/repos/mkxp-z/mkxp-z/actions/artifacts/${ARTIFACT_ID}/zip" > "${RUNTIME_DIR}/mkxp-z-arm64.zip"
            unzip -q -o "${RUNTIME_DIR}/mkxp-z-arm64.zip" -d "${RUNTIME_DIR}/mkxp-z"
            echo "==> Successfully downloaded and unpacked mkxp-z"
        else
            echo "Error: Could not locate macos.arm64.standalone artifact."
            exit 1
        fi
    else
        echo "Error: gh CLI is required to download continuous build artifacts."
        echo "Please install gh: brew install gh && gh auth login"
        exit 1
    fi
fi

# Copy to Tauri sidecar location
cp "${RUNTIME_DIR}/mkxp-z/mkxp-z.aarch64" "${BINARIES_DIR}/mkxp-z-aarch64-apple-darwin"
chmod +x "${BINARIES_DIR}/mkxp-z-aarch64-apple-darwin"
echo "==> Tauri sidecar configured at ${BINARIES_DIR}/mkxp-z-aarch64-apple-darwin"
