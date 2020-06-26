/*
 * @Author: 李星阳
 * @LastEditors: 李星阳
 * @Description: 
 */ 
import React, {Suspense} from 'react';
import { BrowserRouter, Route, Redirect, Switch } from 'react-router-dom';
import Navigation from './common/components/navigation.jsx';


function App() {
  return <BrowserRouter>
    <Navigation/>
    {/* ▼异步组件父级必须有 Suspense */}
    <Suspense fallback={<div>Loading...</div>}>
      <Switch>
        <Redirect exact from="/" to="/index" ></Redirect>
        <Route path="/index" component={React.lazy(() => import('./pages/index/index.jsx'))} />
        <Route path="/practicing" component={React.lazy(() => import('./pages/my-tool-3/my-tool.jsx'))} />
        <Route path="/about" component={React.lazy(() => import('./pages/about/about.jsx'))} />
      </Switch>
    </Suspense>
  </BrowserRouter>
}

export default App;

