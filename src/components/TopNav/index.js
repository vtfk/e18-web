import React, { useState } from 'react'
import PropTypes from 'prop-types'

import { Link, useNavigate } from 'react-router-dom'

import { Icon, IconDropdownNav, IconDropdownNavItem, InitialsBadge, Logo, Paragraph } from '@vtfk/components'

import { TouchScrollable } from 'react-scrolllock'

import './styles.scss'

export function TopNav ({ includeUserInfo, firstName, lastName, displayName, brandName, menuItems, children }) {
  const [navOpen, setNavOpen] = useState(false)

  function toggleNav () {
    const isOpen = !navOpen
    setNavOpen(isOpen)

    if (includeUserInfo) {
      const container = document.getElementsByClassName('topnav-side-control')[0]
      container.classList.toggle('topnav-side-control-hidden')
    }

    return isOpen
  }

  return (
    <>
      <nav role='navigation' className={`topnav-side ${navOpen ? 'open' : ''}`}>
        <div className='topnav-side-control topnav-side-control-hidden'>
          <div className='topnav-side-control-user'>
            {
              includeUserInfo &&
                <>
                  <InitialsBadge className='user-image' firstName={firstName} lastName={lastName} />
                  <div className='user-name'>
                    <Paragraph>{displayName}</Paragraph>
                  </div>
                  <div className='user-menu'>
                    <IconDropdownNav>
                      {
                        menuItems.map((item, index) => {
                          return (
                            <IconDropdownNavItem key={index} onClick={item.onClick} title={item.title} closeOnClick={true} />
                          )
                        })
                      }
                    </IconDropdownNav>
                  </div>
                </>
            }
          </div>

          <button aria-label='Lukk meny' title='Lukk menyen' className='topnav-side-top-close' onClick={() => { toggleNav(); console.log('TopNavSide toggled', !navOpen) }}>
            <Icon name='close' size='xsmall' />
          </button>
        </div>

        <TouchScrollable>
          <div className='topnav-side-list'>
            <div className='topnav-side-list-inner'>
              {children}
            </div>
          </div>
        </TouchScrollable>
      </nav>

      <header className='topnav'>
        <Link to='/' className='topnav-brand'>
          <div className='brand-logo' aria-hidden>
            <Logo />
          </div>
          <div className='brand-name'>{brandName}</div>
        </Link>
        <div className='topnav-toggles'>
          <button aria-label='Åpne meny' title='Åpne menyen' onClick={() => { toggleNav(); console.log('TopNav toggled', !navOpen) }}>
            <Icon size='small' name='menu' />
          </button>
        </div>
      </header>
    </>
  )
}

export function TopNavItem ({ href, icon, title, active, ...props }) {
  const navigate = useNavigate()

  function onItemClick (path) {
    if (path.includes('://')) {
      window.open(path, 'about:blank')
    } else {
      navigate(path)
    }
  }

  return (
    <div className={`topnav-side-list-item ${active ? 'active' : ''}`} {...props} onClick={() => onItemClick(href)}>
      <div className='topnav-side-list-item-icon'>
        {icon}
      </div>
      <div className='topnav-side-list-item-text'>{title}</div>
    </div>
  )
}

TopNav.propTypes = {
  brandName: PropTypes.string.isRequired,
  children: PropTypes.any.isRequired,
  displayName: PropTypes.string,
  firstName: PropTypes.string,
  includeUserInfo: PropTypes.bool,
  lastName: PropTypes.string,
  menuItems: PropTypes.shape({
    onClick: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired
  }).isRequired
}

TopNav.defaultProps = {
  includeUserInfo: true
}

TopNavItem.propTypes = {
  active: PropTypes.bool,
  href: PropTypes.string.isRequired,
  icon: PropTypes.node,
  title: PropTypes.string
}
