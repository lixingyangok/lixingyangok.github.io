import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

Object.defineProperty(window, 'mix', {
  writable: false,
  value: function mix(...mixins) {
    function copyProperties(target, source) {
      for (let key of Reflect.ownKeys(source)) {
        if ( key !== 'constructor'
          && key !== 'prototype'
          && key !== 'name'
        ) {
          let desc = Object.getOwnPropertyDescriptor(source, key);
          Object.defineProperty(target, key, desc);
        }
      }
    }
    class Mix {
      constructor() {
        for (let mixin of mixins) {
          copyProperties(this, new mixin()); // 拷贝实例属性
        }
      }
    }
    for (let mixin of mixins) {
      copyProperties(Mix, mixin); // 拷贝静态属性
      copyProperties(Mix.prototype, mixin.prototype); // 拷贝原型属性
    }
    return Mix;
  },
});

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
