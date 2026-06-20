import { useEffect, useRef, useState } from 'react'
import s from './Autocomplete.module.css'

/**
 * Input com dropdown de sugestões, acessível por teclado.
 *
 * - ↑/↓ navegam pelas opções, Enter seleciona a opção ativa, Esc fecha.
 * - Enter sem opção ativa dispara `onEnterLivre` (ex.: adicionar texto digitado).
 * - Clique fora fecha o dropdown.
 *
 * @param {object} props
 * @param {string} props.id
 * @param {string} props.value
 * @param {(texto: string) => void} props.onChange
 * @param {{ nome: string, descricao?: string }[]} props.opcoes
 * @param {(opcao: { nome: string }) => void} props.onSelecionar
 * @param {() => void} [props.onEnterLivre]
 * @param {boolean} [props.carregando]
 * @param {string} [props.placeholder]
 * @param {string} [props.className]  classe aplicada ao <input>
 */
export default function Autocomplete({
  id,
  value,
  onChange,
  opcoes = [],
  onSelecionar,
  onEnterLivre,
  carregando = false,
  placeholder,
  className = '',
}) {
  const [aberto, setAberto] = useState(false)
  const [ativo, setAtivo] = useState(-1)
  const wrapRef = useRef(null)

  // Fecha ao clicar fora do componente.
  useEffect(() => {
    function onDocMouseDown(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setAberto(false)
    }
    document.addEventListener('mousedown', onDocMouseDown)
    return () => document.removeEventListener('mousedown', onDocMouseDown)
  }, [])

  // Reabre quando surgem opções novas e reposiciona o índice ativo.
  useEffect(() => {
    setAtivo(-1)
    if (opcoes.length > 0) setAberto(true)
  }, [opcoes])

  const temLista = aberto && opcoes.length > 0

  function selecionar(opcao) {
    onSelecionar?.(opcao)
    setAberto(false)
    setAtivo(-1)
  }

  function onKeyDown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (opcoes.length === 0) return
      setAberto(true)
      setAtivo(i => (i + 1) % opcoes.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (opcoes.length === 0) return
      setAberto(true)
      setAtivo(i => (i <= 0 ? opcoes.length - 1 : i - 1))
    } else if (e.key === 'Enter') {
      if (temLista && ativo >= 0 && opcoes[ativo]) {
        e.preventDefault()
        selecionar(opcoes[ativo])
      } else if (onEnterLivre) {
        e.preventDefault()
        onEnterLivre()
        setAberto(false)
      }
    } else if (e.key === 'Escape') {
      setAberto(false)
      setAtivo(-1)
    }
  }

  return (
    <div className={s.wrap} ref={wrapRef}>
      <input
        id={id}
        type="text"
        className={className}
        placeholder={placeholder}
        value={value}
        onChange={e => {
          onChange?.(e.target.value)
          setAberto(true)
        }}
        onFocus={() => { if (opcoes.length > 0) setAberto(true) }}
        onKeyDown={onKeyDown}
        autoComplete="off"
        role="combobox"
        aria-expanded={temLista}
        aria-controls={`${id}-listbox`}
        aria-autocomplete="list"
      />
      {temLista && (
        <ul className={s.lista} id={`${id}-listbox`} role="listbox">
          {opcoes.map((opcao, i) => (
            <li
              key={`${opcao.nome}-${opcao.descricao || ''}-${i}`}
              role="option"
              aria-selected={i === ativo}
              className={`${s.opcao}${i === ativo ? ' ' + s.opcaoAtiva : ''}`}
              // onMouseDown (não onClick) para não perder o foco antes de selecionar.
              onMouseDown={e => { e.preventDefault(); selecionar(opcao) }}
              onMouseEnter={() => setAtivo(i)}
            >
              <span className={s.opcaoNome}>{opcao.nome}</span>
              {opcao.descricao && <span className={s.opcaoDesc}>{opcao.descricao}</span>}
            </li>
          ))}
        </ul>
      )}
      {carregando && aberto && opcoes.length === 0 && (
        <ul className={s.lista} role="listbox">
          <li className={s.opcaoVazia} aria-disabled="true">Buscando...</li>
        </ul>
      )}
    </div>
  )
}
