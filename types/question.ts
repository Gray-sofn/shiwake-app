// 仕訳の1行分（勘定科目と金額）
export interface JournalEntryLine {
  account: string; // 例: "仕入"
  amount: number;  // 例: 100000
}

// 解答の構造（借方・貸方）
export interface JournalSolution {
  debit: JournalEntryLine[];  // 借方（左）
  credit: JournalEntryLine[]; // 貸方（右）
}

// 問題データの全体像
export interface Question {
  id: string;
  category: string;      // 単元名（商品売買、固定資産など）
  difficulty: string;    // '基本' | '標準' | '応用';
  question: string;      // 問題文
  options: string[];     // 回答の選択肢
  solution: JournalSolution; // 正解仕訳
  explanation: string;   // 解説文
}