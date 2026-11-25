"""Checks DayGuard's correlation math (verify/stats.js, the same code that is inside index.html)
against SciPy on 400 random datasets, including heavy ties, yes/no answers and partial correlation.
Run:  python3 verify_stats.py      (needs: Python 3, numpy, scipy, Node.js)"""
import json, os, subprocess, numpy as np
from scipy import stats
HERE=os.path.dirname(os.path.abspath(__file__))
rng=np.random.default_rng(42); cases=[]
for i in range(400):
    n=int(rng.integers(8,90)); kind=i%4
    if kind==0: x=rng.normal(size=n); y=0.4*x+rng.normal(size=n)
    elif kind==1: x=rng.integers(0,5,n).astype(float); y=rng.integers(0,11,n)+x*rng.uniform(-1,1)
    elif kind==2: x=rng.integers(0,2,n).astype(float); y=rng.integers(0,3,n).astype(float)
    else: x=rng.normal(size=n); y=rng.normal(size=n)
    z=np.arange(n,dtype=float)+rng.normal(size=n)*3
    cases.append(dict(x=[round(v,4) for v in x],y=[round(v,4) for v in y],z=[round(v,4) for v in z]))
cf=os.path.join(HERE,'_cases.json'); json.dump(cases,open(cf,'w'))
js=f'const S=require({json.dumps(os.path.join(HERE,"stats.js"))});const C=require({json.dumps(cf)});console.log(JSON.stringify(C.map(c=>({{s:S.corrStat(c.x,c.y,"spearman"),p:S.corrStat(c.x,c.y,"pearson"),pp:S.corrStat(c.x,c.y,"pearson",c.z),sp:S.corrStat(c.x,c.y,"spearman",c.z)}}))))'
out=json.loads(subprocess.check_output(['node','-e',js])); os.remove(cf)
def partial(x,y,z):
    rxy=np.corrcoef(x,y)[0,1];rxz=np.corrcoef(x,z)[0,1];ryz=np.corrcoef(y,z)[0,1]
    return (rxy-rxz*ryz)/np.sqrt((1-rxz**2)*(1-ryz**2))
worst={'Spearman r':0,'Spearman p':0,'Pearson r':0,'Pearson p':0,'partial Pearson r':0,'partial Pearson p':0,'partial Spearman r':0}
for c,o in zip(cases,out):
    x,y,z=map(np.array,(c['x'],c['y'],c['z']))
    if np.std(x)==0 or np.std(y)==0: continue
    s=stats.spearmanr(x,y); p=stats.pearsonr(x,y)
    worst['Spearman r']=max(worst['Spearman r'],abs(s.statistic-o['s']['r'])); worst['Spearman p']=max(worst['Spearman p'],abs(s.pvalue-o['s']['p']))
    worst['Pearson r']=max(worst['Pearson r'],abs(p.statistic-o['p']['r'])); worst['Pearson p']=max(worst['Pearson p'],abs(p.pvalue-o['p']['p']))
    rx=x-np.polyval(np.polyfit(z,x,1),z); ry=y-np.polyval(np.polyfit(z,y,1),z)
    r=np.corrcoef(rx,ry)[0,1]; n=len(x); t=r*np.sqrt((n-3)/(1-r*r)); pv=2*stats.t.sf(abs(t),n-3)
    worst['partial Pearson r']=max(worst['partial Pearson r'],abs(r-o['pp']['r'])); worst['partial Pearson p']=max(worst['partial Pearson p'],abs(pv-o['pp']['p']))
    R=stats.rankdata; worst['partial Spearman r']=max(worst['partial Spearman r'],abs(partial(R(x),R(y),R(z))-o['sp']['r']))
ps=rng.uniform(0,0.2,50)
q=json.loads(subprocess.check_output(['node','-e',f'const S=require({json.dumps(os.path.join(HERE,"stats.js"))});console.log(JSON.stringify(S.bh({json.dumps(list(ps))})))']))
worst['Benjamini-Hochberg q']=float(np.max(np.abs(np.array(q)-stats.false_discovery_control(ps,method="bh"))))
ok=all(v<1e-9 for v in worst.values())
for k,v in worst.items(): print(f'{k:22s} largest difference from SciPy: {v:.1e}')
print('RESULT:', 'PASS - matches SciPy' if ok else 'FAIL')
