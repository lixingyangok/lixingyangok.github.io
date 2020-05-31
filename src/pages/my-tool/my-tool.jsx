import React from "react";
import * as fn from './js/my-tool.js';
import * as cpnt from './style/my-tool-style.js';
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
      fCanvasWidth: 0, //画布宽
      aTimeLine: [], //字幕
      duration: 0, //音频长度（秒
      oneScPx: 0, //一秒种的
      timer: null, //定时器1
      timer02: null, //定时器2
      iCurLine: 1, //当前行
    };
  }
  render() {
    const {state} = this;
    const {oneScPx, aTimeLine, iCurLine} = state;
    return <cpnt.Div>
      <audio src="./static/Im Lost.mp3" ref={this.oAudio}/>
      <cpnt.WaveWrap ref={this.oBox}>
        <canvas width={state.fCanvasWidth} height={200} ref={this.oCanvas}/>
        <i className="pointer" ref={this.oPointer} />
        {state.aTimeLine.map((cur,idx)=>{
          return <span className={idx===iCurLine ? 'cur sentence' : 'sentence'} key={idx}
            style={{left: `${cur.start * oneScPx}px`, width: `${cur.long * oneScPx}px`}}
            onClick={()=>this.toPlay(idx)}
          >
            {idx+1}
          </span>
        })}
      </cpnt.WaveWrap>
      <br/><br/>
      <div>
        {(()=>{
          if (!aTimeLine[iCurLine]) return <span/>;
          return <cpnt.Textarea onChange={ev => this.valChanged(ev)}
            value={(aTimeLine[iCurLine] || {}).text}
            onKeyDown={ev=>this.enterKeyDown(ev)}
          >
            123
          </cpnt.Textarea>
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
    </cpnt.Div>
  }
  // ▼以下是生命周期
  async componentDidMount(){
    const [buffer, sText] = await Promise.all([fn.getMp3(), fn.getText()]);
    const aWave = fn.getPeaks(buffer, 30);
    const aTimeLine = fn.getTimeLine(sText).slice(0, 4);
    const fCanvasWidth = aWave.length / 2; // 画布宽度
    // console.log(`一秒${fCanvasWidth / buffer.duration}像素`);
    this.setState({
      buffer,
      aWave,
      aTimeLine,
      fCanvasWidth,
      duration: buffer.duration,
      oneScPx: fCanvasWidth / buffer.duration,
    });
    this.toDraw();
    this.watchKeyDown();
  }
};


