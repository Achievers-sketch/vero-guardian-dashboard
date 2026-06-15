'use client';

import { useState, useEffect } from 'react';
import VoteCard from '@/components/VoteCard';
import { GitPullRequest, Loader2 } from 'lucide-react';

interface PR {
  id: number;
  title: string;
  author: string;
  url: string;
  status: 'pending' | 'approved' | 'rejected';
  votes: number;
}

export default function PRFeed() {
  const [prs, setPrs] = useState<PR[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with real API fetch
    const mockPRs: PR[] = [
      {
        id: 42,
        title: 'Add multi-signature support for transactions',
        author: '@dev_alice',
        url: 'https://github.com/vero/pr/42',
        status: 'pending',
        votes: 5,
      },
      {
        id: 43,
        title: 'Optimize smart contract gas fees',
        author: '@dev_bob',
        url: 'https://github.com/vero/pr/43',
        status: 'pending',
        votes: 3,
      },
      {
        id: 44,
        title: 'Implement rate limiting for API endpoints',
        author: '@dev_charlie',
        url: 'https://github.com/vero/pr/44',
        status: 'pending',
        votes: 8,
      },
    ];

    setTimeout(() => {
      setPrs(mockPRs);
      setLoading(false);
    }, 800);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
        <p className="text-slate-400">Loading validation feed...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <GitPullRequest className="w-5 h-5 text-indigo-400" />
        <h2 className="text-xl font-semibold text-white">Pending Validations</h2>
        <span className="ml-auto px-2 py-1 bg-slate-800 text-slate-300 text-sm rounded-full">
          {prs.length} PRs
        </span>
      </div>
      
      <div className="space-y-3">
        {prs.map((pr) => (
          <div key={pr.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-slate-600 transition-colors">
            <div className="flex-1 w-full">
              <a 
                href={pr.url} 
                target="_blank" 
                rel="noreferrer" 
                className="font-medium text-white hover:text-indigo-400 transition-colors block break-words"
              >
                #{pr.id} {pr.title}
              </a>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-sm text-slate-400">{pr.author}</span>
                <span className="flex items-center gap-1 text-sm text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                  {pr.votes} votes
                </span>
              </div>
            </div>
            <div className="w-full sm:w-auto">
              <VoteCard pr={pr} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
