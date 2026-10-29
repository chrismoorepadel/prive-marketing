import json, re
from smooth import smooth_path
from fontTools.svgLib.path import parse_path
from fontTools.pens.boundsPen import BoundsPen
def bb(d):
    bp=BoundsPen(None); parse_path(d,bp); return bp.bounds
HI=dict(step=1.0,span=6,corner_deg=48,sigma=4.0,tol=0.8,line_tol=2.5)
LO=dict(step=1.5,span=14,corner_deg=50,sigma=12.0,tol=1.0,line_tol=6.0)
# 1. PRIVÉ
WP=json.load(open('src/wordmark-prive.json')); WP['paths']=[smooth_path(d,**HI) for d in WP['paths']]
json.dump(WP,open('src/wordmark-prive-smooth.json','w')); print('prive done')
# 2. one-line: A D L are the low-res ones (x ranges from the reference layout, k=1000/47)
WO=json.load(open('src/wordmark-oneline-exact.json')); k=1000/47; lo_ranges=[(393*k,436*k),(461*k,504*k),(589*k,623*k)]
# paths were shifted by -x0 of the whole; recover offset: smallest path x = 21*k originally
x0=min(bb(d)[0] for d in WO['paths']); off=21*k-x0
out=[]
for d in WO['paths']:
    b=bb(d); cx=(b[0]+b[2])/2+off
    lo=any(r0-40<=cx<=r1+40 for r0,r1 in lo_ranges)
    out.append(smooth_path(d,**(LO if lo else HI)))
WO['paths']=out; json.dump(WO,open('src/wordmark-oneline-smooth.json','w')); print('oneline done')
# 3. monogram glyph (source pixel ~0.46 units)
P=json.load(open('src/monogram-parts.json'))
ds=re.findall(r'd="([^"]+)"',P['glyph'])
GL=dict(step=0.8,span=6,corner_deg=48,sigma=2.5,tol=0.6,line_tol=2.0)
P['glyph']=''.join(f'<path d="{smooth_path(d,**GL)}"/>' for d in ds)
json.dump(P,open('src/monogram-parts-smooth.json','w')); print('glyph done')
