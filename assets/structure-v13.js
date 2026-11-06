/* 文轉網 PRO V13: table/list presets — emitted article HTML uses inline styles only. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const $$=(sel,root=document)=>Array.from(root.querySelectorAll(sel));
const TABLES=[
 {id:'grid',name:'標準格線',note:'完整框線',type:'grid'},
 {id:'stripe',name:'交錯底色',note:'長表易閱讀',type:'stripe'},
 {id:'minimal',name:'極簡橫線',note:'文章與公告',type:'minimal'},
 {id:'dark',name:'深色表頭',note:'比較與報表',type:'dark'},
 {id:'spec',name:'規格資料',note:'產品型錄',type:'spec'},
 {id:'clean',name:'無框留白',note:'精簡內容',type:'clean'}
];
const LISTS=[
 {id:'bullet',name:'標準圓點',note:'基本條列',type:'bullet'},
 {id:'square',name:'方塊條列',note:'服務特色',type:'square'},
 {id:'numbered',name:'步驟編號',note:'流程說明',type:'numbered'},
 {id:'accent',name:'重點色條',note:'注意事項',type:'accent'},
 {id:'separated',name:'分隔清單',note:'服務項目',type:'separated'},
 {id:'compact',name:'緊湊條列',note:'短篇摘要',type:'compact'}
];
const PROP_TABLE=['width','max-width','margin','border','border-collapse','border-spacing','min-width'];
const PROP_CELL=['border','border-top','border-bottom','border-left','border-right','background-color','color','padding','text-align','vertical-align','font-weight'];
const PROP_LIST=['list-style-type','list-style-position','padding','padding-left','margin','margin-bottom','color'];
const PROP_LI=['border','border-top','border-bottom','border-left','border-right','padding','margin','margin-bottom','background-color','color','font-weight','line-height'];
const get=(id,def)=>$(id)?.value||def;
const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,Number(v)||lo));
const hex=(v,fallback)=>/^#[0-9a-f]{6}$/i.test(v||'')?v:fallback;
const rgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const tint=(h,amount=.89)=>'#'+rgb(h).map(c=>Math.round(c+(255-c)*amount).toString(16).padStart(2,'0')).join('');
function setCSS(node,changes,reset){
 if(!node)return;
 for(const key of reset)node.style.removeProperty(key);
 for(const [key,value] of Object.entries(changes))if(value!==null && value!==undefined && value!=='')node.style.setProperty(key,String(value));
 if(!node.getAttribute('style')?.trim())node.removeAttribute('style');
}
function applyTable(table,opts){
 const mode=opts.table, border=opts.border,primary=opts.tableAccent,bg=opts.headerBg;
 setCSS(table,{width:'100%','max-width':'100%','border-collapse':'collapse',margin:'16px 0','border-spacing':'0'},PROP_TABLE);
 const rows=$$('tr',table);
 const hasSemanticHeader=Boolean(table.querySelector('th'));
 const visualFirstRowHeader=opts.firstRowHeader && !hasSemanticHeader;
 rows.forEach((row,idx)=>{
  const cells=$$('th,td',row);
  const stripeIdx=idx-(hasSemanticHeader||visualFirstRowHeader?1:0);
  cells.forEach((cell,col)=>{
   // Visual header styling never replaces TD elements or changes original cell semantics.
   const isHead=cell.tagName==='TH'||(visualFirstRowHeader && idx===0);
   const onFirst=col===0 && !isHead;
   let css={padding:opts.pad+'px '+Math.max(7,opts.pad+2)+'px','vertical-align':'top','text-align':opts.align};
   if(mode==='grid'){
    css.border='1px solid '+border;
    if(isHead){css['background-color']=bg;css['font-weight']='700';css.color=primary;}
   }else if(mode==='stripe'){
    css['border-bottom']='1px solid '+border;
    if(isHead){css['background-color']=bg;css.color=primary;css['font-weight']='700';}
    else if(stripeIdx%2===1)css['background-color']=tint(primary,.94);
   }else if(mode==='minimal'){
    css['border-bottom']='1px solid '+border;
    if(isHead){css['border-bottom']='2px solid '+primary;css['font-weight']='700';css.color=primary;}
   }else if(mode==='dark'){
    css.border='1px solid '+border;
    if(isHead){css['background-color']=primary;css.color='#ffffff';css['font-weight']='700';}
   }else if(mode==='spec'){
    css['border-bottom']='1px solid '+border;
    if(isHead){css['background-color']=bg;css.color=primary;css['font-weight']='700';}
    else if(onFirst){css['background-color']=tint(primary,.92);css.color=primary;css['font-weight']='700';}
   }else if(mode==='clean'){
    if(isHead){css['font-weight']='700';css.color=primary;}
   }
   setCSS(cell,css,PROP_CELL);
  });
 });
}
function applyList(list,opts){
 const mode=opts.list;
 const type=mode==='square'?'square':mode==='numbered'?'decimal':list.tagName==='OL'?'decimal':'disc';
 const isCard=mode==='accent'||mode==='separated';
 setCSS(list,{
  'list-style-type':isCard?'none':type,
  'list-style-position':'outside',
  'padding-left':isCard?'0':opts.indent+'px',
  margin:'0 0 16px',color:opts.primary
 },PROP_LIST);
 $$(':scope > li',list).forEach((li,i,all)=>{
  const css={'line-height':'1.85',margin:'0 0 '+(mode==='compact'?2:opts.gap)+'px',padding:'0',color:'#33444a'};
  if(mode==='accent'){
   css.padding='8px 12px';css['border-left']='3px solid '+opts.primary;css['background-color']=opts.itemBg;
  }else if(mode==='separated'){
   css.padding='7px 4px';if(i<all.length-1)css['border-bottom']='1px solid '+tint(opts.primary,.76);
  }else if(mode==='numbered'){
   css.color='#33444a';css['font-weight']='400';
  }
  setCSS(li,css,PROP_LI);
 });
}
function options(){
 const primary=hex(get('listAccentColor','#287d7a'),'#287d7a');
 const tableAccent=hex(get('accent','#287d7a'),'#287d7a');
 return {
  table:get('tablePreset','grid'),list:get('listPreset','bullet'),
  border:hex(get('tableBorderColor','#d8e3df'),'#d8e3df'),
  headerBg:hex(get('tableHeaderColor','#dceee8'),'#dceee8'),
  primary,tableAccent,pad:clamp(get('tableCellPad','10'),6,18),
  align:get('tableAlign','left'),
  firstRowHeader:$('tableFirstRowHeader')?.checked??true,
  gap:clamp(get('listItemGap','6'),2,16),indent:clamp(get('listIndent','24'),18,42),
  itemBg:hex(get('listItemBg','#f1f7f4'),'#f1f7f4')
 };
}
function apply(root){
 const opts=options();
 $$('table',root).forEach(t=>applyTable(t,opts));
 $$('ul,ol',root).forEach(list=>applyList(list,opts));
 return root;
}
function previewTable(type){
 let cls='mini-table mini-'+type;
 return '<span class="'+cls+'" aria-hidden="true"><i><b>A</b><b>B</b><b>C</b></i><i><b>01</b><b>內容</b><b>資訊</b></i><i><b>02</b><b>內容</b><b>資訊</b></i></span>';
}
function previewList(type){
 const steps=type==='numbered'?['1','2','3']:type==='square'?['▪','▪','▪']:type==='bullet'?['•','•','•']:type==='compact'?['•','•','•']:['','',''];
 return '<span class="mini-list mini-'+type+'" aria-hidden="true">'+steps.map((v,i)=>'<i><b>'+v+'</b><em></em></i>').join('')+'</span>';
}
function makeGallery(data,id,selectId,isTable){
 const root=$(id),select=$(selectId);if(!root||!select)return;
 data.forEach(p=>{const b=document.createElement('button');b.type='button';b.className='structure-preset';b.dataset.preset=p.id;b.setAttribute('aria-pressed','false');
  b.innerHTML=(isTable?previewTable(p.id):previewList(p.id))+'<strong>'+p.name+'</strong><small>'+p.note+'</small>';
  b.addEventListener('click',()=>{select.value=p.id;select.dispatchEvent(new Event('change',{bubbles:true}));});root.appendChild(b);
 });
 const reflect=()=>{$$('.structure-preset',root).forEach(b=>{const active=b.dataset.preset===select.value;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});};
 select.addEventListener('change',reflect);reflect();
}
function init(){
 makeGallery(TABLES,'tablePresetGallery','tablePreset',true);
 makeGallery(LISTS,'listPresetGallery','listPreset',false);
 $('applyStructureOnly')?.addEventListener('click',()=>window.WZWCore?.applyStructureOnly());
 $('listAccentColor')?.addEventListener('input',e=>{$('structureStyler')?.style.setProperty('--structure-accent',e.target.value);});
 $('structureStyler')?.style.setProperty('--structure-accent',get('listAccentColor','#287d7a'));
}
window.WZWStructures={apply,options};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
