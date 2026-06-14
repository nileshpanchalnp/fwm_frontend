  // src/pages/user/tabs/WritingTab.tsx
  import React, { useState, useRef, useEffect, useCallback } from 'react';
  import { Info, RotateCcw } from 'lucide-react';
  import { writingApi } from '../../../api/client';

  /* ── Key definitions ── */
  type KeyDef = {
    label: string;
    base: string;
    shift: string;
    colSpan?: number;
    action?: 'caps' | 'shift' | 'backspace' | 'enter' | 'tab' | 'space';
    accent?: boolean;
  };

  /* ── AZERTY rows (standard French keyboard) ── */
  const ROWS: KeyDef[][] = [
    [
      { label: '² ²', base: '²', shift: '²' },
      { label: '& 1', base: '&', shift: '1' },
      { label: 'é 2', base: 'é', shift: '2' },
      { label: '" 3', base: '"', shift: '3' },
      { label: "' 4", base: "'", shift: '4' },
      { label: '( 5', base: '(', shift: '5' },
      { label: '- 6', base: '-', shift: '6' },
      { label: 'è 7', base: 'è', shift: '7' },
      { label: '_ 8', base: '_', shift: '8' },
      { label: 'ç 9', base: 'ç', shift: '9' },
      { label: 'à 0', base: 'à', shift: '0' },
      { label: ') °', base: ')', shift: '°' },
      { label: '= +', base: '=', shift: '+' },
      { label: '⌫', base: '', shift: '', action: 'backspace', colSpan: 2 },
    ],
    [
      { label: 'Tab', base: '\t', shift: '\t', action: 'tab', colSpan: 2 },
      { label: 'A', base: 'a', shift: 'A' },
      { label: 'Z', base: 'z', shift: 'Z' },
      { label: 'E', base: 'e', shift: 'E' },
      { label: 'R', base: 'r', shift: 'R' },
      { label: 'T', base: 't', shift: 'T' },
      { label: 'Y', base: 'y', shift: 'Y' },
      { label: 'U', base: 'u', shift: 'U' },
      { label: 'I', base: 'i', shift: 'I' },
      { label: 'O', base: 'o', shift: 'O' },
      { label: 'P', base: 'p', shift: 'P' },
      { label: '^ ¨', base: '^', shift: '¨' },
      { label: '$ £', base: '$', shift: '£' },
      { label: '* µ', base: '*', shift: 'µ' },
    ],
    [
      { label: 'Caps', base: '', shift: '', action: 'caps', colSpan: 2 },
      { label: 'Q', base: 'q', shift: 'Q' },
      { label: 'S', base: 's', shift: 'S' },
      { label: 'D', base: 'd', shift: 'D' },
      { label: 'F', base: 'f', shift: 'F' },
      { label: 'G', base: 'g', shift: 'G' },
      { label: 'H', base: 'h', shift: 'H' },
      { label: 'J', base: 'j', shift: 'J' },
      { label: 'K', base: 'k', shift: 'K' },
      { label: 'L', base: 'l', shift: 'L' },
      { label: 'M', base: 'm', shift: 'M' },
      { label: 'ù %', base: 'ù', shift: '%' },
      { label: '↵ Enter', base: '', shift: '', action: 'enter', colSpan: 2 },
    ],
    [
      { label: '⇧ Shift', base: '', shift: '', action: 'shift', colSpan: 3 },
      { label: 'W', base: 'w', shift: 'W' },
      { label: 'X', base: 'x', shift: 'X' },
      { label: 'C', base: 'c', shift: 'C' },
      { label: 'V', base: 'v', shift: 'V' },
      { label: 'B', base: 'b', shift: 'B' },
      { label: 'N', base: 'n', shift: 'N' },
      { label: ', ?', base: ',', shift: '?' },
      { label: '; .', base: ';', shift: '.' },
      { label: ': /', base: ':', shift: '/' },
      { label: '! §', base: '!', shift: '§' },
      { label: '⇧ Shift', base: '', shift: '', action: 'shift', colSpan: 3 },
    ],
    [
      { label: 'Ctrl', base: '', shift: '', colSpan: 2 },
      { label: 'Alt', base: '', shift: '', colSpan: 2 },
      { label: 'Space', base: ' ', shift: ' ', action: 'space', colSpan: 7 },
      { label: 'AltGr', base: '', shift: '', colSpan: 2 },
      { label: 'Ctrl', base: '', shift: '', colSpan: 3 },
    ],
  ];

  const ACCENT_EXTRAS: KeyDef[] = [
    { label: 'â', base: 'â', shift: 'Â', accent: true },
    { label: 'ê', base: 'ê', shift: 'Ê', accent: true },
    { label: 'î', base: 'î', shift: 'Î', accent: true },
    { label: 'ô', base: 'ô', shift: 'Ô', accent: true },
    { label: 'û', base: 'û', shift: 'Û', accent: true },
    { label: 'ë', base: 'ë', shift: 'Ë', accent: true },
    { label: 'ï', base: 'ï', shift: 'Ï', accent: true },
    { label: 'ü', base: 'ü', shift: 'Ü', accent: true },
    { label: 'ä', base: 'ä', shift: 'Ä', accent: true },
    { label: 'ö', base: 'ö', shift: 'Ö', accent: true },
    { label: 'œ', base: 'œ', shift: 'Œ', accent: true },
    { label: 'æ', base: 'æ', shift: 'Æ', accent: true },
    { label: 'ÿ', base: 'ÿ', shift: 'Ÿ', accent: true },
    { label: '«', base: '«', shift: '«', accent: true },
    { label: '»', base: '»', shift: '»', accent: true },
    { label: '€', base: '€', shift: '€', accent: true },
    { label: '…', base: '…', shift: '…', accent: true },
    { label: '–', base: '–', shift: '—', accent: true },
  ];

  const FrenchKeyboard: React.FC = () => {
    const [text, setText] = useState('');
    const [capsLock, setCapsLock] = useState(false);
    const [shift, setShift] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const saveTimer = useRef<ReturnType<typeof setTimeout>>();

    useEffect(() => {
      writingApi.get().then((d: any) => setText(d.content || '')).catch(() => { });
    }, []);

    const autoSave = useCallback((val: string) => {
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        setSaving(true);
        await writingApi.save(val).catch(() => { });
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }, 1500);
    }, []);

    const insertChar = useCallback((char: string) => {
      const el = textareaRef.current;
      if (!el) return;
      const s = el.selectionStart;
      const e2 = el.selectionEnd;
      const next = text.slice(0, s) + char + text.slice(e2);
      setText(next);
      autoSave(next);
      setShift(false);
      setTimeout(() => {
        el.selectionStart = el.selectionEnd = s + char.length;
        el.focus();
      }, 0);
    }, [text, autoSave]);

    const deleteChar = useCallback(() => {
      const el = textareaRef.current;
      if (!el) return;
      const s = el.selectionStart;
      const e2 = el.selectionEnd;
      let next: string;
      if (s !== e2) {
        next = text.slice(0, s) + text.slice(e2);
      } else if (s > 0) {
        next = text.slice(0, s - 1) + text.slice(s);
      } else return;
      setText(next);
      autoSave(next);
      setTimeout(() => {
        el.selectionStart = el.selectionEnd = Math.max(0, s !== e2 ? s : s - 1);
        el.focus();
      }, 0);
    }, [text, autoSave]);

    const effectiveChar = (key: KeyDef): string => {
      if (key.accent) return shift ? key.shift : key.base;
      if (key.action) return '';
      const isLetter = key.base.length === 1 && /[a-zàâäéèêëîïôöùûüçœæ]/i.test(key.base);
      if (isLetter) {
        const upper = capsLock !== shift;
        return upper ? key.shift : key.base;
      }
      return shift ? key.shift : key.base;
    };

    const handleKey = useCallback((key: KeyDef) => {
      switch (key.action) {
        case 'backspace': deleteChar(); return;
        case 'enter': insertChar('\n'); return;
        case 'tab': insertChar('\t'); return;
        case 'space': insertChar(' '); return;
        case 'caps': setCapsLock(c => !c); return;
        case 'shift': setShift(s => !s); return;
        default: break;
      }
      const ch = effectiveChar(key);
      if (ch) insertChar(ch);
    }, [deleteChar, insertChar, effectiveChar]);

    useEffect(() => {
      const onKeyDown = (e: KeyboardEvent) => {
        if (document.activeElement !== textareaRef.current) return;
        if (e.key === 'CapsLock') { setCapsLock(c => !c); }
        if (e.key === 'Shift') { setShift(true); }
      };
      const onKeyUp = (e: KeyboardEvent) => {
        if (e.key === 'Shift') setShift(false);
      };
      window.addEventListener('keydown', onKeyDown);
      window.addEventListener('keyup', onKeyUp);
      return () => {
        window.removeEventListener('keydown', onKeyDown);
        window.removeEventListener('keyup', onKeyUp);
      };
    }, []);

    const getKeyStyle = (key: KeyDef): string => {
      const base =
        'flex flex-col items-center justify-center rounded-lg border text-center cursor-pointer select-none transition-all duration-100 active:scale-95 active:shadow-inner ';

      if (key.accent) {
        return base + 'h-8 min-w-[2rem] px-1.5 bg-blue-50 border-blue-200 text-blue-700 font-bold text-sm hover:bg-blue-100 hover:border-blue-400';
      }
      if (key.action === 'caps') {
        return base + `h-8 px-2 text-[10px] font-bold border-gray-300 ${capsLock ? 'bg-amber-400 border-amber-500 text-white shadow-inner' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`;
      }
      if (key.action === 'shift') {
        return base + `h-8 px-2 text-[10px] font-bold border-gray-300 ${shift ? 'bg-sky-500 border-sky-600 text-white shadow-inner' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`;
      }
      if (key.action === 'backspace') return base + 'h-8 px-2 bg-red-50 border-red-200 text-red-500 text-sm font-bold hover:bg-red-100';
      if (key.action === 'enter') return base + 'h-8 px-2 bg-emerald-50 border-emerald-200 text-emerald-600 text-xs font-bold hover:bg-emerald-100';
      if (key.action === 'tab') return base + 'h-8 px-2 bg-gray-100 border-gray-300 text-gray-500 text-xs font-bold hover:bg-gray-200';
      if (key.action === 'space') return base + 'h-8 bg-white border-gray-300 text-gray-400 text-[10px] hover:bg-gray-50';
      if (!key.base && !key.accent) return base + 'h-8 px-2 bg-gray-100 border-gray-200 text-gray-400 text-[10px] cursor-default opacity-60';

      const isAccentChar = /[àâäéèêëîïôöùûüçœæ²]/i.test(key.base);
      return base + `h-8 min-w-[1.85rem] ${isAccentChar ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold hover:bg-indigo-100 hover:border-indigo-400' : 'bg-white border-gray-200 text-gray-800 hover:bg-sky-50 hover:border-sky-300'}`;
    };

    const renderLabel = (key: KeyDef) => {
      if (key.action === 'space') return <span className="text-[10px]">Espace / Space</span>;
      if (key.action === 'caps') return (
        <span className="flex flex-col items-center leading-none">
          <span className="text-[9px]">Caps</span>
          <span className="text-[9px]">Lock</span>
          {capsLock && <span className="w-1 h-1 rounded-full bg-current mt-0.5 opacity-80" />}
        </span>
      );
      if (key.action === 'shift') return <span className="text-[10px]">⇧ Shift</span>;
      if (key.action === 'backspace') return <span className="text-base leading-none">⌫</span>;
      if (key.action === 'enter') return <span className="text-[10px]">↵ Entrée</span>;
      if (key.action === 'tab') return <span className="text-[10px]">⇥ Tab</span>;
      if (key.accent) {
        return (
          <span className="flex flex-col items-center leading-none gap-0">
            <span className="text-[9px] text-blue-400 opacity-70">{key.shift !== key.base ? key.shift : ''}</span>
            <span className="text-sm font-bold">{key.base}</span>
          </span>
        );
      }
      if (key.base !== key.shift) {
        return (
          <span className="flex flex-col items-center leading-none w-full px-0.5">
            <span className="text-[8px] text-gray-400 self-end leading-none">{key.shift}</span>
            <span className="text-[11px] font-semibold self-start leading-none">{key.base}</span>
          </span>
        );
      }
      return <span className="text-[11px] font-semibold">{key.base}</span>;
    };

    const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
    const charCount = text.length;

    return (
      <div className="flex flex-col gap-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <div className="flex flex-col lg:flex-row gap-4 items-start">
          <div className="w-full lg:w-[42%] flex flex-col gap-3 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-800">📝 Writing Area</h3>
              <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium">
                {saving
                  ? <span className="text-amber-500">⏳ Saving…</span>
                  : saved
                    ? <span className="text-emerald-500">✓ Saved</span>
                    : <span>{wordCount} words · {charCount} characters</span>}
              </div>
            </div>
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={text}
                onChange={e => { setText(e.target.value); autoSave(e.target.value); }}
                rows={10}
                placeholder="Start writing here…&#10;(Click the keys below or type on your keyboard)"
                className="w-full bg-white border-2 border-gray-200 focus:border-sky-400 rounded-2xl px-5 py-4 text-[15px] text-gray-800 outline-none resize-none transition-all leading-relaxed"
                style={{ fontFamily: "'Georgia', serif", minHeight: 170 }}
                spellCheck={false}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${capsLock ? 'bg-amber-100 border-amber-300 text-amber-700' : 'bg-gray-100 border-gray-200 text-gray-400'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${capsLock ? 'bg-amber-500' : 'bg-gray-300'}`} />
                CAPS {capsLock ? 'ON' : 'OFF'}
              </span>
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${shift ? 'bg-sky-100 border-sky-300 text-sky-700' : 'bg-gray-100 border-gray-200 text-gray-400'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${shift ? 'bg-sky-500' : 'bg-gray-300'}`} />
                SHIFT {shift ? 'ON' : 'OFF'}
              </span>
              <button
                onClick={() => { setText(''); autoSave(''); }}
                className="ml-auto flex items-center gap-1 text-[10px] text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-lg transition-colors font-bold"
              >
                <RotateCcw className="w-3 h-3" /> Effacer / Clear
              </button>
            </div>
          </div>

          <div className="w-full lg:flex-1 flex flex-col gap-3 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-800">⌨️ French AZERTY Keyboard</h3>
              <span className="text-[10px] text-gray-400 font-medium bg-gray-100 px-2 py-1 rounded-full">French AZERTY</span>
            </div>
            <div className="bg-gradient-to-b from-gray-100 to-gray-200 rounded-2xl border border-gray-300 p-3 shadow-md overflow-x-auto">
              <div className="mb-2 pb-2 border-b border-gray-300">
                <p className="text-[9px] font-bold text-blue-500 uppercase tracking-widest mb-1.5">✦ Accents & Caractères spéciaux</p>
                <div className="flex flex-wrap gap-1">
                  {ACCENT_EXTRAS.map((key, i) => (
                    <button key={i} type="button" className={getKeyStyle(key)} onClick={() => handleKey(key)} title={shift ? key.shift : key.base}>
                      {renderLabel(key)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1 min-w-[560px]">
                {ROWS.map((row, ri) => (
                  <div key={ri} className="flex items-center gap-0.5">
                    {row.map((key, ki) => {
                      const span = key.colSpan || 1;
                      return (
                        <button
                          key={ki}
                          type="button"
                          className={getKeyStyle(key)}
                          style={{ flex: span, minWidth: span > 1 ? `${span * 2.1}rem` : '1.85rem' }}
                          onClick={() => handleKey(key)}
                          title={key.action ? key.action : effectiveChar(key)}
                        >
                          {renderLabel(key)}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-sky-50 border border-sky-100 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <Info className="w-4 h-4 text-sky-500 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-sky-800 space-y-1 min-w-0">
              <p className="font-bold text-sky-700 mb-1.5">💡 How to use the French Keyboard</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                <p>• <strong>Click</strong> the keys on screen <em>or</em> type on your physical keyboard.</p>
                <p>• The <strong>blue bar</strong> at the top has all French accents (é, è, â, ç…).</p>
                <p>• <strong>Caps Lock</strong> (glows orange when on) → keeps all letters uppercase.</p>
                <p>• <strong>Shift ⇧</strong> (glows blue when on) → uppercase or alternate character.</p>
                <p>• <strong>Caps Lock + Shift</strong> together → switches back to lowercase.</p>
                <p>• Your notes are <strong>auto-saved</strong> every few seconds — no need to do anything.</p>
                <p>• <strong>Indigo-colored</strong> keys on the main keyboard = accented AZERTY characters.</p>
                <p>• On mobile, <strong>scroll the keyboard horizontally</strong> if keys go off screen.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* ═══════════════════════════════════════════════════════════════
    WRITING TAB
  ═══════════════════════════════════════════════════════════════ */
  const WritingTab: React.FC = () => {
    return (
      <>
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Writing Practice</h2>
        <p className="text-sm text-gray-400 mb-6">Use the French keyboard to practice. Notes are saved automatically.</p>
        <FrenchKeyboard />
      </>
    );
  };

  export default WritingTab;