import React, {Suspense} from 'react';
import { NavLink } from 'react-router-dom';
import { BrowserRouter, Route, Redirect, Switch } from 'react-router-dom';
import styled from 'styled-components';
const Li = styled.li`
  color: red;
  .active{
    background: yellow;
  }
`;

function App() {
  return <BrowserRouter>
    <ul>
      <Li>
        <NavLink to='/index' >首页</NavLink>
        &emsp;
        <NavLink to='/english' >英语</NavLink>
        &emsp;
        <NavLink to='/english-2' >英语-2</NavLink>
        &emsp;
        <NavLink to='/my-tool' >工具</NavLink>
        &emsp;
        <NavLink to='/about' >关于</NavLink>
      </Li>
    </ul>
    {/* ▼异步组件父级必须有 Suspense */}
    <Suspense fallback={<div>Loading...</div>}>
      <Switch>
        <Redirect exact from="/" to="/index" ></Redirect>
        <Route path="/index" component={React.lazy(() => import('./pages/index/index.jsx'))} />
        <Route path="/english" component={React.lazy(() => import('./pages/english/english.jsx'))} />
        <Route path="/english-2" component={React.lazy(() => import('./pages/english-2/english.jsx'))} />
        <Route path="/my-tool" component={React.lazy(() => import('./pages/my-tool/my-tool.jsx'))} />
        <Route path="/about" component={React.lazy(() => import('./pages/about/about.jsx'))} />
      </Switch>
    </Suspense>
  </BrowserRouter>
}


export default App;

