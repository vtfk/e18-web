import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { ErrorMessage } from '@vtfk/components'

import * as auth from '../../../auth'

export function HandleLogin () {
  const [error, setError] = useState(undefined)
  const [isHandeling, setIsHandeling] = useState(true)
  const useMountEffect = fn => useEffect(fn)
  const navigate = useNavigate()
  const { state } = useLocation()

  async function handleRedirect () {
    try {
      await auth.handleRedirect()
      if (auth.getValidToken()) {
        setIsHandeling(false)
        if (!window.opener || window.opener === window) navigate(state?.path || '/')
      } else setError('Kunne ikke logge inn')
    } catch (err) {
      console.log('Auth\\HandleLogin: Error:', err)
      setError(err)
    }
  }

  useMountEffect(() => handleRedirect())

  return (
    <div className='handlelogin-container'>
      {
        error &&
          <div>
            <div className='handlelogin-title'>En feil har oppstått</div>
            <div className='handlelogin-subtitle'>
              <ErrorMessage>{typeof error === 'object' ? JSON.stringify(error, null, 2) : error}</ErrorMessage>
            </div>
          </div>
      }
      {
        !error && isHandeling &&
          <div className='handlelogin-title'>Bearbeider innlogging</div>
      }
      {
        !error && !isHandeling &&
          <div>
            <div className='handlelogin-title'>Innlogging vellykket</div>
            <div className='handlelogin-subtitle'>Du kan stenge dette vinduet nå</div>
          </div>
      }
    </div>
  )
}
