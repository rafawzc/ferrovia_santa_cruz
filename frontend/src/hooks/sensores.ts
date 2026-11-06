import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, type FiltroSensores, type SensorEdicao } from '@/lib/api'

const chaveSensores = ['sensores'] as const

function useInvalidarSensores() {
  const clienteDeConsultas = useQueryClient()
  return () => clienteDeConsultas.invalidateQueries({ queryKey: chaveSensores })
}

export function useSensores(filtro: FiltroSensores = {}) {
  return useQuery({
    queryKey: [...chaveSensores, filtro],
    queryFn: () => api.sensores.listar(filtro),
  })
}

export function useCriarSensor() {
  const invalidar = useInvalidarSensores()
  return useMutation({ mutationFn: api.sensores.criar, onSuccess: invalidar })
}

export function useAtualizarSensor(id: number) {
  const invalidar = useInvalidarSensores()
  return useMutation({
    mutationFn: (sensor: SensorEdicao) => api.sensores.atualizar(id, sensor),
    onSuccess: invalidar,
  })
}

export function useExcluirSensor() {
  const invalidar = useInvalidarSensores()
  return useMutation({ mutationFn: api.sensores.excluir, onSuccess: invalidar })
}
