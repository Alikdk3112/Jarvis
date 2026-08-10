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

import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { hasSupabase, supabase } from '../../lib/supabaseClient'
import { useRefreshAll } from '../../lib/store'
import { seedIfEmpty } from '../../lib/seed'

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

/* Kein Ambient-Layer mehr, keine Glasfläche: die Anmeldung ist eine
   Spalte auf dem Seitengrund, mit derselben 1px-Regel wie jede Sektion. */
function Shell({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'grid',
        placeItems: 'center',
        padding:
          'max(24px, env(safe-area-inset-top)) max(24px, env(safe-area-inset-right))' +
          ' max(24px, env(safe-area-inset-bottom)) max(24px, env(safe-area-inset-left))',
      }}
    >
      <div style={{ width: 'min(360px, 100%)', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <span className="hdr__brand">JARVIS</span>
        {children}
      </div>
    </div>
  )
}

type Mode = 'signin' | 'signup'

/* Für welche Kennung die Erstbefüllung schon versucht wurde. Steht bewusst
   ausserhalb der Komponente: ein Zustand darin würde beim Neuaufbau der
   Komponente verschwinden, und dann liefe die Befüllung erneut. */
let seededFor: string | null = null

export function AuthGate({ children }: { children: ReactNode }) {
  const refreshAll = useRefreshAll()
  const [session, setSession] = useState<Session | null>(null)
  const [checking, setChecking] = useState(hasSupabase)

  /* Der Effekt unten darf sich unter keinen Umständen erneut einhängen. Damit
     das nicht daran hängt, ob `useRefreshAll` seine Identität behält, liest er
     die Funktion aus einer Referenz statt aus der Abhängigkeitsliste. Genau
     diese Kopplung hat die Schleife verursacht; sie kommt hier nicht zurück,
     auch wenn an store.ts jemand das useCallback entfernt. */
  const refreshRef = useRef(refreshAll)
  refreshRef.current = refreshAll

  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  /* Genau einmal einhängen — hier lag der Hänger.

     Vorher stand `refreshAll` in der Abhängigkeitsliste dieses Effekts. Die
     Funktion war ohne useCallback bei jedem Rendern eine neue, der Effekt lief
     also jedes Mal neu: aushängen, wieder einhängen. Supabase schickt beim
     Einhängen aber sofort die laufende Sitzung nach, `setSession` bekam ein
     frisches Objekt, das nächste Rendern folgte — und mit ihm die nächste
     Einhängung. In jedem Umlauf feuerte `seedIfEmpty()` seine drei Abfragen.
     Gemessen: rund 1750 Anfragen je Sekunde gegen Supabase, dauerhaft, ohne
     dass der Nutzer etwas tat.

     In der Entwicklung war davon nichts zu sehen, weil der Effekt im lokalen
     Modus in der ersten Zeile zurückkehrt. Die Schleife existierte nur im
     Supabase-Modus — und der läuft nur im ausgelieferten Bau, also genau dort,
     wo niemand mitliest. */
  useEffect(() => {
    if (!supabase) return
    let alive = true

    void supabase.auth.getSession().then(({ data }) => {
      if (!alive) return
      setSession(data.session)
      setChecking(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((event, next) => {
      if (!alive) return
      setSession(next)
      setChecking(false)

      /* Nur bei einem echten Anmelde-Übergang befüllen. `INITIAL_SESSION`
         kommt bei jedem Einhängen, `TOKEN_REFRESHED` etwa jede Stunde —
         beides ist keine Anmeldung und darf nichts auslösen. Der Riegel auf
         die Kennung fängt zusätzlich, dass Supabase `SIGNED_IN` mehrfach für
         dieselbe Sitzung schickt, etwa beim Zurückkehren in den Vordergrund. */
      if (event !== 'SIGNED_IN' || !next) return
      if (seededFor === next.user.id) return
      seededFor = next.user.id

      void seedIfEmpty()
        .then((befüllt) => {
          /* Nur nach echter Erstbefüllung alles neu laden — vorher lagen
             leere Ergebnisse im Zwischenspeicher. Ohne Befüllung wäre es
             eine vollständige Abfrage aller zehn Sammlungen für nichts. */
          if (befüllt) refreshRef.current()
        })
        .catch((err) => {
          seededFor = null // Ein Fehlversuch gilt nicht als erledigt.
          console.error('Erstbefüllung fehlgeschlagen:', err)
        })
    })

    return () => {
      alive = false
      sub.subscription.unsubscribe()
    }
  }, [])

  // Ohne Supabase gibt es nichts zu bewachen.
  if (!hasSupabase) return <>{children}</>

  if (checking) {
    return (
      <Shell>
        <p className="empty">SITZUNG WIRD GEPRÜFT …</p>
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
      <section className="sec m-tasks">
        <header className="sec__h">
          <span className="sec__bar" aria-hidden="true" />
          <h2 className="sec__t">{mode === 'signin' ? 'Anmeldung' : 'Konto anlegen'}</h2>
        </header>

        <form className="form" onSubmit={submit}>
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
            <p className="empty" style={{ whiteSpace: 'normal', lineHeight: 1.6 }}>
              Mindestens {MIN_PASSWORD} Zeichen · nur freigeschaltete Adressen
            </p>
          )}

          <button type="submit" className="btn btn--p" disabled={busy || !email.trim() || tooShort}>
            {busy ? 'Moment …' : mode === 'signin' ? 'Anmelden' : 'Konto anlegen'}
          </button>

          {error && (
            <p className="errline" role="alert" style={{ whiteSpace: 'normal' }}>
              {error}
            </p>
          )}
          {notice && (
            <p className="empty" role="status" style={{ whiteSpace: 'normal', lineHeight: 1.6, color: 'var(--m-habits)' }}>
              {notice}
            </p>
          )}
        </form>

        <div className="btns" style={{ marginTop: 16 }}>
          <button
            type="button"
            className="btn"
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin')
              setError(null)
              setNotice(null)
            }}
          >
            {mode === 'signin' ? 'Noch kein Konto?' : 'Zurück zur Anmeldung'}
          </button>
          {mode === 'signin' && (
            <button type="button" className="btn" onClick={() => void resetPassword()} disabled={busy}>
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
