/* V8 原文優先貼上排版：不調用 AI，不改寫原始文字 */
(() => {
  'use strict';
  const el = id => document.getElementById(id);
  let mode = 'word';
  const sourceHtmlTags = new Set(['P','DIV','H1','H2','H3','H4','H5','H6','BLOCKQUOTE','UL','OL','LI','TABLE','THEAD','TBODY','TFOOT','TR','TD','TH','BR','STRONG','B','EM','I','U','S','A','SPAN','IMG','HR','SUP','SUB','PRE','CODE']);
  const isMarkedHeading = s => /^#{2,3}\s+/.test(s);
  const isChapter = s => /^(?:第[一二三四五六七八九十百千\d]+[章節篇]|[一二三四五六七八九十]+[、．.]|[（(][一二三四五六七八九十\d]+[）)])[ \t]*\S/.test(s);
  const marker = line => line.match(/^\s*((?:[•●▪◆◦·]|[-*])\s+|(?:\d{1,3}[.、)）])\s+)(.*)$/);
  const encode = text => String(text).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const normalize = text => String(text || '').normalize('NFC').replace(/[\s\u00a0\u200b\u200c\u200d]+/g,'');
  const sourceStr = () => mode === 'text' ? el('pasteText').value : el('pasteWord').innerText;
  const opts = () => ({
    first:el('pasteFirstTitle').checked,
    chapter:el('pasteAutoHeading').checked,
    breaks:el('pastePreserveBreaks').checked,
    marks:el('pasteKeepMarks').checked,
    bold:el('pasteKeepBold').checked
  });
  function setPasteStatus(message) { el('pasteStatus').textContent = message; }
  function parseText(value, options) {
    const text = String(value || '').replace(/\r\n?/g,'\n');
    const lines = text.split('\n');
    const out = [];
    let para = [], list = null, tableRows = [], promoted = false;
    function flushPara(){
      if(!para.length)return;
      const content = para.map(x => encode(x)).join(options.breaks ? '<br>' : ' ');
      const firstLine = para[0].trim();
      const explicit = firstLine.match(/^(#{2,3})\s+([\s\S]*)$/);
      if(explicit && para.length === 1) {
        out.push(`<${explicit[1].length===2?'h2':'h3'}>${encode(explicit[2])}</${explicit[1].length===2?'h2':'h3'}>`); promoted = true;
      } else if(options.first && !promoted && para.length===1 && firstLine.length<=100){
        out.push(`<h2>${encode(para[0])}</h2>`); promoted = true;
      } else if(options.chapter && para.length===1 && isChapter(firstLine)) {
        out.push(`<h3>${content}</h3>`);
      } else out.push(`<p>${content}</p>`);
      para=[];
    }
    function flushList(){if(list){out.push(options.marks ? list.rows.map(row=>row.replace(/^<li>/,'<p>').replace(/<\/li>$/,'</p>')).join('') : `<${list.type}>${list.rows.join('')}</${list.type}>`);list=null;}}
    function flushTable(){if(tableRows.length){
      const colCount = Math.max(...tableRows.map(r=>r.length));
      const trs = tableRows.map((r,index)=>`<tr>${Array.from({length:colCount},(_,c)=>`<${index===0?'th':'td'}>${encode(r[c] ?? '')}</${index===0?'th':'td'}>`).join('')}</tr>`).join('');
      out.push(`<table><tbody>${trs}</tbody></table>`);tableRows=[];
    }}
    for (const line of lines){
      if(!line.trim()){flushPara();flushList();flushTable();continue;}
      if(line.includes('\t') && line.split('\t').length > 1){flushPara();flushList();tableRows.push(line.split('\t'));continue;}
      flushTable();
      const m = marker(line);
      if(m){flushPara();const type=/^\d/.test(m[1].trim())?'ol':'ul';if(list && list.type!==type)flushList();if(!list)list={type,rows:[]};
        // 保留原始符號 / 編號作為文字，不會發生清單編號被重算後改變的問題
        const body=options.marks ? encode(line.trim()) : encode(m[2]);
        list.rows.push(options.marks ? `<li>${body}</li>` : `<li>${body}</li>`);
        continue;
      }
      flushList();
      if(isMarkedHeading(line.trim())){flushPara();const m=line.trim().match(/^(#{2,3})\s+(.*)$/);out.push(`<${m[1].length===2?'h2':'h3'}>${encode(m[2])}</${m[1].length===2?'h2':'h3'}>`);promoted=true;continue;}
      if(options.chapter && isChapter(line.trim())){flushPara();out.push(`<h3>${encode(line)}</h3>`);continue;}
      para.push(line);
    }
    flushPara();flushList();flushTable();
    return out.join('\n');
  }
  function richToHtml(options){
    const wrapper = document.createElement('div');
    wrapper.innerHTML = sanitize(el('pasteWord').innerHTML,'inline');
    // Word may paste <div> wrappers with nested <p>; do not discard text nodes or table cells.
    wrapper.querySelectorAll('*').forEach(node => {
      if(!sourceHtmlTags.has(node.tagName)) return;
      node.removeAttribute('class');node.removeAttribute('id');
      node.removeAttribute('style');node.removeAttribute('width');node.removeAttribute('height');
      if(!options.bold && /^(STRONG|B|EM|I|U)$/.test(node.tagName))node.replaceWith(...node.childNodes);
      if(node.tagName === 'SPAN')node.replaceWith(...node.childNodes);
    });
    // Empty 'Word' editor can still include <br>, avoid producing a blank article.
    if(!wrapper.textContent.trim() && !wrapper.querySelector('img,table'))return '';
    const existingTitle = wrapper.querySelector('h1,h2,h3');
    if(options.first && !existingTitle){
      let first = [...wrapper.children].find(node => ['P','DIV'].includes(node.tagName) && node.textContent.trim());
      if(first && first.textContent.trim().length <= 100 && !first.querySelector('table,img,ul,ol')){
        const newTitle=document.createElement('h2');newTitle.innerHTML=first.innerHTML;first.replaceWith(newTitle);
      }
    }
    if(options.chapter){wrapper.querySelectorAll('p').forEach(node=>{if(isChapter(node.textContent.trim()) && node.children.length===0){let h=document.createElement('h3');h.textContent=node.textContent;node.replaceWith(h);}});}
    if(!options.breaks){wrapper.querySelectorAll('p br').forEach(node=>node.replaceWith(document.createTextNode(' ')));}
    return sanitize(wrapper.innerHTML,'inline');
  }
  function checkAccuracy(src,html,options){
    const body = document.createElement('div');body.innerHTML=html;
    let original=src,converted=body.textContent||'';
    if(mode==='text'){
      original=original.replace(/^\s*#{2,3}\s+/gm,'');
    }
    const old = normalize(original),now=normalize(converted);
    const same=old===now;
    el('pasteSourceCount').textContent=old.length.toLocaleString('zh-TW');
    el('pasteResultCount').textContent=now.length.toLocaleString('zh-TW');
    el('pasteCompareResult').textContent=same?'文字一致':'請人工核對';
    el('pasteCompareLabel').textContent=same?'未偵測到文字變更':'轉換文字需確認';
    el('pasteCompareNote').textContent=same?'已核對非空白文字的順序與內容；格式標記不在核對範圍內。':'可能因 Word 表格換行、清單符號、貼上格式或來源空白而有差異。請展開下方逐段檢查，勿直接交付。';
    el('pasteSourcePreview').textContent=src.slice(0,30000);
    el('pasteResultPreview').textContent=converted.slice(0,30000);
    el('pasteCompare').classList.remove('hidden');
    return same;
  }
  function generate(){
    if(state.busy){setPasteStatus('目前正有文件在轉換，請稍後再產生');return;}
    const original=sourceStr();
    if(!original.trim()){setPasteStatus('請先貼上 Word 或純文字內容');return;}
    try{
      const o=opts();
      const raw=mode==='text'?parseText(original,o):richToHtml(o);
      if(!raw.trim()){setPasteStatus('沒有可轉換的文字');return;}
      // Generating a new article should not accidentally carry over unrelated image assets.
      state.documentTitle='貼上文章';state.file=null;state.fileType='paste';state.imageLibrary.clear();
      const styled=stylize(raw);
      setContent(styled);
      const same=checkAccuracy(original,state.html,o);
      setPasteStatus(same?'已產生 HTML，文字核對通過':'已產生 HTML，但請先核對來源文字');
      report('已完成貼上轉換；請核對原文後使用即時預覽與匯出功能。');
    }catch(err){console.error(err);setPasteStatus('轉換失敗：'+err.message);}
  }
  function switchMode(next){
    mode=next;
    document.querySelectorAll('.paste-mode').forEach(button=>{
      const active=button.dataset.pasteMode===next;
      button.classList.toggle('active',active);button.setAttribute('aria-selected',String(active));
    });
    el('pasteWordWrap').classList.toggle('hidden',next!=='word');
    el('pasteTextWrap').classList.toggle('hidden',next!=='text');
    el('pasteCompare').classList.add('hidden');
    setPasteStatus(next==='word'?'等待貼上 Word 內容':'等待貼上純文字');
  }
  function pasteSafeHtml(e){
    const original = e.clipboardData?.getData('text/html');
    const plain = e.clipboardData?.getData('text/plain')||'';
    if(!original&&!plain)return;
    e.preventDefault();
    let safe='';
    if(original){
      const doc=new DOMParser().parseFromString(original,'text/html');
      doc.querySelectorAll('style,script,meta,link,head,iframe,object,svg').forEach(x=>x.remove());
      safe=sanitize(doc.body.innerHTML,'inline');
    }
    if(!safe.trim())safe=encode(plain).replace(/\r\n?/g,'\n').replace(/\n/g,'<br>');
    const selection=window.getSelection();
    if(!selection.rangeCount || !el('pasteWord').contains(selection.anchorNode)){
      el('pasteWord').focus();selection.removeAllRanges();const r=document.createRange();r.selectNodeContents(el('pasteWord'));r.collapse(false);selection.addRange(r);
    }
    const range=selection.getRangeAt(0);
    range.deleteContents();
    const frag=range.createContextualFragment(safe);
    const last=frag.lastChild;
    range.insertNode(frag);
    if(last){range.setStartAfter(last);range.collapse(true);selection.removeAllRanges();selection.addRange(range);}
    setPasteStatus('內容已貼上，請選擇排版模板並點「產生美化 HTML」');
  }
  function start(){
    document.querySelectorAll('.paste-mode').forEach(x=>x.addEventListener('click',()=>switchMode(x.dataset.pasteMode)));
    el('goPaste').addEventListener('click',()=>tab('paste'));
    el('pasteWord').addEventListener('paste',pasteSafeHtml);
    el('pasteWord').addEventListener('input',()=>setPasteStatus('已輸入 Word 內容，尚未產生 HTML'));
    el('pasteText').addEventListener('input',()=>setPasteStatus('已輸入純文字，尚未產生 HTML'));
    el('pasteGenerate').addEventListener('click',generate);
    el('pasteClear').addEventListener('click',()=>{el('pasteWord').innerHTML='';el('pasteText').value='';el('pasteCompare').classList.add('hidden');setPasteStatus('已清空貼上欄位，已產出的 HTML 不受影響');});
    el('pasteDemo').addEventListener('click',()=>{switchMode('text');el('pasteText').value='2026 公司服務簡介\n\n我們提供網站建置、內容管理與後續維護服務。\n每一個段落都可以直接由網站後台修改。\n\n## 我們的特色\n• 網站規劃與設計\n• SEO 內容優化\n• 文章整理與上架\n\n## 常見問題\nQ：轉換後可以修改嗎？\nA：可以，文字、圖片與段落都能在編輯器內調整。';setPasteStatus('已載入示範文字，按「產生美化 HTML」查看結果');});
    // Add convenient jump to preview after generation.
    const previewBtn=document.createElement('button');previewBtn.className='button';previewBtn.type='button';previewBtn.textContent='查看排版預覽 →';previewBtn.addEventListener('click',()=>tab('preview'));el('pasteGenerate').after(previewBtn);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
