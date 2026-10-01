from PIL import Image, ImageFilter
import numpy as np
from scipy import ndimage
im=Image.open('/root/.claude/uploads/41612205-12b3-5283-ab57-103469f2e792/2400b221-image.jpg').convert('RGB')
a=np.asarray(im).astype(int)
r,g,b=a[...,0],a[...,1],a[...,2]
bright=(r+g+b)/3
blue=(b>110)&(b-r>50)
white=(bright>150)&(abs(b-r)<40)
fg=blue|white
lab,n=ndimage.label(fg)
sizes=ndimage.sum(fg,lab,range(1,n+1))
keep=np.zeros_like(fg)
for i,s in enumerate(sizes,1):
    if s>60:
        ys,xs=np.where(lab==i)
        if 130<xs.mean()<510 and 200<ys.mean()<470: keep|=lab==i
ys,xs=np.where(keep); print(xs.min(),xs.max(),ys.min(),ys.max())
x0,x1,y0,y1=xs.min()-4,xs.max()+5,ys.min()-4,ys.max()+5
S=10
out=[]
kd=ndimage.binary_dilation(keep,iterations=2)
bluesoft=np.clip((b-r-10)/60,0,1)*kd
whitesoft=np.clip((bright-50)/110,0,1)*kd*(np.abs(b-r)<45)
for m in (bluesoft, whitesoft):
    mi=Image.fromarray((m[y0:y1,x0:x1]*255).astype('uint8'))
    mi=mi.resize(((x1-x0)*S,(y1-y0)*S),Image.BICUBIC).filter(ImageFilter.GaussianBlur(S*0.35))
    arr=np.asarray(mi).astype(float)
    out.append(np.clip((arr-128)*8,0,255).astype('uint8'))
W,H=(x1-x0)*S,(y1-y0)*S
logo=Image.new('RGBA',(W,H),(0,0,0,0))
logo.paste(Image.new('RGBA',(W,H),(232,232,236,255)),(0,0),Image.fromarray(out[1]))
logo.paste(Image.new('RGBA',(W,H),(58,78,190,255)),(0,0),Image.fromarray(out[0]))
logo.save('logo.png'); print(logo.size)
bg=Image.new('RGB',(W,H),(0,0,0)); bg.paste(logo,(0,0),logo); bg.resize((W//3,H//3)).save('logo_prev.png')
