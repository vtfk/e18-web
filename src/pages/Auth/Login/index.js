import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { Button, ErrorMessage } from '@vtfk/components'

import * as auth from '../../../auth'

export function Login () {
  const [error, setError] = useState(undefined)
  const useMountEffect = fn => useEffect(fn)
  const navigate = useNavigate()
  const { state } = useLocation()

  async function authenticate () {
    try {
      await auth.login()
      navigate(state?.path || '/')
    } catch (err) {
      console.log('Auth\\Login: Error:', err)
      if (!error) setError(err)
    }
  }

  useMountEffect(() => authenticate())

  // TODO: CSS!!
  return (
    <div className='login-container'>
      <div className='login-title'>You're beeing logged in</div>
      <div className='login-subtitle'>If it does not happen automatically, please try the button</div>
      <Button onClick={() => authenticate()}>Login</Button>
      {error && <ErrorMessage>{typeof error === 'object' ? JSON.stringify(error, null, 2) : error}</ErrorMessage>}
    </div>
  )
}
