import { ArrowLeft, CheckCircle2, RefreshCw } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useCaseReview } from './CaseReviewContext'
import {
  FINDING_SOURCE_LABEL,
  RECOMMENDATION_LABEL,
  RECOMMENDATION_TONE,
  SEVERITY_LABEL,
  SEVERITY_TONE,
} from './presentation'
import './case-review.css'

export function CaseDetailPage() {
  const { caseId } = useParams<{ caseId: string }>()
  const { getCase, rerunAnalysis } = useCaseReview()
  const expenseCase = caseId ? getCase(caseId) : undefined

  if (!expenseCase) {
    return (
      <div className="page">
        <p className="empty-state">找不到這筆案件，可能已被移除或編號有誤。</p>
        <Link className="back-link" to="/">
          <ArrowLeft size={16} /> 返回案件列表
        </Link>
      </div>
    )
  }

  const latestReview = expenseCase.reviewHistory[expenseCase.reviewHistory.length - 1]
  const blockingFindings = latestReview.findings.filter((f) => f.severity === 'Blocking')

  return (
    <div className="page">
      <Link className="back-link" to="/">
        <ArrowLeft size={16} /> 返回案件列表
      </Link>
      <h1 className="page-title">案件詳情（{expenseCase.id}）</h1>

      <section className="card">
        <h2>案件摘要</h2>
        <dl className="summary-grid">
          <dt>申請人</dt>
          <dd>{expenseCase.submittedBy}</dd>
          <dt>類別</dt>
          <dd>{expenseCase.category}</dd>
          <dt>申請金額</dt>
          <dd>NT$ {expenseCase.claimedAmount.toLocaleString('zh-TW')}</dd>
          <dt>費用日期</dt>
          <dd>{expenseCase.expenseDate}</dd>
          <dt>說明</dt>
          <dd>{expenseCase.description}</dd>
        </dl>
      </section>

      <section className="card">
        <h2>審查建議</h2>
        <span className={`badge badge-${RECOMMENDATION_TONE[latestReview.recommendation]}`}>
          {RECOMMENDATION_LABEL[latestReview.recommendation]}
        </span>
      </section>

      {blockingFindings.length > 0 && (
        <section className="card">
          <h2>阻擋風險</h2>
          <ul className="required-check-list">
            {blockingFindings.map((finding) => (
              <li key={finding.id}>{finding.title}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="card">
        <h2>必要檢核</h2>
        <ul className="required-check-list">
          {latestReview.requiredChecks.map((check) => (
            <li className="required-check-item" key={check.name}>
              <CheckCircle2 size={16} aria-hidden="true" />
              {check.name}：{check.completed ? '已完成' : '未完成'}
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h2>發現項目</h2>
        {latestReview.findings.length === 0 ? (
          <p className="empty-state">此案件目前沒有需要留意的發現項目。</p>
        ) : (
          <ul className="finding-list">
            {latestReview.findings.map((finding) => (
              <li className="finding-item" key={finding.id}>
                <div className="finding-item-header">
                  <span className={`badge badge-${SEVERITY_TONE[finding.severity]}`}>
                    {SEVERITY_LABEL[finding.severity]}
                  </span>
                  <span className="finding-title">{finding.title}</span>
                </div>
                <p className="finding-description">{finding.description}</p>
                <p className="finding-meta">
                  來源：{FINDING_SOURCE_LABEL[finding.source]}
                  {finding.ruleReference ? `｜${finding.ruleReference}` : ''}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card">
        <h2>佐證資料</h2>
        {expenseCase.evidence.length === 0 ? (
          <p className="empty-state">此案件未附上任何佐證資料。</p>
        ) : (
          <ul className="evidence-list">
            {expenseCase.evidence.map((item) => (
              <li className="evidence-item" key={item.id}>
                {item.vendor}｜NT$ {item.amount.toLocaleString('zh-TW')}｜{item.date}
                {item.fileName ? `｜${item.fileName}` : ''}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card">
        <h2>審查歷程</h2>
        <ul className="history-list">
          {expenseCase.reviewHistory.map((record) => (
            <li className="history-item" key={record.id}>
              <span>{new Date(record.performedAt).toLocaleString('zh-TW')}</span>
              <span>{record.actor}</span>
              <span>{RECOMMENDATION_LABEL[record.recommendation]}</span>
            </li>
          ))}
        </ul>
        <button className="rerun-button" onClick={() => rerunAnalysis(expenseCase.id)} type="button">
          <RefreshCw size={14} aria-hidden="true" style={{ marginRight: 6, verticalAlign: 'middle' }} />
          重新執行分析（Demo）
        </button>
      </section>
    </div>
  )
}
