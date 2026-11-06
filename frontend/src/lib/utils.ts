import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function dataHora(isoUtcSemFuso: string) {
  return new Date(`${isoUtcSemFuso}Z`).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

export function dataBrasileira(dataIso: string) {
  const [ano, mes, dia] = dataIso.split('-')
  return `${dia}/${mes}/${ano}`
}

export function formatarNumero(valor: number) {
  return valor.toLocaleString('pt-BR', { maximumFractionDigits: 2 })
}
