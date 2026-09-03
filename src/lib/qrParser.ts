export interface ParsedQrData {
  isValid: boolean;
  recipientName?: string;
  vpa?: string;
  phoneNumber?: string;
  amount?: number;
  note?: string;
  rawPayload: string;
  errorMessage?: string;
}

export interface DemoQrPreset {
  id: string;
  title: string;
  recipientName: string;
  phoneNumber: string;
  amount?: number;
  typeBadge: string;
  description: string;
  rawPayload: string;
}

export const DEMO_QR_PRESETS: DemoQrPreset[] = [
  {
    id: 'qr-sample-priya',
    title: 'Priya Fresh Mart',
    recipientName: 'Priya Sharma',
    phoneNumber: '98765 43210',
    amount: 450,
    typeBadge: 'Familiar Contact',
    description: 'UPI QR with preset amount of ₹450',
    rawPayload: 'upi://pay?pa=priya@okhdfcbank&pn=Priya%20Sharma&am=450&cu=INR&tn=Fresh%20Produce'
  },
  {
    id: 'qr-sample-rahul',
    title: 'Rahul Store (New Contact)',
    recipientName: 'Rahul Kumar',
    phoneNumber: '98765 43210',
    amount: 2800,
    typeBadge: 'First-time Recipient',
    description: 'UPI QR with ₹2,800 to a new merchant',
    rawPayload: 'upi://pay?pa=rahulstore@paytm&pn=Rahul%20Kumar&am=2800&cu=INR&tn=Stationery'
  },
  {
    id: 'qr-sample-vikram',
    title: 'Vikram Singh (Amount Pending)',
    recipientName: 'Vikram Singh',
    phoneNumber: '98123 45678',
    amount: undefined,
    typeBadge: 'New Contact • Enter Amount',
    description: 'Static QR (user enters or confirms amount)',
    rawPayload: 'upi://pay?pa=vikram.singh@icici&pn=Vikram%20Singh&cu=INR'
  },
  {
    id: 'qr-sample-invalid',
    title: 'Invalid / Malformed QR Code',
    recipientName: '',
    phoneNumber: '',
    amount: undefined,
    typeBadge: 'Invalid Test',
    description: 'Simulate an unverified or phishing QR link',
    rawPayload: 'https://verify-bonus-instant.xyz/claim-gift?id=fake_payload'
  }
];

/**
 * Parses and validates raw QR code data (UPI URI, JSON, or plain text).
 */
export function parseQrCode(rawData: string): ParsedQrData {
  const trimmed = rawData.trim();

  if (!trimmed) {
    return {
      isValid: false,
      rawPayload: rawData,
      errorMessage: 'QR code data is empty. Please scan a valid payment code.'
    };
  }

  // 1. Standard UPI URI: upi://pay?...
  if (trimmed.toLowerCase().startsWith('upi://pay')) {
    try {
      const url = new URL(trimmed.replace(/^upi:\/\/pay/i, 'https://dummy.upi/pay'));
      const pa = url.searchParams.get('pa') || '';
      const rawPn = url.searchParams.get('pn') || '';
      const pn = decodeURIComponent(rawPn).replace(/\+/g, ' ');
      const rawAm = url.searchParams.get('am');
      const note = url.searchParams.get('tn') || '';

      const amount = rawAm ? parseFloat(rawAm) : undefined;

      // Extract phone if embedded in VPA (e.g. 9876543210@paytm)
      let phone = '';
      const phoneMatch = pa.match(/^(\d{10})@/);
      if (phoneMatch) {
        phone = phoneMatch[1];
      }

      const displayName = pn || (pa ? pa.split('@')[0] : 'Unknown Merchant');

      if (!pa && !pn) {
        return {
          isValid: false,
          rawPayload: rawData,
          errorMessage: 'Incomplete UPI QR code: Missing receiver address or name.'
        };
      }

      return {
        isValid: true,
        recipientName: displayName,
        vpa: pa,
        phoneNumber: phone || undefined,
        amount: amount && !isNaN(amount) && amount > 0 ? amount : undefined,
        note: note ? decodeURIComponent(note) : undefined,
        rawPayload: rawData
      };
    } catch {
      return {
        isValid: false,
        rawPayload: rawData,
        errorMessage: 'Malformed UPI QR code structure.'
      };
    }
  }

  // 2. JSON structured payload (some merchant POS systems)
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const parsed = JSON.parse(trimmed);
      const name = parsed.name || parsed.recipientName || parsed.pn || '';
      const amount = parsed.amount || parsed.am ? Number(parsed.amount || parsed.am) : undefined;
      const phone = parsed.phone || parsed.phoneNumber || '';

      if (name) {
        return {
          isValid: true,
          recipientName: name,
          phoneNumber: phone || undefined,
          amount: amount && !isNaN(amount) ? amount : undefined,
          rawPayload: rawData
        };
      }
    } catch {
      // ignore
    }
  }

  // 3. Fallback: Check if it's an unrecognized or malicious URL
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return {
      isValid: false,
      rawPayload: rawData,
      errorMessage: 'This QR code points to an external website URL, not a direct UPI payment. For your safety, do not pay through unverified web links.'
    };
  }

  return {
    isValid: false,
    rawPayload: rawData,
    errorMessage: 'Unsupported QR code format. Please scan a standard UPI QR code.'
  };
}
