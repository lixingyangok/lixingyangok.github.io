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
        <Route path="/english" component={React.lazy(() => import('./pages/english/english.jsx'))} />
        <Route path="/english-2" component={React.lazy(() => import('./pages/english-2/english.jsx'))} />
        <Route path="/my-tool" component={React.lazy(() => import('./pages/my-tool/my-tool.jsx'))} />
        <Route path="/my-tool-2" component={React.lazy(() => import('./pages/my-tool-2/my-tool.jsx'))} />
        <Route path="/about" component={React.lazy(() => import('./pages/about/about.jsx'))} />
      </Switch>
    </Suspense>
  </BrowserRouter>
}

export default App;

