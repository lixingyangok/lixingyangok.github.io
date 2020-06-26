import React from "react";
import {NavLink, useLocation} from "react-router-dom";
import styled from "styled-components";

const Ul = styled.ul`
  height: 50px;
  line-height: 50px;
  background: black;
  margin: 0;
  display: ${props => props.hide ? "none" : "flex"};
  li{
    margin-right: 20px;
  }
  a{
    display: block;
    color: white;
  }
`;

const aNavData = [
  {name: '首页', to: '/index'},
  {name: '工具', to: '/practicing', target:'_blank'},
  {name: '关于', to: '/about'},
];

export default function () {
  const oLocation = useLocation();
  const isPracticing = oLocation.pathname.includes('/practicing');
  // console.log(oLocation);
  if (isPracticing){
    return <div></div>;  
  }
  return <nav>
    <Ul>
      {aNavData.map((cur,idx)=>{
        return <li key={idx}>
          <NavLink to={cur.to} target={cur.target || ''} >
            {cur.name}
          </NavLink>
        </li>
      })}
    </Ul>
  </nav>;
}
