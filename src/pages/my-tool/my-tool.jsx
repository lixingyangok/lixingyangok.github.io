import React from "react";
import * as fn from './js/my-tool.js';
import {Div, MyBox, Textarea} from './style/my-tool-style.js';
import theFn from './js/my-tool-fn.js';

export default class extends window.mix(
  React.Component,
  theFn,
){
  oCanvas = React.createRef();
  oAudio = React.createRef();
  oBox = React.createRef();
  oPointer = React.createRef();
  constructor(props){
    super(props);
    this.state = {
      buffer: {}, //音频数据
      aWave: [], //波形数据
      iWidth: 0,
      aTimeLine: [], //
      duration: 0,
      oneScPx: 0,
      timer: null,
      timer02: null,
      iCurLine: 1,
      speed: 1,
      left: 100,
      sCurStr: '',
    };
  }
  render() {
    const {state} = this;
    const {oneScPx, aTimeLine, iCurLine} = state;
    return <Div>
      <audio controls="controls" src="./static/Im Lost.mp3" ref={this.oAudio}/>
      <MyBox ref={this.oBox}>
        <canvas width={state.iWidth} height={200} ref={this.oCanvas}/>
        <i className="pointer" ref={this.oPointer} />
        {state.aTimeLine.map((cur,idx)=>{
          return <span className={idx===iCurLine ? 'cur sentence' : 'sentence'} key={idx}
            style={{left: `${cur.start * oneScPx}px`, width: `${cur.long * oneScPx}px`}}
            onClick={()=>this.toPlay(idx)}
          >
            {idx+1}
          </span>
        })}
      </MyBox>
      <br/><br/>
      <div>
        {(()=>{
          if (!aTimeLine[iCurLine]) return <span/>;
          return <Textarea onChange={ev => this.valChanged(ev)}
            value={(aTimeLine[iCurLine] || {}).text}
            onKeyDown={ev=>this.enterKeyDown(ev)}
          >
            123
          </Textarea>
        })()}
      </div>
      <ol>
        {state.aTimeLine.map((cur, idx)=>{
          return <li key={idx}
            onClick={()=>this.toPlay(idx)}
            className={`one-line ${idx===iCurLine ? 'cur' : ''}`}
          >
            {cur.text}
          </li>
        })}
      </ol>
    </Div>
  }
  async componentDidMount(){
    const [buffer, sText] = await Promise.all([fn.getMp3(), fn.getText()]);
    const aWave = fn.getPeaks(buffer, 30);
    const aTimeLine = fn.getTimeLine(sText).slice(0, 4);
    const iWidth = aWave.length / 2; // 画布宽度
    // console.log(`一秒${iWidth / buffer.duration}像素`);
    this.setState({
      buffer,
      aWave,
      aTimeLine,
      iWidth,
      duration: buffer.duration,
      oneScPx: iWidth / buffer.duration,
    });
    this.toDraw();
    this.watchKeyDown();
  }
};

