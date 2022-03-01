import { DefaultLayout } from '../../layouts/Default'

import './styles.scss'

export function PageNotFound () {
  return (
    <DefaultLayout>
      <img className='not-found' src='https://i.gifer.com/AVAR.gif' alt='Not found' />
    </DefaultLayout>
  )
}
