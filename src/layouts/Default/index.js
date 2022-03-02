import React from 'react'

import { Icon, IconDropdownNavItem, SideNav, SideNavItem } from '@vtfk/components'

import { TopBar } from '../../components/TopBar'
import { TopNav, TopNavItem } from '../../components/TopNav'

import './styles.scss'

const user = {
  displayName: 'Vegar Beider',
  firstName: 'Vegar',
  lastName: 'Beider'
}

const navItems = [
  {
    path: '/',
    icon: {
      name: 'home'
    },
    text: 'Hoppsann'
  },
  {
    path: 'https://www.db.no',
    icon: {
      name: 'classes'
    },
    text: 'Uppsann'
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

      {/* Navigation shown on screen sizes greater than 1000px */}
      <SideNav title='E18'>
        {
          navItems.map((item, index) => {
            return (
              <SideNavItem key={index} href={item.path} icon={<Icon name={item.icon.name} size={item.icon.size || 'medium'} />} title={item.text} active={window.location.pathname === item.path} />
            )
          })
        }
      </SideNav>

      {/* Navigation shown on screen sizes less than or equal to 1000px */}
      <TopNav
        brandName='E18'
        displayName={user.displayName}
        firstName={user.firstName}
        lastName={user.lastName}
        menuItems={menuItems}>
          {
            navItems.map((item, index) => {
              return (
                <TopNavItem key={index} href={item.path} icon={<Icon name={item.icon.name} size={item.icon.size || 'medium'} />} title={item.text} active={window.location.pathname === item.path} />
              )
            })
          }
      </TopNav>

      <div className='container'>

        {/* Menu bar shown on screen sizes greater than 1000px */}
        <TopBar displayName={user.displayName} firstName={user.firstName} lastName={user.lastName}>
          {
            menuItems.map((item, index) => {
              return (
                <IconDropdownNavItem key={index} onClick={item.onClick} title={item.title} closeOnClick={true} />
              )
            })
          }
        </TopBar>

        <div className='main-content'>
          {props.children}
        </div>
      </div>
    </div>
  )
}
