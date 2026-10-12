#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
BUILD_DIR="${ROOT_DIR}/runtime/source-build"

echo "==============================================="
echo "   Oak Launcher: mkxp-z Native macOS Builder   "
echo "==============================================="

if ! command -v brew >/dev/null 2>&1; then
    echo "Error: Homebrew is required to install build dependencies."
    exit 1
fi

if ! command -v xcodebuild >/dev/null 2>&1; then
    echo "Error: Xcode or Xcode Command Line Tools are required."
    exit 1
fi

echo "==> Step 1: Checking and installing build dependencies..."
brew install meson ninja sdl2 sdl2_image sdl2_ttf openal-soft libsndfile libvorbis libogg physfs pixman ruby@3.2 || true

echo "==> Step 2: Cloning mkxp-z repository..."
mkdir -p "${BUILD_DIR}"
if [ ! -d "${BUILD_DIR}/mkxp-z/.git" ]; then
    git clone --recursive https://github.com/mkxp-z/mkxp-z.git "${BUILD_DIR}/mkxp-z"
else
    echo "Updating existing clone..."
    git -C "${BUILD_DIR}/mkxp-z" pull --recurse-submodules
fi

echo "==> Step 3: Preparing macOS build..."
cd "${BUILD_DIR}/mkxp-z"

if [ -f "macos/Dependencies/Brewfile" ]; then
    echo "Running brew bundle in macos/Dependencies..."
    brew bundle --file=macos/Dependencies/Brewfile || true
fi

if [ -f "macos/setup.command" ]; then
    echo "Running macos setup script..."
    bash macos/setup.command || true
fi

echo "==> Building universal/arm64 binary via Xcode..."
if [ -d "macos/mkxp-z.xcodeproj" ]; then
    xcodebuild -project macos/mkxp-z.xcodeproj -scheme mkxp-z -configuration Release build
    echo "Build finished! Binary output located in DerivedData/build/Release/"
else
    echo "Configuring Meson build..."
    meson setup build --buildtype=release -Dworkdir_bin=true || true
    ninja -C build
fi

echo "==> Build process completed."
