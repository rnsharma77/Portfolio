/* ============================================================
   RUDRA NARAYAN SHARMA  ·  script.js  v4.1
   Added: "software" category support in filter + radar pentagon
   ============================================================ */

/* ── 1. CURSOR ──────────────────────────────────────────────── */
const cursor     = document.getElementById('cursor');
const cursorRing = document.getElementById('cursor-ring');
let mx=0,my=0,rx=0,ry=0;
document.addEventListener('mousemove',e=>{
  mx=e.clientX; my=e.clientY;
  if(cursor){cursor.style.left=mx+'px';cursor.style.top=my+'px';}
});
(function loopRing(){
  rx+=(mx-rx)*.15; ry+=(my-ry)*.15;
  if(cursorRing){cursorRing.style.left=rx+'px';cursorRing.style.top=ry+'px';}
  requestAnimationFrame(loopRing);
})();


/* ── 2. PARTICLE CANVAS ─────────────────────────────────────── */
(function(){
  const cv=document.getElementById('particleCanvas');
  if(!cv)return;
  const cx=cv.getContext('2d');
  const CFG={count:90,maxDist:160,mRad:180,mForce:.04,speed:.4,
    colors:['#00d4ff','#7c3aed','#ffffff','#f59e0b']};
  let W,H,nodes=[],mouse={x:-9999,y:-9999};
  function resize(){W=cv.width=innerWidth;H=cv.height=innerHeight;}
  window.addEventListener('resize',()=>{resize();build();});
  resize();
  window.addEventListener('mousemove',e=>{mouse.x=e.clientX;mouse.y=e.clientY;});
  window.addEventListener('mouseleave',()=>{mouse.x=-9999;mouse.y=-9999;});
  function rand(a,b){return Math.random()*(b-a)+a;}
  function h2r(h){const c=h.replace('#','');return`${parseInt(c.slice(0,2),16)},${parseInt(c.slice(2,4),16)},${parseInt(c.slice(4,6),16)}`;}
  function build(){
    nodes=[];
    for(let i=0;i<CFG.count;i++){
      const z=rand(.2,1),col=CFG.colors[Math.floor(Math.random()*CFG.colors.length)];
      nodes.push({x:rand(0,W),y:rand(0,H),z,vx:rand(-CFG.speed,CFG.speed)*z,vy:rand(-CFG.speed,CFG.speed)*z,
        r:1.5+z*2.5,color:col,a:.15+z*.5});
    }
  }
  build();
  (function loop(){
    cx.clearRect(0,0,W,H);
    for(const n of nodes){
      const dx=n.x-mouse.x,dy=n.y-mouse.y,d=Math.sqrt(dx*dx+dy*dy);
      if(d<CFG.mRad){const f=(1-d/CFG.mRad)*CFG.mForce;n.vx+=dx*f;n.vy+=dy*f;}
      n.vx*=.98;n.vy*=.98;n.x+=n.vx;n.y+=n.vy;
      if(n.x<-50)n.x=W+50;if(n.x>W+50)n.x=-50;
      if(n.y<-50)n.y=H+50;if(n.y>H+50)n.y=-50;
    }
    for(let i=0;i<nodes.length;i++){
      for(let j=i+1;j<nodes.length;j++){
        const a=nodes[i],b=nodes[j],dx=a.x-b.x,dy=a.y-b.y,d=Math.sqrt(dx*dx+dy*dy);
        if(d<CFG.maxDist){
          cx.beginPath();cx.moveTo(a.x,a.y);cx.lineTo(b.x,b.y);
          cx.strokeStyle=`rgba(0,212,255,${((1-d/CFG.maxDist)*.18*((a.z+b.z)/2)).toFixed(3)})`;
          cx.lineWidth=.6;cx.stroke();
        }
      }
    }
    for(const n of nodes){
      cx.beginPath();cx.arc(n.x,n.y,n.r,0,Math.PI*2);
      cx.fillStyle=`rgba(${h2r(n.color)},${n.a.toFixed(3)})`;cx.fill();
      if(n.z>.75){cx.beginPath();cx.arc(n.x,n.y,n.r*2.5,0,Math.PI*2);cx.fillStyle=`rgba(${h2r(n.color)},.04)`;cx.fill();}
    }
    requestAnimationFrame(loop);
  })();
})();


