import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import { Queue } from './pages/Queue'
import { Statistics } from './pages/Statistics'
import { APIKeys } from './pages/APIKeys'
import { PageNotFound } from './pages/PageNotFound'

function App() {
  return (
    <Router>
      <div className='app'>
        <Routes>
          <Route path='/' element={<Queue />} />
          <Route path='/statistics' element={<Statistics />} />
          <Route path='/apikeys' element={<APIKeys />} />

          <Route path='*' element={<PageNotFound />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App;
