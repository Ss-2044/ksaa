# Personal NEO CAPTA cards (one per person), in three layouts.
# Usage: NAME="سامي البجيدي" LAYOUT=center|vertical|band OUT=file.pdf python3 personal.py
import os, math
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase.pdfmetrics import stringWidth
import qrcode, pymupdf

HERE=os.path.dirname(os.path.abspath(__file__))
NAME=os.environ['NAME']; LAYOUT=os.environ.get('LAYOUT','center')
OUT=os.environ['OUT']
BLUE=(58/255,78/255,190/255); WHITE=(232/255,232/255,236/255)
LIGHTBLUE=(140/255,158/255,240/255); BLACK=(0,0,0)
B=3*mm
if LAYOUT=='vertical': W,H=50*mm,90*mm
else: W,H=90*mm,50*mm
PW,PH=W+2*B,H+2*B
logo=ImageReader(os.path.join(HERE,'logo.png')); lw,lh=logo.getSize()
CONTACTS=[('WA','+966 55 054 8453'),('E','contact@neocapta.com'),('IG','@neocapta.sa')]
QR_URL='https://instagram.com/neocapta.sa'
names=[]  # (page, x0, x1, baseline, size, align, colour) filled in after save

c=canvas.Canvas(OUT,pagesize=(PW,PH))
c.setTitle(f'NEO CAPTA Business Card'); c.setAuthor('NEO CAPTA')

def bg(col=BLACK):
    c.setFillColorRGB(*col); c.rect(0,0,PW,PH,stroke=0,fill=1)

def halftone(center,width,avoid=(),maxr=0.55*mm,step=1.5*mm,strength=1.0):
    ang=math.radians(-35); nx,ny=math.sin(ang),math.cos(ang)
    y=0
    while y<PH+step:
        x=0
        while x<PW+step:
            d=(x-center[0])*nx+(y-center[1])*ny
            v=max(math.exp(-(d/width)**2),0.25*math.exp(-((d+width*1.6)/(width*0.5))**2))*strength
            skip=False
            for ax,ay,aw,ah in avoid:
                dist=math.hypot(max(ax-x,0,x-(ax+aw)),max(ay-y,0,y-(ay+ah)))
                if dist<2*mm: skip=True
                v*=min(1,dist/(6*mm))
            if not skip:
                k=min(1,v*1.3); dim=0.18+0.82*v
                c.setFillColorRGB(*(dim*(BLUE[i]*(1-k)+WHITE[i]*k) for i in range(3)))
                c.circle(x,y,maxr*(0.18+0.82*v),stroke=0,fill=1)
            x+=step
        y+=step

def draw_logo(x,y,h):
    w=h*lw/lh; c.drawImage(logo,x,y,w,h,mask='auto'); return w

def draw_qr(x,y,q):
    # light-blue rounded dots on black, rounded finder eyes (scans as inverted QR)
    qr=qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M,border=0)
    qr.add_data(QR_URL); qr.make(fit=True)
    mat=qr.get_matrix(); n=len(mat); cell=q/n
    X=lambda col:x+col*cell; Y=lambda row:y+q-(row+1)*cell
    eyes=[(0,0),(0,n-7),(n-7,0)]
    in_eye=lambda r,col:any(er<=r<er+7 and ec<=col<ec+7 for er,ec in eyes)
    c.setFillColorRGB(*LIGHTBLUE)
    for r in range(n):
        for col in range(n):
            if mat[r][col] and not in_eye(r,col):
                c.roundRect(X(col)+0.04*cell,Y(r)+0.04*cell,0.92*cell,0.92*cell,0.32*cell,stroke=0,fill=1)
    for er,ec in eyes:
        x0,y0=X(ec),Y(er+6)
        c.setFillColorRGB(*LIGHTBLUE); c.roundRect(x0,y0,7*cell,7*cell,2*cell,stroke=0,fill=1)
        c.setFillColorRGB(*BLACK); c.roundRect(x0+cell,y0+cell,5*cell,5*cell,1.4*cell,stroke=0,fill=1)
        c.setFillColorRGB(*WHITE); c.roundRect(x0+2*cell,y0+2*cell,3*cell,3*cell,0.9*cell,stroke=0,fill=1)

