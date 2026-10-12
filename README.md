# 🌿 Oak Launcher

**High-Performance, Native macOS Pokémon RPGXP Fan Game Player**  
Built with **Tauri v2**, **Rust**, **React**, **TypeScript**, and **mkxp-z**.

---

## ⚡ Overview

Traditional Pokémon RPG Maker XP fan games (such as *Pokémon Reborn*, *Pokémon Infinite Fusion*, *Pokémon Uranium*, *Pokémon Insurgence*) traditionally rely on Windows or heavy emulation layers like Wine, Wineskin, or CrossOver on macOS.

**Oak Launcher** provides a completely **native macOS experience**:
- **Zero Wine / Wineskin**: Runs directly on macOS via a native C++ runtime.
- **Zero Rosetta 2 requirement**: Native Apple Silicon (`arm64`) execution with Metal ANGLE hardware acceleration and ultra-low memory footprint.
- **Automated Save File Protection**: Timestamped save backups are created automatically prior to every launch session.
- **In-Place Game Library**: References your games where they live on disk without duplicating gigabytes of asset files.
- **Visual Controls & Remapping**: Rebind keyboard and gamepad inputs per game with automatic SDL2 controller mapping for Xbox, PlayStation, and Switch controllers.

---

## 🏗️ Architecture

```
pkmn-fan-games-launcher/
├── src-tauri/                  # Tauri v2 Desktop & Rust Backend
│   ├── src/
│   │   ├── lib.rs              # Tauri IPC commands & application lifecycle
│   │   ├── main.rs             # Application entrypoint
│   │   ├── models.rs           # Data structures (GameEntry, GameConfig, SaveBackup)
│   │   └── services/
│   │       ├── config.rs       # Dynamic mkxp.json configuration synthesizer
│   │       ├── launcher.rs     # Process runner & execution monitor
│   │       ├── library.rs      # Library persistence & game scanner
│   │       └── save.rs         # Automated backup & restore engine
│   ├── binaries/               # Tauri sidecar binaries (mkxp-z-aarch64-apple-darwin)
│   └── tauri.conf.json         # Tauri v2 desktop window & permissions configuration
│
├── src/                        # Modern Dark Gaming Frontend (React + TypeScript + Tailwind)
│   ├── api/index.ts            # Tauri IPC bridge & preview mode adapter
│   ├── components/
│   │   ├── Header.tsx          # Branding, process status, and navigation
│   │   ├── GameCard.tsx        # Library card with artwork & quick-play overlay
│   │   ├── GameLibrary.tsx     # Game grid, search, and sorting
│   │   ├── GameDetailModal.tsx # Engine settings, save manager, and controls remap
│   │   ├── ImportGameModal.tsx # Native folder import with live validation
│   │   └── RebornGuideModal.tsx# Step-by-step Pokémon Reborn macOS guide
│   ├── types/index.ts          # TypeScript type definitions
│   └── App.tsx                 # Core application state
│
├── runtime/
│   └── mkxp-z/                 # Native mkxp-z runtime engine (statically linked arm64)
│       ├── mkxp-z.aarch64      # Mach-O executable with Metal ANGLE support
│       ├── scripts/preload/    # Win32API and RGSS compatibility shims
│       └── stdlib/             # Ruby standard library
│
└── scripts/
    ├── fetch-runtime.sh        # Automated GitHub artifact fetcher
    ├── build-mkxp-z.sh         # Standalone build script from mkxp-z source
    └── create-test-game.py     # Test suite generator for local verification
```

---

## 🚀 Getting Started

### Prerequisites
- macOS 12+ (Apple Silicon or Intel)
- [Node.js](https://nodejs.org/) (v18+)
- [Rust & Cargo](https://rustup.rs/) (v1.75+)
- Xcode Command Line Tools (`xcode-select --install`)

### 1. Installation
Clone the repository and install frontend dependencies:
```bash
git clone https://github.com/your-username/pkmn-fan-games-launcher.git
cd pkmn-fan-games-launcher
npm install
```

### 2. Runtime Engine Setup
Oak Launcher uses a hybrid runtime integration. You can obtain the native macOS `mkxp-z` engine in two ways:

#### Option A: Automatic Fetch (Recommended)
Downloads and prepares the verified native macOS arm64 mkxp-z runtime:
```bash
bash scripts/fetch-runtime.sh
```

#### Option B: Compile from Source
To compile `mkxp-z` directly on your machine with Xcode and Homebrew:
```bash
bash scripts/build-mkxp-z.sh
```

---

## 🎮 Running the Application

### Development Mode
Launch Oak Launcher with hot-reloading:
```bash
npm run tauri dev
```

### Web UI Preview Mode
To preview and test the UI layout directly in a browser:
```bash
npm run dev
```

### Production Build
Build a production `.app` and `.dmg` installer for macOS:
```bash
npm run tauri build
```

---

## 🧪 Testing & Verification

### Running Automated Backend Tests
Unit tests verify game scanning, `mkxp.json` generation, and save backup/restore functionality:
```bash
cd src-tauri
cargo test
```

### Running Frontend Typecheck & Build
```bash
npm run build
```

### Verifying with a Test Game
You can generate a test Pokémon RPGXP game structure using the built-in script:
```bash
python3 scripts/create-test-game.py
```
Then import `test-games/PokemonRebornDemo` into Oak Launcher to test library management, pre-launch save backups, and engine initialization.

---

## 🌟 Playing Pokémon Reborn on macOS

1. Download **Pokémon Reborn Episode 19.16** from the [official Reborn Evolved website](https://www.rebornevo.com/pr/index.html/).
2. Extract the archive into your preferred folder (e.g. `~/Games/Pokemon Reborn`).
3. In **Oak Launcher**, click **"Add Game"**, select the extracted folder, and click **Import**.
4. Click **"Launch Game"** to play immediately at native Apple Silicon speeds!

---

## 📜 Licensing

- **Oak Launcher**: MIT License.
- **mkxp-z**: GPLv2+ (see `runtime/mkxp-z/LICENSE.txt`).
- **Pokémon**: Pokémon and Pokémon character names are trademarks of Nintendo, Creatures Inc., and Game Freak. Oak Launcher is an open-source, independent game runner and does not redistribute copyrighted game assets.
