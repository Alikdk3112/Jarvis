/* ══════════════════════════════════════════════════════════════════════
   Anmeldung mit E-Mail und Passwort.

   Im lokalen Modus gibt es keine — die Daten liegen im Browser, ein Login
   wäre reine Schikane. Sobald Supabase konfiguriert ist, schiebt sich diese
   Hürde davor.

   Bewusst kein Magic Link mehr: der Umweg übers Postfach bei jeder Anmeldung
   war lästiger als ein Passwort. Kennung ist die E-Mail-Adresse, weil
   Supabase darüber anmeldet — ein frei gewählter Benutzername bräuchte eine
   zusätzliche Übersetzungstabelle samt öffentlicher Abfrage.

   Wer sich registrieren darf, entscheidet weiterhin die Datenbank, nicht
   diese Datei: ein Trigger auf auth.users lässt nur Adressen aus
   `allowed_emails` durch.
   ══════════════════════════════════════════════════════════════════════ */

import { useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { hasSupabase, supabase } from '../../lib/supabaseClient'
import { useRefreshAll } from '../../lib/store'
import { seedIfEmpty } from '../../lib/seed'
import { AmbientLayer } from '../../components/AmbientLayer'

const MIN_PASSWORD = 8

/** Supabase antwortet auf Englisch und oft technisch. Hier die Fälle, die
 *  tatsächlich vorkommen, in verständlichem Deutsch. */
function humanError(message: string): string {
  const m = message.toLowerCase()
  if (m.includes('invalid login credentials')) return 'E-Mail oder Passwort stimmt nicht.'
  if (m.includes('email not confirmed'))
    return 'Die Adresse ist noch nicht bestätigt — schau einmalig in dein Postfach.'
  if (m.includes('user already registered') || m.includes('already been registered'))
    return 'Für diese Adresse gibt es schon ein Konto. Melde dich einfach an.'
  if (m.includes('password should be')) return `Das Passwort braucht mindestens ${MIN_PASSWORD} Zeichen.`
  if (m.includes('rate limit') || m.includes('too many'))
    return 'Zu viele Versuche. Warte einen Moment und probier es erneut.'
  // Der allowed_emails-Trigger bricht ab; Supabase meldet das nur allgemein.
  if (m.includes('database error saving new user'))
    return 'Diese Adresse ist für JARVIS nicht freigeschaltet.'
  return message
}

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

type Mode = 'signin' | 'signup'

export function AuthGate({ children }: { children: ReactNode }) {
  const refreshAll = useRefreshAll()
  const [session, setSession] = useState<Session | null>(null)
  const [checking, setChecking] = useState(hasSupabase)

  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

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

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!supabase) return
    const address = email.trim()
    if (!address || password.length < MIN_PASSWORD) return

    setBusy(true)
    setError(null)
    setNotice(null)

    if (mode === 'signin') {
      const { error: err } = await supabase.auth.signInWithPassword({ email: address, password })
      setBusy(false)
      if (err) setError(humanError(err.message))
      return
    }

    const { data, error: err } = await supabase.auth.signUp({
      email: address,
      password,
      options: { emailRedirectTo: window.location.origin + import.meta.env.BASE_URL },
    })
    setBusy(false)
    if (err) {
      setError(humanError(err.message))
      return
    }
    // Ist die Bestätigung per Mail eingeschaltet, kommt zwar ein Nutzer
    // zurück, aber keine Sitzung — dann muss erst der Link geklickt werden.
    if (!data.session) {
      setNotice('Konto angelegt. Bestätige einmalig den Link in deiner E-Mail — danach reicht immer das Passwort.')
      setMode('signin')
    }
  }

  async function resetPassword() {
    if (!supabase) return
    const address = email.trim()
    if (!address) {
      setError('Trag zuerst deine E-Mail-Adresse ein.')
      return
    }
    setBusy(true)
    setError(null)
    const { error: err } = await supabase.auth.resetPasswordForEmail(address, {
      redirectTo: window.location.origin + import.meta.env.BASE_URL,
    })
    setBusy(false)
    if (err) setError(humanError(err.message))
    else setNotice('Link zum Zurücksetzen ist unterwegs.')
  }

  const tooShort = password.length > 0 && password.length < MIN_PASSWORD

  return (
    <Shell>
      <section className="tile">
        <header className="tile__h">
          <span className="orb" />
          <span className="tile__t">{mode === 'signin' ? 'Anmeldung' : 'Konto anlegen'}</span>
        </header>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            className="inp"
            type="email"
            autoComplete="username"
            required
            placeholder="E-Mail-Adresse"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-label="E-Mail-Adresse"
          />
          <input
            className="inp"
            type="password"
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            required
            minLength={MIN_PASSWORD}
            placeholder="Passwort"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-label="Passwort"
          />

          {mode === 'signup' && (
            <p className="row__v" style={{ whiteSpace: 'normal', lineHeight: 1.7 }}>
              MINDESTENS {MIN_PASSWORD} ZEICHEN · NUR FREIGESCHALTETE ADRESSEN KÖNNEN EIN KONTO ANLEGEN
            </p>
          )}

          <button type="submit" className="btn btn--p" disabled={busy || !email.trim() || tooShort}>
            {busy ? 'Moment …' : mode === 'signin' ? 'Anmelden' : 'Konto anlegen'}
          </button>

          {error && (
            <p
              className="row__v"
              style={{ color: 'var(--alert)', whiteSpace: 'normal', lineHeight: 1.7 }}
              role="alert"
            >
              {error}
            </p>
          )}
          {notice && (
            <p
              className="row__v"
              style={{ color: 'var(--habits)', whiteSpace: 'normal', lineHeight: 1.7 }}
              role="status"
            >
              {notice}
            </p>
          )}
        </form>

        <div style={{ display: 'flex', gap: 9, marginTop: 16, flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn--sm"
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin')
              setError(null)
              setNotice(null)
            }}
          >
            {mode === 'signin' ? 'Noch kein Konto?' : 'Zurück zur Anmeldung'}
          </button>
          {mode === 'signin' && (
            <button type="button" className="btn btn--sm" onClick={() => void resetPassword()} disabled={busy}>
              Passwort vergessen
            </button>
          )}
        </div>
      </section>
    </Shell>
  )
}

/** Abmelden — liegt in den Einstellungen. */
export function SignOutButton() {
  if (!hasSupabase) return null
  return (
    <button type="button" className="btn" onClick={() => void supabase?.auth.signOut()}>
      Abmelden
    </button>
  )
}
