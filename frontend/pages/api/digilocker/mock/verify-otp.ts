import type { NextApiRequest, NextApiResponse } from 'next';

const MOCK_PROFILE = {
  name: 'Ravi Kumar',
  dob: '15/08/2003',
  gender: 'Male',
  aadhaar: '8765 4321 0987',
  email: 'ravi.kumar@example.com',
  category: 'OBC',
  religion: 'Hindu',
  income: '180000',
  domicile: 'Karnataka',
  district: 'Bengaluru Urban',
  institute: 'Government PU College, Jayanagar, Bengaluru',
  course: 'Pre-University (Science)',
  year: '1st Year',
  board: 'Karnataka Secondary Education Board',
  marks: '89',
  admissionDate: '01/07/2025',
  accountHolder: 'Ravi Kumar',
  bankName: 'State Bank of India',
  accountNo: '31245678901234',
  confirmAccountNo: '31245678901234',
  ifsc: 'SBIN0001234',
  branch: 'Jayanagar Branch',
  docs: ['Aadhaar Card', 'Income Certificate', 'Caste Certificate', 'Marksheet 2024'],
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phone, otp } = req.body;
  if (!phone || !otp) {
    return res.status(400).json({ error: 'phone and otp are required' });
  }

  try {
    const backendUrl = process.env.NEXT_PUBLIC_RAILWAY_URL || 'http://localhost:8000';
    const response = await fetch(`${backendUrl}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, code: otp }),
    });

    const data = await response.json();

    if (!response.ok || data.valid === false) {
      return res.status(401).json({ success: false, error: data.error || 'Invalid or expired OTP' });
    }

    // Merge the actual phone number into the profile
    const profile = { ...MOCK_PROFILE, mobile: phone };

    return res.status(200).json({ success: true, profile });
  } catch (error) {
    return res.status(500).json({ error: 'Verification failed' });
  }
}
