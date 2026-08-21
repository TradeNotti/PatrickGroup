import { useEffect, useRef, useState } from 'react';
import { MUT_55 } from '../../lib/colors';
import { TrashIcon } from '../icons';

// Requires two taps: first tap swaps the icon for an inline Yes/No prompt,
// second tap on Yes actually deletes. Auto-cancels after a few seconds so a
// stray first tap can't leave a live "delete?" button lying around.
export function DeleteButton({ onConfirm, label = 'record' }: { onConfirm: () => void; label?: string }) {
  const [confirming, setConfirming] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  function ask(e: React.MouseEvent) {
    e.stopPropagation();
    setConfirming(true);
    timer.current = setTimeout(() => setConfirming(false), 4000);
  }

  function cancel(e: React.MouseEvent) {
    e.stopPropagation();
    if (timer.current) clearTimeout(timer.current);
    setConfirming(false);
  }

  function confirm(e: React.MouseEvent) {
    e.stopPropagation();
    if (timer.current) clearTimeout(timer.current);
    setConfirming(false);
    onConfirm();
  }

  if (confirming) {
    // Compact icon-only confirm (not "Delete? Yes No") so this never forces a
    // narrow table column or flex row wider than the phone-width layout.
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
        <button
          onClick={confirm}
          aria-label={`Confirm delete ${label}`}
          title="Confirm delete"
          style={{ background: 'var(--color-accent)', color: '#fff', border: 'none', width: 22, height: 22, padding: 0, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
        >
          ✓
        </button>
        <button
          onClick={cancel}
          aria-label="Cancel delete"
          title="Cancel"
          style={{ background: 'none', border: '1px solid var(--color-divider)', width: 22, height: 22, padding: 0, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'inherit', flexShrink: 0 }}
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={ask}
      aria-label={`Delete ${label}`}
      style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer', color: MUT_55, display: 'flex', flexShrink: 0 }}
    >
      <TrashIcon />
    </button>
  );
}
