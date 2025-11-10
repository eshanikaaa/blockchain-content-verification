// src/App.jsx
import { useState, useEffect } from 'react'

const API_URL = 'http://127.0.0.1:5000'

// --- 1. LOADER COMPONENT (NO CHANGES) ---
function Loader({ isLoading }) {
  return (
    <div
      className={`
        fixed inset-0 z-50 
        flex items-center justify-center 
        bg-gray-900 
        transition-opacity duration-500 ease-out 
        ${isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'}
      `}
    >
      <div
        className="opacity-0 animate-zoomIn"
        style={{ animationDelay: '200ms' }}
      >
        <svg
          width="160"
          height="100"
          viewBox="0 0 100 60"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* ... (SVG code is unchanged) ... */}
          <defs>
            <linearGradient id="pulseGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#22d3ee' }} />
              <stop offset="100%" style={{ stopColor: '#06b6d4' }} />
            </linearGradient>
          </defs>
          <path
            d="M10 30 C10 10, 30 10, 50 30 C70 50, 90 50, 90 30 C90 10, 70 10, 50 30 C30 50, 10 50, 10 30"
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="5"
          />
          <path
            d="M10 30 C10 10, 30 10, 50 30 C70 50, 90 50, 90 30 C90 10, 70 10, 50 30 C30 50, 10 50, 10 30"
            fill="none"
            stroke="url(#pulseGradient)"
            strokeWidth="5"
            strokeLinecap="round"
            pathLength="100"
            strokeDasharray="20 80"
            className="animate-flow"
          />
        </svg>
      </div>
    </div>
  )
}

