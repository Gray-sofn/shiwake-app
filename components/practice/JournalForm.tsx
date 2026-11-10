'use client';

// 1行分の入力状態の型定義
interface RowInput {
  account: string;
  amount: string;
}

interface JournalFormProps {
  options: string[];
  debitRows: RowInput[];
  creditRows: RowInput[];
  isAnswered: boolean;
  onDebitChange: (index: number, field: 'account' | 'amount', value: string) => void;
  onCreditChange: (index: number, field: 'account' | 'amount', value: string) => void;
  onDebitBlur: (index: number) => void;
  onDebitFocus: (index: number) => void;
  onCreditBlur: (index: number) => void;
  onCreditFocus: (index: number) => void;
}

export function JournalForm({
  options,
  debitRows,
  creditRows,
  isAnswered,
  onDebitChange,
  onCreditChange,
  onDebitBlur,
  onDebitFocus,
  onCreditBlur,
  onCreditFocus,
}: JournalFormProps) {
  return (
    // {/* 解答エリア：左右2列（借方 / 貸方） */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 border p-4 rounded-lg bg-white">
      {/* 借方（左）5行 */}
      <div>
        <h2 className="font-bold text-gray-700 mb-3 border-b pb-1">【借方（左）】</h2>
        <div className="flex flex-col gap-2">
          {debitRows.map((row, idx) => (
            <div key={`debit-${idx}`} className="flex items-center gap-2">
              <span className="text-xs text-gray-400 w-4 text-right">{idx + 1}</span>
              {/* 勘定科目（セレクトボックス） */}
              <select
                value={row.account}
                onChange={(e) => onDebitChange(idx, 'account', e.target.value)}
                disabled={isAnswered}
                className="border p-2 rounded flex-1 text-sm bg-white"
              >
                <option value="">選択してください</option>
                {options.map((acc) => (
                  <option key={acc} value={acc}>
                    {acc}
                  </option>
                ))}
              </select>
              {/* 金額（入力欄） */}
              <input
                type="text"
                inputMode="numeric"
                placeholder="金額"
                value={row.amount}
                onChange={(e) => onDebitChange(idx, 'amount', e.target.value)}
                onBlur={() => onDebitBlur(idx)}
                onFocus={() => onDebitFocus(idx)}
                disabled={isAnswered}
                className="border p-2 rounded w-32 text-sm text-right font-mono"
              />
            </div>
          ))}
        </div>
      </div>

      {/* 貸方（右）5行 */}
      <div>
        <h2 className="font-bold text-gray-700 mb-3 border-b pb-1">【貸方（右）】</h2>
        <div className="flex flex-col gap-2">
          {creditRows.map((row, idx) => (
            <div key={`credit-${idx}`} className="flex items-center gap-2">
              <span className="text-xs text-gray-400 w-4 text-right">{idx + 1}</span>
              {/* 勘定科目（セレクトボックス） */}
              <select
                value={row.account}
                onChange={(e) => onCreditChange(idx, 'account', e.target.value)}
                disabled={isAnswered}
                className="border p-2 rounded flex-1 text-sm bg-white"
              >
                <option value="">選択してください</option>
                {options.map((acc) => (
                  <option key={acc} value={acc}>
                    {acc}
                  </option>
                ))}
              </select>
              {/* 金額（入力欄） */}
              <input
                type="text"
                inputMode="numeric"
                placeholder="金額"
                value={row.amount}
                onChange={(e) => onCreditChange(idx, 'amount', e.target.value)}
                onBlur={() => onCreditBlur(idx)}
                onFocus={() => onCreditFocus(idx)}
                disabled={isAnswered}
                className="border p-2 rounded w-32 text-sm text-right font-mono"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
