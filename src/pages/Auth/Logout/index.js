import { Button } from '@vtfk/components'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import * as auth from '../../../auth'

export function Logout () {
  const [isLoggingOut, setIsLoggingOut] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    setIsLoggingOut(true)
    auth.logout()
    setIsLoggingOut(false)
  }, [])

  return (
    <div className='logout-container'>
      <div className='logout-title'>{isLoggingOut ? 'Logging out' : 'You\'ve logged out'}</div>
      {
        !isLoggingOut && <Button onClick={() => navigate('/login')}>Log in again</Button>
      }
    </div>
  )
}
