/* 文轉網 PRO 6.0 — optional Jodit 4.17.4 enhancement.
   The original converter still works if this third-party library is unavailable. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
let rich=null;
const dlg=$('advancedDialog'),open=$('advancedEdit'),save=$('advancedSave'),cancel=$('advancedCancel');
if(!dlg||!open)return;
function notify(message){$('advancedNotice').textContent=message;}
function getCurrentHtml(){
  const active=document.querySelector('.tab.active')?.dataset.tab;
  if(active==='code')return $('code').value;
  if(active==='edit')return $('editor').innerHTML;
  // code panel isn't guaranteed up-to-date: use editor DOM (conversion always syncs it).
  return $('editor').innerHTML || $('code').value || '';
}
function ensureRich(){
 if(rich)return true;
 if(typeof window.Jodit==='undefined'){
   notify('進階編輯套件未載入，請確認網路可存取 jsDelivr CDN。其他功能仍可使用。');
   return false;
 }
 try{
   rich=window.Jodit.make('#advancedTextarea',{
     language:'zh_tw',height:Math.max(380,Math.min(620,window.innerHeight-260)),
     toolbarAdaptive:true,toolbarSticky:true,showCharsCounter:true,showWordsCounter:true,
     buttons:['source','|','undo','redo','|','bold','italic','underline','strikethrough','|','font','fontsize','brush','paragraph','|','ul','ol','outdent','indent','|','left','center','right','justify','|','table','link','image','|','hr','eraser','copyformat','fullsize'],
     controls:{},
     uploader:{insertImageAsBase64URI:false},
     askBeforePasteHTML:true,
     cleanHTML:{removeEmptyElements:false},
     defaultActionOnPaste:'insert_as_html',
     enter:'P'
   });
   return true;
 }catch(e){notify('編輯器初始化失敗：'+e.message);return false;}
}
open.addEventListener('click',()=>{
  dlg.showModal();
  if(!ensureRich())return;
  rich.value=getCurrentHtml();
  notify('可選取文字或表格進行編輯；圖片需使用可公開存取的網址，才能在 CMS 正常顯示。');
});
function close(){dlg.close();}
$('advancedClose').addEventListener('click',close);
cancel.addEventListener('click',close);
save.addEventListener('click',()=>{
 if(!rich)return notify('編輯器尚未載入。');
 const html=rich.value;
 if(/<img\b[^>]*\bsrc\s*=\s*["']?data:/i.test(html)){
   notify('檢查到 Base64 圖片。請先改用圖片管理匯出或 CMS 圖庫網址，再套用。');
   return;
 }
 // Switch to Code tab first to avoid overwriting edits when the original app syncs tabs.
 const codeTab=document.querySelector('.tab[data-tab="code"]');
 const previewTab=document.querySelector('.tab[data-tab="preview"]');
 codeTab.click();
 $('code').value=html;
 $('code').dispatchEvent(new Event('input',{bubbles:true}));
 previewTab.click();  // invokes original sanitize and preview + updates editor DOM
 close();
 notify('修改已同步，可再複製 HTML 或下載 ZIP。');
});
})();
