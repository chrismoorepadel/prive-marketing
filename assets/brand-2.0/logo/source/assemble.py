import json, re, os, subprocess
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.recordingPen import RecordingPen, DecomposingRecordingPen
from fontTools.svgLib.path import parse_path

parts=json.load(open('src/monogram-parts.json'))
WP=json.load(open('src/wordmark-prive.json'))
def prive_rec(cap):
    rp=RecordingPen()
    for d in WP['paths']: parse_path(d,TransformPen(rp,(cap/1000,0,0,cap/1000,0,0)))
    return rp
MW,MH=parts['W'],parts['H']
FONTS={'bodoni':TTFont('fonts-dl/BodoniModa-450-opsz11.ttf'),'jost':TTFont('fonts-dl/Jost-300.ttf')}
def cap_ratio(font):
    f=FONTS[font]; gs=f.getGlyphSet(); bp=BoundsPen(gs); gs[f.getBestCmap()[ord('H')]].draw(bp); return bp.bounds[3]/f['head'].unitsPerEm
CAP_B=cap_ratio('bodoni'); CAP_J=cap_ratio('jost'); print('cap ratios',CAP_B,CAP_J)

def text_rec(font,text,fs,tracking):
    f=FONTS[font]; cmap=f.getBestCmap(); gs=f.getGlyphSet(); hmtx=f['hmtx']; upm=f['head'].unitsPerEm
    sc=fs/upm; x=0; rp=DecomposingRecordingPen(gs)
    for ch in text:
        g=cmap[ord(ch)]
        gs[g].draw(TransformPen(rp,(sc,0,0,-sc,x,0)))
        x+=hmtx[g][0]*sc+tracking*fs
    return rp
def rec_bounds(rp):
    bp=BoundsPen(None); rp.replay(bp); return bp.bounds
def rec_svg(rp,dx,dy):
    sp=SVGPathPen(None); rp.replay(TransformPen(sp,(1,0,0,1,dx,dy))); return re.sub(r'(\d+\.\d{2})\d+',r'\1',sp.getCommands())
def path_rec(d,dx=0,dy=0):
    rp=RecordingPen(); parse_path(d,TransformPen(rp,(1,0,0,1,dx,dy))); return rp

def rec_from_d(d):
    rp=RecordingPen(); parse_path(d,rp); return rp

def monogram(dx,dy,scale=1.0):
    """returns list of (RecordingPen) for ring+glyph placed with top-left at dx,dy"""
    recs=[]
    for d in re.findall(r'd="([^"]+)"',parts['ring']+parts['glyph']):
        rp=RecordingPen(); parse_path(d,TransformPen(rp,(scale,0,0,scale,dx,dy))); recs.append(rp)
    return recs

def compose(elements):
    """elements: list of (rec, fillrule). returns svg string with tight viewBox"""
    allb=[rec_bounds(r) for r,_ in elements]
    x0=min(b[0] for b in allb); y0=min(b[1] for b in allb); x1=max(b[2] for b in allb); y1=max(b[3] for b in allb)
    paths=[]
    for r,fr in elements:
        d=rec_svg(r,-x0,-y0)
        fr_attr=' fill-rule="evenodd"' if fr else ''
        paths.append(f'<path{fr_attr} d="{d}"/>')
    return (x1-x0,y1-y0,''.join(paths))

# ---------- layouts (icon height = 1000 units) ----------
def primary():
    el=[(r, i==0) for i,r in enumerate(monogram(-MW/2,0))]
    cap_p=216; prive=prive_rec(cap_p)
    pb=rec_bounds(prive); base_p=1000+196+cap_p
    el.append((path_rec(rec_svg(prive,-(pb[0]+pb[2])/2,base_p)),False))
    cap_d=72; fs_d=cap_d/CAP_J; padel=text_rec('jost','PADEL',fs_d,0.8)
    db=rec_bounds(padel); base_d=base_p+84+cap_d
    el.append((path_rec(rec_svg(padel,-(db[0]+db[2])/2,base_d)),False))
    return el
def horizontal():
    el=[(r, i==0) for i,r in enumerate(monogram(0,0))]
    cap_p=360; prive=prive_rec(cap_p); pb=rec_bounds(prive)
    cap_d=120; fs_d=cap_d/CAP_J; padel=text_rec('jost','PADEL',fs_d,0.8); db=rec_bounds(padel)
    gap=140; block=cap_p+gap+cap_d; top=(1000-block)/2
    x_text=MW+230
    base_p=top+cap_p; el.append((path_rec(rec_svg(prive,x_text-pb[0],base_p)),False))
    pcx=x_text+(pb[2]-pb[0])/2; base_d=base_p+gap+cap_d
    el.append((path_rec(rec_svg(padel,pcx-(db[0]+db[2])/2,base_d)),False))
    return el
def icon():
    return [(r, i==0) for i,r in enumerate(monogram(0,0))]
def wordmark_line():
    WO=json.load(open('src/wordmark-oneline-exact.json'))
    return [(rec_from_d(d),False) for d in WO['paths']]
def wordmark_stacked():
    prive=prive_rec(1000); pb=rec_bounds(prive); el=[(prive,False)]
    cap_d=72/216*1000; fs_d=cap_d/CAP_J; padel=text_rec('jost','PADEL',fs_d,0.8); db=rec_bounds(padel)
    base_d=84/216*1000+cap_d
    el.append((path_rec(rec_svg(padel,(pb[0]+pb[2])/2-(db[0]+db[2])/2,base_d)),False))
    return el

LAYOUTS={'primary':primary,'horizontal':horizontal,'icon':icon,'wordmark':wordmark_line,'wordmark-stacked':wordmark_stacked}
COLORS={'ink':'#0F1B22','cream':'#F5F0E8','black':'#000000','white':'#FFFFFF'}
os.makedirs('out/svg',exist_ok=True); os.makedirs('out/pdf',exist_ok=True); os.makedirs('out/png',exist_ok=True)
manifest=[]
for name,fn in LAYOUTS.items():
    w,h,body=compose(fn())
    for cname,hexv in COLORS.items():
        fn_base=f'prive-padel_{name}_{cname}'
        svg=(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.2f} {h:.2f}" width="{w:.2f}" height="{h:.2f}">'
             f'<title>Privé Padel · {name} · {cname}</title><g fill="{hexv}">{body}</g></svg>')
        open(f'out/svg/{fn_base}.svg','w').write(svg)
        manifest.append((name,cname,round(w),round(h),len(svg)))
for m in manifest: print(m)
json.dump(manifest,open('out/manifest.json','w'))
