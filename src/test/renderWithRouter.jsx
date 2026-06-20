import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import FlightProvider from '../components/FlightTransition/FlightTransition.jsx'

// Renderiza um componente com os contextos de que a UI depende:
// roteador (Link/useNavigate) e o provedor de transição de voo (useFlight).
export function renderWithRouter(ui, { route = '/' } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <FlightProvider>{ui}</FlightProvider>
    </MemoryRouter>
  )
}
