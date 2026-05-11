import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function DigiLockerCallback() {
  const router = useRouter();
  const { consent_id } = router.query;
  
  const [status, setStatus] = useState<'loading' | 'processing' | 'success' | 'error'>('loading');
  const [progress, setProgress] = useState(0);
  const [documents, setDocuments] = useState<string[]>([]);

  useEffect(() => {
    if (!consent_id) return;

    const processDigiLocker = async () => {
      try {
        // Step 1: Simulate authorization processing
        setStatus('processing');
        setProgress(20);
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Step 2: Call mock callback endpoint
        setProgress(40);
        const response = await fetch(`/api/digilocker/mock/callback?consent_id=${consent_id}&action=approve`);
        
        if (!response.ok) {
          throw new Error('Authorization failed');
        }
        
        const data = await response.json();
        
        // Step 3: Fetch documents
        setProgress(60);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const docsResponse = await fetch(`/api/digilocker/mock/documents/${consent_id}`);
        const docsData = await docsResponse.json();
        
        if (docsData.documents) {
          setDocuments(docsData.documents.map((doc: any) => doc.name));
        }
        
        // Step 4: Complete
        setProgress(100);
        setStatus('success');
        
        // Auto-close after 3 seconds
        setTimeout(() => {
          window.close();
        }, 3000);
        
      } catch (error) {
        setStatus('error');
      }
    };

    processDigiLocker();
  }, [consent_id]);

  const getStatusMessage = () => {
    switch (status) {
      case 'loading':
        return 'Initializing DigiLocker connection...';
      case 'processing':
        if (progress < 40) return 'Authorizing with DigiLocker...';
        if (progress < 60) return 'Fetching your documents...';
        return 'Processing documents...';
      case 'success':
        return 'DigiLocker connected successfully!';
      case 'error':
        return 'Failed to connect DigiLocker. Please try again.';
    }
  };

  const getStatusEmoji = () => {
    switch (status) {
      case 'loading':
        return '🔗';
      case 'processing':
        return '⏳';
      case 'success':
        return '✅';
      case 'error':
        return '❌';
    }
  };

  return (
    <>
      <Head>
        <title>DigiLocker Authorization | GovBot</title>
      </Head>
      
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 mb-4">
              <span className="text-4xl">{getStatusEmoji()}</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              DigiLocker Authorization
            </h1>
            <p className="text-gray-400">
              Secure government document access
            </p>
          </div>

          {/* Status Card */}
          <div className="bg-gray-900 border border-green-500/30 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-green-400 font-mono text-sm uppercase tracking-wider">
                Status
              </span>
              <span className="text-white font-mono text-sm">
                {progress}%
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-800 rounded-full h-2 mb-4">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            <p className="text-white text-center">
              {getStatusMessage()}
            </p>
          </div>

          {/* Documents List */}
          {status === 'success' && documents.length > 0 && (
            <div className="bg-gray-900 border border-green-500/30 rounded-lg p-6 mb-6">
              <h3 className="text-green-400 font-mono text-sm uppercase tracking-wider mb-4">
                Documents Fetched
              </h3>
              <ul className="space-y-3">
                {documents.map((doc, index) => (
                  <li key={index} className="flex items-center text-white">
                    <span className="text-green-500 mr-3">✓</span>
                    {doc}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Instructions */}
          {status === 'success' && (
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-4">
                Return to WhatsApp to continue your scholarship application
              </p>
              <p className="text-green-400 text-sm">
                This window will close automatically...
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <button 
                onClick={() => router.reload()}
                className="bg-green-500 hover:bg-green-600 text-black font-bold py-3 px-6 rounded transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-xs">
              Powered by DigiLocker • Government of India
            </p>
            <p className="text-gray-600 text-xs mt-1">
              Demo Mode — Mock Integration
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
