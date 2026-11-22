import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { businessService } from '../../services/businessService'

export default function AcceptInvitePage() {
  const [params] = useSearchParams()
  const token = params.get('token')
  const [status, setStatus] = useState<'working' | 'done' | 'error'>('working')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Invitation link is missing its token')
      return
    }
    businessService
      .acceptInvite(token)
      .then(() => setStatus('done'))
      .catch((err) => {
        setStatus('error')
        setMessage(isAxiosError(err) ? (err.response?.data?.message ?? 'Failed') : 'Failed')
      })
  }, [token])

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-sm space-y-3 rounded-xl border border-slate-200 bg-white p-6 text-center">
        {status === 'working' && <p className="text-slate-600">Accepting invitation...</p>}
        {status === 'done' && (
          <>
            <p className="font-medium text-slate-900">You joined the business.</p>
            <Link to="/dashboard" className="text-blue-600">Go to dashboard</Link>
          </>
        )}
        {status === 'error' && <p className="text-sm text-red-600">{message}</p>}
      </div>
    </div>
  )
}