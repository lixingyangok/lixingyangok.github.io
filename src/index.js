import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import {mix} from './common/common.js';
import lf from 'localforage';

// ▼样式
import 'antd/dist/antd.css';

Object.defineProperties(window, {
  mix: {
    writable: false,
    value: mix,
  },
  lf: {
    writable: false,
    value: lf,
  },
});

ReactDOM.render(
  // <React.StrictMode>
    <App />,
  // </React.StrictMode>,
  document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
