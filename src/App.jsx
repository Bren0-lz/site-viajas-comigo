import { Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useViagens } from './hooks/useViagens.js'
import FlightProvider from './components/FlightTransition/FlightTransition.jsx'
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary.jsx'
import PageLoader from './components/PageLoader/PageLoader.jsx'
import { lazyWithRetry } from './utils/lazyWithRetry.js'
import HomePage from './pages/Home/HomePage.jsx'

const TripDetailPage = lazyWithRetry(() => import('./pages/TripDetail/TripDetailPage.jsx'))
const AdminPage = lazyWithRetry(() => import('./pages/Admin/AdminPage.jsx'))
const MontarViagemPage = lazyWithRetry(() => import('./pages/MontarViagem/MontarViagemPage.jsx'))

export default function App() {
  const { viagens, loading, addViagem, updateViagem, deleteViagem, restaurar, salvarTudo } = useViagens()

  return (
    <FlightProvider>
    <ErrorBoundary>
    <Suspense fallback={<PageLoader />}>
    <Routes>
      <Route path="/" element={<HomePage viagens={viagens} />} />
      <Route path="/montar-viagem" element={<MontarViagemPage />} />
      <Route path="/viagem/:slug" element={<TripDetailPage viagens={viagens} loading={loading} />} />
      <Route
        path="/admin"
        element={
          <AdminPage
            viagens={viagens}
            salvarTudo={salvarTudo}
          />
        }
      />
    </Routes>
    </Suspense>
    </ErrorBoundary>
    </FlightProvider>
  )
}