/* ── 3. RADAR CHART (pentagon — 5 axes including Software) ──── */
(function initRadar(){
  const cv=document.getElementById('radarCanvas');
  if(!cv)return;
  const ctx=cv.getContext('2d');
  const W=cv.width, H=cv.height, CX=W/2, CY=H/2;
  const R=Math.min(W,H)/2-36;

  /*
    5 axes evenly distributed around a circle.
    Starting angle = -π/2 (straight up = Frontend).
    Each subsequent axis is rotated by 2π/5 (72°).
  */
  const TWO_PI=Math.PI*2;
  const BASE_ANGLE=-Math.PI/2;   // top
  const STEP=TWO_PI/5;

  const AXES=[
    {label:'Frontend', value:.87, color:'#00d4ff'},
    {label:'Design',   value:.69, color:'#7c3aed'},
    {label:'Backend',  value:.70, color:'#f59e0b'},
    {label:'Tools',    value:.75, color:'#10b981'},
    {label:'Software', value:.72, color:'#e85d9e'},
  ].map((a,i)=>({...a, angle: BASE_ANGLE + STEP*i}));

  let animPct=0, rafId;

  function drawPolygon(pct){
    ctx.clearRect(0,0,W,H);

    // Grid rings (4 rings)
    for(let ring=1;ring<=4;ring++){
      const rr=R*(ring/4);
      ctx.beginPath();
      AXES.forEach((a,i)=>{
        const px=CX+Math.cos(a.angle)*rr;
        const py=CY+Math.sin(a.angle)*rr;
        i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);
      });
      ctx.closePath();
      ctx.strokeStyle='rgba(255,255,255,.06)';ctx.lineWidth=1;ctx.stroke();
    }

    // Axis lines
    AXES.forEach(a=>{
      ctx.beginPath();
      ctx.moveTo(CX,CY);
      ctx.lineTo(CX+Math.cos(a.angle)*R, CY+Math.sin(a.angle)*R);
      ctx.strokeStyle='rgba(255,255,255,.08)';ctx.lineWidth=1;ctx.stroke();
    });

    // Skill polygon fill
    const pts=AXES.map(a=>({
      x:CX+Math.cos(a.angle)*R*a.value*pct,
      y:CY+Math.sin(a.angle)*R*a.value*pct,
      color:a.color
    }));
    ctx.beginPath();
    pts.forEach((p,i)=>i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y));
    ctx.closePath();
    const grad=ctx.createRadialGradient(CX,CY,0,CX,CY,R);
    grad.addColorStop(0,'rgba(0,212,255,.22)');
    grad.addColorStop(.4,'rgba(124,58,237,.14)');
    grad.addColorStop(.8,'rgba(232,93,158,.10)');
    grad.addColorStop(1,'rgba(245,158,11,.06)');
    ctx.fillStyle=grad;ctx.fill();
    ctx.strokeStyle='rgba(0,212,255,.5)';ctx.lineWidth=2;ctx.stroke();

    // Vertex dots with glow
    pts.forEach((p,i)=>{
      const grd=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,14);
      grd.addColorStop(0,AXES[i].color+'55');
      grd.addColorStop(1,'transparent');
      ctx.beginPath();ctx.arc(p.x,p.y,14,0,Math.PI*2);
      ctx.fillStyle=grd;ctx.fill();
      ctx.beginPath();ctx.arc(p.x,p.y,5,0,Math.PI*2);
      ctx.fillStyle=AXES[i].color;ctx.fill();
      ctx.strokeStyle='rgba(255,255,255,.6)';ctx.lineWidth=1.5;ctx.stroke();
    });

    // Centre dot
    ctx.beginPath();ctx.arc(CX,CY,3,0,Math.PI*2);
    ctx.fillStyle='rgba(255,255,255,.3)';ctx.fill();
  }

  function animate(){
    animPct+=(1-animPct)*.05;
    drawPolygon(animPct);
    if(Math.abs(1-animPct)>.002) rafId=requestAnimationFrame(animate);
    else drawPolygon(1);
  }

  const obs=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){animPct=0;cancelAnimationFrame(rafId);animate();obs.unobserve(e.target);}
    });
  },{threshold:.3});
  obs.observe(cv);
  drawPolygon(0);
})();


