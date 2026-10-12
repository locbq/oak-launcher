# Project: Native macOS Pokémon RPGXP Fangame Player

Build a high-performance, native macOS application that can run Pokémon RPG Maker XP fan games.

## Technology stack

- Rust for the application backend and game management
- Tauri + React + TypeScript for the launcher interface
- C++ mkxp-z for the RPG Maker-compatible game runtime
- Native macOS builds, supporting both Apple Silicon and Intel where feasible
- Reuse existing Ruby/RGSS compatibility functionality

## Strict requirements

- No Wine or Wineskin
- No Windows virtual machines or emulators
- Do not require Rosetta 2 for Apple Silicon builds
- Run games directly on macOS
- Prioritize performance, compatibility, and low memory usage
- Support multiple Pokémon RPGXP fan games

## Phase 1: Proof of concept

1. Investigate the current mkxp-z repository, its macOS build requirements, licensing, and compatibility.
2. Create a new Git repository for the project.
3. Build or integrate a native macOS mkxp-z runtime.
4. Implement a minimal game launcher that accepts a local RPG Maker XP game directory.
5. Launch a compatible game using its existing game assets.
6. Test graphics, audio, keyboard input, and game saves.
7. Document setup instructions and known compatibility limitations.

## Phase 2: Application

Build a Tauri + React launcher with a game library, game imports, per-game configuration, controller support, and save management.

## Development instructions

Start with Phase 1. Inspect existing projects before implementing anything. Reuse proven open-source components rather than rewriting the engine.

Do not claim game compatibility without testing. If no test game is available, build everything possible and document the exact steps required to verify gameplay.

Keep all game data local and do not redistribute copyrighted Pokémon fangame assets.

**Target platform:** macOS.
