"""
Offline tiles downloader for a small area.
Default: Sultanahmet, Istanbul (~30 streets around Hagia Sophia).
Change the bounding box below for any other area.

Usage:
    pip install requests
    python download_tiles.py

Output:
    ./tiles/{z}/{x}/{y}.png
"""

import os
import math
import time
import requests

MIN_LAT = 41.0020
MAX_LAT = 41.0130
MIN_LON = 28.9700
MAX_LON = 28.9850

MIN_ZOOM = 16
MAX_ZOOM = 18

OUTPUT_DIR = "tiles"
TILE_SERVER = "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
USER_AGENT = "StudentSheltersApp/1.0 (educational-project)"
SLEEP_BETWEEN_REQUESTS = 1.0


def deg2num(lat_deg, lon_deg, zoom):
    lat_rad = math.radians(lat_deg)
    n = 2.0 ** zoom
    xtile = int((lon_deg + 180.0) / 360.0 * n)
    ytile = int((1.0 - math.asinh(math.tan(lat_rad)) / math.pi) / 2.0 * n)
    return xtile, ytile


def download_tile(z, x, y):
    folder = os.path.join(OUTPUT_DIR, str(z), str(x))
    os.makedirs(folder, exist_ok=True)
    filepath = os.path.join(folder, f"{y}.png")
    if os.path.exists(filepath):
        return True
    url = TILE_SERVER.format(z=z, x=x, y=y)
    try:
        r = requests.get(url, headers={"User-Agent": USER_AGENT}, timeout=15)
        if r.status_code == 200:
            with open(filepath, "wb") as f:
                f.write(r.content)
            return True
        print(f"  [!] {r.status_code} for {url}")
        return False
    except Exception as e:
        print(f"  [!] Error: {e}")
        return False


def main():
    total = 0
    for z in range(MIN_ZOOM, MAX_ZOOM + 1):
        x_min, y_max = deg2num(MIN_LAT, MIN_LON, z)
        x_max, y_min = deg2num(MAX_LAT, MAX_LON, z)
        count = (x_max - x_min + 1) * (y_max - y_min + 1)
        total += count
        print(f"Zoom {z}: x[{x_min}..{x_max}] y[{y_min}..{y_max}] = {count} tiles")
    print(f"Total tiles to download: {total}")
    print(f"Estimated time: {total * SLEEP_BETWEEN_REQUESTS / 60:.1f} minutes\n")

    done = 0
    for z in range(MIN_ZOOM, MAX_ZOOM + 1):
        x_min, y_max = deg2num(MIN_LAT, MIN_LON, z)
        x_max, y_min = deg2num(MAX_LAT, MAX_LON, z)
        for x in range(x_min, x_max + 1):
            for y in range(y_min, y_max + 1):
                if download_tile(z, x, y):
                    done += 1
                    print(f"[{done}/{total}] z={z} x={x} y={y}")
                time.sleep(SLEEP_BETWEEN_REQUESTS)
    print(f"\nDone. Saved {done}/{total} tiles to '{OUTPUT_DIR}/'")


if __name__ == "__main__":
    main()
