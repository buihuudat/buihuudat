#!/usr/bin/env python3
"""Top languages by bytes across the owner's non-fork repos -> assets/readme/languages-3d.svg (3D bars).
usage: python3 scripts/languages-3d.py [out_dir=assets/readme] [user=buihuudat]   (GITHUB_TOKEN recommended)"""
import html, importlib.util, json, os, sys, urllib.request
from concurrent.futures import ThreadPoolExecutor

HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location('gen3d', os.path.join(HERE, 'gen-readme-3d.py'))
g = importlib.util.module_from_spec(spec); spec.loader.exec_module(g)

COLORS = {'JavaScript': '#f1e05a', 'TypeScript': '#3178c6', 'HTML': '#e34c26', 'CSS': '#7c5cff', 'C#': '#4cc34a', 'PHP': '#8892bf',
          'Python': '#3572a5', 'Java': '#e8a33d', 'Kotlin': '#a97bff', 'Dart': '#00b4ab', 'SCSS': '#c6538c', 'Shell': '#89e051'}


def get(url):
    h = {'User-Agent': 'buihuudat-langs', 'Accept': 'application/vnd.github+json'}
    if os.environ.get('GITHUB_TOKEN'): h['Authorization'] = 'Bearer ' + os.environ['GITHUB_TOKEN']
    with urllib.request.urlopen(urllib.request.Request(url, headers=h), timeout=15) as r:
        return json.loads(r.read().decode())


def collect(user):
    repos, page = [], 1
    while True:
        chunk = get(f'https://api.github.com/users/{user}/repos?per_page=100&page={page}&type=owner')
        repos += chunk
        if len(chunk) < 100: break
        page += 1
    own = [r['name'] for r in repos if not r['fork']]
    tot = {}
    def one(n):
        try: return get(f'https://api.github.com/repos/{user}/{n}/languages')
        except Exception: return {}
    with ThreadPoolExecutor(max_workers=8) as ex:
        for d in ex.map(one, own):
            for k, v in d.items(): tot[k] = tot.get(k, 0) + v
    return tot, len(own)


def render(tot, nrepos):
    W, H = 480, 343
    F = g.FONT
    defs = [g.common_defs(W, H, 300)]
    items = sorted(tot.items(), key=lambda kv: -kv[1])[:7]
    total = sum(tot.values()) or 1
    b = [g.stars(W, H, 22, seed=5),
         f'<text x="26" y="38" font-family="{F}" font-weight="800" font-size="13" letter-spacing="4" fill="#cfe2ff">TOP LANGUAGES</text>',
         f'<text x="454" y="38" text-anchor="end" font-family="{F}" font-weight="600" font-size="11" letter-spacing="2" fill="#7db3ff">{nrepos} REPOS</text>']
    top = max(v for _, v in items)
    for i, (name, val) in enumerate(items):
        y = 78 + i * 37
        col = COLORS.get(name) or '#' + format(abs(hash(name)) % 0xFFFFFF, '06x')
        w = max(10, 250 * val / top)
        gid = f'lb{i}'
        defs.append(f'<linearGradient id="{gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{g.mix(col, "#ffffff", .35)}"/><stop offset="1" stop-color="{g.shade(col, .75)}"/></linearGradient>')
        top_c, side_c = g.mix(col, '#ffffff', .55), g.shade(col, .5)
        d = 9
        bar = (f'<polygon points="0,0 {d},{-d*.7:.1f} {w+d:.1f},{-d*.7:.1f} {w:.1f},0" fill="{top_c}"/>'
               f'<polygon points="{w:.1f},0 {w+d:.1f},{-d*.7:.1f} {w+d:.1f},{16-d*.7:.1f} {w:.1f},16" fill="{side_c}"/>'
               f'<rect width="{w:.1f}" height="16" fill="url(#{gid})"/>'
               f'<rect width="{w:.1f}" height="1" fill="#fff" opacity=".45"/>')
        b.append(f'<text x="26" y="{y+13}" font-family="{F}" font-weight="700" font-size="13" fill="#e6efff">{html.escape(name)}</text>')
        b.append(f'<g transform="translate(130 {y})"><g>'
                 f'<animateTransform attributeName="transform" type="scale" values="0 1;1 1;1 1" keyTimes="0;.12;1" dur="{6+i*.3}s" begin="{i*.15:.2f}s" calcMode="spline" keySplines=".16 1 .3 1;0 0 1 1" repeatCount="indefinite"/>'
                 f'{bar}</g></g>')
        b.append(f'<text x="454" y="{y+13}" text-anchor="end" font-family="{F}" font-weight="700" font-size="13" fill="#9fc2ff">{100*val/total:.1f}%</text>')
    return g.wrap(W, H, ''.join(defs), '\n'.join(b), 'Top languages by bytes')


if __name__ == '__main__':
    out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, '..', 'assets', 'readme')
    user = sys.argv[2] if len(sys.argv) > 2 else 'buihuudat'
    tot, n = collect(user)
    if not tot: sys.exit('no language data; leaving file untouched')
    open(os.path.join(out, 'languages-3d.svg'), 'w').write(render(tot, n))
    print('ok', n, 'repos,', len(tot), 'languages')
