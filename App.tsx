
import React, { useState, useRef, useEffect, useCallback } from 'react';

interface LogEntry {
  id: number;
  timestamp: string;
  message: string;
  type: 'system' | 'user' | 'info' | 'warning' | 'success';
}

const SearchEngineCore = {
  sanitizeInput: (raw: string): string => {
    return raw
      .replace(/[\x00-\x1F\x7F]/g, "")
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .trim();
  },
  isSyntaxSafe: (str: string): boolean => {
    let stack = 0;
    for (const char of str) {
      if (char === '(') stack++;
      if (char === ')') stack--;
      if (stack < 0) return false;
    }
    return stack === 0;
  },
  processTerm: (term: string): string => {
    if (SearchEngineCore.isSyntaxSafe(term)) return term;
    return term.replace(/([()])/g, "\\$1");
  }
};

const App: React.FC = () => {
  const [input, setInput] = useState('');
  const [isBooting, setIsBooting] = useState(true);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [vectors, setVectors] = useState<string[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  
  // Control Deck States
  const [vectorCount, setVectorCount] = useState(10);
  const [density, setDensity] = useState(257);
  const [pageOffset, setPageOffset] = useState(0);

  const outputRef = useRef<HTMLDivElement>(null);

  const addLog = useCallback((message: string, type: LogEntry['type'] = 'info') => {
    const time = new Date().toLocaleTimeString('ru-RU', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [...prev, { id: Date.now() + Math.random(), timestamp: time, message, type }]);
  }, []);

  // Boot Sequence (v2.5.0 Pattern)
  useEffect(() => {
    const sequence = [
      { msg: "SYSTEM_RELOAD: VERCEL CLOUD DEPLOYMENT CONTEXT...", type: 'system' },
      { msg: "HEURISTIC ENGINE v2.5.0 LOADED [STABLE]...", type: 'system' },
      { msg: "DECAY ALGORITHM SYNCHRONIZED. CPU_CORE: ACTIVE.", type: 'system' },
      { msg: "READY. AWAITING OPERATOR INPUT.", type: 'success' }
    ];
    
    let timeout: number;
    const runSequence = (idx: number) => {
      if (idx < sequence.length) {
        addLog(sequence[idx].msg, sequence[idx].type as any);
        timeout = window.setTimeout(() => runSequence(idx + 1), 400);
      } else {
        setIsBooting(false);
      }
    };

    runSequence(0);
    return () => clearTimeout(timeout);
  }, [addLog]);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [logs]);

  const executeSearch = useCallback(() => {
    if (!input.trim() || isBooting) return;

    setIsExecuting(true);
    setTimeout(() => setIsExecuting(false), 300);

    const rawTerm = input;
    const cleanTerm = SearchEngineCore.sanitizeInput(rawTerm);
    const isSafe = SearchEngineCore.isSyntaxSafe(cleanTerm);
    const processedTerm = SearchEngineCore.processTerm(cleanTerm);

    addLog(`CMD: EXEC_V_SEARCH [${rawTerm}]`, 'user');
    
    if (rawTerm !== cleanTerm) addLog("SANITIZER: NON-PRINTABLE CHARS REMOVED", "warning");
    if (!isSafe) addLog("SYNTAX_ALERT: UNBALANCED SCOPES DETECTED - AUTO_ESCAPE ACTIVE", "warning");
    if (density > 600) addLog("HTTP_414_RISK: URL DENSITY EXCEEDS RECOMMENDED LIMITS", "warning");

    // --- ALGORITHM v2.5.0 ---
    const wordCount = processedTerm.split(' ').length;
    const decayFactor = Math.max(32 - wordCount, 1);
    const template = 'site:*.*.%NUM%.* |';
    const generatedUrls: string[] = [];

    for (let i = 0; i < vectorCount; i++) {
      let queryPart = '';
      const iterations = Math.max(density - (i * decayFactor), 1);
      
      for (let ii = 0; ii < iterations; ii++) {
        queryPart += template.replace('%NUM%', ii.toString());
      }
      queryPart = queryPart.slice(0, -1);
      
      const finalQuery = `(${processedTerm}) (${queryPart})`;
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(finalQuery)}&start=${pageOffset * 10}`;
      generatedUrls.push(searchUrl);
    }
    // ------------------------

    setVectors(generatedUrls);
    addLog(`COMPUTATION SUCCESS: ${vectorCount} VECTORS READY`, 'success');
    addLog(`REDIRECTING TO PRIMARY VECTOR...`, 'info');

    const win = window.open(generatedUrls[0], '_blank', 'noopener,noreferrer');
    if (!win) addLog("BROWSER_BLOCK: POPUP PREVENTED. MANUAL LAUNCH REQUIRED.", "warning");

  }, [input, isBooting, addLog, vectorCount, density, pageOffset]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') executeSearch();
  };

  return (
    <div className="w-full max-w-4xl bg-black border-2 border-[#00ff00] p-4 md:p-8 shadow-[0_0_50px_rgba(0,255,0,0.2)] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-[#00ff00]/30"></div>
      
      <header className="flex justify-between items-center mb-6 border-b border-[#00ff00]/40 pb-4">
        <div className="crt-glow font-bold text-lg md:text-xl tracking-tighter">
          CYBER_SEARCH//TERMINAL_v2.5.0
        </div>
        <div className="text-[10px] text-[#00ff00]/60 hidden md:flex gap-4 items-center uppercase tracking-widest">
          <div>CPU_CORE: <span className="text-green-400">STABLE</span></div>
          <div>STATUS: <span className={isBooting ? "text-yellow-500 animate-pulse" : "text-green-400"}>
            {isBooting ? "INITIALIZING" : "READY"}
          </span></div>
        </div>
      </header>

      {/* INPUT SECTION */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={isBooting}
            placeholder={isBooting ? "SYSTEM_RELOAD_IN_PROGRESS..." : "ENTER_TARGET_PARAMETERS..."}
            className={`w-full bg-[#0a0a0a] border ${isExecuting ? 'border-white shadow-[0_0_20px_white]' : 'border-[#00ff00]'} text-[#00ff00] p-4 outline-none focus:bg-[#00ff00]/5 placeholder:text-[#00ff00]/20 transition-all font-mono duration-300`}
          />
          {!input && !isBooting && <span className="absolute right-4 top-4 text-[#00ff00]/40 pointer-events-none animate-pulse">_</span>}
        </div>
        <button
          onClick={executeSearch}
          disabled={isBooting}
          className="bg-[#00ff00] text-black px-12 py-4 font-black uppercase tracking-[0.2em] hover:bg-[#00cc00] disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 shadow-[0_0_20px_rgba(0,255,0,0.4)]"
        >
          {isBooting ? "WAIT" : "EXECUTE"}
        </button>
      </div>

      {/* CONTROL DECK */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 p-4 bg-[#0a0a0a] border border-[#00ff00]/10">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-[10px] uppercase tracking-wider">
            <span>Vector Count</span>
            <span className="text-white font-bold">{vectorCount}</span>
          </div>
          <input 
            type="range" min="1" max="20" 
            value={vectorCount} 
            onChange={(e) => setVectorCount(parseInt(e.target.value))}
            className="w-full"
          />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-[10px] uppercase tracking-wider">
            <span>Density</span>
            <span className={density > 600 ? "text-red-500 font-bold" : "text-white font-bold"}>{density}</span>
          </div>
          <input 
            type="range" min="128" max="1024" 
            value={density} 
            onChange={(e) => setDensity(parseInt(e.target.value))}
            className="w-full"
          />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-[10px] uppercase tracking-wider">
            <span>Page Offset</span>
            <span className="text-white font-bold">{pageOffset}</span>
          </div>
          <input 
            type="range" min="0" max="9" 
            value={pageOffset} 
            onChange={(e) => setPageOffset(parseInt(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      {/* DISPLAY GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[350px]">
        {/* LOG PANEL */}
        <div 
          ref={outputRef}
          className="bg-[#030303] border border-[#00ff00]/20 p-4 font-mono text-[11px] overflow-y-auto custom-scrollbar flex flex-col gap-1 shadow-inner"
        >
          {logs.map((log) => (
            <div key={log.id} className="leading-relaxed animate-in fade-in slide-in-from-left-1 duration-200">
              <span className="text-[#00ff00]/30 mr-2">[{log.timestamp}]</span>
              <span className={
                log.type === 'system' ? 'text-blue-500 italic' : 
                log.type === 'user' ? 'text-white border-l-2 border-[#00ff00] pl-2' : 
                log.type === 'warning' ? 'text-yellow-500 italic uppercase' :
                log.type === 'success' ? 'text-[#00ff00] font-bold underline' :
                'text-[#00ff00]/80'
              }>
                {log.type === 'user' ? `${log.message}` : log.message}
              </span>
            </div>
          ))}
          {!isBooting && <div className="cursor-blink"></div>}
        </div>

        {/* VECTOR PANEL */}
        <div className="bg-[#030303] border border-[#00ff00]/20 p-4 flex flex-col gap-2 overflow-y-auto custom-scrollbar shadow-inner">
          <div className="text-[10px] uppercase text-[#00ff00]/50 mb-2 tracking-[0.2em] border-b border-[#00ff00]/10 pb-1 flex justify-between">
            <span>Output Vectors</span>
            {density > 600 && <span className="text-red-500 animate-pulse">Risk: HIGH</span>}
          </div>
          {vectors.length > 0 ? (
            vectors.map((url, i) => (
              <a
                key={i}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-2 border border-[#00ff00]/5 hover:border-[#00ff00]/40 hover:bg-[#00ff00]/5 transition-all text-[10px] truncate group flex justify-between items-center"
              >
                <div>
                  <span className="text-[#00ff00]/30 mr-3">V_{i.toString().padStart(2, '0')}</span>
                  <span className="group-hover:text-white transition-colors">INIT_V_ANALYSIS</span>
                </div>
                <span className="text-[8px] opacity-0 group-hover:opacity-100 transition-opacity">LAUNCH >></span>
              </a>
            ))
          ) : (
            <div className="h-full flex items-center justify-center text-[#00ff00]/10 text-[9px] uppercase tracking-[0.5em] text-center italic">
              AWAITING_CALCULATION...
            </div>
          )}
        </div>
      </div>

      <footer className="mt-6 pt-4 border-t border-[#00ff00]/10 flex justify-between items-center text-[9px] text-[#00ff00]/30 uppercase tracking-[0.4em]">
        <div>Protocol: HEURISTIC_DECAY_v2.5</div>
        <div>Vercel_Edge_Stable::2025</div>
      </footer>
    </div>
  );
};

export default App;
