import os
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from reportlab.lib.utils import ImageReader
import math, random
W,H=90*mm,50*mm; B=3*mm
PW,PH=W+2*B,H+2*B
BLUE=(58/255,78/255,190/255); WHITE=(232/255,232/255,236/255)
LIGHTBLUE=(140/255,158/255,240/255)
logo=ImageReader('/home/user/ksaa/business-card/logo.png'); lw,lh=logo.getSize()
c=canvas.Canvas(os.environ.get('OUT','/home/user/ksaa/business-card/NEO-CAPTA-business-card-print.pdf'),pagesize=(PW,PH))
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
                if math.hypot(dx,dy)<2*mm:
                    x+=step; continue
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

# ---------- FRONT (contact info) ----------
bg(c)
m=B+7*mm
# right column: small logo on top, Instagram QR code below
s_h=20*mm; s_w=s_h*lw/lh
xc=PW-B-7*mm-s_w/2
l_h=10*mm; l_w=l_h*lw/lh
c.drawImage(logo,xc-l_w/2,PH-B-7*mm-l_h,l_w,l_h,mask='auto')
q=17*mm; pad=1.4*mm
qy=B+6*mm
halftone(c,(PW*1.05,PH*0.0),6*mm,strength=0.8,maxr=0.45*mm,avoid=(xc-q/2-pad,qy-pad,q+2*pad,q+2*pad))
import qrcode
qr=qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M,border=0)
qr.add_data('https://instagram.com/neocapta.sa'); qr.make(fit=True)
mat=qr.get_matrix(); n=len(mat); cell=q/n
def X(col): return xc-q/2+col*cell
def Y(row): return qy+q-(row+1)*cell
eyes=[(0,0),(0,n-7),(n-7,0)]
def in_eye(r,col): return any(er<=r<er+7 and ec<=col<ec+7 for er,ec in eyes)
# QR style (QR_STYLE env var picks a variant; default is the chosen one)
import os
NAVY=(0.03,0.04,0.12)
styles={
    # tile colour, module colour, eye-centre colour
    'blue':     (BLUE,      WHITE,     WHITE),
    'lightblue':(LIGHTBLUE, NAVY,      NAVY),
    'bluedots': (None,      LIGHTBLUE, WHITE),
}
tile,mod,eye=styles[os.environ.get('QR_STYLE','blue')]
gap=tile or (0,0,0)
if tile:
    c.setFillColorRGB(*tile); c.roundRect(xc-q/2-pad,qy-pad,q+2*pad,q+2*pad,1.6*mm,stroke=0,fill=1)
c.setFillColorRGB(*mod)
for r in range(n):
    for col in range(n):
        if mat[r][col] and not in_eye(r,col):
            c.roundRect(X(col)+0.04*cell,Y(r)+0.04*cell,0.92*cell,0.92*cell,0.32*cell,stroke=0,fill=1)
# finder eyes, rounded like the logo letters
for er,ec in eyes:
    x0,y0=X(ec),Y(er+6)
    c.setFillColorRGB(*mod); c.roundRect(x0,y0,7*cell,7*cell,2*cell,stroke=0,fill=1)
    c.setFillColorRGB(*gap); c.roundRect(x0+cell,y0+cell,5*cell,5*cell,1.4*cell,stroke=0,fill=1)
    c.setFillColorRGB(*eye); c.roundRect(x0+2*cell,y0+2*cell,3*cell,3*cell,0.9*cell,stroke=0,fill=1)
# thin blue divider
c.setStrokeColorRGB(*BLUE); c.setLineWidth(0.5)
dx=PW-B-7*mm-s_w-6*mm
c.line(dx,B+10*mm,dx,PH-B-10*mm)
# name
y=PH-B-15*mm
c.setFillColorRGB(*WHITE); c.setFont('Helvetica-Bold',13); c.drawString(m,y,'NEO CAPTA')
c.setFillColorRGB(*BLUE); c.rect(m,y-3.2*mm,8*mm,0.5*mm,stroke=0,fill=1)
# contacts
rows=[('WA','+966 55 054 8453'),('E','contact@neocapta.com'),('IG','@neocapta.sa')]
yy=B+16.5*mm
for icon,txt in rows:
    c.setFillColorRGB(*BLUE); c.circle(m+1.3*mm,yy+0.85*mm,1.5*mm,stroke=0,fill=1)
    cx,cy=m+1.3*mm,yy+0.85*mm
    if icon=='WA':
        # simple WhatsApp glyph: speech bubble ring with tail, handset inside
        c.setStrokeColorRGB(*WHITE); c.setLineWidth(0.4)
        c.circle(cx+0.05*mm,cy+0.05*mm,0.82*mm,stroke=1,fill=0)
        c.setFillColorRGB(*WHITE)
        p=c.beginPath()
        p.moveTo(cx-0.55*mm,cy-0.55*mm); p.lineTo(cx-1.0*mm,cy-1.0*mm); p.lineTo(cx-0.25*mm,cy-0.8*mm); p.close()
        c.drawPath(p,stroke=0,fill=1)
        c.setLineWidth(0.38); c.setLineCap(1)
        h=c.beginPath()
        h.moveTo(cx-0.33*mm,cy+0.38*mm)
        h.curveTo(cx-0.45*mm,cy-0.05*mm,cx-0.05*mm,cy-0.42*mm,cx+0.38*mm,cy-0.33*mm)
        c.drawPath(h,stroke=1,fill=0)
        c.setLineCap(0)
    elif icon=='IG':
        # simple Instagram glyph: rounded square, lens, dot
        c.setStrokeColorRGB(*WHITE); c.setLineWidth(0.45)
        c.roundRect(cx-0.85*mm,cy-0.85*mm,1.7*mm,1.7*mm,0.45*mm,stroke=1,fill=0)
        c.circle(cx,cy,0.4*mm,stroke=1,fill=0)
        c.setFillColorRGB(*WHITE); c.circle(cx+0.5*mm,cy+0.5*mm,0.12*mm,stroke=0,fill=1)
    else:
        c.setFillColorRGB(*WHITE); c.setFont('Helvetica-Bold',5.5); c.drawCentredString(cx,yy+0.2*mm,icon)
    c.setFont('Helvetica',7.5); c.drawString(m+4.5*mm,yy,txt)
    yy-=4.8*mm
c.showPage()

# ---------- BACK (logo) ----------
bg(c)
lh_t=30*mm; lw_t=lh_t*lw/lh
lx=(PW-lw_t)/2; ly=(PH-lh_t)/2
halftone(c,(PW*0.62,PH*0.55),9*mm,avoid=(lx,ly,lw_t,lh_t))
c.drawImage(logo,lx,ly,lw_t,lh_t,mask='auto')
c.showPage(); c.save()
