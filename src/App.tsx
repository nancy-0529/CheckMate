import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'

function Home() {
  return (
    <main
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        minHeight: '100svh',
      }}
    >
      <ShieldCheck size={32} aria-hidden="true" />
      <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>CheckMate</h1>
      <p style={{ margin: 0, color: '#6b6375' }}>App Skeleton 已就緒</p>
    </main>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
