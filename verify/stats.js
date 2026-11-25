// ---- statistics: exact, checked against SciPy ----
function lgamma(x){const c=[76.18009172947146,-86.50532032941677,24.01409824083091,-1.231739572450155,0.1208650973866179e-2,-0.5395239384953e-5];let y=x,t=x+5.5;t-=(x+0.5)*Math.log(t);let s=1.000000000190015;for(let j=0;j<6;j++)s+=c[j]/++y;return -t+Math.log(2.5066282746310005*s/x)}
function betacf(a,b,x){const MAX=300,EPS=3e-16,FP=1e-300;let qab=a+b,qap=a+1,qam=a-1,c=1,d=1-qab*x/qap;if(Math.abs(d)<FP)d=FP;d=1/d;let h=d;
 for(let m=1;m<=MAX;m++){const m2=2*m;let aa=m*(b-m)*x/((qam+m2)*(a+m2));d=1+aa*d;if(Math.abs(d)<FP)d=FP;c=1+aa/c;if(Math.abs(c)<FP)c=FP;d=1/d;h*=d*c;
  aa=-(a+m)*(qab+m)*x/((a+m2)*(qap+m2));d=1+aa*d;if(Math.abs(d)<FP)d=FP;c=1+aa/c;if(Math.abs(c)<FP)c=FP;d=1/d;const del=d*c;h*=del;if(Math.abs(del-1)<EPS)break}return h}
function betai(a,b,x){if(x<=0)return 0;if(x>=1)return 1;const bt=Math.exp(lgamma(a+b)-lgamma(a)-lgamma(b)+a*Math.log(x)+b*Math.log(1-x));return x<(a+1)/(a+b+2)?bt*betacf(a,b,x)/a:1-bt*betacf(b,a,1-x)/b}
// two-sided p-value for t with df degrees of freedom
const pT=(t,df)=>!isFinite(t)?0:betai(df/2,0.5,df/(df+t*t));
function ranks(a){const idx=a.map((v,i)=>[v,i]).sort((x,y)=>x[0]-y[0]),r=new Array(a.length);let i=0;while(i<idx.length){let j=i;while(j+1<idx.length&&idx[j+1][0]===idx[i][0])j++;const rk=(i+j)/2+1;for(let k=i;k<=j;k++)r[idx[k][1]]=rk;i=j+1}return r}
function pearsonR(x,y){const n=x.length;let mx=0,my=0;for(let i=0;i<n;i++){mx+=x[i];my+=y[i]}mx/=n;my/=n;let sxy=0,sxx=0,syy=0;for(let i=0;i<n;i++){const a=x[i]-mx,b=y[i]-my;sxy+=a*b;sxx+=a*a;syy+=b*b}if(sxx<=1e-12||syy<=1e-12)return null;return Math.max(-1,Math.min(1,sxy/Math.sqrt(sxx*syy)))}
// correlation of two series (null = missing); optional control series z (partial correlation)
function corrStat(xs,ys,method,zs){
 const X=[],Y=[],Z=[];for(let i=0;i<xs.length;i++){if(xs[i]==null||ys[i]==null||(zs&&zs[i]==null))continue;X.push(xs[i]);Y.push(ys[i]);if(zs)Z.push(zs[i])}
 const n=X.length,k=zs?1:0;if(n<k+4)return{n,r:null};
 const f=method==='spearman'?a=>ranks(a):a=>a,x=f(X),y=f(Y);let r=pearsonR(x,y);if(r==null)return{n,r:null,constant:true};
 if(zs){const z=f(Z),rxz=pearsonR(x,z),ryz=pearsonR(y,z);if(rxz==null||ryz==null)return{n,r:null};const den=Math.sqrt((1-rxz*rxz)*(1-ryz*ryz));if(den<1e-12)return{n,r:null};r=Math.max(-1,Math.min(1,(r-rxz*ryz)/den))}
 const df=n-2-k,t=Math.abs(r)>=1?Infinity:r*Math.sqrt(df/(1-r*r)),p=pT(Math.abs(t),df);
 const zr=Math.atanh(Math.max(-0.999999,Math.min(0.999999,r))),se=(method==='spearman'?Math.sqrt(1+r*r/2):1)/Math.sqrt(n-3-k);
 return{n,r,p,df,lo:Math.tanh(zr-1.959964*se),hi:Math.tanh(zr+1.959964*se)};
}
// Benjamini–Hochberg false discovery rate
function bh(ps){const m=ps.length,o=ps.map((p,i)=>[p,i]).sort((a,b)=>a[0]-b[0]),q=new Array(m);let min=1;for(let j=m-1;j>=0;j--){min=Math.min(min,o[j][0]*m/(j+1));q[o[j][1]]=Math.min(1,min)}return q}
if(typeof module!=='undefined')module.exports={corrStat,bh,ranks,pT,betai};
