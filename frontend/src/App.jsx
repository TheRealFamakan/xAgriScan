import { useState, useCallback } from 'react'
import UploadZone from './components/UploadZone'
import { PredictionPanel, AdvicePanel } from './components/ResultCard'
import BatchResults from './components/BatchResults'
import Header from './components/Header'

const API_URL = 'http://localhost:5000/api'

function App() {
  const [results, setResults] = useState(null)
  const [batchResults, setBatchResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [batchPreviews, setBatchPreviews] = useState({})
  const [mode, setMode] = useState(null) // 'single' or 'batch'

  const resetState = () => {
    setResults(null)
    setBatchResults(null)
    setError(null)
    setPreviewUrl(null)
    setBatchPreviews({})
    setMode(null)
  }

  const handleSingleUpload = useCallback(async (file) => {
    resetState()
    setMode('single')
    setLoading(true)
    setPreviewUrl(URL.createObjectURL(file))

    const formData = new FormData()
    formData.append('image', file)

    try {
      const response = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()
      if (data.error) {
        setError(data.error)
      } else {
        setResults(data)
      }
    } catch (err) {
      setError('Connexion au serveur impossible. Verifiez que le backend est lance.')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleBatchUpload = useCallback(async (files) => {
    resetState()
    setMode('batch')
    setLoading(true)

    const formData = new FormData()
    const previews = {}
    for (const file of files) {
      const fileName = file.webkitRelativePath || file.name
      formData.append('images', file, fileName)
      previews[fileName] = URL.createObjectURL(file)
    }
    setBatchPreviews(previews)

    try {
      const response = await fetch(`${API_URL}/predict/batch`, {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()
      if (data.error) {
        setError(data.error)
      } else {
        setBatchResults(data)
      }
    } catch (err) {
      setError('Connexion au serveur impossible. Verifiez que le backend est lance.')
    } finally {
      setLoading(false)
    }
  }, [])

  const hasSingleResult = mode === 'single' && results

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-green-950/30 to-gray-950 text-white">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-900/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        <Header />

        {!hasSingleResult && (
          <UploadZone
            onSingleUpload={handleSingleUpload}
            onBatchUpload={handleBatchUpload}
            loading={loading}
          />
        )}

        {error && (
          <div className="mt-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 backdrop-blur-xl text-red-300 text-center animate-fade-in">
            {error}
          </div>
        )}

        {loading && (
          <div className="mt-12 flex flex-col items-center gap-4 animate-fade-in">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-green-500/20" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-green-400 animate-spin" />
            </div>
            <p className="text-green-200 text-lg font-light">Analyse en cours...</p>
          </div>
        )}

        {hasSingleResult && (
          <div className="mt-10 grid md:grid-cols-3 gap-6 items-start animate-fade-in">
            {/* Column 1: image + compact upload controls */}
            <UploadZone
              onSingleUpload={handleSingleUpload}
              onBatchUpload={handleBatchUpload}
              loading={loading}
              compact
              previewUrl={previewUrl}
            />

            {/* Column 2: prediction info */}
            <PredictionPanel result={results} />

            {/* Column 3: AI diagnostic & treatment */}
            <AdvicePanel result={results} />
          </div>
        )}

        {mode === 'batch' && batchResults && (
          <BatchResults data={batchResults} previews={batchPreviews} />
        )}
      </div>
    </div>
  )
}

export default App