def icon(cx,cy,kind,disc=BLUE,fg=WHITE,r=1.5*mm):
    s=r/(1.5*mm)
    c.setFillColorRGB(*disc); c.circle(cx,cy,r,stroke=0,fill=1)
    c.setStrokeColorRGB(*fg); c.setFillColorRGB(*fg)
    if kind=='WA':
        c.setLineWidth(0.4*s); c.circle(cx+0.05*mm*s,cy+0.05*mm*s,0.82*mm*s,stroke=1,fill=0)
        p=c.beginPath(); p.moveTo(cx-0.55*mm*s,cy-0.55*mm*s); p.lineTo(cx-1.0*mm*s,cy-1.0*mm*s); p.lineTo(cx-0.25*mm*s,cy-0.8*mm*s); p.close()
        c.drawPath(p,stroke=0,fill=1)
        c.setLineWidth(0.38*s); c.setLineCap(1)
        h=c.beginPath(); h.moveTo(cx-0.33*mm*s,cy+0.38*mm*s)
        h.curveTo(cx-0.45*mm*s,cy-0.05*mm*s,cx-0.05*mm*s,cy-0.42*mm*s,cx+0.38*mm*s,cy-0.33*mm*s)
        c.drawPath(h,stroke=1,fill=0); c.setLineCap(0)
    elif kind=='IG':
        c.setLineWidth(0.45*s)
        c.roundRect(cx-0.85*mm*s,cy-0.85*mm*s,1.7*mm*s,1.7*mm*s,0.45*mm*s,stroke=1,fill=0)
        c.circle(cx,cy,0.4*mm*s,stroke=1,fill=0)
        c.circle(cx+0.5*mm*s,cy+0.5*mm*s,0.12*mm*s,stroke=0,fill=1)
    else:
        c.setFont('Helvetica-Bold',5.5*s); c.drawCentredString(cx,cy-0.65*mm*s,kind)

def contact(x,y,kind,txt,size=7.5,disc=BLUE,fg=WHITE,txtcol=WHITE):
    # x = left edge of the icon disc; y = text baseline; returns total width
    icon(x+1.5*mm,y+0.85*mm,kind,disc,fg)
    c.setFillColorRGB(*txtcol); c.setFont('Helvetica',size); c.drawString(x+4.4*mm,y,txt)
    return 4.4*mm+stringWidth(txt,'Helvetica',size)

def contact_w(txt,size): return 4.4*mm+stringWidth(txt,'Helvetica',size)

def name(page,x0,x1,base,size,align):
    names.append((page,x0,x1,base,size,align))

def back_logo(h=30*mm):
    bg()
    w=h*lw/lh; x=(PW-w)/2; y=(PH-h)/2
    halftone((PW*0.62,PH*0.55),9*mm,avoid=[(x,y,w,h)])
    draw_logo(x,y,h)

# ---------------- layouts (page 0 = front with info, page 1 = back) ----------------
if LAYOUT=='center':
    bg()
    halftone((PW*1.2,PH*1.1),6*mm,strength=0.7,maxr=0.45*mm,avoid=[(PW-B-6*mm-14*mm,PH-B-6*mm-14*mm,14*mm,14*mm),(B+4*mm,B+4*mm,W-8*mm,6*mm),(B+18*mm,PH/2-6*mm,W-36*mm,12*mm)])
    draw_logo(B+6*mm,PH-B-6*mm-9*mm,9*mm)
    draw_qr(PW-B-6*mm-14*mm,PH-B-6*mm-14*mm,14*mm)
    base=PH/2-1*mm
    name(0,B,PW-B,base,16,'center')
    c.setFillColorRGB(*BLUE); c.rect(PW/2-6*mm,base-4*mm,12*mm,0.6*mm,stroke=0,fill=1)
    # contacts in one centred row
    size=6.2; gap=4*mm
    total=sum(contact_w(t,size) for _,t in CONTACTS)+gap*(len(CONTACTS)-1)
    x=(PW-total)/2; y=B+6*mm
    for k,t in CONTACTS: x+=contact(x,y,k,t,size)+gap
    c.showPage(); back_logo(); c.showPage()

