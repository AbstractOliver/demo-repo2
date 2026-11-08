import { useState, type FormEvent } from 'react'
import { useSession } from '../session'

export function SignInPage() {
  const { signIn } = useSession()
  const [email, setEmail] = useState('maya@acme.test')
  const [error, setError] = useState<string | null>(null)

  async function submit(event: FormEvent) {
    event.preventDefault()
    try {
      await signIn(email)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  return (
    <div className="centered">
      <form className="card sign-in" onSubmit={submit}>
        <h1>Acme Invoicing</h1>
        <label>
          Email
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit">Sign in</button>
      </form>
    </div>
  )
}
