from PIL import Image, ImageDraw, ImageFilter
import numpy as np, sys
from scipy import ndimage as nd
S=sys.argv[1]
im=Image.open(S+'/players.jpg').convert('RGB'); W,H=im.size
a=np.asarray(im).astype(float)
r,g,b=a[...,0],a[...,1],a[...,2]
yy0=np.arange(a.shape[0])[:,None]*np.ones((1,a.shape[1]))
key=(g>r+4)&(g>=b-5)&(yy0<175)
k=np.asarray(Image.fromarray((key*255).astype('uint8')).filter(ImageFilter.GaussianBlur(2))).astype(float)/255*np.clip((185-yy0)/40,0,1)
a=a*(1-0.93*k[...,None])+np.array([3,22,11])*0.93*k[...,None]
im=Image.fromarray(a.clip(0,255).astype('uint8'))
fg=np.ones((H,W),bool)
yy,xx=np.mgrid[0:H,0:W]
clear=(xx>=471)&(xx<=697)&(yy<160)
head=(((xx-591)/37.0)**2+((yy-116)/50.0)**2<1)|(((xx-446)/34.0)**2+((yy-107)/47.0)**2<1)|(((xx-716)/34.0)**2+((yy-106)/49.0)**2<1)
neck=(xx>568)&(xx<614)&(yy>140)
fg[clear & ~head & ~neck]=False
fgA=Image.fromarray((fg*255).astype('uint8')).filter(ImageFilter.GaussianBlur(1.5))
# global fade mask: top/sides/bottom
ys=np.linspace(0,1,H)[:,None]; xs=np.linspace(0,1,W)[None,:]
fade=np.clip(ys/0.03,0,1)*np.clip(xs/0.07,0,1)*np.clip((1-xs)/0.07,0,1)*np.clip((1-ys)/0.12,0,1)
alpha=(np.asarray(fgA)/255.0)*fade*(1-0.97*k)
out=im.convert('RGBA'); out.putalpha(Image.fromarray((alpha*255).astype('uint8'))); out.save(S+'/players_fg.png')
# check
bg=Image.new('RGBA',(W,H),(255,0,255,255)); bg.alpha_composite(out); bg.crop((380,0,800,260)).save(S+'/chk.png')
