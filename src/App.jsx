import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useViagens } from './hooks/useViagens.js'
import FlightProvider from './components/FlightTransition/FlightTransition.jsx'
import HomePage from './pages/Home/HomePage.jsx'

const TripDetailPage = lazy(() => import('./pages/TripDetail/TripDetailPage.jsx'))
const AdminPage = lazy(() => import('./pages/Admin/AdminPage.jsx'))

export default function App() {
  const { viagens, loading, addViagem, updateViagem, deleteViagem, restaurar, salvarTudo } = useViagens()

  return (
    <FlightProvider>
    <Suspense fallback={null}>
    <Routes>
      <Route path="/" element={<HomePage viagens={viagens} />} />
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
    </FlightProvider>
  )
}
