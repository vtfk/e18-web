import React from 'react'
import PropTypes from 'prop-types'

import { IconDropdownNav, InitialsBadge, Paragraph } from '@vtfk/components'

import './styles.scss'

export function TopBar ({ includeUserInfo, firstName, lastName, displayName, children }) {
  return (
    <div className='top-bar'>
      <div className='top-bar-user'>
        {
          includeUserInfo &&
            <>
              <InitialsBadge className='user-image' firstName={firstName} lastName={lastName} />
              <div className='user-name'>
                <Paragraph>{displayName}</Paragraph>
              </div>
            </>
        }
        <div className='user-menu'>
          <IconDropdownNav>
            {children}
          </IconDropdownNav>
        </div>
      </div>
    </div>
  )
}

TopBar.propTypes = {
  children: PropTypes.element,
  displayName: PropTypes.string,
  firstName: PropTypes.string,
  includeUserInfo: PropTypes.bool,
  lastName: PropTypes.string
}

TopBar.defaultProps = {
  includeUserInfo: true
}
