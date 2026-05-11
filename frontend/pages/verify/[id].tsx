import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

interface VerificationResult {
  valid: boolean;
  revoked: boolean;
  issued_at: string | null;
  issuer: string | null;
  message: string;
}

interface CredentialData {
  credential_id: string;
  confirmation_number: string;
  phone: string;
  blockchain_tx_hash: string;
  credential_hash: string;
  ipfs_hash: string | null;
  credential_json: {
    credentialSubject?: {
      name?: string;
      scholarshipType?: string;
      amount?: number;
      confirmationNumber?: string;
    };
    issuer?: {
      name?: string;
    };
    issuanceDate?: string;
  };
  issued_at: string;
  revoked: boolean;
}

export default function VerifyCredential() {
  const router = useRouter();
  const { id } = router.query;
  
  const [credential, setCredential] = useState<CredentialData | null>(null);
  const [verification, setVerification] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    fetchCredential(id as string);
  }, [id]);

  const fetchCredential = async (credentialId: string) => {
    try {
      // Fetch credential data
      const credResponse = await fetch(`/api/credentials/by-confirmation/${credentialId}`);
      
      if (!credResponse.ok) {
        // Try by credential ID
        const altResponse = await fetch(`/api/credentials/verify/${credentialId}`);
        if (!altResponse.ok) {
          throw new Error('Credential not found');
        }
        const verifyData = await altResponse.json();
        setVerification(verifyData);
        
        // Get full credential
        const fullResponse = await fetch(`/api/credentials/${credentialId}`);
        if (fullResponse.ok) {
          const walletData = await fullResponse.json();
          const found = walletData.credentials?.find(
            (c: CredentialData) => c.credential_id === credentialId
          );
          if (found) setCredential(found);
        }
      } else {
        const credData = await credResponse.json();
        setCredential(credData);
        
        // Verify on blockchain
        const verifyResponse = await fetch(`/api/credentials/verify/${credData.credential_id}`);
        const verifyData = await verifyResponse.json();
        setVerification(verifyData);
      }
    } catch (err) {
      setError('Credential not found or invalid');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const shortenHash = (hash: string) => {
    if (!hash || hash.length < 20) return hash;
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-green-400 font-mono mb-4">Verifying on blockchain...</div>
          <div className="w-48 h-1 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 animate-pulse" style={{ width: '60%' }} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-red-400 font-bold text-xl mb-2">Verification Failed</h1>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  const subject = credential?.credential_json?.credentialSubject;
  const isValid = verification?.valid && !verification?.revoked && !credential?.revoked;

  return (
    <>
      <Head>
        <title>Verify Credential | GovBot</title>
      </Head>

      <div className="min-h-screen bg-black p-4">
        <div className="max-w-2xl mx-auto">
          {/* Verification Status */}
          <div className={`text-center py-12 mb-8 rounded-lg ${
            isValid ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'
          }`}>
            <div className="text-6xl mb-4">
              {isValid ? '✅' : '❌'}
            </div>
            <h1 className={`text-2xl font-bold mb-2 ${isValid ? 'text-green-400' : 'text-red-400'}`}>
              {isValid ? 'Credential Verified' : 'Invalid or Revoked'}
            </h1>
            <p className="text-gray-400">
              {isValid 
                ? 'This scholarship credential is valid and verified on the blockchain'
                : 'This credential cannot be verified or has been revoked'
              }
            </p>
          </div>

          {/* Credential Details */}
          {credential && (
            <div className="bg-gray-900 border border-green-500/30 rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-green-500/20">
                <h2 className="text-lg font-bold text-white">Credential Details</h2>
              </div>

              <div className="p-6 space-y-4">
                {/* Student Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-500 text-sm">Student Name</span>
                    <div className="text-white font-medium">
                      {subject?.name || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">Scholarship Type</span>
                    <div className="text-white font-medium">
                      {subject?.scholarshipType || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">Amount</span>
                    <div className="text-green-400 font-bold text-lg">
                      ₹{(subject?.amount || 0).toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">Confirmation Number</span>
                    <div className="text-white font-mono text-sm">
                      {credential.confirmation_number}
                    </div>
                  </div>
                </div>

                <hr className="border-gray-800" />

                {/* Issuer Info */}
                <div>
                  <span className="text-gray-500 text-sm">Issued By</span>
                  <div className="text-white">
                    {credential.credential_json?.issuer?.name || 'GovBot Scholarship System'}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {formatDate(credential.issued_at)}
                  </div>
                </div>

                <hr className="border-gray-800" />

                {/* Blockchain Info */}
                <div>
                  <span className="text-gray-500 text-sm mb-2 block">Blockchain Record</span>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between bg-gray-800 p-3 rounded">
                      <span className="text-gray-400 text-sm">Network</span>
                      <span className="text-green-400 font-mono text-sm">Polygon Mumbai</span>
                    </div>
                    
                    <div className="flex items-center justify-between bg-gray-800 p-3 rounded">
                      <span className="text-gray-400 text-sm">Transaction Hash</span>
                      <a
                        href={`https://mumbai.polygonscan.com/tx/${credential.blockchain_tx_hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-400 font-mono text-sm hover:underline"
                      >
                        {shortenHash(credential.blockchain_tx_hash)} ↗
                      </a>
                    </div>
                    
                    <div className="flex items-center justify-between bg-gray-800 p-3 rounded">
                      <span className="text-gray-400 text-sm">Credential Hash</span>
                      <span className="text-gray-500 font-mono text-xs">
                        {shortenHash(credential.credential_hash)}
                      </span>
                    </div>
                    
                    {credential.ipfs_hash && (
                      <div className="flex items-center justify-between bg-gray-800 p-3 rounded">
                        <span className="text-gray-400 text-sm">IPFS Storage</span>
                        <a
                          href={`https://gateway.pinata.cloud/ipfs/${credential.ipfs_hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-400 font-mono text-sm hover:underline"
                        >
                          {shortenHash(credential.ipfs_hash)} ↗
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Verification Method */}
          <div className="mt-8 bg-gray-900/50 border border-green-500/20 rounded-lg p-6">
            <h3 className="text-green-400 font-mono text-sm uppercase mb-3">
              How This Verification Works
            </h3>
            <ol className="text-gray-400 text-sm space-y-2 list-decimal list-inside">
              <li>The credential hash is compared with the blockchain record</li>
              <li>The transaction is verified on Polygon Mumbai testnet</li>
              <li>IPFS metadata is checked for completeness</li>
              <li>Revocation status is confirmed</li>
            </ol>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-xs">
              Powered by GovBot • Verified on Polygon Mumbai
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
