import { Icon, SideNav, SideNavItem } from '@vtfk/components'

import './styles.scss'

export function DefaultLayout (props) {
  return (
    <div className='top-content'>
      <SideNav title='E18'>
        <SideNavItem href='https://www.vg.no' icon={<Icon name='home' size='medium' />} title='Home' active={window.location.pathname === '/'} />
        <SideNavItem href='https://www.db.no' icon={<Icon name='search' size='medium' />} title='Search' active={window.location.pathname === '/'} />
        <SideNavItem href='https://www.tb.no' icon={<Icon name='add' size='medium' />} title='Add' active={window.location.pathname === '/'} />
      </SideNav>
      <div className='main-content'>
        {props.children}
      </div>
    </div>
  )
}
