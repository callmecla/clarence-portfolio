'use strict';
var H=document.documentElement;

/* ── THEME ── */
document.getElementById('tg').addEventListener('click',function(){
  var n=H.getAttribute('data-theme')==='dark'?'light':'dark';
  H.setAttribute('data-theme',n);
  localStorage.setItem('pt',n);
});

/* ── CANVAS ── */
(function(){
  var c=document.getElementById('cv'),x=c.getContext('2d'),W,H2,pts=[],raf,N=window.innerWidth<600?35:70;
  function rs(){W=c.width=window.innerWidth;H2=c.height=window.innerHeight;}
  function mk(){return{x:Math.random()*W,y:Math.random()*H2,vx:(Math.random()-.5)*.3,vy:(Math.random()-.5)*.3,l:Math.random()};}
  function cl(){return H.getAttribute('data-theme')==='light'?'61,122,0,':'200,244,104,';}
  function dr(){
    x.clearRect(0,0,W,H2);var c2=cl();
    for(var i=0;i<pts.length;i++){var p=pts[i];p.x+=p.vx;p.y+=p.vy;p.l=(p.l+.002)%1;
      if(p.x<-2)p.x=W+2;if(p.x>W+2)p.x=-2;if(p.y<-2)p.y=H2+2;if(p.y>H2+2)p.y=-2;
      x.beginPath();x.arc(p.x,p.y,.9,0,Math.PI*2);x.fillStyle='rgba('+c2+(Math.sin(p.l*Math.PI)*.5)+')';x.fill();}
    for(var i=0;i<pts.length;i++)for(var j=i+1;j<pts.length;j++){
      var dx=pts[i].x-pts[j].x,dy=pts[i].y-pts[j].y,d=Math.sqrt(dx*dx+dy*dy);
      if(d<110){x.beginPath();x.moveTo(pts[i].x,pts[i].y);x.lineTo(pts[j].x,pts[j].y);
        x.strokeStyle='rgba('+c2+((1-d/110)*.07)+')';x.lineWidth=.5;x.stroke();}}
    raf=requestAnimationFrame(dr);}
  rs();for(var i=0;i<N;i++)pts.push(mk());dr();
  window.addEventListener('resize',function(){cancelAnimationFrame(raf);rs();pts=[];for(var i=0;i<N;i++)pts.push(mk());dr();});
})();

/* ── CURSOR ── */
(function(){
  var dot=document.getElementById('cd'),ring=document.getElementById('cr');
  if(!window.matchMedia('(hover:hover) and (pointer:fine)').matches){dot.style.display='none';ring.style.display='none';return;}
  var mx=0,my=0,rx=0,ry=0,on=false;
  dot.style.transition='opacity .15s';
  ring.style.transition='width .3s cubic-bezier(.16,1,.3,1),height .3s cubic-bezier(.16,1,.3,1),border-color .3s,opacity .15s';
  document.addEventListener('mousemove',function(e){
    mx=e.clientX;my=e.clientY;
    if(!on){rx=mx;ry=my;on=true;document.body.classList.add('hc');dot.style.opacity='1';ring.style.opacity='.6';}
    dot.style.left=mx+'px';dot.style.top=my+'px';
  });
  document.addEventListener('mouseleave',function(){dot.style.opacity='0';ring.style.opacity='0';});
  document.addEventListener('mouseenter',function(){if(on){dot.style.opacity='1';ring.style.opacity='.6';}});
  (function lp(){rx+=(mx-rx)*.12;ry+=(my-ry)*.12;ring.style.left=rx+'px';ring.style.top=ry+'px';requestAnimationFrame(lp);})();
  var S='a,button,label,[data-tilt],.pill,.tag,.badge,.cc,.pc,.sc2,.sl3,.tt';
  document.addEventListener('mouseover',function(e){if(e.target.closest(S)){ring.style.width='52px';ring.style.height='52px';ring.style.borderColor='var(--a2)';ring.style.opacity='.9';}});
  document.addEventListener('mouseout',function(e){if(e.target.closest(S)){ring.style.width='34px';ring.style.height='34px';ring.style.borderColor='var(--ac)';ring.style.opacity='.6';}});
})();

/* ── NAV ── */
(function(){
  var nv=document.getElementById('nv'),links=document.querySelectorAll('.na');
  window.addEventListener('scroll',function(){nv.classList.toggle('sc',window.scrollY>40);},{passive:true});
  nv.classList.toggle('sc',window.scrollY>40);
  var io=new IntersectionObserver(function(e){e.forEach(function(e){if(e.isIntersecting)links.forEach(function(a){a.classList.toggle('on',a.getAttribute('href')==='#'+e.target.id);});});},{rootMargin:'-40% 0px -55% 0px'});
  document.querySelectorAll('section[id]').forEach(function(s){io.observe(s);});
})();

/* ── MOBILE NAV ── */
(function(){
  var hb=document.getElementById('hb'),mo=document.getElementById('mo');
  document.querySelectorAll('#nls .na').forEach(function(l){var c=l.cloneNode(true);c.style.fontSize='1rem';mo.appendChild(c);});
  function tg(o){hb.classList.toggle('op',o);hb.setAttribute('aria-expanded',o);mo.classList.toggle('op',o);document.body.style.overflow=o?'hidden':'';}
  hb.addEventListener('click',function(){tg(!mo.classList.contains('op'));});
  mo.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){tg(false);});});
  mo.addEventListener('click',function(e){if(e.target===mo)tg(false);});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')tg(false);});
})();

