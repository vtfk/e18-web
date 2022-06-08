import React from 'react'
import ReactDOM from 'react-dom'
import { BaseStyle } from '@vtfk/components'
import App from './App'

import { APP } from './config'

import './assets/scss/base-styles.scss'

if (APP.IS_MOCK) {
  const { worker } = require('./mocks/browser')
  worker.start()
}

ReactDOM.render(
  <React.StrictMode>
    <BaseStyle>
      <App />
    </BaseStyle>
  </React.StrictMode>,
  document.getElementById('root')
)
