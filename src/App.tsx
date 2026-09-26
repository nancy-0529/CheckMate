import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { CaseDetailPage } from './features/case-review/CaseDetailPage'
import { CaseListPage } from './features/case-review/CaseListPage'
import { CaseReviewProvider } from './features/case-review/CaseReviewContext'

function App() {
  return (
    <BrowserRouter>
      <CaseReviewProvider>
        <Routes>
          <Route path="/" element={<CaseListPage />} />
          <Route path="/cases/:caseId" element={<CaseDetailPage />} />
        </Routes>
      </CaseReviewProvider>
    </BrowserRouter>
  )
}

export default App
