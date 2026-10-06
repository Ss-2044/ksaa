from PIL import Image, ImageFilter
import numpy as np, sys
from scipy import ndimage as nd
im=Image.open(sys.argv[1]).convert('RGB').crop((340,30,630,778))
a=np.asarray(im).astype(float)
r,g,b=a[...,0],a[...,1],a[...,2]
mx=a.max(-1); mn=a.min(-1); sat=(mx-mn)/(mx+1e-6)
bg=(mx<38)|((g>r+20)&(g>b+10)&(sat>0.3))
bg=nd.binary_opening(bg,iterations=1)
lab,n=nd.label(bg)
edge=set(lab[0,:])|set(lab[:,0])|set(lab[:,-1])|set(lab[-1,:]); edge.discard(0)
outside=np.isin(lab,list(edge))
fg=~outside
fg=nd.binary_fill_holes(nd.binary_closing(fg,iterations=3))
lab2,n2=nd.label(fg); sizes=nd.sum(fg,lab2,range(1,n2+1)); fg=lab2==(np.argmax(sizes)+1)
fg=nd.binary_erosion(fg,iterations=1)
A=Image.fromarray((fg*255).astype('uint8')).filter(ImageFilter.GaussianBlur(1.2))
out=im.convert('RGBA'); out.putalpha(A); out.save(sys.argv[2])
