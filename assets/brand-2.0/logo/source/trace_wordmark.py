from PIL import Image, ImageFilter
import numpy as np, vtracer, re, json
from fontTools.svgLib.path import parse_path
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.recordingPen import RecordingPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen

im=Image.open('src/ref-stacked.webp').convert('RGBA'); bg=Image.new('RGBA',im.size,(255,255,255,255))
g=Image.alpha_composite(bg,im).convert('L'); a=np.array(g)
# band rows for PRIVÉ incl. accent: measured earlier 1376..1712, cols 105..1484
y0,y1,x0,x1=1360,1730,80,1510
crop=g.crop((x0,y0,x1,y1))
UP=4
big=crop.resize((crop.width*UP,crop.height*UP),Image.BICUBIC).filter(ImageFilter.GaussianBlur(2.2))
bw=big.point(lambda v:0 if v<150 else 255).convert('RGB'); bw.save('src/wordmark-bw.png')
vtracer.convert_image_to_svg_py('src/wordmark-bw.png','src/wordmark-trace.svg',colormode='binary',hierarchical='stacked',mode='spline',filter_speckle=16,corner_threshold=70,length_threshold=6.0,max_iterations=14,splice_threshold=60,path_precision=2)
s=open('src/wordmark-trace.svg').read()
tags=re.findall(r'<path d="([^"]+)"[^>]*transform="translate\(([-\d.]+),([-\d.]+)\)"',s)
recs=[]
for d,tx,ty in tags:
    rp=RecordingPen(); parse_path(d,TransformPen(rp,(1,0,0,1,float(tx),float(ty)))); bp=BoundsPen(None); rp.replay(bp); recs.append((rp,bp.bounds))
print('paths',len(recs))
# drop the background path (touches 0,0) 
recs=[(r,b) for r,b in recs if not (b[0]<=1 and b[1]<=1)]
for r,b in recs: print([round(v) for v in b])
# letters: tall paths; accent: short path above
H=max(b[3] for r,b in recs); top_letters=min(b[1] for r,b in recs if (b[3]-b[1])>0.5*(H-min(bb[1] for rr,bb in recs)))
cap=H-top_letters; print('cap px',cap)
# normalise: cap height -> 1000, baseline y=0 (y negative up), left at 0
S=1000/cap; L=min(b[0] for r,b in recs)
out=[]
for r,b in recs:
    sp=SVGPathPen(None); r.replay(TransformPen(sp,(S,0,0,S,-L*S,-H*S))); out.append(re.sub(r'(\d+\.\d{2})\d+',r'\1',sp.getCommands()))
W=(max(b[2] for r,b in recs)-L)*S
json.dump({'paths':out,'cap':1000,'width':W},open('src/wordmark-prive.json','w'))
print('normalised width',W,'per cap',W/1000)
svg=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -1300 {W:.1f} 1320"><g fill="#0F1B22">'+''.join(f'<path d="{d}"/>' for d in out)+'</g></svg>'
open('src/wordmark-prive.svg','w').write(svg)
