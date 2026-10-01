from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from reportlab.lib.utils import ImageReader
import math, random
W,H=90*mm,50*mm; B=3*mm
PW,PH=W+2*B,H+2*B
BLUE=(58/255,78/255,190/255); WHITE=(232/255,232/255,236/255)
logo=ImageReader('/home/user/ksaa/business-card/logo.png'); lw,lh=logo.getSize()
c=canvas.Canvas('/home/user/ksaa/business-card/NEO-CAPTA-business-card-print.pdf',pagesize=(PW,PH))
c.setTitle('NEO CAPTA Business Card'); c.setAuthor('NEO CAPTA')

def halftone(c, band_center, band_width, avoid=None, maxr=0.55*mm, step=1.5*mm, strength=1.0):
    # diagonal glowing band of dots, like the original artwork
    random.seed(4)
    ang=math.radians(-35); nx,ny=math.sin(ang),math.cos(ang)
    y=0
    while y<PH+step:
        x=0
        while x<PW+step:
            d=(x-band_center[0])*nx+(y-band_center[1])*ny
            t=math.exp(-(d/band_width)**2)
            t2=0.25*math.exp(-((d+band_width*1.6)/(band_width*0.5))**2)
            v=max(t,t2)*strength
            if avoid:
                ax,ay,aw,ah=avoid
                dx=max(ax-x,0,x-(ax+aw)); dy=max(ay-y,0,y-(ay+ah))
                v*=min(1,math.hypot(dx,dy)/(6*mm))
            r=maxr*(0.18+0.82*v)
            # colour: blue at edges of band, white in the core
            k=min(1,v*1.3)
            col=tuple(BLUE[i]*(1-k)+WHITE[i]*k for i in range(3))
            dim=0.18+0.82*v
            c.setFillColorRGB(*(ch*dim for ch in col))
            c.circle(x,y,r,stroke=0,fill=1)
            x+=step
        y+=step

def bg(c):
    c.setFillColorRGB(0,0,0); c.rect(0,0,PW,PH,stroke=0,fill=1)

# ---------- FRONT ----------
bg(c)
lh_t=30*mm; lw_t=lh_t*lw/lh
lx=(PW-lw_t)/2; ly=(PH-lh_t)/2
halftone(c,(PW*0.62,PH*0.55),9*mm,avoid=(lx,ly,lw_t,lh_t))
c.drawImage(logo,lx,ly,lw_t,lh_t,mask='auto')
c.showPage()

# ---------- BACK ----------
bg(c)
halftone(c,(PW*1.05,PH*0.0),6*mm,strength=0.8,maxr=0.45*mm)
m=B+7*mm
# logo on the right, vertically centred
s_h=20*mm; s_w=s_h*lw/lh
c.drawImage(logo,PW-B-7*mm-s_w,(PH-s_h)/2,s_w,s_h,mask='auto')
# thin blue divider
c.setStrokeColorRGB(*BLUE); c.setLineWidth(0.5)
dx=PW-B-7*mm-s_w-6*mm
c.line(dx,B+10*mm,dx,PH-B-10*mm)
# name
y=PH-B-15*mm
c.setFillColorRGB(*WHITE); c.setFont('Helvetica-Bold',13); c.drawString(m,y,'NEO CAPTA')
c.setFillColorRGB(*BLUE); c.rect(m,y-3.2*mm,8*mm,0.5*mm,stroke=0,fill=1)
# contacts
rows=[('T','+966 55 054 8453'),('E','contact@neocapta.com'),('IG','@neocapta.sa')]
yy=B+16.5*mm
for icon,txt in rows:
    c.setFillColorRGB(*BLUE); c.circle(m+1.3*mm,yy+0.85*mm,1.5*mm,stroke=0,fill=1)
    cx,cy=m+1.3*mm,yy+0.85*mm
    if icon=='IG':
        # simple Instagram glyph: rounded square, lens, dot
        c.setStrokeColorRGB(*WHITE); c.setLineWidth(0.45)
        c.roundRect(cx-0.85*mm,cy-0.85*mm,1.7*mm,1.7*mm,0.45*mm,stroke=1,fill=0)
        c.circle(cx,cy,0.4*mm,stroke=1,fill=0)
        c.setFillColorRGB(*WHITE); c.circle(cx+0.5*mm,cy+0.5*mm,0.12*mm,stroke=0,fill=1)
    else:
        c.setFillColorRGB(*WHITE); c.setFont('Helvetica-Bold',5.5); c.drawCentredString(cx,yy+0.2*mm,icon)
    c.setFont('Helvetica',7.5); c.drawString(m+4.5*mm,yy,txt)
    yy-=4.8*mm
c.showPage(); c.save()
