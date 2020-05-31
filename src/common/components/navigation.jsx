import React from "react";
import { NavLink } from "react-router-dom";
import styled from "styled-components";
const Ul = styled.ul`
  background: black;
  margin: 0;
  padding: 15px 30px;
  a {
    color: white;
  }
`;

export default function () {
  return (
    <Ul>
      <li>
        <NavLink to="/index">首页</NavLink>
        &emsp;
        <NavLink to="/english">英语</NavLink>
        &emsp;
        <NavLink to="/english-2">英语-2</NavLink>
        &emsp;
        <NavLink to="/my-tool">工具</NavLink>
        &emsp;
        <NavLink to="/about">关于</NavLink>
      </li>
    </Ul>
  );
}
