import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  try {
    const { aadhaar } = req.body;

    if (!aadhaar || !/^\d{12}$/.test(String(aadhaar))) {
      return res.status(400).json({ error: 'Invalid Aadhaar' });
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_RAILWAY_URL}/pm-kisan/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ aadhaar }),
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch status' });
  }
}
