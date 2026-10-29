import re,io,json,resvg_py,numpy as np,vtracer
from PIL import Image, ImageFilter, ImageDraw
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.recordingPen import RecordingPen
from fontTools.svgLib.path import parse_path
def rec_from_d(d,tf=(1,0,0,1,0,0)):
    rp=RecordingPen(); parse_path(d,TransformPen(rp,tf)); return rp
def bounds(rp):
    bp=BoundsPen(None); rp.replay(bp); return bp.bounds
def to_svg(rp,tf=(1,0,0,1,0,0)):
    sp=SVGPathPen(None); rp.replay(TransformPen(sp,tf)); return re.sub(r'(\d+\.\d{2})\d+',r'\1',sp.getCommands())
def stem(rp,frac=0.5):
    b=bounds(rp); w,h=b[2]-b[0],b[3]-b[1]
    svg=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}"><path fill="#000" d="{to_svg(rp,(1,0,0,1,-b[0],-b[1]))}"/></svg>'
    png=resvg_py.svg_to_bytes(svg_string=svg,width=int(w),height=int(h)); a=np.array(Image.open(io.BytesIO(bytes(png))).convert('RGBA'))[...,3]>128
    row=a[int(h*frac)]; runs=[];x=0
    while x<len(row):
        if row[x]:
            x0=x
            while x<len(row) and row[x]: x+=1
            runs.append(x-x0)
        else: x+=1
    return runs
im=Image.open('src/ref-oneline.jpg').convert('L')
seg={'A':(393,436),'D':(461,504),'L':(589,623)}
colP=np.array(im)[:,21:57]<120; prow=np.where(colP.any(axis=1))[0]; cap_top,base=prow.min(),prow.max()+1; cap=base-cap_top
UP=16
def trace(x0,x1,thr,blur):
    crop=im.crop((x0-5,cap_top-6,x1+5,base+6)).resize(((x1-x0+10)*UP,(cap+12)*UP),Image.BICUBIC).filter(ImageFilter.GaussianBlur(blur))
    bw=crop.point(lambda v:0 if v<thr else 255).convert('RGB'); bw.save('src/tmp_letter.png')
    vtracer.convert_image_to_svg_py('src/tmp_letter.png','src/tmp_letter.svg',colormode='binary',hierarchical='stacked',mode='spline',filter_speckle=40,corner_threshold=80,length_threshold=10.0,max_iterations=16,splice_threshold=70,path_precision=2)
    s=open('src/tmp_letter.svg').read(); tags=re.findall(r'<path d="([^"]+)"[^>]*transform="translate\(([-\d.]+),([-\d.]+)\)"',s)
    rp=RecordingPen()
    for d,tx,ty in tags:
        r=rec_from_d(d,(1,0,0,1,float(tx),float(ty))); b=bounds(r)
        if b[0]<=1 and b[1]<=1: continue
        r.replay(rp)
    b=bounds(rp); s_=1000/(b[3]-b[1])
    return rec_from_d(to_svg(rp,(s_,0,0,s_,-b[0]*s_,-b[3]*s_)))
# tune threshold so the D stem (left stroke at mid height) ~131 units
res={}
for thr in [120,140,160,180,200,215]:
    d=trace(*seg['D'],thr,3.0); runs=stem(d); print('thr',thr,'D runs at mid',runs)
    res[thr]=runs[0] if runs else None
best=min((t for t in res if res[t]),key=lambda t:abs(res[t]-131)); print('chosen thr',best)
exact={k:trace(*v,best,3.0) for k,v in seg.items()}
json.dump({k:to_svg(v) for k,v in exact.items()},open('src/exact-adl.json','w'))
# compose with exact letters using the same layout as build_oneline2
WO=json.load(open('src/wordmark-oneline.json'))
exec(open('build_oneline2.py').read().split('# reference layout')[0].split("target=stem")[0])  # defines hi{}
seg_all=[(21,57),(78,117),(144,154),(176,221),(243,277),(335,371),(393,436),(461,504),(530,564),(589,623)]
names=['P','R','I','V','E','P2','A','D','E2','L']; k=1000/47
el=[]
for nm,(x0,x1) in zip(names,seg_all):
    b_=nm.rstrip('2'); r=exact[b_] if b_ in exact else hi[b_]; b=bounds(r); x=x0*k
    el.append(rec_from_d(to_svg(r,(1,0,0,1,x-b[0],0))))
    if nm=='E':
        ab=bounds(hi['acute']); cx=x+(b[2]-b[0])/2+45; el.append(rec_from_d(to_svg(hi['acute'],(1,0,0,1,cx-(ab[0]+ab[2])/2,0))))
allb=[bounds(r) for r in el]; x0=min(b[0] for b in allb); y0=min(b[1] for b in allb); x1=max(b[2] for b in allb); y1=max(b[3] for b in allb)
paths=[to_svg(r,(1,0,0,1,-x0,-y0)) for r in el]
json.dump({'paths':paths,'width':x1-x0,'height':y1-y0},open('src/wordmark-oneline-exact.json','w'))
svg=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {x1-x0:.1f} {y1-y0:.1f}"><g fill="#0F1B22">'+''.join(f'<path d="{d}"/>' for d in paths)+'</g></svg>'
open('src/wordmark-oneline-exact.svg','w').write(svg)
def rend(svg,w): png=resvg_py.svg_to_bytes(svg_string=svg,width=w); im_=Image.open(io.BytesIO(bytes(png))).convert('RGBA'); bg=Image.new('RGB',im_.size,(245,240,232)); bg.paste(im_,mask=im_.split()[3]); return bg
ref=Image.open('src/ref-oneline.jpg').convert('RGB'); ref=ref.resize((2400,int(ref.height*2400/634)),Image.BICUBIC)
A=rend(svg,2400); B=rend(open('src/wordmark-oneline.svg').read(),2400)
# zoom crops of PADEL in both
za=rend(svg,7200).crop((3700,0,7200,1100)); zb=rend(open('src/wordmark-oneline.svg').read(),7200).crop((3700,0,7200,1100))
za=za.resize((2400,int(za.height*2400/za.width))); zb=zb.resize((2400,int(zb.height*2400/zb.width)))
rows=[('REFERENCE',ref),('A: exact trace of A D L from your image',A),('B: traced P R I V É E + weight-matched A D L',B),('A zoomed',za),('B zoomed',zb)]
H=sum(i.height+60 for _,i in rows); sheet=Image.new('RGB',(2400,H),(245,240,232)); d=ImageDraw.Draw(sheet); y=0
for lab,i in rows: d.text((16,y+6),lab,fill=(100,90,80)); sheet.paste(i,(0,y+30)); y+=i.height+60
sheet.save('src/preview/padel-exact-vs-fitted.png'); print('ok',sheet.size)