elif LAYOUT=='vertical':
    bg()
    halftone((PW*1.1,PH*0.0),6*mm,strength=0.7,maxr=0.45*mm,avoid=[((PW-18*mm)/2,B+7*mm,18*mm,18*mm)])
    lh_=15*mm; lw_=lh_*lw/lh
    draw_logo((PW-lw_)/2,PH-B-9*mm-lh_,lh_)
    base=PH-B-36*mm
    name(0,B,PW-B,base,14,'center')
    c.setFillColorRGB(*BLUE); c.rect(PW/2-5*mm,base-4*mm,10*mm,0.6*mm,stroke=0,fill=1)
    size=7
    bw=max(contact_w(t,size) for _,t in CONTACTS); x=(PW-bw)/2; y=base-11*mm
    for k,t in CONTACTS: contact(x,y,k,t,size); y-=5*mm
    draw_qr((PW-18*mm)/2,B+7*mm,18*mm)
    c.showPage(); back_logo(h=26*mm); c.showPage()

elif LAYOUT=='band':
    bg()
    band=13*mm
    halftone((PW*0.2,PH*1.25),6*mm,strength=0.6,maxr=0.45*mm)
    c.setFillColorRGB(*BLUE); c.rect(0,0,PW,B+band,stroke=0,fill=1)
    draw_logo(B+6*mm,PH-B-6*mm-12*mm,12*mm)
    base=PH-B-20*mm
    name(0,B+30*mm,PW-B-6*mm,base,16,'right')
    c.setFillColorRGB(*BLUE); c.rect(PW-B-6*mm-12*mm,base-4*mm,12*mm,0.6*mm,stroke=0,fill=1)
    c.setFillColorRGB(*LIGHTBLUE); c.setFont('Helvetica-Bold',6.5)
    c.drawRightString(PW-B-6*mm,base-8.5*mm,'NEO CAPTA')
    # contacts on the blue band: white discs with blue glyphs
    size=6.2; gap=4*mm
    total=sum(contact_w(t,size) for _,t in CONTACTS)+gap*(len(CONTACTS)-1)
    x=(PW-total)/2; y=B+band/2-1*mm
    for k,t in CONTACTS: x+=contact(x,y,k,t,size,disc=WHITE,fg=BLUE)+gap
    c.showPage()
    # back: logo + QR
    bg()
    q=15*mm; qx,qy=PW-B-6*mm-q,B+6*mm
    h=24*mm; w=h*lw/lh; lx=B+9*mm; ly=(PH-h)/2
    halftone((PW*0.62,PH*0.55),9*mm,avoid=[(lx,ly,w,h),(qx,qy,q,q)])
    draw_logo(lx,ly,h); draw_qr(qx,qy,q)
    c.showPage()
c.save()

# ---- Arabic names: PyMuPDF shapes Arabic text properly (ReportLab does not) ----
doc=pymupdf.open(OUT)
font=os.path.join(HERE,'fonts','NotoKufiArabic-Bold.ttf')
css='@font-face{font-family:kufi;src:url(NotoKufiArabic-Bold.ttf);}'
arch=pymupdf.Archive(os.path.dirname(font))
for page,x0,x1,base,size,align in names:
    top=PH-base
    html=(f'<p style="font-family:kufi;font-size:{size}pt;color:#e8e8ec;margin:0;'
          f'line-height:1;text-align:{align}">{NAME}</p>')
    doc[page].insert_htmlbox(pymupdf.Rect(x0,top-size*1.25,x1,top+size*0.8),html,css=css,archive=arch)
doc.save(OUT+'.tmp',garbage=3,deflate=True); doc.close(); os.replace(OUT+'.tmp',OUT)
