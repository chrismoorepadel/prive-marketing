import re, json
from fontTools.svgLib.path import parse_path
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.recordingPen import RecordingPen

s=open('src/monogram-trace.svg').read()
tags=re.findall(r'<path d="([^"]+)"[^>]*transform="translate\(([-\d.]+),([-\d.]+)\)"',s)

def baked(d,tx,ty,extra=(1,0,0,1,0,0)):
    rp=RecordingPen(); parse_path(d,TransformPen(rp,(1,0,0,1,tx,ty)))
    return rp
def bounds(rp):
    bp=BoundsPen(None); rp.replay(bp); return bp.bounds
def svg(rp,transform=None):
    sp=SVGPathPen(None)
    if transform: rp.replay(TransformPen(sp,transform))
    else: rp.replay(sp)
    return sp.getCommands()

paths=[baked(d,float(tx),float(ty)) for d,tx,ty in tags]
for i,p in enumerate(paths): print(i,[round(v) for v in bounds(p)])

# --- ring: split subpaths of path 0
ring=paths[0]
subs=[];cur=[]
for op,args in ring.value:
    if op=='moveTo' and cur: subs.append(cur); cur=[]
    cur.append((op,args))
subs.append(cur)
def sub_bounds(sub):
    rp=RecordingPen(); rp.value=sub; return bounds(rp)
sb=[sub_bounds(x) for x in subs]; print('ring subpaths',[[round(v) for v in b] for b in sb])
outer=max(sb,key=lambda b:(b[2]-b[0])); inner=min(sb,key=lambda b:(b[2]-b[0]))
cx=(outer[0]+outer[2])/2; cy=(outer[1]+outer[3])/2
orx=(outer[2]-outer[0])/2; ory=(outer[3]-outer[1])/2
irx=(inner[2]-inner[0])/2; iry=(inner[3]-inner[1])/2
icx=(inner[0]+inner[2])/2; icy=(inner[1]+inner[3])/2
print('outer',cx,cy,orx,ory,'inner center',icx,icy,irx,iry,'stroke x',orx-irx,'stroke y',ory-iry)
stroke=round(((orx-irx)+(ory-iry))/2,1)
irx=orx-stroke; iry=ory-stroke

# --- glyph parts: stem = tallest narrow; scrolls = others
rest=paths[1:]
stem=max(rest,key=lambda p:bounds(p)[3]-bounds(p)[1])
scrolls=[p for p in rest if p is not stem]
sbnd=bounds(stem); stem_cx=(sbnd[0]+sbnd[2])/2
print('stem bounds',[round(v) for v in sbnd],'stem cx',stem_cx,'ring cx',cx)
left=min(scrolls,key=lambda p:bounds(p)[0]); right=[p for p in scrolls if p is not left][0]
lb=bounds(left); rb=bounds(right)
print('left',[round(v) for v in lb],'right',[round(v) for v in rb])
print('left mirrored would span', round(2*stem_cx-lb[2]), round(2*stem_cx-lb[0]), 'vs right', round(rb[0]), round(rb[2]))

# --- normalise: centre on ring centre, scale so outer ring height = 1000
S=1000/(2*ory)
def T(dx=0,sx=1): return (sx*S,0,0,S,(-cx*sx+dx)*S+500*(orx/ory),-cy*S+500)
# viewBox 0 0 W 1000 with W=2*orx*S
W=2*orx*S
# glyph: use stem + left scroll + mirrored left scroll (exact symmetry about stem centre)
gx=stem_cx
mirror=(-S,0,0,S,gx*S+W/2,-cy*S+500)  # x' = (2gx - x) mapped
normal=(S,0,0,S,-gx*S+W/2,-cy*S+500)
d_stem=svg(stem,normal); d_left=svg(left,normal); d_right=svg(left,mirror)
ring_svg=(f'<path fill-rule="evenodd" d="M{W/2:.2f} 0 a{orx*S:.2f} {500:.2f} 0 1 0 0.001 0 Z M{W/2:.2f} {stroke*S:.2f} a{irx*S:.2f} {iry*S:.2f} 0 1 0 0.001 0 Z"/>')
# simpler ring using two ellipses with evenodd via a single path:
ring_svg=(f'<path fill-rule="evenodd" d="M{W/2-orx*S:.2f},500 a{orx*S:.3f},{500:.3f} 0 1,0 {2*orx*S:.3f},0 a{orx*S:.3f},{500:.3f} 0 1,0 {-2*orx*S:.3f},0 Z '
          f'M{W/2-irx*S:.2f},500 a{irx*S:.3f},{iry*S:.3f} 0 1,0 {2*irx*S:.3f},0 a{irx*S:.3f},{iry*S:.3f} 0 1,0 {-2*irx*S:.3f},0 Z"/>')
def rnd(d): return re.sub(r'(\d+\.\d{2})\d+',r'\1',d)
glyph_svg=f'<path d="{rnd(d_stem)}"/><path d="{rnd(d_left)}"/><path d="{rnd(d_right)}"/>'
meta={'W':round(W,3),'H':1000,'stroke':round(stroke*S,3),'ring':ring_svg,'glyph':glyph_svg}
json.dump(meta,open('src/monogram-parts.json','w'))
master=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W:.3f} 1000"><g fill="#0F1B22">{ring_svg}{glyph_svg}</g></svg>'
open('src/monogram-master.svg','w').write(master)
print('W',W,'stroke',stroke*S,'size',len(master))
