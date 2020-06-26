import React from "react";
import {NavLink} from "react-router-dom";
import styled from "styled-components";

const Ul = styled.ul`
  height: 50px;
  line-height: 50px;
  background: black;
  margin: 0;
  display: flex;
  li{
    margin-right: 20px;
  }
  a{
    display: block;
    color: white;
  }
`;

export default function () {
  const aNavData = [
    {name: '首页', to: '/index'},
    {name: '工具', to: '/practicing', target:'_blank'},
    {name: '关于', to: '/about'},
  ];
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
