'use client';

import { useState } from 'react';
import { castVote } from '@/lib/stellar-interact';
import { useWallet } from '@/context/WalletContext';
import { useToast } from '@/components/Toast';

export interface PR {
  id: number;
  title: string;
  author: string;
  url: string;
}

export default function VoteCard({ pr }: { pr: PR }) {
  const { publicKey } = useWallet();
  const { showToast } = useToast();
  const [voted, setVoted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleVote() {
    if (!publicKey) {
      showToast('Please connect your wallet first', 'warning');
      return;
    }
    setLoading(true);
    try {
      await castVote(pr.id, publicKey);
      setVoted(true);
      showToast(`Vote cast for PR #${pr.id}`, 'success');
    } catch (error) {
      showToast('Failed to cast vote', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleVote}
      disabled={voted || loading}
      className={`px-4 py-3 sm:py-2 rounded-lg text-sm font-medium transition-all w-full sm:w-auto min-h-[44px] ${
        voted
          ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-800 cursor-default'
          : loading
          ? 'bg-slate-700 text-slate-400 border border-slate-600 cursor-wait'
          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20'
      }`}
    >
      {voted ? '✓ Voted' : loading ? 'Voting…' : 'Vote'}
    </button>
  );
}
