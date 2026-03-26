import { C } from '../../styles/tokens'

export default function Spinner({ size = 28, color = C.limen }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      border: `3px solid ${color}22`,
      borderTop: `3px solid ${color}`,
      animation: 'spin .8s linear infinite',
      margin: '0 auto',
    }} />
  )
}
