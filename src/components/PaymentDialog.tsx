interface Props {
  open: boolean;
  name: string;
  amount: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function PaymentDialog({ open, name, amount, onCancel, onConfirm }: Props) {
  if (!open) return null;
  return (
    <div className="dialog-backdrop" style={{ position: 'absolute', inset: 0, padding: 20 }}>
      <div className="dialog" style={{ width: 'min(320px,92%)' }}>
        <div className="dialog-title">Record payment</div>
        <div className="dialog-body">
          Record payment in full for <b>{name}</b> and clear the outstanding balance of <b>{amount}</b>?
        </div>
        <div className="dialog-actions">
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn btn-primary" onClick={onConfirm}>Record payment</button>
        </div>
      </div>
    </div>
  );
}
