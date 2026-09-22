import { useState } from 'react'
import { X } from 'lucide-react'
import Button from '../Button/Button'
import Toast from '../Toast/Toast'

const trenes = [
  { id: 1, nome: 'Trem 01' },
  { id: 2, nome: 'Trem 02' },
  { id: 3, nome: 'Trem 03' },
]

const vagoes = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

export default function PassengerModal({ onClose, onAdd, poltronasOcupadas }) {
  const [selectedTrain, setSelectedTrain] = useState('')
  const [selectedWagon, setSelectedWagon] = useState('')
  const [selectedSeats, setSelectedSeats] = useState([])
  const [sending, setSending] = useState(false)
  const [toast, setToast] = useState(null)

  const getOcupadas = () => {
    if (!selectedTrain || !selectedWagon) return []
    return poltronasOcupadas[selectedTrain]?.[selectedWagon] || []
  }

  const ocupadas = getOcupadas()

  const handleSeatClick = (seatIndex) => {
    if (ocupadas.includes(seatIndex)) return
    setSelectedSeats((prev) =>
      prev.includes(seatIndex) ? prev.filter((s) => s !== seatIndex) : [...prev, seatIndex],
    )
  }

  const handleConfirm = async () => {
    if (!selectedTrain || !selectedWagon || selectedSeats.length === 0) {
      setToast({ message: 'Selecione trem, vagão e ao menos um assento.', type: 'error' })
      return
    }

    setSending(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      onAdd({
        id: Date.now(),
        trem: Number(selectedTrain),
        vagao: selectedWagon,
        assentos: selectedSeats,
        timestamp: Date.now(),
      })
      setToast({
        message: `${selectedSeats.length} assento(s) cadastrado(s) com sucesso!`,
        type: 'success',
      })
      setTimeout(() => onClose(), 2000)
    } catch {
      setToast({ message: 'Erro ao cadastrar passageiro.', type: 'error' })
    } finally {
      setSending(false)
    }
  }

  const renderSeats = () => {
    if (!selectedWagon) return null

    const rows = [
      [0, 1, 2, 3, 4, 5, 6, 7],
      [8, 9, 10, 11, 12, 13, 14, 15],
      [16, 17, 18, 19, 20, 21, 22, 23],
      [24, 25, 26, 27, 28, 29, 30, 31],
    ]

    return (
      <div className="mt-4 flex flex-col items-center gap-1">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex}>
            <div className="flex gap-1">
              {row.map((seatIndex) => (
                <button
                  key={seatIndex}
                  onClick={() => handleSeatClick(seatIndex)}
                  disabled={ocupadas.includes(seatIndex)}
                  className={`h-5 w-5 rounded-full transition-all duration-200 ${
                    ocupadas.includes(seatIndex)
                      ? 'cursor-not-allowed bg-destructive'
                      : selectedSeats.includes(seatIndex)
                        ? 'scale-110 bg-destructive ring-2 ring-primary-foreground'
                        : 'cursor-pointer bg-success hover:scale-110'
                  }`}
                />
              ))}
            </div>
            {rowIndex === 1 && <div className="my-1 h-px w-full bg-primary-foreground/30" />}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-overlay">
      <div className="mx-4 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-primary p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Cadastrar Passageiro</h2>
          <button
            onClick={onClose}
            className="cursor-pointer text-foreground transition-opacity hover:opacity-70"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <select
              value={selectedTrain}
              onChange={(e) => {
                setSelectedTrain(e.target.value)
                setSelectedWagon('')
                setSelectedSeats([])
              }}
              className={`flex-1 rounded-full bg-input px-4 py-2 text-sm text-foreground placeholder-foreground/60 transition-all duration-200 focus:ring-2 focus:ring-primary/30 ${
                !selectedTrain ? 'text-foreground/60' : ''
              }`}
            >
              <option value="" disabled>
                Trem
              </option>
              {trenes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nome}
                </option>
              ))}
            </select>

            {selectedTrain && (
              <select
                value={selectedWagon}
                onChange={(e) => {
                  setSelectedWagon(e.target.value)
                  setSelectedSeats([])
                }}
                className={`w-24 rounded-full bg-input px-4 py-2 text-sm text-foreground placeholder-foreground/60 transition-all duration-200 focus:ring-2 focus:ring-primary/30 ${
                  !selectedWagon ? 'text-foreground/60' : ''
                }`}
              >
                <option value="" disabled>
                  Vagão
                </option>
                {vagoes.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            )}
          </div>

          {renderSeats()}

          {selectedSeats.length > 0 && (
            <p className="text-center text-sm text-foreground">
              {selectedSeats.length} assento(s) selecionado(s)
            </p>
          )}

          <div className="mt-2 flex justify-center">
            <Button
              type="button"
              variant="secondary"
              onClick={handleConfirm}
              disabled={sending || selectedSeats.length === 0}
              className="w-auto px-10"
            >
              {sending ? 'Cadastrando...' : 'Cadastrar'}
            </Button>
          </div>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
