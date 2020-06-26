/*
 * @Author: 李星阳
 * @LastEditors: 李星阳
 * @Description: 
 */ 
import styled from "styled-components";

export const Ul = styled.ul`
  height: 50px;
  line-height: 50px;
  background: black;
  margin: 0;
  display: ${props => props.hide ? "none" : "flex"};
`;

export const Li = styled.li`
  margin-right: 20px;
  a{
    display: block;
    color: white;
  }
`;
