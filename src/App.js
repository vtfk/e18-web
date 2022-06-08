import { BrowserRouter, Routes, Route } from 'react-router-dom'

import { APP } from './config'

import { Login } from './pages/Auth/Login'
import { HandleLogin } from './pages/Auth/HandleLogin'
import { LoginRedirect } from './pages/Auth/LoginRedirect'
import { Logout } from './pages/Auth/Logout'
import { AuthRoute } from './pages/Auth/AuthRoute'
import { DefaultLayout } from './layouts/Default'

function App () {
  if (APP.IS_MOCK) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path='/*' element={<DefaultLayout />} />
        </Routes>
      </BrowserRouter>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/handlelogin' element={<HandleLogin />} />
        <Route path='/loginredirect' element={<LoginRedirect />} />
        <Route path='/logout' element={<Logout />} />
        <Route path='/*' element={<AuthRoute><DefaultLayout /></AuthRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
