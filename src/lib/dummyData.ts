export interface Transaction {
  id: string;
  recipientName: string;
  phoneNumber: string;
  amount: number;
  dateStr: string;
  timestamp: string;
  riskLevel: 'low' | 'medium' | 'high';
  status: 'safe' | 'reviewed';
  isSimulated: boolean;
  category?: string;
}

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'SAFE839201',
    recipientName: 'Priya Sharma',
    phoneNumber: '98765 43210',
    amount: 600,
    dateStr: 'Yesterday',
    timestamp: 'Yesterday, 6:30 PM',
    riskLevel: 'low',
    status: 'safe',
    isSimulated: false,
    category: 'Groceries / Friend'
  },
  {
    id: 'SAFE728190',
    recipientName: 'College Canteen',
    phoneNumber: '91234 56789',
    amount: 150,
    dateStr: '2 days ago',
    timestamp: 'Sep 02, 1:15 PM',
    riskLevel: 'low',
    status: 'safe',
    isSimulated: false,
    category: 'Food & Dining'
  },
  {
    id: 'SAFE617283',
    recipientName: 'Priya Sharma',
    phoneNumber: '98765 43210',
    amount: 450,
    dateStr: '4 days ago',
    timestamp: 'Aug 31, 8:45 PM',
    riskLevel: 'low',
    status: 'safe',
    isSimulated: false,
    category: 'Groceries / Friend'
  },
  {
    id: 'SAFE516274',
    recipientName: 'College Canteen',
    phoneNumber: '91234 56789',
    amount: 120,
    dateStr: 'Last week',
    timestamp: 'Aug 28, 12:40 PM',
    riskLevel: 'low',
    status: 'safe',
    isSimulated: false,
    category: 'Food & Dining'
  },
  {
    id: 'SAFE405162',
    recipientName: 'Priya Sharma',
    phoneNumber: '98765 43210',
    amount: 500,
    dateStr: '2 weeks ago',
    timestamp: 'Aug 20, 11:20 AM',
    riskLevel: 'low',
    status: 'safe',
    isSimulated: false,
    category: 'Groceries / Friend'
  },
  {
    id: 'SAFE394051',
    recipientName: 'College Canteen',
    phoneNumber: '91234 56789',
    amount: 100,
    dateStr: '3 weeks ago',
    timestamp: 'Aug 15, 2:05 PM',
    riskLevel: 'low',
    status: 'safe',
    isSimulated: false,
    category: 'Food & Dining'
  }
];

export function generateTransactionId(): string {
  const randomSixDigits = Math.floor(100000 + Math.random() * 900000);
  return `SAFE${randomSixDigits}`;
}

export interface KnownRecipient {
  name: string;
  phoneNumber: string;
  avgAmount: number;
  count: number;
}

export const KNOWN_RECIPIENTS_INFO: Record<string, KnownRecipient> = {
  'priya sharma': {
    name: 'Priya Sharma',
    phoneNumber: '98765 43210',
    avgAmount: 516.67, // (500 + 450 + 600) / 3
    count: 3
  },
  'college canteen': {
    name: 'College Canteen',
    phoneNumber: '91234 56789',
    avgAmount: 123.33, // (120 + 150 + 100) / 3
    count: 3
  }
};
