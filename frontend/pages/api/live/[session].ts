import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { session } = req.query;
  if (!session || typeof session !== 'string') return res.status(400).json({ error: 'Missing session' });

  if (req.method === 'GET') {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_RAILWAY_URL}/live/${session}`);
      const data = await response.json();
      return res.status(response.status).json(data);
    } catch (e) {
      return res.status(500).json({ error: 'Live session error' });
    }
  }

  if (req.method === 'POST') {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_RAILWAY_URL}/live/${session}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body),
      });
      const data = await response.json();
      return res.status(response.status).json(data);
    } catch (e) {
      return res.status(500).json({ error: 'Live session update error' });
    }
  }

  return res.status(405).end();
}