/* ── REVEAL ── */
(function(){
  try{
    var els=document.querySelectorAll('.rv');
    document.body.classList.add('jr');
    var io=new IntersectionObserver(function(e){e.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{threshold:.08,rootMargin:'0px 0px -40px 0px'});
    els.forEach(function(el){io.observe(el);});
    setTimeout(function(){document.querySelectorAll('.rv:not(.in)').forEach(function(el){el.classList.add('in');});},1500);
  }catch(e){document.body.classList.remove('jr');}
})();

/* ── COUNTERS ── */
(function(){
  var els=document.querySelectorAll('.sn2[data-t]');
  var io=new IntersectionObserver(function(e){e.forEach(function(e){if(!e.isIntersecting)return;var el=e.target,t=+el.dataset.t,d=1400,t0=performance.now();(function tk(n){var p=Math.min((n-t0)/d,1);el.textContent=Math.round((1-Math.pow(1-p,4))*t);if(p<1)requestAnimationFrame(tk);}(performance.now()));io.unobserve(el);});},{threshold:.5});
  els.forEach(function(el){io.observe(el);});
})();

/* ── SKILL BARS ── */
(function(){
  var sec=document.getElementById('skills');
  var fills=sec.querySelectorAll('.skf[data-w]');
  new IntersectionObserver(function(e){e.forEach(function(e){if(!e.isIntersecting)return;fills.forEach(function(f,i){setTimeout(function(){f.style.width=f.dataset.w+'%';},i*70);});});},{threshold:.2}).observe(sec);
})();

/* ── TILT ── */
(function(){
  if(!window.matchMedia('(hover:hover)').matches)return;
  document.querySelectorAll('[data-tilt]').forEach(function(c){
    var g=c.querySelector('.pg2');
    c.addEventListener('mousemove',function(e){var r=c.getBoundingClientRect(),cx=(e.clientX-r.left)/r.width,cy=(e.clientY-r.top)/r.height;c.style.transform='perspective(700px) rotateX('+((cy-.5)*-8)+'deg) rotateY('+((cx-.5)*8)+'deg) translateZ(4px)';c.style.transition='transform .1s linear';if(g){g.style.setProperty('--mx2',(cx*100)+'%');g.style.setProperty('--my',(cy*100)+'%');}});
    c.addEventListener('mouseleave',function(){c.style.transform='';c.style.transition='transform .6s cubic-bezier(.16,1,.3,1)';});
  });
})();

/* ── PHOTO UPLOAD ── */
(function(){
  var inp=document.getElementById('phu'),img=document.getElementById('pi');
  inp.addEventListener('change',function(e){var f=e.target.files&&e.target.files[0];if(!f||!f.type.startsWith('image/'))return;var r=new FileReader();r.onload=function(ev){img.src=ev.target.result;};r.readAsDataURL(f);});
})();

/* ── EMAILJS CONTACT FORM ──
   Setup: https://emailjs.com
   1. Create account → Add Email Service → copy SERVICE_ID
   2. Create Template with: {{from_name}} {{from_email}} {{subject}} {{message}} {{to_name}}
      → copy TEMPLATE_ID
   3. Account → General → copy PUBLIC_KEY
   4. Paste below ↓
*/
(function(){
  var PK='YOUR_PUBLIC_KEY', SI='YOUR_SERVICE_ID', TI='YOUR_TEMPLATE_ID', YN='Clarence Flores';
  if(typeof emailjs!=='undefined')emailjs.init({publicKey:PK});
  var form=document.getElementById('cf'),btn=document.getElementById('cfb'),lbl=document.getElementById('cbl'),spin=document.getElementById('cs'),ok=document.getElementById('cok'),err=document.getElementById('cer');
  function load(on){btn.disabled=on;lbl.textContent=on?'Sending…':'Send Message';spin.style.display=on?'inline-block':'none';}
  function show(el){el.style.display='block';setTimeout(function(){el.style.display='none';},6000);}
  function shake(el){el.style.animation='none';el.getBoundingClientRect();el.style.animation='shake .4s ease';el.addEventListener('animationend',function(){el.style.animation='';},{once:true});el.focus();}
  form.addEventListener('submit',function(e){
    e.preventDefault();ok.style.display='none';err.style.display='none';
    var n=form.querySelector('#cfn').value.trim(),em=form.querySelector('#cfe').value.trim(),m=form.querySelector('#cfm').value.trim(),re=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!n){shake(form.querySelector('#cfn'));return;}
    if(!re.test(em)){shake(form.querySelector('#cfe'));return;}
    if(!m){shake(form.querySelector('#cfm'));return;}
    if(PK==='YOUR_PUBLIC_KEY'){load(true);setTimeout(function(){load(false);form.reset();show(ok);},1200);return;}
    load(true);
    emailjs.send(SI,TI,{to_name:YN,from_name:n,from_email:em,subject:form.querySelector('#cfs').value.trim()||'(no subject)',message:m,reply_to:em}).then(function(){load(false);form.reset();show(ok);},function(e2){console.error(e2);load(false);show(err);});
  });
})();
