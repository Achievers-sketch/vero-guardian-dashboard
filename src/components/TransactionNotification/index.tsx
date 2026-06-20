'use client';

import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import type { VoteTxState } from '@/hooks/useVoteTransaction';
import { getStellarExplorerTxUrl } from '@/lib/stellar-expert';

interface TransactionNotificationProps {
  state: VoteTxState;
  /** Called when the user dismisses an error notification. */
  onDismiss?: () => void;
}

/**
 * Inline transaction status notification for the vote flow.
 * Renders nothing while idle; shows a spinner for PENDING,
 * a success message with an explorer link for SUCCESS,
 * and a contextual error for ERROR (distinguishing user rejection
 * from contract/network failures).
 */
export default function TransactionNotification({
  state,
  onDismiss,
}: TransactionNotificationProps): ReactElement | null {
  const { t } = useTranslation();

  if (state.status === 'idle') return null;

  if (state.status === 'pending') {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400"
      >
        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
        <span>{t('vote.tx.pending')}</span>
      </div>
    );
  }

  if (state.status === 'success' && state.txHash) {
    const explorerUrl = getStellarExplorerTxUrl(state.txHash);
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400"
      >
        <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
        <span>
          {t('vote.tx.success')}{' '}
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:no-underline font-medium"
          >
            {t('vote.tx.viewTx')}
          </a>
        </span>
      </div>
    );
  }

  if (state.status === 'error') {
    const label =
      state.errorKind === 'user_rejected'
        ? t('vote.tx.errorUserRejected')
        : t('vote.tx.errorNetwork');

    return (
      <div
        role="alert"
        aria-live="assertive"
        className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400"
      >
        <XCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
        <span className="flex-1">{label}</span>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
            aria-label={t('toast.closeNotification')}
          >
            ×
          </button>
        )}
      </div>
    );
  }

  return null;
}