/* ── 4. SKILL TILT CARDS ────────────────────────────────────── */
(function initTiltCards(){
  const cards=document.querySelectorAll('.sk3-card');
  if(!cards.length)return;

  cards.forEach(card=>{
    const color=card.dataset.color||'#00d4ff';
    const pct=parseInt(card.dataset.pct)||80;

    // Colour the % label
    const pctEl=card.querySelector('.sk3-pct');
    if(pctEl) pctEl.style.color=color;

    // Inject radial glow
    const glow=card.querySelector('.sk3-card-glow');
    if(glow){
      const rgb=hexToRgb(color);
      glow.style.background=`radial-gradient(ellipse at 50% 0%,rgba(${rgb},.14) 0%,transparent 70%)`;
    }

    // Bar animation on scroll
    const bar=card.querySelector('.sk3-bar-fill');
    if(bar){
      const barObs=new IntersectionObserver(entries=>{
        entries.forEach(e=>{
          if(e.isIntersecting){
            setTimeout(()=>{ bar.style.width=pct+'%'; },120);
            barObs.unobserve(e.target);
          }
        });
      },{threshold:.5});
      barObs.observe(card);
    }

    // 3-D tilt on mousemove
    card.addEventListener('mousemove',e=>{
      const rect=card.getBoundingClientRect();
      const x=e.clientX-rect.left, y=e.clientY-rect.top;
      const cx=rect.width/2, cy=rect.height/2;
      const rotX=((y-cy)/cy)*-10;
      const rotY=((x-cx)/cx)*10;
      card.style.transform=`perspective(600px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(8px)`;
      card.style.boxShadow=`0 20px 50px rgba(${hexToRgb(color)},.18), 0 8px 20px rgba(0,0,0,.3)`;
    });
    card.addEventListener('mouseleave',()=>{
      card.style.transform='perspective(600px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
      card.style.boxShadow='';
    });
  });

  function hexToRgb(hex){
    const c=hex.replace('#','');
    return`${parseInt(c.slice(0,2),16)},${parseInt(c.slice(2,4),16)},${parseInt(c.slice(4,6),16)}`;
  }
})();


/* ── 5. SKILL FILTER TABS ───────────────────────────────────── */
(function initSkillFilter(){
  const tabs=document.querySelectorAll('.sk3-tab');
  const cards=document.querySelectorAll('.sk3-card');
  if(!tabs.length)return;
  tabs.forEach(tab=>{
    tab.addEventListener('click',()=>{
      tabs.forEach(t=>t.classList.remove('active'));
      tab.classList.add('active');
      const cat=tab.dataset.cat;
      cards.forEach(c=>{
        const match=cat==='all'||c.dataset.cat===cat;
        c.classList.toggle('sk3-hidden',!match);
      });
    });
  });
})();


/* ── 6. NAVBAR ──────────────────────────────────────────────── */
const navbar=document.getElementById('navbar');
window.addEventListener('scroll',()=>{
  if(navbar)navbar.classList.toggle('scrolled',scrollY>40);
  const secs=document.querySelectorAll('section[id]');
  const links=document.querySelectorAll('.nav-links a');
  let cur='';
  secs.forEach(s=>{if(scrollY>=s.offsetTop-130)cur=s.getAttribute('id');});
  links.forEach(a=>{a.classList.remove('active');if(a.getAttribute('href')==='#'+cur)a.classList.add('active');});
});


/* ── 7. HAMBURGER ───────────────────────────────────────────── */
const ham=document.getElementById('hamburger');
const nav=document.getElementById('navLinks');
function closeMenu(){nav?.classList.remove('open');const i=ham?.querySelector('i');if(i)i.className='fa-solid fa-bars';}
if(ham&&nav){
  ham.addEventListener('click',()=>{
    nav.classList.toggle('open');
    const i=ham.querySelector('i');
    if(i)i.className=nav.classList.contains('open')?'fa-solid fa-xmark':'fa-solid fa-bars';
  });
  nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
}
document.addEventListener('click',e=>{if(nav?.classList.contains('open')&&!nav.contains(e.target)&&!ham?.contains(e.target))closeMenu();});


