/* ══════════════════════════════════════════════════════════════════════
   Anmeldung.

   Im lokalen Modus gibt es keine — die Daten liegen im Browser, ein Login
   wäre reine Schikane. Sobald Supabase konfiguriert ist, schiebt sich diese
   Hürde davor: Anmeldung per Magic Link, ohne Passwort.

   Wer sich registrieren darf, entscheidet die Datenbank, nicht diese Datei:
   ein Trigger auf auth.users lässt nur Adressen aus `allowed_emails` durch.
   ══════════════════════════════════════════════════════════════════════ */

import { useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { hasSupabase, supabase } from '../../lib/supabaseClient'
import { useRefreshAll } from '../../lib/store'
import { seedIfEmpty } from '../../lib/seed'
import { AmbientLayer } from '../../components/AmbientLayer'

function Shell({ children }: { children: ReactNode }) {
  return (
    <>
      <AmbientLayer enabled />
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          minHeight: '100dvh',
          display: 'grid',
          placeItems: 'center',
          padding: 24,
        }}
      >
        <div style={{ width: 'min(420px, 100%)', display: 'flex', flexDirection: 'column', gap: 22 }}>
          <span className="brand" style={{ justifyContent: 'center' }}>
            <i />
            JARVIS
          </span>
          {children}
        </div>
      </div>
    </>
  )
}

export function AuthGate({ children }: { children: ReactNode }) {
  const refreshAll = useRefreshAll()
  const [session, setSession] = useState<Session | null>(null)
  const [checking, setChecking] = useState(hasSupabase)
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!supabase) return
    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setChecking(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
      if (!next) return
      // Beim allerersten Login ist das Konto leer — dann einmal befüllen,
      // damit kein nacktes Gerüst dasteht. Danach immer neu laden, weil
      // vorher leere Ergebnisse im Cache lagen.
      void seedIfEmpty()
        .catch((err) => console.error('Erstbefüllung fehlgeschlagen:', err))
        .finally(refreshAll)
    })
    return () => sub.subscription.unsubscribe()
  }, [refreshAll])

  // Ohne Supabase gibt es nichts zu bewachen.
  if (!hasSupabase) return <>{children}</>

  if (checking) {
    return (
      <Shell>
        <p className="row__v" style={{ textAlign: 'center' }}>
          SITZUNG WIRD GEPRÜFT …
        </p>
      </Shell>
    )
  }

  if (session) return <>{children}</>

  async function signIn(e: React.FormEvent) {
    e.preventDefault()
    const address = email.trim()
    if (!address || !supabase) return
    setSending(true)
    setError(null)
    const { error: err } = await supabase.auth.signInWithOtp({
      email: address,
      options: {
        // origin allein reicht nicht: liegt die App in einem Unterverzeichnis
        // (GitHub Pages: /Jarvis/), landet der Link sonst auf der leeren
        // Wurzel statt in der App. BASE_URL trägt genau diesen Unterpfad.
        emailRedirectTo: window.location.origin + import.meta.env.BASE_URL,
      },
    })
    setSending(false)
    if (err) setError(err.message)
    else setSent(true)
  }

  return (
    <Shell>
      <section className="tile">
        <header className="tile__h">
          <span className="orb" />
          <span className="tile__t">Anmeldung</span>
        </header>

        {sent ? (
          <>
            <p style={{ fontSize: 15, lineHeight: 1.6 }}>
              Link ist unterwegs an <b>{email}</b>. Öffne ihn auf diesem Gerät — danach bist du drin.
            </p>
            <button
              type="button"
              className="btn"
              style={{ marginTop: 16, alignSelf: 'flex-start' }}
              onClick={() => {
                setSent(false)
                setError(null)
              }}
            >
              Andere Adresse
            </button>
          </>
        ) : (
          <form onSubmit={signIn} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ fontSize: 14.5, color: 'var(--dim)', lineHeight: 1.6 }}>
              Kein Passwort — du bekommst einen Link per E-Mail. Nur freigeschaltete Adressen
              können ein Konto anlegen.
            </p>
            <input
              className="inp"
              type="email"
              autoComplete="email"
              required
              placeholder="deine@adresse.de"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="E-Mail-Adresse"
            />
            <button type="submit" className="btn btn--p" disabled={sending || !email.trim()}>
              {sending ? 'Sende …' : 'Link anfordern'}
            </button>
            {error && (
              <p className="row__v" style={{ color: 'var(--alert)', whiteSpace: 'normal' }} role="alert">
                {error}
              </p>
            )}
          </form>
        )}
      </section>
    </Shell>
  )
}

/** Abmelden — liegt in den Einstellungen. */
export function SignOutButton() {
  if (!hasSupabase) return null
  return (
    <button
      type="button"
      className="btn"
      onClick={() => void supabase?.auth.signOut()}
    >
      Abmelden
    </button>
  )
}
