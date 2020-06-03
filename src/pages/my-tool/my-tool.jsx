import React from "react";
import * as cpnt from './style/my-tool-style.js';
import theFn from './js/my-tool.js';
import keyDownFn from './js/key-down-fn.js';
import * as fn from './js/my-tool-pure-fn.js';
import {Button} from 'antd';

export default class Tool extends window.mix(
  React.Component,
  theFn,
  keyDownFn,
){
  oCanvas = React.createRef();
  oAudio = React.createRef();
  oBox = React.createRef();
  oPointer = React.createRef();
  oSententList = React.createRef();
  constructor(props){
    super(props);
    const oFirstLine = {
      start_: '00:00:00,000',
      end_: '00:00:09,000',
      start: 0,
      end: 9,
      long: 9,
      text: '',
    };
    this.state = {
      buffer: {}, //音频数据
      aWave: [], //波形数据
      duration: 0, //音频长度（秒
      oneScPx: 0, //一秒种的
      timer: null, //定时器1
      timer02: null, //定时器2
      iCurLine: 0, //当前行
      oFirstLine, //默认行
      aTimeLine: [oFirstLine], //字幕
      fileName: '', //文件名
      fileSrc: '', //文件地址
      perSecPx: 10,
      iHeight : 50,
    };
  }
  render() {
    const {state} = this;
    const {oneScPx, aTimeLine, iCurLine} = state;
    return <cpnt.Div>
      {/* <audio src={fileSrc} ref={this.oAudio}/> */}
      <audio src='./static/Im Lost.mp3' ref={this.oAudio}/>
      <cpnt.WaveWrap ref={this.oBox}
        onWheel={(ev) => this.onWheelFn(ev)}
      >
        <canvas  height={200} ref={this.oCanvas}/>
        <i className="pointer" ref={this.oPointer} />
        {aTimeLine.map(({start, end},idx)=>{
          return <cpnt.Region className={idx===iCurLine ? 'cur sentence' : 'sentence'} key={idx}
            style={{left: `${start * oneScPx}px`, width: `${(end - start) * oneScPx}px`}}
            onClick={()=>this.toPlay(idx)}
          >
            {idx+1}
          </cpnt.Region>
        })}
      </cpnt.WaveWrap>
      <div>
        <br/>
        <Button type="primary" onClick={()=>this.toSave()}>保存</Button>
        &nbsp;
        <Button onClick={()=>this.toExport()}>导出</Button>
        &nbsp;
        <input type="file" onChange={ev=>this.toImport(ev)}/>
      </div>
      {/* 分界 */}
      <cpnt.InputWrap>
        {(()=>{
          if (!aTimeLine[iCurLine]) return <span/>;
          return <textarea onChange={ev => this.valChanged(ev)}
            value={(aTimeLine[iCurLine] || {}).text}
            onKeyDown={ev=>this.enterKeyDown(ev)}
          />
        })()}
      </cpnt.InputWrap>
      {/* 分界 */}
      <cpnt.SentenceWrap ref={this.oSententList}>
        {aTimeLine.map((cur, idx)=>{
          return <li key={idx}
            onClick={()=>this.toPlay(idx)}
            className={`one-line ${idx===iCurLine ? 'cur' : ''}`}
          >
            <i className="idx" 
              style={{width: `${String(aTimeLine.length || 0).length}em`}}
            >
              {idx+1}
            </i>
            <span className="time" >
              <em>{cur.start_}</em>&nbsp;-&nbsp;<em>{cur.end_}</em>
            </span>
            {cur.text}
          </li>
        })}
      </cpnt.SentenceWrap>
    </cpnt.Div>
  }
  // ▼以下是生命周期
  async componentDidMount(){
    const buffer = await fn.getMp3();
    const aWave = fn.getPeaks(buffer, this.state.perSecPx);
    this.setState({
      buffer,
      aWave,
      duration: buffer.duration,
      oneScPx: aWave.length / 2 / buffer.duration,
    });
    this.toDraw();
    this.watchKeyDown();
  }
};


