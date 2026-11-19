import random, math, sys
FONT = "'Segoe UI','SF Pro Display','Helvetica Neue',Arial,sans-serif"

def hx(c): c=c.lstrip('#'); return [int(c[i:i+2],16) for i in (0,2,4)]
def to(c): return '#%02x%02x%02x' % tuple(max(0,min(255,round(v))) for v in c)
def shade(c,f): return to([v*f for v in hx(c)])
def mix(a,b,t): return to([x+(y-x)*t for x,y in zip(hx(a),hx(b))])

uid=[0]
def nid(p): uid[0]+=1; return f"{p}{uid[0]}"

def anim_float(amp, dur, begin):
    return (f'<animateTransform attributeName="transform" type="translate" values="0 0;0 {-amp};0 0" keyTimes="0;.5;1" '
            f'calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1" dur="{dur}s" begin="{-begin}s" repeatCount="indefinite"/>')

def box(cx, cy, a, b, h, base, defs, label=None, fs=18, tcolor='#fff', glow=True):
    """isometric box, (cx,cy) = centre of the top face"""
    g1, g2, g3 = nid('t'), nid('l'), nid('r')
    top, left, right = mix(base,'#ffffff',.28), shade(base,.72), shade(base,.48)
    defs.append(f'<linearGradient id="{g1}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="{mix(base,"#ffffff",.5)}"/><stop offset="1" stop-color="{base}"/></linearGradient>')
    defs.append(f'<linearGradient id="{g2}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{left}"/><stop offset="1" stop-color="{shade(base,.5)}"/></linearGradient>')
    defs.append(f'<linearGradient id="{g3}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{right}"/><stop offset="1" stop-color="{shade(base,.3)}"/></linearGradient>')
    P=lambda pts:' '.join(f'{x:.1f},{y:.1f}' for x,y in pts)
    s=[]
    s.append(f'<polygon points="{P([(cx-a,cy),(cx,cy+b),(cx,cy+b+h),(cx-a,cy+h)])}" fill="url(#{g2})"/>')
    s.append(f'<polygon points="{P([(cx,cy+b),(cx+a,cy),(cx+a,cy+h),(cx,cy+b+h)])}" fill="url(#{g3})"/>')
    s.append(f'<polygon points="{P([(cx,cy-b),(cx+a,cy),(cx,cy+b),(cx-a,cy)])}" fill="url(#{g1})"/>')
    # edge highlights
    s.append(f'<polyline points="{P([(cx-a,cy+h),(cx-a,cy),(cx,cy-b),(cx+a,cy),(cx+a,cy+h)])}" fill="none" stroke="#fff" stroke-opacity=".38" stroke-width="1" stroke-linejoin="round"/>')
    s.append(f'<polyline points="{P([(cx-a,cy),(cx,cy+b),(cx+a,cy)])}" fill="none" stroke="#fff" stroke-opacity=".22" stroke-width="1"/>')
    s.append(f'<line x1="{cx}" y1="{cy+b}" x2="{cx}" y2="{cy+b+h}" stroke="#fff" stroke-opacity=".3" stroke-width="1"/>')
    if label:
        k=math.hypot(a,b)/ (a/0.866) if a else 1
        s.append(f'<g transform="translate({cx} {cy}) matrix(0.866 -0.5 0.866 0.5 0 0) scale({k:.3f})"><text x="0" y="{fs*0.35:.1f}" text-anchor="middle" font-family="{FONT}" font-weight="800" font-size="{fs}" fill="{tcolor}">{label}</text></g>')
    return '\n'.join(s)

def cube(cx, cy, L, base, defs, **kw):
    return box(cx, cy, L*0.866, L*0.5, L, base, defs, **kw)

def floaty(inner, amp, dur, begin):
    return f'<g>{anim_float(amp,dur,begin)}{inner}</g>'

def shadow(cx, cy, rx, dur, begin):
    return (f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{rx*0.28:.1f}" fill="#000" opacity=".45" filter="url(#blur6)">'
            f'<animate attributeName="rx" values="{rx};{rx*0.78:.1f};{rx}" keyTimes="0;.5;1" dur="{dur}s" begin="{-begin}s" repeatCount="indefinite"/>'
            f'<animate attributeName="opacity" values=".45;.25;.45" keyTimes="0;.5;1" dur="{dur}s" begin="{-begin}s" repeatCount="indefinite"/></ellipse>')

