import { ActionButton, medicalStyles, Panel } from "./ui"
import type { MedicalChatMessage } from "./types"

export function ChatPanel({
  chat,
  msg,
  onMessageChange,
  onSend,
}: {
  chat: MedicalChatMessage[]
  msg: string
  onMessageChange: (value: string) => void
  onSend: () => void
}) {
  return (
    <div style={medicalStyles.grid}>
      <Panel title="💬 Radio Médicale">
        <div style={medicalStyles.chat}>
          {chat.map((message, index) => (
            <div key={`${message.createdAt || index}-${index}`}>
              {message.user}: {message.text}
            </div>
          ))}
        </div>
        <input value={msg} onChange={(event) => onMessageChange(event.target.value)} style={medicalStyles.input} placeholder="Message staff..." />
        <ActionButton onClick={onSend}>Envoyer</ActionButton>
      </Panel>
    </div>
  )
}
