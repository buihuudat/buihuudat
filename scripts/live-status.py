#!/usr/bin/env python3
"""Fetch live data from free, key-less APIs and render assets/readme/live-3d.svg.

APIs: Open-Meteo (weather), GitHub REST (stats), Hacker News (tech pulse), ZenQuotes (quote).
Each source is optional: on failure the last good value from live-data.json is reused,
and if nothing could be refreshed the SVG is left untouched.

usage: python3 scripts/live-status.py [out_dir=assets/readme] [github_user=buihuudat]
"""
import html, importlib.util, json, os, sys, urllib.request
from datetime import datetime, timezone
from zoneinfo import ZoneInfo

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, '..', 'assets', 'readme')
USER = sys.argv[2] if len(sys.argv) > 2 else 'buihuudat'
LAT, LON, CITY = 10.8231, 106.6297, 'HO CHI MINH CITY'
TZ = ZoneInfo('Asia/Ho_Chi_Minh')

spec = importlib.util.spec_from_file_location('gen3d', os.path.join(HERE, 'gen-readme-3d.py'))
g = importlib.util.module_from_spec(spec); spec.loader.exec_module(g)

FALLBACK_QUOTES = [
    ('Make it work, make it right, make it fast.', 'Kent Beck'),
    ('Simplicity is prerequisite for reliability.', 'Edsger W. Dijkstra'),
    ('First, solve the problem. Then, write the code.', 'John Johnson'),
]


def get(url, headers=None, timeout=15):
    req = urllib.request.Request(url, headers={'User-Agent': 'buihuudat-live-status', **(headers or {})})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read().decode())


def fetch_all():
    data = {}
    try:
        w = get(f'https://api.open-meteo.com/v1/forecast?latitude={LAT}&longitude={LON}'
                '&current=temperature_2m,weather_code,is_day,wind_speed_10m&timezone=Asia%2FHo_Chi_Minh')['current']
        data['weather'] = {'temp': round(w['temperature_2m']), 'code': w['weather_code'],
                           'day': bool(w['is_day']), 'wind': round(w['wind_speed_10m'])}
    except Exception as e:
        print('weather failed:', e)

    gh_headers = {'Accept': 'application/vnd.github+json'}
    if os.environ.get('GITHUB_TOKEN'):
        gh_headers['Authorization'] = 'Bearer ' + os.environ['GITHUB_TOKEN']
    try:
        u = get(f'https://api.github.com/users/{USER}', gh_headers)
        repos = get(f'https://api.github.com/users/{USER}/repos?per_page=100&sort=pushed', gh_headers)
        own = [r for r in repos if not r['fork']]
        last = max(repos, key=lambda r: r['pushed_at'])
        data['github'] = {'stars': sum(r['stargazers_count'] for r in own), 'repos': u['public_repos'],
                          'followers': u['followers'], 'last_repo': last['name'],
                          'last_push': last['pushed_at'], 'last_lang': last.get('language') or ''}
    except Exception as e:
        print('github failed:', e)

    try:
        ids = get('https://hacker-news.firebaseio.com/v0/topstories.json')[:5]
        for i in ids:
            it = get(f'https://hacker-news.firebaseio.com/v0/item/{i}.json')
            if it and it.get('title'):
                data['hn'] = {'title': it['title'], 'score': it.get('score', 0), 'comments': it.get('descendants', 0)}
                break
    except Exception as e:
        print('hn failed:', e)

    try:
        q = get('https://zenquotes.io/api/today')[0]
        if q.get('q') and 'Too many requests' not in q['q']:
            data['quote'] = {'text': q['q'], 'author': q['a']}
    except Exception as e:
        print('quote failed:', e)
    return data


