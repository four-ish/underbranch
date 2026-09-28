const editor=document.getElementById('editor');const compileBtn=document.getElementById('compileBtn');const logPanel=document.getElementById('logPanel');const toast=document.getElementById('toast');const fileTree=document.querySelector('.file-tree');
const initialSource=`\\documentclass{article}
\\usepackage{amsmath}
\\usepackage{graphicx}

\\title{An Introduction to Underbranch}
\\author{Jordan Doe}
\\date{September 2026}

\\begin{document}
\\maketitle

\\section{Introduction}
This is a free and open way to write beautiful
documents together. Underbranch brings your
ideas into focus, one branch at a time.

\\section{A Simple Equation}
\\begin{equation}
  E = mc^2
\\end{equation}

\\end{document}`;
let activeFile='main.tex';let zoom=100;
function showToast(msg){toast.textContent=msg;toast.classList.add('show');clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>toast.classList.remove('show'),2400)}
function source(){return editor.innerText.replace(/\u00a0/g,' ').replace(/\n\n\n+/g,'\n\n').trim()}
function escapeHtml(s){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function renderEditor(text){editor.innerHTML=text.split('\n').map((line,i)=>{let escaped=escapeHtml(line);escaped=escaped.replace(/(\\[a-zA-Z]+)/g,'<span class="code cmd">$1</span>');return `<div class="line"><span class="ln">${i+1}</span><span class="plain">${escaped||' '}</span></div>`}).join('')}
function getCommand(cmd,fallback){const m=source().match(new RegExp('\\\\'+cmd+'\\s*\\{([^}]*)\\}'));return m?m[1]:fallback}
function renderPreview(){const src=source();const title=getCommand('title','Untitled document');const author=getCommand('author','Anonymous');const date=getCommand('date','');let body=src.replace(/^[\s\S]*?\\begin\{document\}/,'').replace(/\\end\{document\}[\s\S]*$/,'').replace(/\\maketitle/,'').replace(/\\title\{[^}]*\}|\\author\{[^}]*\}|\\date\{[^}]*\}/g,'');body=body.replace(/\\section\{([^}]*)\}/g,'</SECTION><h2>$1</h2>').replace(/\\begin\{equation\}([\s\S]*?)\\end\{equation\}/g,'</SECTION><div class="equation">$1</div>').replace(/\\(textbf|textit)\{([^}]*)\}/g,'$2').replace(/\\[a-zA-Z]+/g,'').trim();const blocks=body.split('</SECTION>').filter(Boolean).map(block=>{if(block.includes('<h2>'))return block;return `<p>${escapeHtml(block).replace(/\n/g,' ')}</p>`}).join('');document.querySelector('.paper').innerHTML=`<h1>${escapeHtml(title).replace(/\\n/g,'<br>')}</h1><div class="paper-author">${escapeHtml(author)}</div><div class="paper-date">${escapeHtml(date)}</div><hr>${blocks||'<p>Your document is empty.</p>'}<div class="page-num">1</div>`}
function save(){localStorage.setItem('underbranch:'+activeFile,source());document.querySelector('.compile-state').innerHTML='<span class="dot green"></span> All changes saved'}
function loadFile(name){activeFile=name;const saved=localStorage.getItem('underbranch:'+name);renderEditor(saved|| (name==='main.tex'?initialSource:'% '+name+'\n\nStart writing here.'));document.querySelectorAll('.tree-row[data-file]').forEach(x=>x.classList.toggle('selected',x.dataset.file===name));document.querySelector('.editor-tab span:nth-child(2)').textContent=name;showToast('Opened '+name)}
function compile(){compileBtn.innerHTML='<span class="play">◌</span> Compiling…';compileBtn.disabled=true;save();setTimeout(()=>{renderPreview();compileBtn.innerHTML='<span class="play">▶</span> Compile <span class="caret">⌄</span>';compileBtn.disabled=false;logPanel.classList.add('open');showToast('Project compiled successfully')},600)}
compileBtn.addEventListener('click',compile);document.getElementById('closeLog').addEventListener('click',()=>logPanel.classList.remove('open'));
editor.addEventListener('input',()=>{document.querySelector('.compile-state').innerHTML='<span class="dot green"></span> Saving…';clearTimeout(window.saveTimer);window.saveTimer=setTimeout(save,500)});
fileTree.addEventListener('click',e=>{const row=e.target.closest('.tree-row[data-file]');if(row)loadFile(row.dataset.file)});
document.getElementById('newFileBtn').addEventListener('click',()=>{const name=prompt('New file name','notes.tex');if(!name)return;const row=document.createElement('div');row.className='tree-row';row.dataset.file=name;row.innerHTML=`<span class="file-icon tex">T<small>e</small></span><span>${escapeHtml(name)}</span><span class="row-more">⋯</span>`;fileTree.appendChild(row);localStorage.setItem('underbranch:'+name,'% '+name+'\n\n');loadFile(name)});
document.getElementById('downloadTex').addEventListener('click',()=>{const blob=new Blob([source()],{type:'text/plain'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=activeFile;a.click();URL.revokeObjectURL(a.href);showToast('Source downloaded')});
document.getElementById('fullscreenPreview').addEventListener('click',()=>document.querySelector('.preview-pane').requestFullscreen?.());
document.getElementById('zoomIn').addEventListener('click',()=>{zoom=Math.min(140,zoom+10);document.getElementById('zoomValue').textContent=zoom+'%';document.querySelector('.paper').style.transform=`scale(${zoom/100})`;document.querySelector('.paper').style.transformOrigin='top center'});
document.getElementById('zoomOut').addEventListener('click',()=>{zoom=Math.max(70,zoom-10);document.getElementById('zoomValue').textContent=zoom+'%';document.querySelector('.paper').style.transform=`scale(${zoom/100})`;document.querySelector('.paper').style.transformOrigin='top center'});
document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key==='Enter'){e.preventDefault();compile()}});
loadFile('main.tex');renderPreview();