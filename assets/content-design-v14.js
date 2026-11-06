/* 文轉網 PRO V14 — section, image, and CTA presets. Export HTML always inline-only. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const all=(selector,root=document)=>Array.from(root.querySelectorAll(selector));
const LAYOUTS=[
 {id:'reading',name:'清爽閱讀',hint:'均衡留白、段落清楚'},
 {id:'divider',name:'章節分隔',hint:'細線分隔主要標題'},
 {id:'sidebar',name:'色條標題',hint:'主色左線引導閱讀'},
 {id:'highlight',name:'淡底標題',hint:'重點區塊更清楚'},
 {id:'center',name:'雜誌置中',hint:'置中標題、優雅留白'},
 {id:'editorial',name:'編輯專欄',hint:'較大標題及引言'}
];
const IMAGES=[
 {id:'fluid',name:'自適滿寬',hint:'隨容器縮放'},
 {id:'center',name:'置中展示',hint:'適合單張重點圖'},
 {id:'compact',name:'半幅配圖',hint:'文章插圖'},
 {id:'border',name:'極細相框',hint:'低調線條'},
 {id:'mat',name:'留白相片框',hint:'圖片周圍留白'},
 {id:'bottom',name:'底線展示',hint:'簡約形象圖'}
];
const CTAS=[
 {id:'solid',name:'品牌實心',hint:'醒目主按鈕'},
 {id:'outline',name:'線框簡約',hint:'優雅輕量導流'},
 {id:'dark',name:'深色商務',hint:'沉穩對比'},
 {id:'soft',name:'柔和提示',hint:'淡色底區塊'},
 {id:'banner',name:'整幅色帶',hint:'明確行動區'},
 {id:'editorial',name:'專欄導流',hint:'底線與文字鏈結'}
];
const ownedHeading=['border','border-top','border-bottom','border-left','background-color','padding','padding-top','padding-bottom','padding-left','padding-right','text-align','letter-spacing','margin-top','margin-bottom'];
const ownedImage=['display','width','max-width','height','margin','margin-top','margin-bottom','padding','border','border-top','border-bottom','background-color','box-sizing'];
const ownedCTA=['border','border-top','border-bottom','border-left','border-right','background-color','padding','margin','margin-top','margin-bottom','text-align','color','font-size','font-weight','line-height','display','width','max-width','box-sizing','letter-spacing','text-decoration'];
const read=(id,fallback)=>$(id)?.value||fallback;
const validColor=(v,fallback)=>/^#[a-f\d]{6}$/i.test(v||'')?v:fallback;
const colorParts=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
const blend=(hex,strength=.92)=>'#'+colorParts(hex).map(v=>Math.round(v+(255-v)*strength).toString(16).padStart(2,'0')).join('');
const number=(id,min,max,fallback)=>{const x=Number($(id)?.value);return Number.isFinite(x)?Math.max(min,Math.min(max,x)):fallback;};
function style(el,updates,reset=[]){
 if(!el)return;
 for(const k of reset)el.style.removeProperty(k);
 for(const [k,v] of Object.entries(updates))if(v!==undefined&&v!==null&&v!=='')el.style.setProperty(k,String(v));
 if(!el.style.length)el.removeAttribute('style');
}
function options(){
 const accent=validColor(read('accent','#287d7a'),'#287d7a');
 return {
  layout:read('layoutPreset','reading'),image:read('imagePreset','fluid'),cta:read('ctaPreset','solid'),
  accent,ctaColor:validColor(read('ctaColor',accent),accent),
  sectionGap:number('sectionGap',12,66,26),
  headingScale:number('headingScale',16,44,26),
  imageWidth:number('imageWidth',30,100,100),
  imageGap:number('imageGap',0,54,18),
  imageBorder:validColor(read('imageBorder','#dce5df'),'#dce5df'),
  ctaSpace:number('ctaSpace',8,72,26),
  ctaAlign:read('ctaAlign','center')
 };
}
function inCTA(el){return Boolean(el.closest('section[title="文轉網CTA"]'));}
function applyLayout(root,o=options()){
 const titles=all('h2,h3',root).filter(x=>!inCTA(x));
 titles.forEach((el,i)=>{
  const isH2=el.tagName==='H2';
  let changes={'margin-top':(isH2?o.sectionGap:o.sectionGap*.65)+'px','margin-bottom':isH2?'16px':'10px',
   'font-size':(isH2?o.headingScale:Math.max(16,o.headingScale-5))+'px'};
  if(o.layout==='divider'&&isH2)Object.assign(changes,{'border-bottom':'1px solid '+o.imageBorder,'padding-bottom':'12px'});
  if(o.layout==='sidebar'&&isH2)Object.assign(changes,{'border-left':'4px solid '+o.accent,'padding-left':'14px'});
  if(o.layout==='highlight'&&isH2)Object.assign(changes,{'background-color':blend(o.accent,.91),'padding':'13px 16px'});
  if(o.layout==='center'&&isH2)Object.assign(changes,{'text-align':'center','letter-spacing':'1px','border-bottom':'1px solid '+o.imageBorder,'padding-bottom':'13px'});
  if(o.layout==='editorial'&&isH2)Object.assign(changes,{'font-size':(o.headingScale+2)+'px','letter-spacing':'.6px','border-bottom':'2px solid '+o.accent,'padding-bottom':'10px'});
  style(el,changes,ownedHeading);
 });
 all('blockquote',root).filter(x=>!inCTA(x)).forEach(q=>{
  if(o.layout==='editorial'||o.layout==='highlight')style(q,{'background-color':blend(o.accent,.95),'padding':'13px 18px','border-left':'3px solid '+o.accent},['background-color','padding','border-left']);
 });
}
function applyImages(root,o=options()){
 all('img',root).filter(x=>!inCTA(x)).forEach(img=>{
  let w=o.imageWidth;
  if(o.image==='center')w=Math.min(w,82);
  if(o.image==='compact')w=Math.min(w,56);
  const changes={display:'block',width:w+'%','max-width':'100%',height:'auto',margin:o.imageGap+'px auto', 'box-sizing':'border-box'};
  if(o.image==='border')changes.border='1px solid '+o.imageBorder;
  if(o.image==='mat'){changes.border='1px solid '+o.imageBorder;changes.padding='10px';changes['background-color']='#ffffff';}
  if(o.image==='bottom')changes['border-bottom']='3px solid '+o.accent;
  style(img,changes,ownedImage);
 });
 all('figcaption',root).forEach(c=>style(c,{'font-size':'13px',color:'#72817a','text-align':'center',margin:'9px 0 19px'},['font-size','color','text-align','margin']));
}
function applyCTAs(root,o=options()){
 all('section[title="文轉網CTA"]',root).forEach(sec=>{
  const bg=blend(o.ctaColor,.91);
  let box={margin:o.ctaSpace+'px 0',padding:'22px 24px','text-align':o.ctaAlign,'box-sizing':'border-box','max-width':'100%'};
  if(o.cta==='solid')Object.assign(box,{'border-top':'2px solid '+o.ctaColor,'background-color':'#f8faf9'});
  if(o.cta==='outline')Object.assign(box,{border:'1px solid '+o.imageBorder,'background-color':'#ffffff'});
  if(o.cta==='dark')Object.assign(box,{'background-color':'#283b38',color:'#ffffff'});
  if(o.cta==='soft')Object.assign(box,{'background-color':bg,'border-left':'4px solid '+o.ctaColor});
  if(o.cta==='banner')Object.assign(box,{'background-color':o.ctaColor,color:'#ffffff',padding:'27px 24px'});
  if(o.cta==='editorial')Object.assign(box,{'border-top':'1px solid '+o.ctaColor,'border-bottom':'1px solid '+o.imageBorder});
  style(sec,box,ownedCTA);
  const title=sec.querySelector('h2,h3');
  const desc=sec.querySelector('p');
  const anchor=sec.querySelector('a[href]');
  const inverted=o.cta==='dark'||o.cta==='banner';
  style(title,{'font-size':'22px','font-weight':'700','line-height':'1.5','margin':'0 0 9px',color:inverted?'#ffffff':'#293f38'},ownedCTA);
  style(desc,{'font-size':'15px','line-height':'1.8','margin':'0 0 17px',color:inverted?'#ffffff':'#566a61'},ownedCTA);
  if(anchor){
   let btn={display:'inline-block','font-size':'15px','font-weight':'700',padding:'10px 23px','text-decoration':'none','line-height':'1.7','text-align':'center',border:'1px solid '+o.ctaColor,'background-color':o.ctaColor,color:'#ffffff'};
   if(o.cta==='outline'){btn['background-color']='#ffffff';btn.color=o.ctaColor;}
   if(o.cta==='dark'){btn['background-color']='#ffffff';btn.border='1px solid #ffffff';btn.color='#283b38';}
   if(o.cta==='banner'){btn['background-color']='#ffffff';btn.border='1px solid #ffffff';btn.color=o.ctaColor;}
   if(o.cta==='editorial'){btn['background-color']='transparent';btn.color=o.ctaColor;btn.border='0';btn['border-bottom']='1px solid '+o.ctaColor;btn.padding='8px 5px';}
   style(anchor,btn,ownedCTA);
  }
 });
}
function applyAll(root){const o=options();applyLayout(root,o);applyImages(root,o);applyCTAs(root,o);return root;}
function gallery(data,id,selectId,group){
 const el=$(id),sel=$(selectId);if(!el||!sel)return;
 data.forEach((preset,i)=>{
  const b=document.createElement('button');b.type='button';b.className='design-preset';b.dataset.preset=preset.id;b.setAttribute('aria-pressed','false');
  const visual=document.createElement('span');visual.className='design-thumb design-thumb-'+group+' design-'+group+'-'+preset.id;visual.setAttribute('aria-hidden','true');
  if(group==='layout')visual.innerHTML='<i></i><b></b><em></em><b></b><em></em>';
  else if(group==='image')visual.innerHTML='<i></i><span><b></b><em></em></span>';
  else visual.innerHTML='<i></i><b></b><em></em>';
  const label=document.createElement('strong');label.textContent=preset.name;
  const note=document.createElement('small');note.textContent=preset.hint;
  b.append(visual,label,note);
  b.addEventListener('click',()=>{sel.value=preset.id;sel.dispatchEvent(new Event('change',{bubbles:true}));});el.append(b);
 });
 const reflect=()=>all('.design-preset',el).forEach(b=>{const selected=b.dataset.preset===sel.value;b.classList.toggle('active',selected);b.setAttribute('aria-pressed',String(selected));});
 sel.addEventListener('change',reflect);reflect();
}
const validLink=(str)=>{
 try{
  const raw=str.trim();
  if(/^https?:\/\//i.test(raw)){const u=new URL(raw);return ['http:','https:'].includes(u.protocol)?raw:null;}
  if(/^mailto:[^\s@]+@[^\s@]+$/i.test(raw)||/^tel:\+?[\d\s()-]+$/i.test(raw))return raw;
  if(/^\/(?!\/)[a-zA-Z0-9%_?=&/#.~-]*$/.test(raw)||/^#[a-zA-Z0-9_-]+$/.test(raw))return raw;
 }catch{}
 return null;
};
function makeCTA(){
 const link=validLink(read('ctaUrl',''));
 if(!link)throw Error('請輸入有效的 CTA 連結（https://、站內 / 路徑或 #錨點）。');
 const button=read('ctaButtonText','').trim();if(!button)throw Error('請輸入按鈕文字。');
 const sec=document.createElement('section');sec.setAttribute('title','文轉網CTA');
 const heading=read('ctaTitle','').trim(),desc=read('ctaDescription','').trim();
 if(heading){const h=document.createElement('h3');h.textContent=heading;sec.append(h);}
 if(desc){const p=document.createElement('p');p.textContent=desc;sec.append(p);}
 const a=document.createElement('a');a.textContent=button;a.setAttribute('href',link);
 if($('ctaNewTab')?.checked&&/^https?:\/\//.test(link)){a.target='_blank';a.rel='noopener noreferrer';}
 sec.append(a);applyCTAs(sec.parentElement||wrapNode(sec));
 return sec;
}
function wrapNode(n){const d=document.createElement('div');d.append(n);return d;}
function requestUpdate(handler,success,allowBlank=false){
 const core=window.WZWCore;
 if(!core?.updateContent)return window.alert('編輯核心尚未完成載入，請重新整理頁面。');
 try{core.updateContent(root=>handler(root),success,allowBlank);}catch(e){core.report('操作失敗：'+e.message);}
}
function applyDesignOnly(){
 requestUpdate(root=>applyAll(root),'已套用文章排版、圖片及 CTA 樣式。其他文字內容不變。');
}
function addCTA(updateExisting=false){
 requestUpdate(root=>{
  const newBlock=makeCTA();
  const prior=all('section[title="文轉網CTA"]',root);
  if(updateExisting){if(!prior.length)throw Error('文章內還沒有 CTA，請先點「插入 CTA 區塊」。');prior[prior.length-1].replaceWith(newBlock);}
  else{
   let target=root;
   if(root.children.length===1&&root.firstElementChild?.tagName==='DIV')target=root.firstElementChild;
   if(read('ctaPosition','bottom')==='top')target.prepend(newBlock);else target.append(newBlock);
  }
 },updateExisting?'已更新最後一個 CTA 區塊。':'已插入 CTA 區塊，可在預覽或 HTML 原始碼中檢查。',true);
}
function removeCTA(){requestUpdate(root=>{
 const items=all('section[title="文轉網CTA"]',root);
 if(!items.length)throw Error('文章中沒有可移除的 CTA。');items[items.length-1].remove();
 },'已移除最後一個 CTA 區塊。');}
function init(){
 gallery(LAYOUTS,'layoutGallery','layoutPreset','layout');
 gallery(IMAGES,'imageGallery','imagePreset','image');
 gallery(CTAS,'ctaGallery','ctaPreset','cta');
 $('applyDesignOnly')?.addEventListener('click',applyDesignOnly);
 $('ctaInsert')?.addEventListener('click',()=>addCTA(false));
 $('ctaUpdate')?.addEventListener('click',()=>addCTA(true));
 $('ctaRemove')?.addEventListener('click',removeCTA);
 const onChange=()=>{const o=options();const color=$('designStudio');if(color)color.style.setProperty('--design-accent',o.accent);};
 $('accent')?.addEventListener('input',onChange);$('ctaColor')?.addEventListener('input',onChange);onChange();
}
window.WZWDesign={applyAll,applyLayout,applyImages,applyCTAs,options};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
