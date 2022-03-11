import React from 'react'

import { IconDropdownNavItem, SideNav, TopBar } from '@vtfk/components'

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
    onClick: () => console.log('Should log off', '🤡'),
    title: 'Logg av 🤡'
  }
]

export function DefaultLayout (props) {
  return (
    <div className='default-layout'>

      <SideNav title='E18' items={items} useMini />

      {/* Menu bar shown on screen sizes greater than 1000px */}
      <TopBar displayName={user.displayName} firstName={user.firstName} lastName={user.lastName}>
        {
          menuItems.map((item, index) => {
            return (
              <IconDropdownNavItem key={index} onClick={item.onClick} title={item.title} closeOnClick />
            )
          })
        }
      </TopBar>

      <div className='container'>
        {props.children}
      </div>
    </div>
  )
}
