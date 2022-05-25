import { useEffect, useState } from 'react'

import { ErrorMessage } from '@vtfk/components'

import * as auth from '../../../auth'

export function LoginRedirect () {
  const [error, setError] = useState(undefined)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const useMountEffect = fn => useEffect(fn)

  useMountEffect(() => {
    if (!isLoggingIn) {
      setIsLoggingIn(true)
      try {
        auth.login({ force: true })
      } catch (err) {
        console.log('Auth\\LoginRedirect: Error:', err)
        setError(err)
      }
    }
  })

  return (
    <div className='loginredirect-container'>
      <div className='loginredirect-title'>Logging in</div>
      <div className='loginredirect-subtitle'>You will soon be redirected</div>
      {error && <ErrorMessage>{typeof error === 'object' ? JSON.stringify(error, null, 2) : error}</ErrorMessage>}
    </div>
  )
}
