// In-page debug toolbar implementation
(function(){
  const out = document.getElementById('console-output');
  let originalConsoleLog = console.log;
  console.log = function(...args){
    appendLine(args.map(a=>String(a)).join(' '));
    originalConsoleLog.apply(console, args);
  };

  function appendLine(text, cls){
    const line = document.createElement('div');
    line.className = 'console-line' + (cls? ' '+cls : '');
    const time = document.createElement('span'); time.className='time';
    time.textContent = new Date().toLocaleTimeString();
    line.appendChild(time);
    const content = document.createElement('span');
    content.textContent = text;
    line.appendChild(content);
    out.appendChild(line);
    out.scrollTop = out.scrollHeight;
  }

  function appendError(err){
    appendLine((err && err.stack) ? err.stack : String(err), 'error');
  }

  // Script state and steps (so we can Step/Run/Pause)
  const state = {};
  const steps = [
    function(){ state.greeting = 'Hello, World'; console.log('greeting set'); },
    function(){ console.log(state.greeting); },
    function(){ state.greeting2 = 'Welcome to Node.js'; console.log('greeting2 set'); },
    function(){ console.log(state.greeting2); },
    function(){ state.sentence1 = 'Learning how to debug code with the debugger'; console.log('sentence1 set'); },
    function(){ /* replicate original bug: reference undefined variable */ console.log(sentenceOne); }
  ];

  let pc = 0; // program counter (next step index)
  let running = false;
  let runPromise = null;

  function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }

  async function runAll(){
    if(running) return;
    running = true;
    appendLine('Run started');
    while(running && pc < steps.length){
      try{
        steps[pc]();
      }catch(e){ appendError(e); running=false; break; }
      pc++;
      await sleep(600);
    }
    if(pc >= steps.length){ appendLine('Run finished'); }
    running = false;
  }

  function stepOnce(){
    if(pc >= steps.length){ appendLine('Already at end'); return; }
    try{ steps[pc](); }catch(e){ appendError(e); return; }
    pc++;
    appendLine('Stepped to ' + pc);
  }

  function pauseRun(){ running = false; appendLine('Paused'); }
  function reset(){ pc = 0; for(const k in state) delete state[k]; appendLine('Reset state'); }
  function clearConsole(){ out.innerHTML=''; appendLine('Console cleared'); }
  function toggleConsole(){ const panel = document.getElementById('console-panel'); panel.classList.toggle('hidden'); }

  // wire UI
  document.getElementById('btn-run').addEventListener('click', runAll);
  document.getElementById('btn-step').addEventListener('click', stepOnce);
  document.getElementById('btn-pause').addEventListener('click', pauseRun);
  document.getElementById('btn-reset').addEventListener('click', reset);
  document.getElementById('btn-clear').addEventListener('click', clearConsole);
  document.getElementById('btn-toggle-console').addEventListener('click', toggleConsole);

  // initial note
  appendLine('Toolbar ready — use Run/Step to execute the demo script.');
})();
