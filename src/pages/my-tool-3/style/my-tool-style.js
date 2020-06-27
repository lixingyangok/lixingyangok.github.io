import styled from "styled-components";

export const Div = styled.div`
  box-sizing: border-box;
  padding: 20px 40px 60px;
  height: calc(100vh - 50px);
  display: flex;
  flex-flow: column nowrap;
  .ant-spin-spinning{
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.5);
    overflow: hidden;
    z-index: 3;
  }
  .ant-spin-dot{
    margin-top: 45vh;
  }
  .ant-spin-dot-item{
    background: white;
  }
`;

export const WaveWrap = styled.div`
  width: 100%;
  height: 220px;
  background: gray;
  overflow-x: auto;
  overflow-y: hidden;
  position: relative;
  flex: none;
  canvas{ }
  .region{
    box-sizing: border-box;
    position: absolute;
    top: 0px;
    height: 100%;
    min-width: 1px;
    background: rgba(0,0,0,0.5);
    z-index: 4;
    margin: 0;
    padding: 0;
    border: solid rgba(255,255,255,0.5);
    border-width: 0 1px;
    overflow: hidden;
  }
  .cur{
    border-color: transparent blue transparent red;
    border-width: 0 2px;
    background: none;
  }
  .pointer{
    position: absolute;
    width: 1px;
    height: 100%;
    background: white;
    top: 0;
    left: 0;
    z-index: 9;
    /* transition-timing-function: linear !important; */
  }
  canvas{
    position: absolute;
    top: 0;
    left: 0;
  }
`;

export const TimeBar = styled.div`
  position: relative;
  height: 100%;
  background: rgba(0,0,0,0.1);
  z-index: 2;
  .second-mark{
    box-sizing: border-box;
    display: inline-block;
    border-left: solid 1px rgba(255,255,255,0.5);
    height: 15px;
    z-index: 3;
    position: absolute;
    top: 0;
  }
`;

export const Region = styled.span`
  display: inline-block;
  background: yellow;
  margin: 5px 10px 0 0;
  padding: 3px 10px;
  border-radius: 3px;
  color: white;
`;

export const BtnBar = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 15px 0 -5px;
`;

export const InputWrap = styled.div`
  height: 90px;
  margin: 25px 0;
  flex: none;
  textarea{
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    padding: 10px;
    font-size: 20px;
  }
`;


export const SentenceWrap = styled.ol`
  overflow-y: auto;
  list-style: none;
  padding: 0 0 100px;
  margin: 0;
  border-bottom: solid 1px #aaa;
  .one-line{
    line-height: 2;
    border: solid #aaa;
    border-width: 1px 0 0;
    padding: 0 10px;
    display: flex;
    &[class~=cur],
    &:hover{
      background: #ceffe7;
      cursor: pointer;
    }
    &:last-child{
      border-width: 1px 0;
    }
  }
  .idx{
    flex: none;
    font-style: normal;
    text-align: center;
  }
  .time{
    flex: none;
    border: solid 1px #aaa;
    border-width: 0 1px;
    padding: 0 0.6em;
    margin: 0 0.6em;
    em{
      font-style: normal;
    }
  }
`;
