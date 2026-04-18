// /app/login/page.tsx

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  login,
  register
} from "@/lib/auth"

export default function LoginPage() {
  const router = useRouter()

  const [pseudo, setPseudo] = useState("")
  const [password, setPassword] = useState("")
  const [mode, setMode] = useState("login")
  const [error, setError] = useState("")

  async function handleSubmit() {
    setError("")

    if (!pseudo || !password) {
      setError("Remplis tous les champs")
      return
    }

    const email =
      pseudo.toLowerCase() + "@scum.local"

    try {
      if (mode === "login") {
        await login(email, password)
      } else {
        await register(email, password)
      }

      router.push("/shop")
    } catch (e: any) {
      setError("Erreur connexion")
    }
  }

  return (
    <main className="page">
      <div className="box">
        <h1>
          {mode === "login"
            ? "Connexion"
            : "Inscription"}
        </h1>

        <input
          placeholder="Pseudo IG"
          value={pseudo}
          onChange={(e) =>
            setPseudo(e.target.value)
          }
        />

        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        {error && (
          <p className="error">
            {error}
          </p>
        )}

        <button onClick={handleSubmit}>
          {mode === "login"
            ? "Se connecter"
            : "Créer compte"}
        </button>

        <button
          className="switch"
          onClick={() =>
            setMode(
              mode === "login"
                ? "register"
                : "login"
            )
          }
        >
          {mode === "login"
            ? "Créer un compte"
            : "Déjà inscrit ?"}
        </button>
      </div>

      <style jsx>{`
        .page {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background:
            url("/background.jpg")
            center/cover no-repeat;
        }

        .box {
          width: 360px;
          background: rgba(0,0,0,.82);
          border: 1px solid #00ffcc;
          border-radius: 14px;
          padding: 30px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          color: #00ffcc;
        }

        h1 {
          text-align: center;
          margin: 0 0 10px;
          text-shadow:
            0 0 12px #00ffcc;
        }

        input,
        button {
          padding: 10px;
          border-radius: 8px;
          border: 1px solid #00ffcc;
          background: black;
          color: #00ffcc;
        }

        button {
          cursor: pointer;
        }

        .switch {
          font-size: 13px;
        }

        .error {
          color: red;
          font-size: 14px;
          text-align: center;
        }
      `}</style>
    </main>
  )
}