def floor(W, H, hy, cx, n=9, spread=150, period=4):
    s=[]
    bottom=H-hy
    for k in range(-10,11):
        s.append(f'<line x1="{cx}" y1="{hy}" x2="{cx+k*spread}" y2="{H}" stroke="url(#gridFade)" stroke-width="1.1"/>')
    steps=14
    for i in range(n):
        ys=[];x1s=[];x2s=[];ops=[]
        for j in range(steps+1):
            t=j/steps
            y=hy+bottom*(t**2.1)
            hw=10*spread*(y-hy)/bottom
            ys.append(f'{y:.1f}');x1s.append(f'{cx-hw:.1f}');x2s.append(f'{cx+hw:.1f}')
            ops.append(f'{min(1,t*3)*(1-t**6)*.9:.2f}')
        b=-(period*i/n)
        a=lambda attr,vals:f'<animate attributeName="{attr}" values="{";".join(vals)}" dur="{period}s" begin="{b:.2f}s" repeatCount="indefinite"/>'
        s.append(f'<line x1="{x1s[0]}" x2="{x2s[0]}" y1="{ys[0]}" y2="{ys[0]}" stroke="#5aa2ff" stroke-width="1.3" opacity="0">'
                 + a('x1',x1s)+a('x2',x2s)+a('y1',ys)+a('y2',ys)+a('opacity',ops)+'</line>')
    s.append(f'<rect x="0" y="{hy-1}" width="{W}" height="2" fill="url(#horizon)"/>')
    return '\n'.join(s)

def stars(W, H, n, seed=7):
    r=random.Random(seed); s=[]
    for _ in range(n):
        x=r.uniform(8,W-8); y=r.uniform(8,H); rad=r.choice([.6,.8,1,1.3,1.7])
        d=r.uniform(2.5,6); b=r.uniform(0,6)
        s.append(f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{rad}" fill="#cfe0ff"><animate attributeName="opacity" values=".15;1;.15" dur="{d:.1f}s" begin="{-b:.1f}s" repeatCount="indefinite"/></circle>')
    return '\n'.join(s)

def common_defs(W,H,hy):
    return f'''
<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#01030f"/><stop offset=".55" stop-color="#071033"/><stop offset="1" stop-color="#0b2a8f"/></linearGradient>
<radialGradient id="aura" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#2f6bff" stop-opacity=".65"/><stop offset=".55" stop-color="#5b3dff" stop-opacity=".18"/><stop offset="1" stop-color="#2f6bff" stop-opacity="0"/></radialGradient>
<linearGradient id="gridFade" gradientUnits="userSpaceOnUse" x1="0" y1="{hy}" x2="0" y2="{H}"><stop offset="0" stop-color="#5aa2ff" stop-opacity="0"/><stop offset="1" stop-color="#5aa2ff" stop-opacity=".7"/></linearGradient>
<linearGradient id="horizon" x1="0" x2="1"><stop offset="0" stop-color="#5aa2ff" stop-opacity="0"/><stop offset=".5" stop-color="#a5c8ff" stop-opacity=".95"/><stop offset="1" stop-color="#5aa2ff" stop-opacity="0"/></linearGradient>
<filter id="blur6" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>
<filter id="blur14" x="-30%" y="-60%" width="160%" height="220%"><feGaussianBlur stdDeviation="14"/></filter>
<clipPath id="round"><rect width="{W}" height="{H}" rx="20"/></clipPath>'''

def wrap(W,H,defs,body,title):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" role="img" aria-label="{title}">\n'
            f'<title>{title}</title>\n<defs>{defs}</defs>\n<g clip-path="url(#round)">\n<rect width="{W}" height="{H}" fill="url(#bg)"/>\n{body}\n</g>\n'
            f'<rect x=".5" y=".5" width="{W-1}" height="{H-1}" rx="20" fill="none" stroke="#6ea8ff" stroke-opacity=".25"/>\n</svg>\n')

