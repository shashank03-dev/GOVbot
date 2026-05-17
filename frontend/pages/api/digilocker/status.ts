import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { consent_id } = req.query;

  if (!consent_id) {
    return res.status(400).json({ error: 'Consent ID required' });
  }

  try {
    // Forward to backend
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/digilocker/mock/status/${consent_id}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch status');
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('DigiLocker status error:', error);
    return res.status(500).json({ error: 'Failed to check DigiLocker status' });
  }
}
