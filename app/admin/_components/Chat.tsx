import { styles } from "./styles"
import { EmptyState } from "./ui"

function isPlayerMessage(message: any) {
  return String(message.role || "").toLowerCase() === "joueur" || String(message.role || "").toLowerCase() === "player"
}

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
      <section style={styles.hero}>
        <div style={{ color: "#00ffcc", fontWeight: 900, letterSpacing: 1, textTransform: "uppercase", fontSize: 12 }}>
          Staff communications
        </div>
        <h1 style={{ margin: "8px 0 6px", fontSize: "clamp(28px, 4vw, 46px)", lineHeight: 1 }}>
          Chat Staff & Joueurs
        </h1>
        <div style={{ color: "#b7d8e6" }}>
          Canal operationnel avec bulles differenciees staff et joueurs.
        </div>
      </section>

      <div className="cyber-card" style={{ ...styles.card, borderColor: staffOnline ? "#00ff99" : "rgba(0,255,204,.18)" }}>
        <span style={{ ...styles.badge, color: staffOnline ? "#00ff99" : "#ffae00", border: `1px solid ${staffOnline ? "#00ff99" : "#ffae00"}`, background: staffOnline ? "rgba(0,255,153,.12)" : "rgba(255,174,0,.12)" }}>
          Staff {staffOnline ? "en ligne" : "hors ligne"}
        </span>
      </div>

      <div className="cyber-card" style={styles.card}>
        <div style={{ maxHeight: 460, overflowY: "auto", marginBottom: 14, paddingRight: 4 }}>
          {chatMessages.length === 0 && <EmptyState title="Aucun message" detail="Les nouveaux messages apparaitront ici en temps reel." />}

          {chatMessages.map((message: any) => {
            const player = isPlayerMessage(message)
            return (
              <div
                key={message.id}
                style={{
                  display: "flex",
                  justifyContent: player ? "flex-start" : "flex-end",
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    maxWidth: "min(680px, 92%)",
                    padding: "11px 13px",
                    borderRadius: player ? "14px 14px 14px 4px" : "14px 14px 4px 14px",
                    border: player ? "1px solid rgba(138,180,255,.28)" : "1px solid rgba(0,255,204,.3)",
                    background: player ? "rgba(138,180,255,.1)" : "rgba(0,255,204,.1)",
                    boxShadow: player ? "0 0 18px rgba(138,180,255,.08)" : "0 0 18px rgba(0,255,204,.1)",
                  }}
                >
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 5, flexWrap: "wrap" }}>
                    <b style={{ color: player ? "#8ab4ff" : "#00ffcc" }}>{message.user}</b>
                    <span style={{ ...styles.badge, padding: "2px 7px", color: player ? "#8ab4ff" : "#00ffcc", border: "1px solid rgba(255,255,255,.12)", background: "rgba(255,255,255,.04)" }}>
                      {message.role || "staff"}
                    </span>
                  </div>
                  <div style={{ color: "#eafffb", lineHeight: 1.45 }}>{message.text}</div>
                </div>
              </div>
            )
          })}
        </div>

        <input
          style={styles.input}
          placeholder="Message staff..."
          value={chatText}
          onChange={(event) => onChatTextChange(event.target.value)}
        />

        <button className="cyber-button" style={styles.button} onClick={onSendChat}>
          Envoyer
        </button>
      </div>

      <div className="cyber-card" style={styles.card}>
        <h3 style={{ marginTop: 0 }}>Reponse privee joueur</h3>
        <input
          style={styles.input}
          placeholder="Pseudo joueur"
          value={replyTarget}
          onChange={(event) => onReplyTargetChange(event.target.value)}
        />
        <input
          style={styles.input}
          placeholder="Reponse admin"
          value={replyText}
          onChange={(event) => onReplyTextChange(event.target.value)}
        />
        <button className="cyber-button" style={styles.button} onClick={onSendPrivateReply}>
          Envoyer reponse
        </button>
      </div>
    </div>
  )
}
