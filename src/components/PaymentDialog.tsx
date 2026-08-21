interface Props {
  open: boolean;
  name: string;
  amount: string;
  date: string;
  onDateChange: (date: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

export function PaymentDialog({ open, name, amount, date, onDateChange, onCancel, onConfirm }: Props) {
  if (!open) return null;
  return (
    <div className="dialog-backdrop" style={{ position: 'absolute', inset: 0, padding: 20 }}>
      <div className="dialog" style={{ width: 'min(320px,92%)' }}>
        <div className="dialog-title">Record payment</div>
        <div className="dialog-body">
          Record payment in full for <b>{name}</b> and clear the outstanding balance of <b>{amount}</b>?
        </div>
        <div className="field">
          <label>Date</label>
          <input className="input" type="date" value={date} onChange={(e) => onDateChange(e.target.value)} />
        </div>
        <div className="dialog-actions">
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn btn-primary" onClick={onConfirm} disabled={!date}>Record payment</button>
        </div>
      </div>
    </div>
  );
}
