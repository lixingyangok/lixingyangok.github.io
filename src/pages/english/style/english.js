import styled from "styled-components";

export const Div = styled.div`
  margin: 30px;
  .a99{
    background: pink;
    .wavesurfer-handle{
      width: 1px !important;
    }
  }
  .sentence{
    display: inline-block;
    background: yellow;
    margin: 5px 10px 0 0;
    padding: 3px 10px;
    border-radius: 3px;
  }
`;

export const MyBox = styled.div`
  width: 100%;
  height: 220px;
  background: yellow;
  margin: 20px 0 0;
  overflow-x: auto;
  overflow-y: hidden;
  canvas{
    /* height: 200px; */
    outline: solid 1px blue;
  }
`;
