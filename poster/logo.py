from PIL import Image, ImageFilter
import numpy as np, sys
from scipy import ndimage as nd
im=Image.open(sys.argv[1]).convert('RGB').crop((150,180,500,460))
a=np.asarray(im).astype(float); r,g,b=a[...,0],a[...,1],a[...,2]
lum=.3*r+.59*g+.11*b
blue=(b>110)&(b>r+50)
white=lum>120
m=blue|white
lab,n=nd.label(nd.binary_closing(m,iterations=1)); sz=nd.sum(m,lab,range(1,n+1))
keep=np.isin(lab,[i+1 for i,s in enumerate(sz) if s>60])
alpha=np.where(blue,np.clip((b-70)/60,0,1),np.clip((lum-70)/70,0,1))*keep
alpha=np.asarray(Image.fromarray((alpha*255).astype('uint8')).filter(ImageFilter.GaussianBlur(.6)))
out=im.convert('RGBA'); out.putalpha(Image.fromarray(alpha))
bb=out.getbbox(); out=out.crop(bb); out.save(sys.argv[2]); print(out.size)
chk=Image.new('RGBA',out.size,(0,120,60,255)); chk.alpha_composite(out); chk.resize((out.size[0]*3,out.size[1]*3)).save(sys.argv[3])