/* ── 8. SMOOTH SCROLL ───────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click',e=>{
    const id=a.getAttribute('href');if(id==='#')return;
    const t=document.querySelector(id);
    if(t){e.preventDefault();window.scrollTo({top:t.getBoundingClientRect().top+scrollY-(navbar?.offsetHeight||0),behavior:'smooth'});}
  });
});


/* ── 9. TYPING EFFECT ───────────────────────────────────────── */
const tEl=document.getElementById('typed-text');
const roles=['Frontend Developer','UI/UX Designer','Problem Solver','React Developer'];
let ri=0,ci=0,del=false;
function type(){
  if(!tEl)return;
  const c=roles[ri];
  tEl.textContent=del?c.slice(0,ci--):c.slice(0,ci++);
  if(!del&&ci>c.length){del=true;setTimeout(type,1800);return;}
  if(del&&ci<0){del=false;ri=(ri+1)%roles.length;ci=0;setTimeout(type,400);return;}
  setTimeout(type,del?60:100);
}
type();


/* ── 10. SCROLL REVEAL ──────────────────────────────────────── */
const ro=new IntersectionObserver((entries,obs)=>{
  entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');obs.unobserve(e.target);}});
},{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>ro.observe(el));


/* ── 11. COUNT-UP ───────────────────────────────────────────── */
function countUp(el,target,dur=1200){
  const s=performance.now(),suf=el.dataset.suffix||'';
  (function u(now){
    const p=Math.min((now-s)/dur,1),e=1-Math.pow(1-p,3);
    el.textContent=Math.round(e*target)+suf;
    if(p<1)requestAnimationFrame(u);
  })(performance.now());
}
document.querySelectorAll('.stat-num').forEach(el=>{
  new IntersectionObserver((entries,obs)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        const m=el.textContent.trim().match(/^([\d.]+)(.*)$/);
        if(m){el.dataset.suffix=m[2];countUp(el,parseFloat(m[1]));}
        obs.unobserve(el);
      }
    });
  },{threshold:.5}).observe(el);
});



/* ── 13. LIGHTBOX ───────────────────────────────────────────── */
const lb      =document.getElementById('lightbox');
const lbImg   =document.getElementById('lightboxImg');
const lbCap   =document.getElementById('lightboxCaption');
const lbClose =document.getElementById('lightboxClose');
const lbPrev  =document.getElementById('lightboxPrev');
const lbNext  =document.getElementById('lightboxNext');
let lbIdx=0;
const getVis=()=>Array.from(gItems).filter(i=>!i.classList.contains('hidden'));

function openLB(idx){
  const vis=getVis();if(!vis[idx])return;
  lbIdx=idx;
  lbImg.src=vis[idx].querySelector('img').src;
  lbImg.alt=vis[idx].querySelector('img').alt||'';
  lbCap.textContent=
    (vis[idx].querySelector('.gallery-overlay-title')?.textContent||'')+
    ' · '+
    (vis[idx].querySelector('.gallery-overlay-tag')?.textContent||'');
  lb.classList.add('open');document.body.style.overflow='hidden';
}
function closeLB(){lb?.classList.remove('open');if(lbImg)lbImg.src='';document.body.style.overflow='';}
function navLB(d){const vis=getVis();lbIdx=(lbIdx+d+vis.length)%vis.length;openLB(lbIdx);}

document.querySelectorAll('.gallery-zoom-btn').forEach(btn=>{
  btn.addEventListener('click',e=>{
    e.stopPropagation();
    const i=getVis().indexOf(btn.closest('.gallery-item'));
    if(i!==-1)openLB(i);
  });
});
gItems.forEach(it=>it.addEventListener('click',()=>{
  const i=getVis().indexOf(it);if(i!==-1)openLB(i);
}));
if(lbClose)lbClose.addEventListener('click',closeLB);
if(lbPrev) lbPrev.addEventListener('click',e=>{e.stopPropagation();navLB(-1);});
if(lbNext) lbNext.addEventListener('click',e=>{e.stopPropagation();navLB(1);});
if(lb)lb.addEventListener('click',e=>{if(e.target===lb)closeLB();});
document.addEventListener('keydown',e=>{
  if(!lb?.classList.contains('open'))return;
  if(e.key==='Escape')closeLB();
  if(e.key==='ArrowLeft')navLB(-1);
  if(e.key==='ArrowRight')navLB(1);
});
let tx=0;
if(lb){
  lb.addEventListener('touchstart',e=>{tx=e.touches[0].clientX;},{passive:true});
  lb.addEventListener('touchend',e=>{const d=tx-e.changedTouches[0].clientX;if(Math.abs(d)>50)navLB(d>0?1:-1);});
}

window.addEventListener('load',()=>window.dispatchEvent(new Event('scroll')));