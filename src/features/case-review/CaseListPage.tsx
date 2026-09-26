import { useNavigate } from 'react-router-dom'
import { useCaseReview } from './CaseReviewContext'
import { RECOMMENDATION_LABEL, RECOMMENDATION_TONE } from './presentation'
import './case-review.css'

export function CaseListPage() {
  const { cases } = useCaseReview()
  const navigate = useNavigate()

  return (
    <div className="page">
      <h1 className="page-title">待審查案件</h1>
      <table className="case-table">
        <thead>
          <tr>
            <th>案件編號</th>
            <th>申請人</th>
            <th>類別</th>
            <th>申請金額（TWD）</th>
            <th>審查建議</th>
          </tr>
        </thead>
        <tbody>
          {cases.map((expenseCase) => {
            const latestReview = expenseCase.reviewHistory[expenseCase.reviewHistory.length - 1]
            return (
              <tr key={expenseCase.id} onClick={() => navigate(`/cases/${expenseCase.id}`)}>
                <td>{expenseCase.id}</td>
                <td>{expenseCase.submittedBy}</td>
                <td>{expenseCase.category}</td>
                <td>{expenseCase.claimedAmount.toLocaleString('zh-TW')}</td>
                <td>
                  {latestReview ? (
                    <span className={`badge badge-${RECOMMENDATION_TONE[latestReview.recommendation]}`}>
                      {RECOMMENDATION_LABEL[latestReview.recommendation]}
                    </span>
                  ) : (
                    <span className="badge badge-neutral">尚未審查</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
