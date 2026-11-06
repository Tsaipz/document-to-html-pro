(()=>{'use strict';
const $=id=>document.getElementById(id);
const $$=(sel,root=document)=>[...root.querySelectorAll(sel)];
let sourceMode='paste';
function switchSource(mode){
 if(!['paste','file','batch'].includes(mode))return;
 sourceMode=mode;
 $$('.source-choice').forEach(btn=>{const on=btn.dataset.source===mode;btn.classList.toggle('active',on);btn.setAttribute('aria-pressed',String(on));});
 $$('.source-panel').forEach(panel=>panel.classList.toggle('hidden',panel.dataset.sourcePanel!==mode));
}
function onTab(tab){
 const checking=['audit','seo'].includes(tab);
 $('reviewEmpty').classList.toggle('hidden',checking);
}
window.WZWWorkflow={switchSource,onTab};
function init(){
 $$('[data-source]').forEach(btn=>btn.addEventListener('click',()=>switchSource(btn.dataset.source)));
 $$('[data-jump]').forEach(btn=>btn.addEventListener('click',()=>$(btn.dataset.jump)?.scrollIntoView({behavior:'instant',block:'start'})));
 $$('[data-open-tab]').forEach(btn=>btn.addEventListener('click',()=>window.WZWCore?.tab(btn.dataset.openTab)));
 // Selecting a template updates the original dropdown; the conversion engine remains unchanged.
 const templates=[
 ['simple','簡約商務','#287d7a','#edf5f3','企業內容'],['medical','醫療衛教','#27849a','#eef7fa','診所衛教'],
 ['brand','品牌形象','#a37462','#faf0ea','品牌故事'],['news','最新消息','#455a73','#eef1f6','消息公告'],
 ['editorial','雜誌專欄','#493f3e','#f4efec','長篇文章'],['minimal','日系留白','#66715a','#f4f4ee','輕量排版'],
 ['product','產品介紹','#9a7042','#faf4e8','商品服務'],['warm','暖色生活','#af6b70','#fcf1f0','生活品牌'],
 ['contrast','資訊整理','#263b66','#e9eef9','比較表格'],['classic','經典公告','#5b5151','#f2f0ef','正式公告']];
 const gal=$('templateGallery'),theme=$('theme');
 for(const [id,label,col,tint,tip] of templates){
  const btn=document.createElement('button');btn.type='button';btn.className='template-card';btn.dataset.theme=id;
  const sample=document.createElement('span');sample.className='template-preview';sample.style.setProperty('--accent',col);sample.style.setProperty('--tint',tint);
  sample.innerHTML='<i></i><span></span><span></span>';
  const n=document.createElement('b');n.textContent=label;const note=document.createElement('small');note.textContent=tip;
  btn.append(sample,n,note);btn.addEventListener('click',()=>{theme.value=id;theme.dispatchEvent(new Event('change',{bubbles:true}));refreshTemplates();});gal.append(btn);
 }
 function refreshTemplates(){$$('.template-card',gal).forEach(b=>{let yes=b.dataset.theme===theme.value;b.classList.toggle('active',yes);b.setAttribute('aria-pressed',String(yes));});}
 theme.addEventListener('change',refreshTemplates);refreshTemplates();
 // Nav stays visible and indicates the current scroll section.
 const items=$$('.progress-item');
 const observed=$$('.flow-section');
 if('IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>{const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top);if(!visible.length)return;items.forEach(a=>a.classList.toggle('is-current',a.getAttribute('href')==='#'+visible[0].target.id));},{rootMargin:'-8% 0px -72% 0px',threshold:0});
  observed.forEach(x=>observer.observe(x));
 }
 switchSource('paste');$('reviewEmpty').classList.remove('hidden');
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();