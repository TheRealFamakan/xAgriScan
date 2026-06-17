import { useCallback, useState, useRef } from 'react'

export default function UploadZone({ onSingleUpload, onBatchUpload, loading, compact = false, previewUrl = null }) {
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef(null)
  const folderInputRef = useRef(null)

  const handleDrag = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (!e.dataTransfer.files) {
      return;
    }
    const files = Array.from(e.dataTransfer.files)
    if (files.length === 0) {
      return
    }

    if (files.length === 1) {
      onSingleUpload(files[0])
    } else {
      onBatchUpload(files)
    }
  }, [onSingleUpload, onBatchUpload])

  const handleFileChange = (e) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files)
    if (files.length === 0) return
    if (files.length === 1) {
      onSingleUpload(files[0])
    } else {
      onBatchUpload(files)
    }
    e.target.value = ''
  }

  const handleFolderChange = (e) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files)
    if (files.length === 0) return
    onBatchUpload(files)
    e.target.value = ''
  }

  const hiddenInputs = (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={folderInputRef}
        type="file"
        accept="image/*"
        webkitdirectory="true"
        className="hidden"
        onChange={handleFolderChange}
      />
    </>
  )

  if (compact) {
    return (
      <div className="animate-fade-in space-y-4">
        {/* Image preview */}
        <div className="glass-card p-4 bg-black/20">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Image analysee"
              className="w-full max-h-[420px] object-contain rounded-xl shadow-2xl"
            />
          ) : (
            <div className="w-full h-64 flex items-center justify-center text-gray-500 text-sm">
              Aucune image
            </div>
          )}
        </div>

        {/* Compact action buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl text-sm font-medium
              bg-green-500/10 text-green-400 border border-green-500/20
              hover:bg-green-500/20 hover:border-green-500/40
              transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H3.75A2.25 2.25 0 001.5 6.75v11.25c0 1.242 1.008 2.25 2.25 2.25z" />
              </svg>
              Changer image
            </span>
          </button>

          <button
            onClick={() => folderInputRef.current?.click()}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl text-sm font-medium
              bg-emerald-500/10 text-emerald-400 border border-emerald-500/20
              hover:bg-emerald-500/20 hover:border-emerald-500/40
              transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
              </svg>
              Changer dossier
            </span>
          </button>
        </div>

        {hiddenInputs}
      </div>
    )
  }

  return (
    <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
      {/* Drop zone */}
      <div
        className={`
          relative glass-card p-12 text-center cursor-pointer
          transition-all duration-300 group
          ${dragActive
            ? 'border-green-400/60 bg-green-500/10 scale-[1.01]'
            : 'hover:border-green-500/30 hover:bg-white/[0.07]'
          }
          ${loading ? 'pointer-events-none opacity-50' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        {/* Icon */}
        <div className={`
          inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6
          transition-all duration-300
          ${dragActive
            ? 'bg-green-500/20 scale-110'
            : 'bg-white/5 group-hover:bg-green-500/10 group-hover:scale-105'
          }
        `}>
          <svg className={`w-8 h-8 transition-colors duration-300 ${dragActive ? 'text-green-400' : 'text-gray-400 group-hover:text-green-400'}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
        </div>

        <h3 className="text-xl font-semibold text-white mb-2">
          {dragActive ? 'Deposez vos images ici' : 'Glissez-deposez vos images'}
        </h3>
        <p className="text-gray-300 text-sm mb-6">
          ou cliquez pour parcourir vos fichiers
        </p>

        <p className="text-gray-400 text-xs">
          Formats acceptes : JPG, PNG, BMP, WebP
        </p>

        {hiddenInputs}
      </div>

      {/* Action buttons */}
      <div className="flex justify-center gap-4 mt-4">
        <button
          onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click() }}
          disabled={loading}
          className="px-5 py-2.5 rounded-xl text-sm font-medium
            bg-green-500/10 text-green-400 border border-green-500/20
            hover:bg-green-500/20 hover:border-green-500/40
            transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H3.75A2.25 2.25 0 001.5 6.75v11.25c0 1.242 1.008 2.25 2.25 2.25z" />
            </svg>
            Image(s)
          </span>
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); folderInputRef.current?.click() }}
          disabled={loading}
          className="px-5 py-2.5 rounded-xl text-sm font-medium
            bg-emerald-500/10 text-emerald-400 border border-emerald-500/20
            hover:bg-emerald-500/20 hover:border-emerald-500/40
            transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
            </svg>
            Dossier
          </span>
        </button>
      </div>
    </div>
  )
}