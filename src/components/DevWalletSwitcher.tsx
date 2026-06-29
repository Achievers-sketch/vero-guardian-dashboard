'use client';

import { useState } from 'react';
import { useWallet } from '@/context/WalletContext';
import { KeyRound, X, ChevronDown, ChevronUp } from 'lucide-react';

/**
 * DEV-ONLY floating panel that lets you inject an arbitrary Stellar public key
 * directly into WalletContext — no wallet extension required.
 *
 * Both this component AND `WalletContext.setMockPublicKey` independently
 * check `process.env.NODE_ENV`, ensuring the feature is a guaranteed no-op
 * in production even if only one guard were to be removed.
 */
export default function DevWalletSwitcher() {
  // Independent production guard (layer 1 of 2).
  // Returning null *before* any hooks would violate the Rules of Hooks, so we
  // place the early-return after the hook declarations.
  const { setMockPublicKey } = useWallet();
  const [collapsed, setCollapsed] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [dismissed, setDismissed] = useState(false);

  // Layer 1 guard: component renders nothing in production.
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  if (dismissed) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-[9999] w-72 rounded-xl border border-amber-400/40 bg-slate-900/95 shadow-2xl backdrop-blur-sm"
      role="complementary"
      aria-label="Dev wallet switcher"
    >
      {/* ── Header bar ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-700/60">
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold tracking-wide uppercase focus:outline-none focus:ring-2 focus:ring-amber-400/60 rounded"
          aria-expanded={!collapsed}
          aria-controls="dev-wallet-switcher-body"
        >
          <KeyRound className="w-3.5 h-3.5" aria-hidden="true" />
          Dev Wallet
          {collapsed
            ? <ChevronDown className="w-3.5 h-3.5 ml-0.5" aria-hidden="true" />
            : <ChevronUp className="w-3.5 h-3.5 ml-0.5" aria-hidden="true" />}
        </button>

        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss dev wallet panel"
          className="text-slate-500 hover:text-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400/60 rounded"
        >
          <X className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>

      {/* ── Collapsible body ────────────────────────────────────────────────── */}
      {!collapsed && (
        <div
          id="dev-wallet-switcher-body"
          className="px-3 py-3 flex flex-col gap-2"
        >
          <label
            htmlFor="dev-wallet-input"
            className="text-xs text-slate-400 font-medium"
          >
            Stellar public key
          </label>
          <input
            id="dev-wallet-input"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="G..."
            spellCheck={false}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/60 transition-colors"
          />
          <button
            type="button"
            onClick={() => {
              if (inputValue.trim()) {
                setMockPublicKey(inputValue.trim());
              }
            }}
            disabled={!inputValue.trim()}
            className="flex items-center justify-center gap-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-900 text-xs font-semibold px-3 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            <KeyRound className="w-3.5 h-3.5" aria-hidden="true" />
            Apply key
          </button>
          <p className="text-[10px] text-slate-500 leading-snug">
            ⚠ Dev only — this panel and the underlying method are both no-ops in production.
          </p>
        </div>
      )}
    </div>
  );
}
