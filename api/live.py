"""Vercel serverless function: GET /api/live -> real-time 3D status SVG.

Fetches the free APIs on every request, falls back to the last committed values
(assets/readme/live-data.json) for anything that fails, and embeds a ticking
SMIL clock so the image keeps moving after it loads. Not cacheable on purpose.
"""
import importlib.util, json, os
from datetime import datetime
from http.server import BaseHTTPRequestHandler

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
spec = importlib.util.spec_from_file_location('live_status', os.path.join(ROOT, 'scripts', 'live-status.py'))
live = importlib.util.module_from_spec(spec)
spec.loader.exec_module(live)


def build():
    try:
        data = json.load(open(os.path.join(ROOT, 'assets', 'readme', 'live-data.json')))
    except Exception:
        data = {}
    data.update(live.fetch_all(skip=('quote',)))  # daily quote: cached copy, refreshed by the Action
    return live.render(data, now=datetime.now(live.TZ), live=True)


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            body = build().encode()
            self.send_response(200)
        except Exception as e:  # never return a broken image
            body = f'<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="60"><text x="10" y="35" fill="#999">live status unavailable</text></svg>'.encode()
            self.send_response(200)
        self.send_header('Content-Type', 'image/svg+xml; charset=utf-8')
        self.send_header('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)
