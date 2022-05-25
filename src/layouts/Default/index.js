import { Routes, Route } from 'react-router-dom'

import { IconDropdownNavItem, SideNav, TopBar } from '@vtfk/components'

import { getValidToken } from '../../auth'

import { Queue } from '../../pages/Queue'
import { Statistics } from '../../pages/Statistics'
import { APIKeys } from '../../pages/APIKeys'
import { PageNotFound } from '../../pages/PageNotFound'

import './styles.scss'

const user = {
  displayName: 'Vegar Beider',
  firstName: 'Vegar',
  lastName: 'Beider'
}

const items = [
  {
    href: '/',
    icon: {
      name: 'activity'
    },
    title: 'Queue'
  },
  {
    href: '/statistics',
    icon: {
      name: 'statistics'
    },
    title: 'Statistics'
  },
  {
    href: '/apikeys',
    icon: {
      name: 'students'
    },
    title: 'API-keys'
  }
]

const menuItems = [
  {
    onClick: () => {
      window.location.href = '/logout'
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
