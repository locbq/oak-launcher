#!/usr/bin/env python3
"""
Creates a mock Pokémon RPGXP game structure for testing Oak Launcher's
scanner, configuration generator, save manager, and launch pipelines.
"""

import os
import sys

def create_mock_game(base_dir="test-games/PokemonRebornDemo"):
    os.makedirs(os.path.join(base_dir, "Data"), exist_ok=True)
    os.makedirs(os.path.join(base_dir, "Graphics", "Characters"), exist_ok=True)
    os.makedirs(os.path.join(base_dir, "Graphics", "Titles"), exist_ok=True)
    os.makedirs(os.path.join(base_dir, "Audio", "BGM"), exist_ok=True)
    os.makedirs(os.path.join(base_dir, "Audio", "SE"), exist_ok=True)

    # Game.ini
    ini_content = """[Game]
Library=RGSS104E.dll
Scripts=Data\\Scripts.rxdata
Title=Pokémon Reborn (Oak Test Edition)
RTP1=
RTP2=
RTP3=
"""
    with open(os.path.join(base_dir, "Game.ini"), "w") as f:
        f.write(ini_content)

    # Dummy Scripts.rxdata (empty binary file for scanner validation)
    with open(os.path.join(base_dir, "Data", "Scripts.rxdata"), "wb") as f:
        f.write(b"\x04\x08o:\x0bObject\x00")

    # Sample Save file
    with open(os.path.join(base_dir, "Game.rxdata"), "wb") as f:
        f.write(b"POKEMON_REBORN_SAVE_DATA_DEMO_SLOT_1\x00\x00")

    print(f"Mock Pokémon RPGXP game created at: {os.path.abspath(base_dir)}")

if __name__ == "__main__":
    out = sys.argv[1] if len(sys.argv) > 1 else "test-games/PokemonRebornDemo"
    create_mock_game(out)
