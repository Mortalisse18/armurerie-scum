export async function sendDiscordLog(title: string, description: string, color = 65280) {
  const url = process.env.NEXT_PUBLIC_DISCORD_WEBHOOK
  if (!url) return

  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "Armurerie Logs",
      embeds: [
        {
          title,
          description,
          color,
          timestamp: new Date().toISOString()
        }
      ]
    })
  })
}