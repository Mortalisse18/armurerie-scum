/* eslint-disable @typescript-eslint/no-explicit-any */

import { styles } from "./styles"

function formatLogDate(log: any) {
  if (log.createdAt?.seconds) {
    return new Date(log.createdAt.seconds * 1000).toLocaleString("fr-FR")
  }

  if (typeof log.createdAt === "number") {
    return new Date(log.createdAt).toLocaleString("fr-FR")
  }

  return "Date inconnue"
}

export function Logs({ logs }: { logs: any[] }) {
  return (
    <div>
      <h1>📜 Logs système</h1>

      {logs.map((log: any, index: number) => {
        const text = log.message || log.text || log.action || "Log inconnu"

        return (
          <div key={log.id || index} style={styles.card}>
            <div style={{ fontWeight: "bold", marginBottom: 8, color: "#00ffcc" }}>{text}</div>
            <div style={{ opacity: 0.7, fontSize: 13 }}>🕒 {formatLogDate(log)}</div>
          </div>
        )
      })}
    </div>
  )
}