// --- NEW: BlockCard Component (NO CHANGES) ---
function BlockCard({ block, onVerifyClick, isBusy }) {
  const HashDisplay = ({ hash, label }) => {
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
      if (!hash) return;
      navigator.clipboard.writeText(hash)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }

    const displayHash = hash
      ? `${hash.substring(0, 8)}...${hash.substring(hash.length - 6)}`
      : 'N/A (Genesis Block)';

    return (
      <div className="text-sm flex flex-wrap items-center">
        <strong className="text-gray-400 w-24 flex-shrink-0">{label}:</strong>
        <span className="text-cyan-300 ml-2 break-all">
          {displayHash}
        </span>
        <button
          onClick={handleCopy}
          disabled={!hash}
          className="ml-2 text-xs bg-gray-600 hover:bg-gray-500 text-white py-0.5 px-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700 transition duration-300 hover:border-cyan-600 space-y-3">
      <h3 className="text-xl font-bold text-cyan-400">Block #{block.index}</h3>
      <HashDisplay label="Block Hash" hash={block.hash} />
      <HashDisplay label="Prev. Hash" hash={block.previous_hash} />

      <div className="text-sm">
        <strong className="text-gray-400 w-24 inline-block">Timestamp:</strong>
        <span className="text-gray-300 ml-2">
          {new Date(block.timestamp * 1000).toLocaleString()}
        </span>
      </div>

      <div className="pt-3 border-t border-gray-700">
        <h4 className="font-semibold text-white mb-2">
          Block Data ({block.data.length} item{block.data.length !== 1 ? 's' : ''})
        </h4>
        {block.data.length > 0 ? (
          <div className="space-y-2">
            {block.data.map((item) => (
              <div
                key={item.content_hash}
                className="bg-gray-700 p-2 rounded-md flex justify-between items-center"
              >
                <span className="text-gray-300 text-xs break-all">
                  Hash: {item.content_hash.substring(0, 10)}...
                </span>
                <button
                  onClick={() => onVerifyClick(item.content_hash)}
                  disabled={isBusy}
                  className="text-xs bg-green-600 hover:bg-green-500 text-white py-1 px-2 rounded-lg transition-colors disabled:bg-gray-500"
                >
                  Verify
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">No data in this block (Genesis block).</p>
        )}
      </div>
    </div>
  )
}


// --- 2. YOUR APP CONTENT (MODIFIED) ---
function AppContent() {
  const [chain, setChain] = useState([])
  const [pendingData, setPendingData] = useState([])
  const [newContent, setNewContent] = useState("")
  const [verifyHash, setVerifyHash] = useState("")
  const [message, setMessage] = useState("")
  const [verifyResult, setVerifyResult] = useState("")
  const [isBusy, setIsBusy] = useState(false) // For user-initiated actions

  // --- MODIFIED: fetchChain is now quieter ---
  // It won't set messages, so it can be called silently in the background.
  const fetchChain = async () => {
    try {
      const response = await fetch(`${API_URL}/chain`)
      const data = await response.json()
      setChain(data.chain)
      setPendingData(data.pending)
    } catch (error) {
      console.error('Error fetching chain:', error)
      // We only set messages on *manual* actions, not background polling
    }
  }

  // --- useEffect for initial fetch ---
  useEffect(() => {
    const initialFetch = async () => {
      setIsBusy(true) // Show loader for the *first* load
      await fetchChain()
      setIsBusy(false)
    }
    initialFetch()
  }, [])

  // --- NEW: useEffect for auto-refreshing (polling) ---
  useEffect(() => {
    // Set up an interval to fetch data every 10 seconds (10000ms)
    const intervalId = setInterval(() => {
      // We call fetchChain directly. It's silent and won't trigger 'isBusy'
      fetchChain()
    }, 10000)

    // Cleanup function: This runs when the component unmounts
    // It's crucial to prevent memory leaks
    return () => clearInterval(intervalId)
  }, []) // Empty dependency array means this runs once on mount

  // --- (useEffect for auto-clearing messages is unchanged) ---
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  useEffect(() => {
    if (verifyResult) {
      const timer = setTimeout(() => setVerifyResult(''), 5000)
      return () => clearTimeout(timer)
    }
  }, [verifyResult])

  // --- (handleAddContent is unchanged) ---
  const handleAddContent = async (e) => {
    e.preventDefault()
    if (!newContent) return
    setIsBusy(true)
    try {
      const response = await fetch(`${API_URL}/add_content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent, metadata: { source: 'ReactApp' } }),
      })
      const data = await response.json()
      setMessage(`Content added. Hash: ${data.content_hash} (Status: ${data.status})`)
      setNewContent('')
      await fetchChain()
    } catch (error) {
      console.error('Error adding content:', error)
      setMessage('Error adding content.')
    } finally {
      setIsBusy(false)
    }
  }

  // --- (handleMineBlock is unchanged) ---
  const handleMineBlock = async () => {
    setIsBusy(true)
    try {
      setMessage('Mining new block...')
      const response = await fetch(`${API_URL}/mine`)
      const newBlock = await response.json()
      setMessage(`New block #${newBlock.index} mined successfully!`)
      await fetchChain()
    } catch (error) {
      console.error('Error mining block:', error)
      setMessage('Error mining block.')
    } finally {
      setIsBusy(false)
    }
  }

  // --- (handleVerifyClick is unchanged) ---
  const handleVerifyClick = async (hash) => {
    setVerifyHash(hash)
    setIsBusy(true)
    try {
      const response = await fetch(`${API_URL}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content_hash: hash }),
      })
      const data = await response.json()
      if (data.verified) {
        setVerifyResult(`✅ VERIFIED: Found in Block #${data.block_index}. (Original timestamp: ${new Date(data.timestamp * 1000).toLocaleString()})`)
      } else if (data.pending) {
        setVerifyResult(`⚠️ PENDING: Content is in the pending pool, not yet mined.`)
      } else {
        setVerifyResult(`❌ NOT FOUND: This content hash is not on the blockchain.`)
      }
    } catch (error) {
      console.error('Error verifying content:', error)
      setVerifyResult('Error during verification.')
    } finally {
      setIsBusy(false)
    }
  }

  // --- (handleVerifyContent is unchanged) ---
  const handleVerifyContent = async (e) => {
    e.preventDefault()
    if (!verifyHash) return
    await handleVerifyClick(verifyHash)
  }

  // --- MODIFIED: handleRefresh now sets messages ---
  // This is what the user *clicks*, so it should be loud and show errors.
  const handleRefresh = async () => {
    setIsBusy(true)
    setMessage('Refreshing chain data...')
    try {
      await fetchChain()
      setMessage('Blockchain data loaded.')
    } catch (error) {
      console.error('Error refreshing chain:', error)
      setMessage('Error fetching chain.')
    }
    setIsBusy(false)
  }

  // --- (JSX is unchanged) ---
  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">

        <h1 className="text-4xl font-bold text-cyan-400 mb-6 opacity-0 animate-fadeInUp">
          Blockchain Content Verifier
        </h1>

        {message && (
          <div
            className="bg-gray-800 border border-cyan-500 text-cyan-300 p-3 rounded-lg mb-6 opacity-100 transition-opacity duration-300"
          >
            <strong>Status:</strong> {message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div
            className="bg-gray-800 p-6 rounded-lg shadow-lg opacity-0 animate-fadeInUp transition duration-300 hover:shadow-cyan-500/20"
            style={{ animationDelay: '200ms' }}
          >
            <h2 className="text-2xl font-semibold mb-4 text-white">Add New Content</h2>
            <form onSubmit={handleAddContent}>
              <textarea
                className="w-full p-3 bg-gray-700 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
                rows="4"
                placeholder="Type your content to add to the chain..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                disabled={isBusy}
              />
              <button
                type="submit"
                className="mt-4 w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:bg-gray-600 disabled:hover:scale-100 disabled:cursor-not-allowed"
                disabled={isBusy || !newContent}
              >
                {isBusy ? 'Adding...' : 'Add Content to Pending Pool'}
              </button>
            </form>
          </div>

          <div
            className="bg-gray-800 p-6 rounded-lg shadow-lg opacity-0 animate-fadeInUp transition duration-300 hover:shadow-green-500/20"
            style={{ animationDelay: '300ms' }}
          >
            <h2 className="text-2xl font-semibold mb-4 text-white">Verify Content</h2>
            <form onSubmit={handleVerifyContent}>
              <input
                type="text"
                className="w-full p-3 bg-gray-700 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                placeholder="Enter content hash (SHA-256) to verify..."
                value={verifyHash}
                onChange={(e) => setVerifyHash(e.target.value)}
                disabled={isBusy}
              />
              <button
                type="submit"
                className="mt-4 w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:bg-gray-600 disabled:hover:scale-100 disabled:cursor-not-allowed"
                disabled={isBusy || !verifyHash}
              >
                {isBusy ? 'Verifying...' : 'Verify Hash'}
              </button>
            </form>
            {verifyResult && (
              <div className={`mt-4 p-3 rounded-lg opacity-100 transition-opacity duration-300 ${
                verifyResult.startsWith('✅') ? 'bg-green-800 border-green-600 text-green-200' :
                verifyResult.startsWith('⚠️') ? 'bg-yellow-800 border-yellow-600 text-yellow-200' :
                'bg-red-800 border-red-600 text-red-200'
              }`}>
                {verifyResult}
              </div>
            )}
          </div>
        </div>

        <div
          className="flex gap-4 mb-8 opacity-0 animate-fadeInUp"
          style={{ animationDelay: '400ms' }}
        >
          <button
            onClick={handleMineBlock}
            className="flex-1 bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 px-6 rounded-lg text-lg transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:bg-gray-600 disabled:hover:scale-100 disabled:cursor-not-allowed"
            disabled={isBusy || pendingData.length === 0}
          >
            {isBusy ? 'Mining...' : `Mine New Block (${pendingData.length} pending)`}
          </button>
          <button
            onClick={handleRefresh}
            className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg text-lg transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:bg-gray-500 disabled:hover:scale-100 disabled:cursor-not-allowed"
            disabled={isBusy}
          >
            {isBusy ? 'Refreshing...' : 'Refresh Chain Data'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div
            className="opacity-0 animate-fadeInUp"
            style={{ animationDelay: '500ms' }}
          >
            <h2 className="text-3xl font-semibold mb-4 text-white">Pending Data (Pool)</h2>
            <div className="bg-gray-800 p-4 rounded-lg shadow-inner max-h-96 overflow-y-auto space-y-4">
              {pendingData.length > 0 ? (
                pendingData.map((item, index) => (
                  <div key={index} className="bg-gray-700 p-4 rounded-md border border-yellow-500 transition duration-300 hover:border-yellow-300">
                    <p className="text-yellow-300 text-sm break-all">
                      <strong>Hash:</strong> {item.content_hash.substring(0, 10)}...
                    </p>
                    <p className="text-gray-300 text-sm">
                      <strong>Preview:</strong> "{item.content_preview}..."
                    </p>
                    <button
                      onClick={() => handleVerifyClick(item.content_hash)}
                      disabled={isBusy}
                      className="mt-2 text-sm bg-green-600 hover:bg-green-500 text-white py-1 px-3 rounded-lg transition-colors disabled:bg-gray-500"
                    >
                      Verify This Hash
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-400">No pending data to be mined.</p>
              )}
            </div>
          </div>

          <div
            className="opacity-0 animate-fadeInUp"
            style={{ animationDelay: '600ms' }}
          >
            <h2 className="text-3xl font-semibold mb-4 text-white">Blockchain (Length: {chain.length})</h2>
            <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2">
              {[...chain].reverse().map((block) => (
                <BlockCard
                  key={block.index}
                  block={block}
                  onVerifyClick={handleVerifyClick}
                  isBusy={isBusy}
                />
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}


// --- 3. THE MAIN APP WRAPPER (NO CHANGES) ---
export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-mono overflow-hidden">

      <Loader isLoading={isLoading} />

      {!isLoading && <AppContent />}

    </div>
  )
}