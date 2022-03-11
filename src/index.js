import React from 'react';
import ReactDOM from 'react-dom';
import { BaseStyle } from '@vtfk/components'
import App from './App';

import './assets/scss/base-styles.scss'

ReactDOM.render(
  <React.StrictMode>
    <BaseStyle>
      <App />
    </BaseStyle>
  </React.StrictMode>,
  document.getElementById('root')
);
