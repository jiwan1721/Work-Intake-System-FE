import type { Analysis } from '../api/types'
import { PriorityBadge } from './StatusBadge'
import { CATEGORY_LABELS } from './statusLabels'

export function AnalysisCard({ analysis }: { analysis: Analysis }) {
  return (
    <section aria-labelledby="analysis-heading">
      <h4 className="section__head" id="analysis-heading">
        AI analysis
      </h4>

      <dl className="fields">
        <dt>Category</dt>
        <dd>{CATEGORY_LABELS[analysis.category] ?? analysis.category}</dd>

        <dt>Priority</dt>
        <dd>
          <PriorityBadge priority={analysis.priority} />
        </dd>

        <dt>Summary</dt>
        <dd className="prose">{analysis.summary}</dd>

        <dt>Action</dt>
        <dd className="prose">{analysis.recommendedAction}</dd>
      </dl>

      {/* The verdict is attributed: which model, at what time, on which
          attempt. An unattributed machine judgement is the thing this product
          exists not to present. */}
      <p className="footnote">
        Analysed {new Date(analysis.analysedAt).toLocaleString()}
        {analysis.model ? ` · ${analysis.model}` : ''}
      </p>
    </section>
  )
}
