'use strict';
const posts=window.OFTALMOS_POSTS;
let month='all',format='todos',lastFocus=null,toastTimer;
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const months={'10':'Outubro','11':'Novembro',all:'Todo o período'};
const shortDate=p=>p.date.slice(8)+'/'+p.date.slice(5,7);
const inMonth=p=>month==='all'||p.date.slice(5,7)===month;
const temArte=p=>Boolean(p.image);
const cardPendente=p=>p.format==='card'&&!p.image;
function brief(label,text,main=false){return `<div class="brief-section"><div class="brief-lbl">${esc(label)}</div><div class="${main?'brief-main':'brief-text'}">${esc(text)}</div></div>`;}
function render(){
 const selected=posts.filter(inMonth),visible=selected.filter(p=>format==='todos'||p.format===format);
 $('#content-heading').textContent=`${visible.length} ${visible.length===1?'publicação':'publicações'} · ${months[month]}`;
 for(const f of ['all','card','reel'])$('#count-'+f).textContent=selected.filter(p=>f==='all'||p.format===f).length;
 $('#feed-grid').innerHTML=[...selected].reverse().map(p=>{
  if(temArte(p))return `<button class="cell" data-lightbox="${p.id}" aria-label="Ampliar ${esc(p.title)}"><img src="${p.image}" alt="${esc(p.h1)}" loading="lazy" width="1080" height="1350"></button>`;
  if(cardPendente(p))return `<button class="cell pend" data-open-post="${p.id}" aria-label="Ver copy: ${esc(p.title)}"><span>${esc(p.title)}</span><span class="feed-date">${shortDate(p)} · Arte em produção</span></button>`;
  if(p.thumb)return `<button class="cell cell-video" data-open-post="${p.id}" aria-label="Ver roteiro: ${esc(p.title)}"><img src="${p.thumb}" alt="Prévia do vídeo: ${esc(p.title)}" loading="lazy" width="1080" height="1350"><span class="cell-play" aria-hidden="true">▷</span></button>`;
  return `<button class="cell reel" data-open-post="${p.id}" aria-label="Ver roteiro: ${esc(p.title)}"><span class="feed-play" aria-hidden="true">▷</span><span>${esc(p.title)}</span><span class="feed-date">${shortDate(p)} · A produzir</span></button>`;
 }).join('');
 $('#post-grid').innerHTML=visible.map(p=>{
  let topo;
  if(temArte(p))topo=`<button class="thumb" data-lightbox="${p.id}" aria-label="Ampliar arte: ${esc(p.title)}"><img src="${p.image}" alt="${esc(p.h1)}" loading="lazy" width="1080" height="1350"><span class="badge">Card · ${shortDate(p)}</span></button>`;
  else if(cardPendente(p))topo=`<div class="thumb card-pend"><span class="pend-eyebrow">CARD · ${shortDate(p)}</span><div class="pend-title">${esc(p.h1||p.title)}</div><div class="pend-state">Copy aprovada<br>Arte em produção</div></div>`;
  else if(p.thumb)topo=`<div class="thumb thumb-video"><img src="${p.thumb}" alt="Prévia do vídeo: ${esc(p.title)}" loading="lazy" width="1080" height="1350"></div>`;
  else topo=`<div class="thumb reel-th"><span class="video-eyebrow">VÍDEO · ${shortDate(p)}</span><span class="video-icon" aria-hidden="true">▷</span><div class="video-title">${esc(p.title)}</div><div class="video-state">${esc(p.status)}</div></div>`;
  const ponto=temArte(p)?'status-dot':(cardPendente(p)?'pend-dot':'video-dot');
  return `<article class="pcard" id="post-${p.id}" data-format="${p.format}">${topo}<div class="cbody"><div class="pnum">${p.id} · ${shortDate(p)} · ${esc(p.pillar)}</div><h3 class="ptitle">${esc(p.h1||p.title)}</h3><p class="pganche">${esc(p.h2||p.objective)}</p><div class="post-status"><i class="${ponto}"></i>${esc(p.status)}</div></div><details class="brief"><summary>${p.format==='card'?'Ver copy e legenda':'Ver roteiro e legenda'}</summary><div class="brief-content">${p.h1?brief('Headline · H1',p.h1,true)+brief('Apoio · H2',p.h2):''}${p.objective?brief('Objetivo',p.objective):''}${p.script?brief('Roteiro',p.script):''}${p.screen?brief('Textos na tela',p.screen.join('\n')):''}${p.visual?brief('Direção visual',p.visual):''}${p.thumb_nota?brief('Sobre a prévia',p.thumb_nota):''}${brief('Legenda · Instagram',p.caption||'Legenda ainda não produzida.')}${p.notice?brief('Aviso em tela',p.notice):''}<div class="card-actions">${p.caption?`<button data-copy="${p.id}">Copiar legenda</button>`:''}${p.image?`<a href="${p.image}" download="OFTALMOS_${p.date}_${p.id}.png">Baixar card ↓</a>`:''}</div></div></details></article>`;
 }).join('');
 renderCalendar();
}
function renderCalendar(){
 $('#calendar-grid').innerHTML=(month==='all'?['10','11']:[month]).map(m=>{
 const last=new Date(2026,Number(m),0).getDate(),offset=(new Date(2026,Number(m)-1,1).getDay()+6)%7;
 let cells=Array.from({length:offset},()=>'<div class="day blank" aria-hidden="true"></div>');
 for(let n=1;n<=last;n++){
  const date=`2026-${m}-${String(n).padStart(2,'0')}`,items=posts.filter(p=>p.date===date);
  cells.push(`<div class="day ${items.length?'has-post':''}"><span class="day-number">${n}</span>${items.map(p=>`<button class="calendar-post ${p.format==='reel'?'video':''}" data-open-post="${p.id}" aria-label="${shortDate(p)}: ${esc(p.title)}, ${esc(p.status)}"><b>${p.id} · ${p.format==='card'?'CARD':'VÍDEO'}</b>${esc(p.title)}</button>`).join('')}</div>`);
 }
 while(cells.length%7)cells.push('<div class="day blank" aria-hidden="true"></div>');
 return `<div class="calendar-month"><h3>${months[m]} <span>2026</span></h3><div class="weekdays">${['SEG','TER','QUA','QUI','SEX','SÁB','DOM'].map(t=>`<span>${t}</span>`).join('')}</div><div class="days">${cells.join('')}</div></div>`;
 }).join('');
}
function selectMonth(m){month=m;format='todos';$$('[data-month]').forEach(b=>{b.classList.toggle('active',b.dataset.month===m);b.setAttribute('aria-pressed',b.dataset.month===m);});setFilterState();render();document.title=`Oftalmos Day Hospital · Calendário editorial · ${months[m]} 2026`;}
function setFilterState(){$$('.filter-btn').forEach(b=>{const on=b.dataset.format===format;b.classList.toggle('active',on);b.setAttribute('aria-pressed',on);});}
function openPost(id){const p=posts.find(p=>p.id===id);if(!p)return;if(!inMonth(p)){selectMonth(p.date.slice(5,7));}else if(format!=='todos'&&format!==p.format){format='todos';setFilterState();render();}const article=$('#post-'+id);article.querySelector('details').open=true;article.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});article.querySelector('summary').focus({preventScroll:true});}
function lightbox(id){const p=posts.find(p=>p.id===id);if(!p?.image)return;lastFocus=document.activeElement;$('#lightbox-image').src=p.image;$('#lightbox-image').alt=p.h1;$('#lightbox-title').textContent=shortDate(p)+' · '+p.title;$('#lightbox-download').href=p.image;$('#lightbox-download').download=`OFTALMOS_${p.date}_${p.id}.png`;$('#lightbox').showModal();document.body.classList.add('modal-open');}
function toast(text){$('#toast').textContent=text;$('#toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),2500);}
async function copyCaption(id){const text=posts.find(p=>p.id===id).caption;try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(text);}else{const t=document.createElement('textarea');t.value=text;t.style.position='fixed';t.style.opacity='0';document.body.append(t);t.select();const success=document.execCommand('copy');t.remove();if(!success)throw new Error('copy failed');}toast('Legenda copiada.');}catch{toast('Selecione e copie o texto da legenda.');}}
document.addEventListener('click',e=>{const monthButton=e.target.closest('[data-month]');if(monthButton){selectMonth(monthButton.dataset.month);return;}const formatButton=e.target.closest('.filter-btn');if(formatButton){format=formatButton.dataset.format;setFilterState();render();return;}const preview=e.target.closest('[data-lightbox]');if(preview){lightbox(preview.dataset.lightbox);return;}const jump=e.target.closest('[data-open-post]');if(jump){openPost(jump.dataset.openPost);return;}const copy=e.target.closest('[data-copy]');if(copy)copyCaption(copy.dataset.copy);});
$('#close-lightbox').addEventListener('click',()=>$('#lightbox').close());
$('#lightbox').addEventListener('click',e=>{if(e.target===$('#lightbox')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});
$('#lightbox').addEventListener('close',()=>{document.body.classList.remove('modal-open');lastFocus?.focus();});
$('.nav-burger').addEventListener('click',()=>{const open=$('#menu').classList.toggle('menu-open');$('.nav-burger').setAttribute('aria-expanded',open);});
$$('#menu a').forEach(a=>a.addEventListener('click',()=>{$('#menu').classList.remove('menu-open');$('.nav-burger').setAttribute('aria-expanded','false');}));
render();
