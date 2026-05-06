import { styles } from "./styles"

export function StatCard({
  title,
  value,
}: {
  title: string
  value: string | number
}) {
  return (
    <div style={styles.card}>
      <div style={styles.statTitle}>{title}</div>
      <div style={styles.statValue}>{value}</div>
    </div>
  )
}

export function PanelCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div style={styles.panelCard}>
      <div style={styles.panelHeader}>{title}</div>
      <div>{children}</div>
    </div>
  )
}
