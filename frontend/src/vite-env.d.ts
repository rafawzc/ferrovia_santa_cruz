/// <reference types="vite/client" />

declare module '*.jsx' {
  import type { ComponentType } from 'react'
  const Componente: ComponentType
  export default Componente
}
