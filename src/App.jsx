import { Routes, Route } from 'react-router-dom'
import { useViagens } from './hooks/useViagens.js'
import HomePage from './pages/Home/HomePage.jsx'
import TripDetailPage from './pages/TripDetail/TripDetailPage.jsx'
import AdminPage from './pages/Admin/AdminPage.jsx'

export default function App() {
  const { viagens, addViagem, updateViagem, deleteViagem, restaurar } = useViagens()

  return (
    <Routes>
      <Route path="/" element={<HomePage viagens={viagens} />} />
      <Route path="/viagem/:slug" element={<TripDetailPage viagens={viagens} />} />
      <Route
        path="/admin"
        element={
          <AdminPage
            viagens={viagens}
            addViagem={addViagem}
            updateViagem={updateViagem}
            deleteViagem={deleteViagem}
            restaurar={restaurar}
          />
        }
      />
    </Routes>
  )
}
