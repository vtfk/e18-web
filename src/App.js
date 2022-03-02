import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import { Home } from './pages/Home'
import { PageNotFound } from './pages/PageNotFound'

function App() {
  return (
    <Router>
      <div className='app'>
        <Routes>
          <Route path='/' element={<Home />} />

          <Route path='*' element={<PageNotFound />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App;
