"""Corner-preserving outline smoother: flatten -> resample -> find corners -> gaussian smooth between corners -> Schneider bezier fit."""
import numpy as np, re, math
from fontTools.svgLib.path import parse_path
from fontTools.pens.recordingPen import RecordingPen

def flatten(d, step=1.0):
    rp=RecordingPen(); parse_path(d,rp)
    contours=[]; cur=[]; pt=None
    def bez(p0,p1,p2,p3,n):
        t=np.linspace(0,1,n+1)[1:,None]
        return (1-t)**3*p0+3*(1-t)**2*t*p1+3*(1-t)*t**2*p2+t**3*p3
    for op,args in rp.value:
        if op=='moveTo':
            if cur: contours.append(np.array(cur))
            cur=[np.array(args[0])]; pt=np.array(args[0])
        elif op=='lineTo':
            p=np.array(args[0]); n=max(2,int(np.linalg.norm(p-pt)/step)); cur+=list(np.linspace(pt,p,n+1)[1:]); pt=p
        elif op=='curveTo':
            p1,p2,p3=[np.array(a) for a in args]; L=np.linalg.norm(p1-pt)+np.linalg.norm(p2-p1)+np.linalg.norm(p3-p2); n=max(4,int(L/step)); cur+=list(bez(pt,p1,p2,p3,n)); pt=p3
        elif op=='qCurveTo':
            pts=[np.array(a) for a in args]; 
            for i in range(len(pts)-1):
                c=pts[i]; e=pts[i+1] if i<len(pts)-2 else pts[-1]
                p1=pt+2/3*(c-pt); p2=e+2/3*(c-e); n=8; cur+=list(bez(pt,p1,p2,e,n)); pt=e
        elif op in ('closePath','endPath'):
            if cur: contours.append(np.array(cur)); cur=[]
    if cur: contours.append(np.array(cur))
    return contours

def resample(P, step):
    P=np.asarray(P,float)
    if np.linalg.norm(P[0]-P[-1])>1e-6: P=np.vstack([P,P[:1]])
    seg=np.linalg.norm(np.diff(P,axis=0),axis=1); s=np.concatenate([[0],np.cumsum(seg)]); L=s[-1]
    n=max(16,int(L/step)); t=np.linspace(0,L,n,endpoint=False)
    x=np.interp(t,s,P[:,0]); y=np.interp(t,s,P[:,1]); return np.stack([x,y],1)

def corners(P, span, thresh_deg):
    n=len(P); idx=np.arange(n)
    a=P[(idx-span)%n]; b=P[(idx+span)%n]
    v1=P-a; v2=b-P
    ang=np.degrees(np.arctan2(v1[:,0]*v2[:,1]-v1[:,1]*v2[:,0], (v1*v2).sum(1)))
    mag=np.abs(ang); cand=mag>thresh_deg
    # non-max suppression within span
    out=[]
    for i in np.where(cand)[0]:
        lo=(i-span); hi=(i+span)
        window=[mag[j%n] for j in range(lo,hi+1)]
        if mag[i]>=max(window): out.append(i)
    # dedupe near-equal neighbours
    out=sorted(set(out)); res=[]
    for i in out:
        if not res or i-res[-1]>span//2: res.append(i)
    return res

def gauss_smooth_open(Q, sigma):
    if sigma<=0 or len(Q)<5: return Q
    r=int(3*sigma); k=np.exp(-0.5*(np.arange(-r,r+1)/sigma)**2); k/=k.sum()
    pad=np.vstack([Q[0]+(Q[0]-Q[1:r+1][::-1]) if r>0 else Q[:0], Q, Q[-1]+(Q[-1]-Q[-r-1:-1][::-1]) if r>0 else Q[:0]])
    xs=np.convolve(pad[:,0],k,'valid'); ys=np.convolve(pad[:,1],k,'valid')
    S=np.stack([xs,ys],1); S[0]=Q[0]; S[-1]=Q[-1]; return S

# --- Schneider curve fitting
def fit_cubic(points, tol):
    pts=np.asarray(points,float)
    if len(pts)==2:
        d=pts[1]-pts[0]; return [[pts[0],pts[0]+d/3,pts[0]+2*d/3,pts[1]]]
    tHat1=pts[1]-pts[0]; tHat1/=np.linalg.norm(tHat1)+1e-12
    tHat2=pts[-2]-pts[-1]; tHat2/=np.linalg.norm(tHat2)+1e-12
    return _fit(pts,tHat1,tHat2,tol)
def _chord(pts):
    d=np.linalg.norm(np.diff(pts,axis=0),axis=1); u=np.concatenate([[0],np.cumsum(d)]); return u/u[-1]
