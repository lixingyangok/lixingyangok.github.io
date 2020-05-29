import styled from "styled-components";

export const Div = styled.div`
  margin: 30px;
  .sentence{
    display: inline-block;
    background: yellow;
    margin: 5px 10px 0 0;
    padding: 3px 10px;
    border-radius: 3px;
  }
  .one-line{
    line-height: 2;
    &:hover{
      background: #eee;
      cursor: pointer;
    }
  }
`;

export const MyBox = styled.div`
  width: 100%;
  height: 220px;
  background: yellow;
  margin: 20px 0 0;
  overflow-x: auto;
  overflow-y: hidden;
  position: relative;
  canvas{
    /* height: 200px; */
    outline: solid 1px blue;
  }
  .sentence{
    box-sizing: border-box;
    position: absolute;
    top: 0px;
    height: 100%;
    min-width: 1px;
    background: rgba(0,0,0,0.1);
    z-index: 3;
    margin: 0;
    padding: 0;
    border: solid gray;
    border-width: 0 1px;
    &[class~=cur]{
      border-color: red;
      border-width: 0 2px;
    }
  }
  .pointer{
    position: absolute;
    width: 1px;
    height: 100%;
    background: black;
    top: 0;
    left: 100px;
    /* transition-timing-function: linear !important; */
  }
`;

export const Textarea = styled.textarea`
  width: 100%;
  height: 90px;
`;