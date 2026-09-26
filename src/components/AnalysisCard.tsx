import type { Analysis } from '../api/types'
import { PriorityBadge } from './StatusBadge'
import { CATEGORY_LABELS } from './statusLabels'

export function AnalysisCard({ analysis }: { analysis: Analysis }) {
  return (
    <section className="card" aria-labelledby="analysis-heading">
      <h3 id="analysis-heading">AI analysis</h3>

      <dl className="card__grid">
        <dt>Category</dt>
        <dd>{CATEGORY_LABELS[analysis.category] ?? analysis.category}</dd>

        <dt>Priority</dt>
        <dd>
          <PriorityBadge priority={analysis.priority} />
        </dd>

        <dt>Summary</dt>
        <dd>{analysis.summary}</dd>

        <dt>Recommended action</dt>
        <dd>{analysis.recommended_action}</dd>
      </dl>

      <p className="card__footnote">
        Analysed {new Date(analysis.analysed_at).toLocaleString()}
        {analysis.model ? ` by ${analysis.model}` : ''}
      </p>
    </section>
  )
}
