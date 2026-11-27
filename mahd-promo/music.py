"""Synthesize a 15s soft ambient Arabic-lounge bed (maqam Hijaz on D). Output: argv[1] (wav)."""
import numpy as np, sys, wave
SR=44100; DUR=15.0; N=int(SR*DUR); rng=np.random.default_rng(3)
out=np.zeros((N,2))
def hz(m): return 440*2**((m-69)/12)
def add(sig,start,pan=0.0,gain=1.0):
    i=int(start*SR); j=min(N,i+len(sig)); s=sig[:j-i]*gain
    out[i:j,0]+=s*np.sqrt((1-pan)/2); out[i:j,1]+=s*np.sqrt((1+pan)/2)
def env(n,a,r,sus=1.0):
    e=np.ones(n)*sus; A=int(a*SR); R=int(r*SR)
    e[:A]=np.linspace(0,sus,A); e[-R:]*=np.linspace(1,0,R); return e
# --- pad
def pad(notes,start,dur,g=0.05):
    n=int(dur*SR); t=np.arange(n)/SR; s=np.zeros(n)
    for m in notes:
        f=hz(m)
        for det in (-0.12,0.12):
            ff=f*2**(det/12)
            s+=np.sin(2*np.pi*ff*t)+0.35*np.sin(2*np.pi*2*ff*t)+0.12*np.sin(2*np.pi*3*ff*t)
    s*=(1+0.15*np.sin(2*np.pi*0.3*t))*env(n,1.6,1.8)
    add(s,start,0,g/len(notes))
pad([38,45,50,54],0.0,6.4); pad([43,46,50,55],5.6,4.9); pad([38,45,50,54,57],10.0,3.4)
# --- oud-like pluck (Karplus-Strong)
def pluck(m,dur=1.6,bright=0.5):
    f=hz(m); P=int(SR/f); n=int(dur*SR)
    buf=rng.uniform(-1,1,P); buf=np.convolve(buf,[bright,1-bright],'same')
    y=np.zeros(n); y[:P]=buf
    for i in range(P,n): y[i]=0.996*0.5*(y[i-P]+y[i-P-1])
    y+=0.3*np.sin(2*np.pi*f*np.arange(n)/SR)*np.exp(-np.arange(n)/SR*3)
    return y*np.exp(-np.arange(n)/SR*1.2)
B=60/84  # beat
# Hijaz on D: D Eb F# G A Bb C
D,Eb,Fs,G,A,Bb,C=62,63,66,67,69,70,72
mel=[(1.0,A,1),(1.5,G,.5),(1.75,Fs,.5),(2.0,Eb,1),(3.0,D,2),
     (5.0,D,.5),(5.5,Eb,.5),(6.0,Fs,1),(7.0,G,.5),(7.5,A,1.5),
     (9.0,Bb,.5),(9.5,A,.5),(10.0,G,1),(11.0,Fs,.5),(11.5,Eb,.5),(12.0,Fs,1),(13.0,D,2),
     (14.5,A,.5),(15.0,Bb,.5),(15.5,A,.5),(16.0,G,.5),(16.5,Fs,.5),(17.0,Eb,.5)]
for b,m,l in mel:
    st=0.9+b*B
    if st<13.0: add(pluck(m,1.4+l*0.5),st,-0.25,0.16)
for b in (3.0,7.5,13.0):  # low drone plucks
    add(pluck(D-12,2.5,0.3),0.9+b*B,0.2,0.12)
# --- darbuka maqsoum (soft), 3.0s -> 12.8s
def doum():
    n=int(0.45*SR); t=np.arange(n)/SR; f=110*np.exp(-t*8)+55
    return np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*9)
def tek(g=1):
    n=int(0.09*SR); x=rng.uniform(-1,1,n); x=np.diff(x,prepend=0); return x*np.exp(-np.arange(n)/SR*55)*g
pat=[(0,'D'),(0.5,'T'),(1.5,'T'),(2,'D'),(3,'T'),(3.5,'t')]
t0=0.9+4*B
bar=0
while True:
    base=t0+bar*4*B
    if base>12.6: break
    for off,k in pat:
        st=base+off*B
        if st>12.7: continue
        if k=='D': add(doum(),st,0.0,0.22)
        elif k=='T': add(tek(),st,0.3,0.05)
        else: add(tek(0.6),st,-0.3,0.035)
    bar+=1
# shaker-ish 16ths very soft
for i in range(int((12.7-t0)/(B/2))):
    add(tek(0.25),t0+i*B/2+0.02,0.6,0.02)
# --- door chime at 0.55s
def bell(f,dur=2.5):
    n=int(dur*SR); t=np.arange(n)/SR
    return sum(a*np.sin(2*np.pi*f*r*t)*np.exp(-t*d) for r,a,d in [(1,1,2.2),(2.76,.45,3.5),(5.4,.25,5),(8.9,.1,7)])
add(bell(hz(86)),0.55,0.35,0.05); add(bell(hz(81)),0.75,-0.35,0.04)
# --- riser 12.1 -> 13.0
n=int(0.9*SR); t=np.arange(n)/SR; nz=rng.uniform(-1,1,n)
rs=np.convolve(nz,np.ones(6)/6,'same')*(t/0.9)**2.5
add(rs,12.1,0,0.08)
# --- logo hit at 13.1: sub boom + bright bell
n=int(1.9*SR); t=np.arange(n)/SR
boom=np.sin(2*np.pi*np.cumsum(70*np.exp(-t*4)+38)/SR)*np.exp(-t*2.2)
add(boom,13.1,0,0.5)
add(bell(hz(74),1.9),13.12,0,0.07); add(bell(hz(81),1.9),13.9,0.3,0.035); add(bell(hz(78),1.8),14.15,-0.3,0.03)
# master
out/=np.max(np.abs(out))*1.12
fade=int(0.6*SR); out[-fade:]*=np.linspace(1,0,fade)[:,None]
w=wave.open(sys.argv[1],'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((out*32767).astype(np.int16).tobytes()); w.close()
