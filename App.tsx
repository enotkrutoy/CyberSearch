
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
  const outputRef = useRef<HTMLDivElement>(null);

  const addLog = useCallback((message: string, type: LogEntry['type'] = 'info') => {
    const time = new Date().toLocaleTimeString('ru-RU', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [...prev, { id: Date.now() + Math.random(), timestamp: time, message, type }]);
  }, []);

  // Boot Sequence
  useEffect(() => {
    const sequence = [
      { msg: "INITIALIZING VERCEL DEPLOYMENT CONTEXT...", type: 'system' },
      { msg: "LOADING HEURISTIC ENGINE v2.3.0...", type: 'system' },
      { msg: "MEMORY CHECK: OK. NETWORK: SECURE.", type: 'system' },
      { msg: "SYSTEM READY. AWAITING INPUT.", type: 'success' }
    ];
    
    let timeout: number;
    const runSequence = (idx: number) => {
      if (idx < sequence.length) {
        addLog(sequence[idx].msg, sequence[idx].type as any);
        timeout = window.setTimeout(() => runSequence(idx + 1), 600);
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

    const rawTerm = input;
    const cleanTerm = SearchEngineCore.sanitizeInput(rawTerm);
    const isSafe = SearchEngineCore.isSyntaxSafe(cleanTerm);
    const processedTerm = SearchEngineCore.processTerm(cleanTerm);

    addLog(`CMD: EXECUTE SEARCH [${rawTerm}]`, 'user');
    
    if (rawTerm !== cleanTerm) addLog("AUTO-CLEAN: REMOVED NON-PRINTABLE CHARS", "warning");
    if (!isSafe) addLog("SYNTAX WARNING: UNBALANCED PARENTHESES ENCOUNTERED", "warning");

    // --- PRESERVED LOGIC CORE (DO NOT MODIFY) ---
    const wordCount = processedTerm.split(' ').length;
    let o = Math.max(32 - wordCount, 1);
    const template = 'site:*.*.%NUM%.* |';
    const generatedUrls: string[] = [];
    const maxUrls = 10;

    for (let i = 0; i < maxUrls; i++) {
      let queryPart = '';
      for (let ii = 0; ii < (257 - (i * o)); ii++) {
        queryPart += template.replace('%NUM%', ii.toString());
      }
      queryPart = queryPart.slice(0, -1);
      const finalQuery = `(${processedTerm}) (${queryPart})`;
      generatedUrls.push('https://www.google.com/search?q=' + encodeURIComponent(finalQuery));
    }
    // --------------------------------------------

    setVectors(generatedUrls);
    addLog(`CALCULATION COMPLETE: 10 VECTORS GENERATED`, 'success');
    addLog(`PRIMARY VECTOR LAUNCHING...`, 'info');

    const win = window.open(generatedUrls[0], '_blank', 'noopener,noreferrer');
    if (!win) addLog("BLOCK ALERT: BROWSER PREVENTED AUTO-LAUNCH. USE DATA CELLS BELOW.", "warning");

    setInput('');
  }, [input, isBooting, addLog]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') executeSearch();
  };

  return (
    <div className="w-full max-w-4xl bg-black/95 border-2 border-[#00ff00] p-4 md:p-8 shadow-[0_0_40px_rgba(0,255,0,0.15)] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-[#00ff00]/20"></div>
      
      <header className="flex justify-between items-center mb-6 border-b border-[#00ff00]/30 pb-4">
        <div className="crt-glow font-bold text-lg md:text-xl tracking-tighter">
          CYBER-SEARCH//TERMINAL_v2.3.0
        </div>
        <div className="text-[10px] text-[#00ff00]/60 hidden md:block uppercase tracking-widest">
          Status: <span className={isBooting ? "text-yellow-500 animate-pulse" : "text-green-400"}>
            {isBooting ? "Booting" : "Online"}
          </span>
        </div>
      </header>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={isBooting}
            placeholder={isBooting ? "SYSTEM BOOTING..." : "ENTER TARGET PARAMETERS..."}
            className="w-full bg-black/50 border border-[#00ff00] text-[#00ff00] p-3 outline-none focus:bg-[#003300]/10 placeholder:text-[#00ff00]/20 transition-colors font-mono"
          />
          {!input && !isBooting && <span className="absolute right-4 top-3 text-[#00ff00]/40 pointer-events-none">_</span>}
        </div>
        <button
          onClick={executeSearch}
          disabled={isBooting}
          className="bg-[#00ff00] text-black px-10 py-3 font-bold uppercase tracking-widest hover:bg-[#00cc00] disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 shadow-[0_0_15px_rgba(0,255,0,0.3)]"
        >
          {isBooting ? "Wait" : "Execute"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[400px]">
        {/* LOG PANEL */}
        <div 
          ref={outputRef}
          className="bg-[#0a0a0a] border border-[#00ff00]/20 p-4 font-mono text-[12px] overflow-y-auto custom-scrollbar flex flex-col gap-1"
        >
          {logs.map((log) => (
            <div key={log.id} className="leading-relaxed animate-in fade-in slide-in-from-left-2 duration-300">
              <span className="text-[#00ff00]/40 mr-2">[{log.timestamp}]</span>
              <span className={
                log.type === 'system' ? 'text-blue-400' : 
                log.type === 'user' ? 'text-white font-bold' : 
                log.type === 'warning' ? 'text-yellow-500' :
                log.type === 'success' ? 'text-[#00ff00]' :
                'text-[#00ff00]/70'
              }>
                {log.type === 'user' ? `> ${log.message}` : log.message}
              </span>
            </div>
          ))}
          {!isBooting && <div className="cursor-blink"></div>}
        </div>

        {/* VECTOR PANEL */}
        <div className="bg-[#0a0a0a] border border-[#00ff00]/20 p-4 flex flex-col gap-2 overflow-y-auto custom-scrollbar">
          <div className="text-[10px] uppercase text-[#00ff00]/50 mb-2 tracking-widest border-b border-[#00ff00]/10 pb-1">
            Data Vectors (Output)
          </div>
          {vectors.length > 0 ? (
            vectors.map((url, i) => (
              <a
                key={i}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-2 border border-[#00ff00]/10 hover:border-[#00ff00]/50 hover:bg-[#00ff00]/5 transition-all text-[11px] truncate group"
              >
                <span className="text-[#00ff00]/40 mr-2">V_{i.toString().padStart(2, '0')}</span>
                <span className="group-hover:text-white transition-colors">LAUNCH VECTOR ANALYSIS</span>
              </a>
            ))
          ) : (
            <div className="h-full flex items-center justify-center text-[#00ff00]/20 text-[10px] uppercase text-center italic">
              Awaiting Calculation...
            </div>
          )}
        </div>
      </div>

      <footer className="mt-6 flex justify-between items-center text-[9px] text-[#00ff00]/40 uppercase tracking-[0.3em]">
        <div>Engine: Google_Dork_Heuristics</div>
        <div>Vercel_Stable_Deployment::2024</div>
      </footer>
    </div>
  );
};

export default App;