def _bez(b,t):
    t=np.asarray(t)[:,None]; return (1-t)**3*b[0]+3*(1-t)**2*t*b[1]+3*(1-t)*t**2*b[2]+t**3*b[3]
def _gen(pts,u,t1,t2):
    first,last=pts[0],pts[-1]
    A1=np.outer(3*(1-u)**2*u,t1); A2=np.outer(3*(1-u)*u**2,t2)
    C=np.zeros((2,2)); X=np.zeros(2)
    tmp=pts-((1-u)**3)[:,None]*first-(3*(1-u)**2*u)[:,None]*first-(3*(1-u)*u**2)[:,None]*last-(u**3)[:,None]*last
    C[0,0]=(A1*A1).sum(); C[0,1]=C[1,0]=(A1*A2).sum(); C[1,1]=(A2*A2).sum()
    X[0]=(A1*tmp).sum(); X[1]=(A2*tmp).sum()
    det=C[0,0]*C[1,1]-C[1,0]*C[0,1]
    a1=(X[0]*C[1,1]-X[1]*C[0,1])/det if abs(det)>1e-12 else 0
    a2=(C[0,0]*X[1]-C[1,0]*X[0])/det if abs(det)>1e-12 else 0
    seglen=np.linalg.norm(last-first); eps=1e-6*seglen
    if a1<eps or a2<eps: a1=a2=seglen/3
    return np.array([first,first+t1*a1,last+t2*a2,last])
def _reparam(pts,u,b):
    out=u.copy()
    for i,(p,t) in enumerate(zip(pts,u)):
        for _ in range(2):
            q=_bez(b,[t])[0]; d1=3*((1-t)**2*(b[1]-b[0])+2*(1-t)*t*(b[2]-b[1])+t**2*(b[3]-b[2])); d2=6*((1-t)*(b[2]-2*b[1]+b[0])+t*(b[3]-2*b[2]+b[1]))
            num=((q-p)*d1).sum(); den=(d1*d1).sum()+((q-p)*d2).sum()
            if abs(den)>1e-12: t=t-num/den
            t=min(1,max(0,t))
        out[i]=t
    return out
def _fit(pts,t1,t2,tol,depth=0):
    if len(pts)==2:
        d=np.linalg.norm(pts[1]-pts[0])/3; return [np.array([pts[0],pts[0]+t1*d,pts[1]+t2*d,pts[1]])]
    u=_chord(pts); b=_gen(pts,u,t1,t2)
    err,split=_maxerr(pts,b,u)
    if err<tol: return [b]
    if err<tol*4:
        for _ in range(4):
            u=_reparam(pts,u,b); b=_gen(pts,u,t1,t2); err,split=_maxerr(pts,b,u)
            if err<tol: return [b]
    if depth>20: return [b]
    split=max(1,min(len(pts)-2,split))
    tc=pts[split-1]-pts[split+1]; tc/=np.linalg.norm(tc)+1e-12
    return _fit(pts[:split+1],t1,tc,tol,depth+1)+_fit(pts[split:],-tc,t2,tol,depth+1)
def _maxerr(pts,b,u):
    q=_bez(b,u); d=((q-pts)**2).sum(1); i=int(np.argmax(d)); return math.sqrt(d[i]),i

def smooth_path(d, step=1.0, span=6, corner_deg=48, sigma=4.0, tol=0.8, min_seg=4, line_tol=2.5):
    out=[]
    for C in flatten(d,step):
        P=resample(C,step); n=len(P)
        cs=corners(P,span,corner_deg)
        if len(cs)==0: cs=[0]
        pieces=[]
        for a,b in zip(cs,cs[1:]+[cs[0]+n]):
            idx=[(i%n) for i in range(a,b+1)]; Q=P[idx]
            Q=gauss_smooth_open(Q,sigma); pieces.append(Q)
        # emit
        start=pieces[0][0]; cmds=[f'M{start[0]:.2f} {start[1]:.2f}']
        for Q in pieces:
            if len(Q)<min_seg:
                cmds.append(f'L{Q[-1][0]:.2f} {Q[-1][1]:.2f}'); continue
            # straight-line detection: max deviation from chord
            a,b=Q[0],Q[-1]; ab=b-a; L=np.linalg.norm(ab)
            if L>0:
                dev=np.abs((Q[:,0]-a[0])*ab[1]-(Q[:,1]-a[1])*ab[0])/L
                if dev.max()<line_tol:
                    cmds.append(f'L{b[0]:.2f} {b[1]:.2f}'); continue
            for bz in fit_cubic(Q,tol):
                cmds.append(f'C{bz[1][0]:.2f} {bz[1][1]:.2f} {bz[2][0]:.2f} {bz[2][1]:.2f} {bz[3][0]:.2f} {bz[3][1]:.2f}')
        cmds.append('Z'); out.append(''.join(cmds))
    return ' '.join(out)
