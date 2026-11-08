import { useState, type FormEvent } from 'react'
import { useParams } from 'react-router'
import { api, type Customer } from '../api'
import { useApi } from '../useApi'

export function CustomersPage() {
  const { workspaceId } = useParams()
  const { data: customers, error, reload } = useApi<Customer[]>(`/workspaces/${workspaceId}/customers`)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  async function addCustomer(event: FormEvent) {
    event.preventDefault()
    try {
      await api(`/workspaces/${workspaceId}/customers`, { method: 'POST', body: { name, email } })
      setName('')
      setEmail('')
      setFormError(null)
      await reload()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : String(err))
    }
  }

  return (
    <>
      <header className="page-header">
        <h1>Customers</h1>
      </header>
      <form className="inline-form" onSubmit={addCustomer}>
        <input placeholder="Name" value={name} onChange={(event) => setName(event.target.value)} />
        <input placeholder="Billing email" value={email} onChange={(event) => setEmail(event.target.value)} />
        <button type="submit">Add customer</button>
      </form>
      {(error || formError) && <p className="error">{error ?? formError}</p>}
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Billing email</th>
          </tr>
        </thead>
        <tbody>
          {(customers ?? []).map((customer) => (
            <tr key={customer.id}>
              <td>{customer.name}</td>
              <td>{customer.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
