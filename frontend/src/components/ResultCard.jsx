const SEVERITY_CONFIG = {
  none: { label: 'Saine', color: 'green', bg: 'bg-green-500', border: 'border-green-500/30', text: 'text-green-400' },
  low: { label: 'Faible', color: 'yellow', bg: 'bg-yellow-500', border: 'border-yellow-500/30', text: 'text-yellow-400' },
  moderate: { label: 'Moderee', color: 'orange', bg: 'bg-orange-500', border: 'border-orange-500/30', text: 'text-orange-400' },
  high: { label: 'Elevee', color: 'red', bg: 'bg-red-500', border: 'border-red-500/30', text: 'text-red-400' },
}

function ConfidenceBar({ label, probability, isTop }) {
  const barColor = isTop ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-white/20'

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-300 w-32 truncate text-right" title={label}>
        {label}
      </span>
      <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full confidence-bar ${barColor}`}
          style={{ width: `${probability}%` }}
        />
      </div>
      <span className={`text-sm font-mono w-14 text-right ${isTop ? 'text-green-400 font-semibold' : 'text-gray-400'}`}>
        {probability}%
      </span>
    </div>
  )
}

export function PredictionPanel({ result }) {
  const severity = SEVERITY_CONFIG[result.severity] || SEVERITY_CONFIG.moderate

  return (
    <div className="animate-slide-up h-full">
      <div className="glass-card overflow-hidden p-8 h-full bg-black/40">
        {/* Status indicator */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative">
            <div className={`w-4 h-4 rounded-full ${severity.bg}`} />
            <div className={`absolute inset-0 w-4 h-4 rounded-full ${severity.bg} pulse-ring`} />
          </div>
          <span className={`text-base font-medium ${severity.text}`}>
            Severite : {severity.label}
          </span>
        </div>

        {/* Main prediction */}
        <h2 className="text-3xl font-bold text-white mb-1">
          {result.predicted_label}
        </h2>
        <p className="text-gray-300 text-base mb-6">
          Classe : <code className="text-green-400/80 bg-green-500/10 px-1.5 py-0.5 rounded text-xs">{result.predicted_class}</code>
        </p>

        {/* Confidence */}
        <div className="mb-8">
          <div className="flex justify-between items-end mb-2">
            <span className="text-base text-gray-300">Confiance</span>
            <span className="text-4xl font-bold text-white">{result.confidence}%</span>
          </div>
          <div className="h-3 bg-white/5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full confidence-bar bg-gradient-to-r ${
                result.is_healthy
                  ? 'from-green-400 to-emerald-500'
                  : 'from-orange-400 to-red-500'
              }`}
              style={{ width: `${result.confidence}%` }}
            />
          </div>
        </div>

        {/* All class probabilities */}
        <div>
          <h4 className="text-base font-medium text-gray-200 mb-3">Distribution des probabilites</h4>
          <div className="space-y-2.5">
            {Object.entries(result.class_probabilities)
              .sort((a, b) => b[1].probability - a[1].probability)
              .map(([cls, data]) => (
                <ConfidenceBar
                  key={cls}
                  label={data.label}
                  probability={data.probability}
                  isTop={cls === result.predicted_class}
                />
              ))
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export function AdvicePanel({ result }) {
  if (!result.advice) return null

  return (
    <div className="animate-slide-up h-full">
      <div className="glass-card overflow-hidden p-8 h-full bg-black/40">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <h3 className="text-base font-semibold text-green-300 uppercase tracking-wide">
            {result.is_healthy ? 'Recommandation' : 'Diagnostic & Traitement (IA)'}
          </h3>
        </div>
        <div className="space-y-4 text-base">
          <div>
            <span className="text-green-400 font-semibold block mb-1">Description</span>
            <span className="text-gray-100">{result.advice.description}</span>
          </div>
          <div>
            <span className="text-green-400 font-semibold block mb-1">Symptômes</span>
            <span className="text-gray-100">{result.advice.symptomes}</span>
          </div>
          <div>
            <span className="text-green-400 font-semibold block mb-1">Traitement</span>
            <span className="text-gray-100">{result.advice.traitement}</span>
          </div>
          <div>
            <span className="text-green-400 font-semibold block mb-1">Prévention</span>
            <span className="text-gray-100">{result.advice.prevention}</span>
          </div>
        </div>
      </div>
    </div>
  )
}