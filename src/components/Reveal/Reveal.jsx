import { useReveal } from '../../hooks/useReveal.js'
import s from './Reveal.module.css'

/**
 * Envolve um elemento e o revela suavemente ao entrar na viewport.
 *
 * Props:
 *  - as: tag/elemento a renderizar (default 'div')
 *  - variant: 'up' | 'fade' | 'left' | 'right' (default 'up')
 *  - delay: atraso em segundos (para stagger)
 *  - className: classes extras
 */
export default function Reveal({
  as: Tag = 'div',
  variant = 'up',
  delay = 0,
  className = '',
  style,
  children,
  ...rest
}) {
  const { ref, visible } = useReveal()

  const classes = [
    s.reveal,
    s[variant] || s.up,
    visible ? s.visible : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <Tag
      ref={ref}
      className={classes}
      style={{ transitionDelay: delay ? `${delay}s` : undefined, ...style }}
      {...rest}
    >
      {children}
    </Tag>
  )
}