def ago(iso):
    d = datetime.now(timezone.utc) - datetime.fromisoformat(iso.replace('Z', '+00:00'))
    m = int(d.total_seconds() // 60)
    if m < 60: return f'{max(m,1)}m ago'
    if m < 60 * 48: return f'{m//60}h ago'
    return f'{m//1440}d ago'


def wrap(text, width, lines):
    out, cur = [], ''
    for w in text.split():
        if len(cur) + len(w) + 1 > width and cur:
            out.append(cur); cur = w
        else:
            cur = (cur + ' ' + w).strip()
    out.append(cur)
    if len(out) > lines:
        out = out[:lines]; out[-1] = out[-1][:max(0, width - 1)].rstrip() + '…'
    return out


def esc(s): return html.escape(str(s), quote=True)


def weather_desc(code):
    if code <= 1: return 'Clear sky'
    if code == 2: return 'Partly cloudy'
    if code == 3: return 'Overcast'
    if code in (45, 48): return 'Foggy'
    if code < 60: return 'Drizzle'
    if code < 70: return 'Rain'
    if code < 80: return 'Snow'
    if code < 90: return 'Showers'
    return 'Thunderstorm'


def icon(code, day):
    if code <= 1 and day:
        rays = ''.join(f'<line x1="0" y1="-24" x2="0" y2="-31" transform="rotate({a})" stroke="#ffd166" stroke-width="3" stroke-linecap="round"/>' for a in range(0, 360, 45))
        return ('<g><circle r="22" fill="#ffd166" opacity=".25" filter="url(#blur6)"/><circle r="14" fill="#ffd166"/>'
                f'<g><animateTransform attributeName="transform" type="rotate" values="0;360" dur="24s" repeatCount="indefinite"/>{rays}</g></g>')
    if code <= 1:
        return ('<g><circle r="22" fill="#9db8ff" opacity=".22" filter="url(#blur6)"/>'
                '<path d="M6 -16 A17 17 0 1 0 17 8 A13 13 0 0 1 6 -16 Z" fill="#dbe7ff"/></g>')
    cloud = '<path d="M-22 10 a11 11 0 0 1 4 -21 a16 16 0 0 1 31 3 a10 10 0 0 1 -1 18 z" fill="#d4e2ff"/>'
    rain = ''
    if code >= 51:
        rain = ''.join(f'<line x1="{x}" y1="16" x2="{x-3}" y2="26" stroke="#6ea8ff" stroke-width="2.5" stroke-linecap="round">'
                       f'<animate attributeName="opacity" values="0;1;0" dur="1.1s" begin="{b}s" repeatCount="indefinite"/></line>'
                       for x, b in ((-10, 0), (0, .35), (10, .7)))
    return f'<g>{cloud}{rain}</g>'


def render(d):
    W, H, hy = 1200, 420, 322
    defs = [g.common_defs(W, H, hy)]
    defs.append('<linearGradient id="glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity=".16"/><stop offset="1" stop-color="#ffffff" stop-opacity=".03"/></linearGradient>')
    defs.append('<linearGradient id="rim" x1="0" x2="1"><stop offset="0" stop-color="#ffffff" stop-opacity="0"/><stop offset=".5" stop-color="#a5c8ff" stop-opacity=".9"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></linearGradient>')
    F = g.FONT
    now = datetime.now(TZ)
    b = [g.stars(W, hy, 60, seed=21), '<ellipse cx="600" cy="230" rx="580" ry="170" fill="url(#aura)" opacity=".8"/>',
         g.floor(W, H, hy, 600, n=7, spread=170)]

    b.append(f'<circle cx="52" cy="40" r="5" fill="#3ddc97"><animate attributeName="opacity" values="1;.25;1" dur="1.6s" repeatCount="indefinite"/></circle>')
    b.append(f'<text x="68" y="45" font-family="{F}" font-weight="800" font-size="15" letter-spacing="5" fill="#cfe2ff">LIVE STATUS</text>')
    stamp = f'UPDATED {now:%H:%M} ICT · {now:%d %b %Y}'.upper()
    b.append(f'<text x="1160" y="45" text-anchor="end" font-family="{F}" font-weight="600" font-size="13" letter-spacing="2" fill="#7db3ff">{stamp}</text>')

    cw, ch, cy0, gap = 265, 172, 70, 20
    xs = [40 + i * (cw + gap) for i in range(4)]

    def slab(i, content):
        x = xs[i]
        dur, bg = 5 + i * .4, i * 1.1
        parts = [f'<rect x="{x+9}" y="{cy0+10}" width="{cw}" height="{ch}" rx="16" fill="#040a26"/>',
                 f'<rect x="{x+5}" y="{cy0+6}" width="{cw}" height="{ch}" rx="16" fill="#0a1a5e"/>',
                 f'<rect x="{x+2}" y="{cy0+3}" width="{cw}" height="{ch}" rx="16" fill="#143185"/>',
                 f'<rect x="{x}" y="{cy0}" width="{cw}" height="{ch}" rx="16" fill="#0b1a55" fill-opacity=".92"/>',
                 f'<rect x="{x}" y="{cy0}" width="{cw}" height="{ch}" rx="16" fill="url(#glass)" stroke="#9fc2ff" stroke-opacity=".3"/>',
                 f'<rect x="{x+18}" y="{cy0+1}" width="{cw-36}" height="1.6" fill="url(#rim)"/>', content]
        b.append(g.floaty('\n'.join(parts), 5, dur, bg))

    def title(i, t): return f'<text x="{xs[i]+20}" y="{cy0+32}" font-family="{F}" font-weight="700" font-size="12" letter-spacing="3" fill="#7db3ff">{esc(t)}</text>'
    def big(i, t, size=46): return f'<text x="{xs[i]+20}" y="{cy0+92}" font-family="{F}" font-weight="800" font-size="{size}" fill="#fff">{t}</text>'
    def sub(i, t, row): return f'<text x="{xs[i]+20}" y="{cy0+122+row*24}" font-family="{F}" font-weight="500" font-size="14" fill="#b6ccff">{esc(t)}</text>'

    w = d.get('weather')
    if w:
        slab(0, title(0, CITY) + big(0, f'{w["temp"]}°<tspan font-size="22" fill="#9fc2ff"> C</tspan>') +
             sub(0, weather_desc(w['code']), 0) + sub(0, f'Wind {w["wind"]} km/h', 1) +
             f'<g transform="translate({xs[0]+cw-56} {cy0+68})">{icon(w["code"], w["day"])}</g>')
    else:
        slab(0, title(0, CITY) + sub(0, 'Weather unavailable', 0))

    h = d.get('github')
    if h:
        slab(1, title(1, 'GITHUB PULSE') + big(1, f'{h["stars"]}<tspan font-size="20" fill="#9fc2ff"> ★ stars</tspan>') +
             sub(1, f'{h["repos"]} repositories', 0) + sub(1, f'{h["followers"]} followers', 1))
        lang = f' · {h["last_lang"]}' if h['last_lang'] else ''
        slab(2, title(2, 'LATEST PUSH') + big(2, esc(ago(h['last_push'])), 42) +
             sub(2, h['last_repo'][:26], 0) + sub(2, (h['last_lang'] or 'repository'), 1))
    else:
        slab(1, title(1, 'GITHUB PULSE') + sub(1, 'GitHub unavailable', 0))
        slab(2, title(2, 'LATEST PUSH') + sub(2, '—', 0))

    n = d.get('hn')
    if n:
        lines = wrap(n['title'], 24, 3)
        t = ''.join(f'<text x="{xs[3]+20}" y="{cy0+62+k*24}" font-family="{F}" font-weight="700" font-size="17" fill="#fff">{esc(s)}</text>' for k, s in enumerate(lines))
        slab(3, title(3, 'TECH PULSE · HN') + t + sub(3, f'▲ {n["score"]} · {n["comments"]} comments', 1) .replace(f'y="{cy0+146}"', f'y="{cy0+152}"'))
    else:
        slab(3, title(3, 'TECH PULSE · HN') + sub(3, 'Hacker News unavailable', 0))

    q = d.get('quote') or {}
    text, author = q.get('text'), q.get('author')
    if not text:
        text, author = FALLBACK_QUOTES[now.timetuple().tm_yday % len(FALLBACK_QUOTES)]
    qy = 270
    ql = wrap(text, 96, 2)
    qb = [f'<rect x="49" y="{qy+10}" width="1120" height="92" rx="18" fill="#040a26"/>',
          f'<rect x="45" y="{qy+6}" width="1120" height="92" rx="18" fill="#0a1a5e"/>',
          f'<rect x="40" y="{qy}" width="1120" height="92" rx="18" fill="#0b1a55" fill-opacity=".92"/>',
          f'<rect x="40" y="{qy}" width="1120" height="92" rx="18" fill="url(#glass)" stroke="#9fc2ff" stroke-opacity=".3"/>',
          f'<text x="64" y="{qy+78}" font-family="Georgia,serif" font-size="84" fill="#5aa2ff" fill-opacity=".35">“</text>']
    for k, s in enumerate(ql):
        qb.append(f'<text x="128" y="{qy+38+k*26}" font-family="{F}" font-style="italic" font-weight="500" font-size="19" fill="#e6efff">{esc(s)}</text>')
    qb.append(f'<text x="1140" y="{qy+80}" text-anchor="end" font-family="{F}" font-weight="700" font-size="13" letter-spacing="2" fill="#7db3ff">— {esc(author or "").upper()}</text>')
    b.append(g.floaty('\n'.join(qb), 4, 6.5, 2))
    return g.wrap(W, H, ''.join(defs), '\n'.join(b), 'Live status: weather, GitHub stats, latest push, Hacker News and a daily quote')


def main():
    os.makedirs(OUT, exist_ok=True)
    cache_path = os.path.join(OUT, 'live-data.json')
    try: cache = json.load(open(cache_path))
    except Exception: cache = {}
    fresh = fetch_all()
    if not fresh:
        print('no source reachable; leaving files untouched'); return
    cache.update(fresh)
    open(cache_path, 'w').write(json.dumps(cache, indent=2, ensure_ascii=False) + '\n')
    open(os.path.join(OUT, 'live-3d.svg'), 'w').write(render(cache))
    print('ok:', ', '.join(sorted(fresh)))


if __name__ == '__main__':
    main()
