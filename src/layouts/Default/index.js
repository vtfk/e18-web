import { Routes, Route } from 'react-router-dom'
import { IconDropdownNavItem, SideNav, TopBar } from '@vtfk/components'
import { ToastContainer } from 'react-toastify'

import { getValidToken } from '../../auth'

import { Queue } from '../../pages/Queue'
import { Statistics } from '../../pages/Statistics'
import { APIKeys } from '../../pages/APIKeys'
import { PageNotFound } from '../../pages/PageNotFound'

import { APP } from '../../config'

import './styles.scss'
import 'react-toastify/dist/ReactToastify.css'

const user = {
  displayName: 'Vegar Beider',
  firstName: 'Vegar',
  lastName: 'Beider'
}

const items = [
  {
    to: '/',
    icon: {
      name: 'activity'
    },
    title: 'Queue'
  },
  {
    to: '/statistics',
    icon: {
      name: 'statistics'
    },
    title: 'Statistics'
  },
  {
    to: '/apikeys',
    icon: {
      name: 'students'
    },
    title: 'API-keys'
  }
]

const menuItems = [
  {
    onClick: () => {
      if (APP.IS_MOCK) alert('Mock mode is enabled 🤡')
      else window.location.href = '/logout'
    },
    title: 'Logg av 🤡'
  }
]

export function DefaultLayout () {
  const token = getValidToken()

  return (
    <div className='app'>
      <div className='default-layout'>

        <SideNav title='E18' items={items} useMini />

        {/* Menu bar shown on screen sizes greater than 1000px */}
        <TopBar displayName={token?.user?.displayName || user.displayName} firstName={token?.user?.firstName || user.firstName} lastName={token?.user?.lastName || user.lastName}>
          {
            menuItems.map((item, index) => {
              return (
                <IconDropdownNavItem key={index} onClick={() => item.onClick()} title={item.title} closeOnClick />
              )
            })
          }
        </TopBar>

        <ToastContainer newestOnTop pauseOnFocusLoss={false} />

        <div className='container'>
          <Routes>
            <Route path='/' element={<Queue />} />
            <Route path='/statistics' element={<Statistics />} />
            <Route path='/apikeys' element={<APIKeys />} />

            <Route path='/*' element={<PageNotFound />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}
