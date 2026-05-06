/* eslint-disable @typescript-eslint/no-explicit-any */

import { styles } from "./styles"

export function Chat({
  chatMessages,
  chatText,
  replyTarget,
  replyText,
  staffOnline,
  onChatTextChange,
  onReplyTargetChange,
  onReplyTextChange,
  onSendChat,
  onSendPrivateReply,
}: {
  chatMessages: any[]
  chatText: string
  replyTarget: string
  replyText: string
  staffOnline: boolean
  onChatTextChange: (value: string) => void
  onReplyTargetChange: (value: string) => void
  onReplyTextChange: (value: string) => void
  onSendChat: () => void
  onSendPrivateReply: () => void
}) {
  return (
    <div>
      <h1>💬 Chat Staff & Joueurs</h1>
      <div style={{ ...styles.card, borderColor: staffOnline ? "#00ff99" : "rgba(0,255,204,.18)" }}>
        Staff {staffOnline ? "en ligne" : "hors ligne"}
      </div>

      <div style={styles.card}>
        <div style={{ maxHeight: 400, overflowY: "auto", marginBottom: 14 }}>
          {chatMessages.map((message: any) => (
            <div key={message.id} style={{ padding: 10, borderBottom: "1px solid rgba(255,255,255,.08)" }}>
              <b>{message.user}</b> ({message.role})
              <div>{message.text}</div>
            </div>
          ))}
        </div>

        <input
          style={styles.input}
          placeholder="Message staff..."
          value={chatText}
          onChange={(event) => onChatTextChange(event.target.value)}
        />

        <button style={styles.button} onClick={onSendChat}>
          📡 Envoyer
        </button>
      </div>

      <div style={styles.card}>
        <h3>📨 Réponse privée joueur</h3>
        <input
          style={styles.input}
          placeholder="Pseudo joueur"
          value={replyTarget}
          onChange={(event) => onReplyTargetChange(event.target.value)}
        />
        <input
          style={styles.input}
          placeholder="Réponse admin"
          value={replyText}
          onChange={(event) => onReplyTextChange(event.target.value)}
        />
        <button style={styles.button} onClick={onSendPrivateReply}>
          ✉ Envoyer réponse
        </button>
      </div>
    </div>
  )
}