# ---------------- HERO ----------------
def hero():
    W,H,hy=1200,430,268
    d=[common_defs(W,H,hy)]
    d.append('<linearGradient id="face" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#cfe0ff"/><stop offset="1" stop-color="#7fa8ff"/></linearGradient>')
    d.append('<linearGradient id="shine" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>')
    d.append('<linearGradient id="sub" x1="0" x2="1"><stop offset="0" stop-color="#60a5fa" stop-opacity="0"/><stop offset=".5" stop-color="#93c5fd"/><stop offset="1" stop-color="#60a5fa" stop-opacity="0"/></linearGradient>')
    b=[]
    b.append(stars(W,hy,70))
    b.append(f'<ellipse cx="600" cy="205" rx="560" ry="190" fill="url(#aura)"/>')
    b.append(floor(W,H,hy,600))
    # cubes: (x,y,L,color,amp,dur,begin)
    cubes=[(112,150,50,'#3b82f6',14,6,0),(236,306,30,'#22d3ee',10,5,1.5),(64,330,24,'#8b5cf6',9,4.6,3),
           (1090,140,54,'#8b5cf6',15,6.4,2),(962,318,36,'#3b82f6',11,5.2,.8),(1142,318,24,'#22d3ee',9,4.4,2.6),
           (338,66,18,'#60a5fa',8,4.8,1),(868,60,20,'#a78bfa',8,5,3.4)]
    for x,y,L,c,amp,dur,bg in cubes:
        b.append(shadow(x, 392 if y>260 else 372, L*0.9, dur, bg))
        b.append(floaty(cube(x,y,L,c,d),amp,dur,bg))
    # extruded 3D headline
    T='HUU DAT'; tl=640; fs=158
    attrs=f'font-family="{FONT}" font-weight="900" font-size="{fs}" text-anchor="middle" textLength="{tl}" lengthAdjust="spacingAndGlyphs"'
    layers=[]
    N=22
    for i in range(N,0,-1):
        col=mix('#2a54d6','#050b24',(i-1)/(N-1))
        layers.append(f'<text x="{i*0.85:.2f}" y="{i*0.95:.2f}" {attrs} fill="{col}">{T}</text>')
    d.append(f'<clipPath id="txtclip"><text x="0" y="0" {attrs}>{T}</text></clipPath>')
    head=f'''<g transform="translate(600 238) skewX(-7)">
  <animateTransform attributeName="transform" type="translate" additive="sum" values="0 0;0 -7;0 0" keyTimes="0;.5;1" calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1" dur="6s" repeatCount="indefinite"/>
  <text x="26" y="34" {attrs} fill="#000" opacity=".55" filter="url(#blur14)">{T}</text>
  <text x="0" y="0" {attrs} fill="#3d7bff" opacity=".7" filter="url(#blur14)">{T}</text>
  {chr(10).join(layers)}
  <text x="0" y="0" {attrs} fill="url(#face)" stroke="#ffffff" stroke-width="1.2" stroke-opacity=".7" paint-order="stroke">{T}</text>
  <g clip-path="url(#txtclip)"><rect x="-420" y="-150" width="170" height="190" fill="url(#shine)" transform="skewX(14)"><animate attributeName="x" values="-420;420;420" keyTimes="0;.5;1" dur="7s" repeatCount="indefinite"/></rect></g>
</g>'''
    b.append(head)
    b.append('<rect x="170" y="318" width="150" height="1.5" fill="url(#sub)"/><rect x="880" y="318" width="150" height="1.5" fill="url(#sub)"/>')
    b.append(f'<text x="600" y="326" text-anchor="middle" font-family="{FONT}" font-weight="700" font-size="21" letter-spacing="6" fill="#cfe2ff" textLength="520" lengthAdjust="spacing">FRONTEND / FULL-STACK DEVELOPER</text>')
    b.append(f'<text x="600" y="362" text-anchor="middle" font-family="{FONT}" font-weight="600" font-size="14" fill="#7db3ff" textLength="470" lengthAdjust="spacing">REACT  ·  NEXT.JS  ·  TYPESCRIPT  ·  NODE.JS</text>')
    return wrap(W,H,''.join(d),'\n'.join(b),'Huu Dat — Frontend / Full-Stack Developer')

# ---------------- STACK ----------------
def stack():
    W,H=1200,300
    d=[common_defs(W,H,250)]
    items=[('React','#61DAFB',21,'#06222b'),('Next.js','#2b2f3a',17,'#fff'),('TypeScript','#3178C6',13,'#fff'),
           ('Node.js','#3FA34D',17,'#fff'),('Postgres','#4169E1',14,'#fff'),('Redis','#DC382D',20,'#fff')]
    b=[stars(W,H,40,seed=3)]
    b.append(f'<ellipse cx="600" cy="200" rx="560" ry="120" fill="url(#aura)" opacity=".7"/>')
    b.append(floor(W,H,250,600,n=6,spread=170))
    xs=[130,314,498,682,866,1050]
    for i,((name,col,fs,tc),x) in enumerate(zip(items,xs)):
        y=132 + (12 if i%2 else 0)
        dur=4.6+i*.35; bg=i*.9
        b.append(shadow(x, 238, 66, dur, bg))
        b.append(floaty(box(x,y,70,40,38,col,d,label=name,fs=fs,tcolor=tc),11,dur,bg))
    return wrap(W,H,''.join(d),'\n'.join(b),'Tech stack — React, Next.js, TypeScript, Node.js, PostgreSQL, Redis')

# ---------------- FOOTER ----------------
def footer():
    W,H=1200,170
    d=[common_defs(W,H,70)]
    b=[stars(W,70,30,seed=11), '<ellipse cx="600" cy="80" rx="560" ry="80" fill="url(#aura)" opacity=".8"/>', floor(W,H,70,600,n=6,spread=150)]
    for x,y,L,c,amp,dur,bg in [(220,92,26,'#3b82f6',7,5,0),(600,84,34,'#8b5cf6',9,6,1.6),(980,92,26,'#22d3ee',7,4.6,3)]:
        b.append(shadow(x,148,L*.9,dur,bg)); b.append(floaty(cube(x,y,L,c,d),amp,dur,bg))
    b.append(f'<text x="600" y="38" text-anchor="middle" font-family="{FONT}" font-weight="700" font-size="14" letter-spacing="5" fill="#93c5fd" textLength="380" lengthAdjust="spacing">BUILD · LEARN · IMPROVE · REPEAT</text>')
    return wrap(W,H,''.join(d),'\n'.join(b),'Build, learn, improve, repeat')

if __name__ == '__main__':
    OUT = sys.argv[1]
    for name,fn in [('hero-3d.svg',hero),('stack-3d.svg',stack),('footer-3d.svg',footer)]:
        open(f'{OUT}/{name}','w').write(fn())
    print('ok')
