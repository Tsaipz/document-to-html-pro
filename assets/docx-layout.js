/* DOCX layout-aware HTML converter. Keeps editable text and common OOXML formatting.
   Not a page-perfect Word renderer: advanced floating shapes, charts, headers/footers
   and pagination require a server-side Office renderer or separate visual preview. */
(()=>{'use strict';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const elems=(n,name)=>[...(n?.children||[])].filter(x=>x.localName===name);
const first=(n,name)=>elems(n,name)[0]||null;
const deep=(n,name)=>[...(n?.getElementsByTagName('*')||[])].filter(x=>x.localName===name);
const attr=(n,name)=>n?.getAttribute('w:'+name)??n?.getAttribute('a:'+name)??n?.getAttribute('r:'+name)??n?.getAttribute(name)??null;
const childAttr=(n,tag,property='val')=>attr(first(n,tag),property);
const pxTwip=n=>Math.round(Number(n)/15*100)/100;
const unit=n=>Number.isFinite(+n) ? pxTwip(n)+'px' : '';
const color=x=>/^[0-9a-f]{6}$/i.test(x||'')?'#'+x:null;
const cleanFont=x=>String(x||'').replace(/[;"'<>:{}]/g,'').trim().slice(0,80);
const css=o=>Object.entries(o).filter(([,v])=>v!==''&&v!=null).map(([k,v])=>k+':'+v).join(';');
function rStyle(pr){if(!pr)return {};
 let out={};let size=childAttr(pr,'sz');if(size&&+size>=6&&+size<=240)out['font-size']=Math.round(+size*2/3*10)/10+'px';
 const clr=color(childAttr(pr,'color'));if(clr)out.color=clr;
 const sh=color(childAttr(pr,'shd','fill'));if(sh)out['background-color']=sh;
 let fonts=first(pr,'rFonts');const f=attr(fonts,'eastAsia')||attr(fonts,'ascii')||attr(fonts,'hAnsi');if(f)out['font-family']=cleanFont(f)+',Arial,sans-serif';
 for(const [src,dst,val] of [['b','font-weight','700'],['i','font-style','italic'],['strike','text-decoration','line-through'],['u','text-decoration','underline']]){let e=first(pr,src);if(e&&attr(e,'val')!=='0'&&attr(e,'val')!=='false'&&attr(e,'val')!=='none')out[dst]=val;}
 const vert=childAttr(pr,'vertAlign');if(vert==='superscript')out['vertical-align']='super';if(vert==='subscript')out['vertical-align']='sub';
 return out;
}
function pStyle(pr){if(!pr)return {};
 let out={};let jc=childAttr(pr,'jc');if(jc)out['text-align']=({start:'left',end:'right',both:'justify',distribute:'justify'}[jc]||jc);
 let ind=first(pr,'ind');if(ind){const l=attr(ind,'left')||attr(ind,'start'),r=attr(ind,'right')||attr(ind,'end'),firstline=attr(ind,'firstLine');if(l)out['margin-left']=unit(l);if(r)out['margin-right']=unit(r);if(firstline)out['text-indent']=unit(firstline);if(attr(ind,'hanging'))out['text-indent']='-'+unit(attr(ind,'hanging'));}
 let spacing=first(pr,'spacing');if(spacing){if(attr(spacing,'before'))out['margin-top']=unit(attr(spacing,'before'));if(attr(spacing,'after'))out['margin-bottom']=unit(attr(spacing,'after'));if(attr(spacing,'line')&&attr(spacing,'lineRule')!=='exact'){out['line-height']=Math.round(Number(attr(spacing,'line'))/240*100)/100;}}
 let shade=color(childAttr(pr,'shd','fill'));if(shade)out['background-color']=shade;
 return out;
}
async function convert(file){if(!window.JSZip)throw Error('JSZip 套件尚未載入，無法讀取 Word 原始格式');
 const zip=await JSZip.loadAsync(await file.arrayBuffer());const parser=new DOMParser();
 const read=async path=>{const entry=zip.file(path);if(!entry)return null;const xml=parser.parseFromString(await entry.async('string'),'application/xml');if(xml.getElementsByTagName('parsererror').length)throw Error('Word XML 格式有誤：'+path);return xml;};
 const doc=await read('word/document.xml');if(!doc)throw Error('找不到 word/document.xml');
 const styles=await read('word/styles.xml'), numbering=await read('word/numbering.xml'), rels=await read('word/_rels/document.xml.rels');
 const relMap=new Map();if(rels)for(const r of deep(rels,'Relationship'))relMap.set(attr(r,'Id'),{target:attr(r,'Target'),type:attr(r,'Type'),external:attr(r,'TargetMode')==='External'});
 const styleMap=new Map();if(styles)for(const s of deep(styles,'style')){let id=attr(s,'styleId');if(id)styleMap.set(id,s);}
 const abstract=new Map(),nums=new Map();if(numbering){for(const a of deep(numbering,'abstractNum'))abstract.set(attr(a,'abstractNumId'),a);for(const n of deep(numbering,'num'))nums.set(attr(n,'numId'),childAttr(n,'abstractNumId'));}
 function listKind(p){const pr=first(p,'pPr'),np=first(pr,'numPr'),numId=childAttr(np,'numId'),level=childAttr(np,'ilvl')||'0';if(!numId)return null;const a=abstract.get(nums.get(numId));const lvl=elems(a,'lvl').find(l=>attr(l,'ilvl')===level);const fmt=childAttr(lvl,'numFmt');return {id:numId,level,kind:fmt==='bullet'?'ul':'ol'};}
 function styled(id){let props={},p={},seen=new Set();function merge(k){if(!k||seen.has(k))return;seen.add(k);let s=styleMap.get(k);if(!s)return;merge(childAttr(s,'basedOn'));Object.assign(props,rStyle(first(s,'rPr')));Object.assign(p,pStyle(first(s,'pPr')));}merge(id);return {run:props,para:p};}
 async function media(id){const r=relMap.get(id);if(!r||r.external)return null;const target=r.target||'';let name=target.split('/').pop();if(!/\.(png|jpe?g|gif|webp)$/i.test(name))return null;const path='word/media/'+name;if(!zip.file(path))return null;const ext=name.split('.').pop().toLowerCase(),mime=ext==='jpg'?'jpeg':ext;return 'data:image/'+mime+';base64,'+await zip.file(path).async('base64');}
 async function image(n){let blip=deep(n,'blip')[0],imagedata=deep(n,'imagedata')[0];const id=attr(blip,'embed')||attr(imagedata,'id');if(!id)return '';const uri=await media(id);if(!uri)return '';const ext=deep(n,'ext')[0],cx=attr(ext,'cx');let w=cx ? Math.round(+cx/9525):0;let s=w>0?'max-width:100%;width:'+Math.min(w,1500)+'px;height:auto':'max-width:100%;height:auto';return `<img src="${uri}" alt="文件圖片" style="${s}">`;}
 async function renderInline(parent,base={}){let html='';for(const n of [...(parent?.childNodes||[])]){if(n.nodeType===3)continue;const type=n.localName;
  if(type==='r'){const runStyle={...base,...rStyle(first(n,'rPr'))};let content='';for(const c of [...n.childNodes]){if(c.nodeType!==1)continue;switch(c.localName){case 't':case 'delText':if(c.localName==='t')content+=esc(c.textContent);break;case 'br':case 'cr':content+='<br>';break;case 'tab':content+='&emsp;';break;case 'noBreakHyphen':content+='‑';break;case 'drawing':case 'pict':content+=await image(c);break;}}
    if(content)html+=(Object.keys(runStyle).length?`<span style="${css(runStyle)}">${content}</span>`:content);}
  else if(type==='hyperlink'){let r=relMap.get(attr(n,'id'));let txt=await renderInline(n,base);let href=r?.external?r.target:'';if(href&&/^(https?:\/\/|mailto:)/i.test(href))html+=`<a href="${esc(href)}">${txt}</a>`;else html+=txt;}
  else if(['ins','sdtContent','smartTag','fldSimple'].includes(type))html+=await renderInline(n,base);
  else if(type==='drawing'||type==='pict')html+=await image(n);
 }return html;}
 async function paragraph(p,insideCell=false){const pr=first(p,'pPr'),id=childAttr(pr,'pStyle'),base=styled(id),run={...base.run},style={...base.para,...pStyle(pr)};
  const type=/^Title$/i.test(id||'')?'h2':/^Heading\s?([1-6])$/i.test(id||'')?('h'+Math.min(6,Number((id.match(/[1-6]/)||['2'])[0])+1)):'p';
  const content=await renderInline(p,run);const hasText=content.replace(/<[^>]*>/g,'').trim();if(!hasText&&!/<img\b|<br\b/.test(content))return {html:insideCell?'<p>&nbsp;</p>':'',list:null};
  if(!style['margin-bottom'])style['margin-bottom']=insideCell?'4px':'10px';
  const st=css(style),fmt=st?` style="${esc(st)}"`:'';let lst=listKind(p);
  if(lst){return {html:`<li${fmt}>${content}</li>`,list:lst};}
  return {html:`<${type}${fmt}>${content}</${type}>`,list:null};}
 async function table(t){let trs=[];for(const tr of elems(t,'tr')){let tds=[];for(const cell of elems(tr,'tc')){let cellpr=first(cell,'tcPr'),span=Number(childAttr(cellpr,'gridSpan')||1),bg=color(childAttr(cellpr,'shd','fill')),v=first(cellpr,'vMerge');if(v&&attr(v,'val')!=='restart')continue;let props={'border':'1px solid #aeb9bc','padding':'7px 9px','vertical-align':'top'};if(bg)props['background-color']=bg;let parts=[];for(const c of [...cell.children]){if(c.localName==='p')parts.push((await paragraph(c,true)).html);else if(c.localName==='tbl')parts.push(await table(c));}tds.push(`<td${span>1?` colspan="${span}"`:''} style="${css(props)}">${parts.join('')||'&nbsp;'}</td>`);}trs.push('<tr>'+tds.join('')+'</tr>');}return '<div style="max-width:100%;overflow-x:auto"><table style="border-collapse:collapse;width:100%;max-width:100%;margin:14px 0">'+trs.join('')+'</table></div>';}
 const body=deep(doc,'body')[0],result=[];let list=null;
 function flushList(){if(list){result.push(`</${list.kind}>`);list=null;}}
 for(const block of [...(body?.children||[])]){if(block.localName==='p'){const p=await paragraph(block);if(!p.html)continue;
  if(p.list){const key=p.list.id+':'+p.list.level+':'+p.list.kind;if(!list||list.key!==key){flushList();result.push(`<${p.list.kind} style="padding-left:28px;margin:10px 0">`);list={...p.list,key};}result.push(p.html);}else{flushList();result.push(p.html);}}
  else if(block.localName==='tbl'){flushList();result.push(await table(block));}
  else if(block.localName==='sdt'){flushList();const content=first(block,'sdtContent');if(content)for(const p of elems(content,'p'))result.push((await paragraph(p)).html);}}
 flushList();if(!result.length)throw Error('Word 文件沒有可輸出的內文');
 return `<div style="max-width:820px;margin:0 auto;padding:20px;box-sizing:border-box;font-family:Arial,Microsoft JhengHei,sans-serif;line-height:1.65;overflow-wrap:anywhere">${result.join('\n')}</div>`;
}
window.WZWDocxLayout={convert};
})();
