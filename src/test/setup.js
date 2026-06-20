import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Desmonta a árvore React e limpa o DOM entre os testes.
afterEach(() => {
  cleanup()
})
