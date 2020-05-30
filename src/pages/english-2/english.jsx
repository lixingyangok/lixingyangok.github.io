import React from "react";
import * as fn from './js/english.js';
import {Div, MyBox, Textarea} from './style/english.js';


class A01 extends React.Component {
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
    };
  }
  render() {
    const {state} = this;
    const {oneScPx} = state;
    return <Div>
      <audio controls="controls" src="./static/Im Lost.mp3" ref={this.oAudio}/>
      <MyBox ref={this.oBox}>
        <canvas width={state.iWidth} height={200} ref={this.oCanvas}/>
        <i className="pointer" ref={this.oPointer} />
        {state.aTimeLine.map((cur,idx)=>{
          return <span className={idx===state.iCurLine ? 'cur sentence' : 'sentence'} key={idx}
            style={{left: `${cur.start * oneScPx}px`, width: `${cur.long * oneScPx}px`}}
            onClick={()=>this.toPlay(idx)}
          >
            {idx+1}
          </span>
        })}
      </MyBox>
      <br/><br/>
      <div>
        <Textarea>
          123
        </Textarea>
      </div>
      <button onClick={()=>this.log()}>asdf</button>
      <ul>
        {state.aTimeLine.map((cur, idx)=>{
          return <li className="one-line" key={idx} onClick={()=>this.toPlay(idx)}>
            {cur.text}
          </li>
        })}
      </ul>
    </Div>
  }
  componentDidMount = componentDidMount;
  goLine(idx){
    const oBox = this.oBox.current;
    const {oneScPx, aTimeLine} = this.state;
    const leftVal = oneScPx * aTimeLine[idx].start - 500;
    oBox.scrollTo(leftVal, 0);
  }
  toDraw(){
    const {aWave} = this.state;
    const oCanvas = this.oCanvas.current;
    const Context = oCanvas.getContext('2d');
    let idx = -1;
    let width = aWave.length / 2;
    while(idx<width){
      idx++
      const cur1 = aWave[idx * 2];
      const cur2 = aWave[idx * 2 + 1];
      Context.fillStyle = '#55c655';
      Context.fillRect(
        idx, (100 - cur1), 1, Math.ceil(cur1 - cur2),
      );
      Context.fillStyle = '#4ddc4d';
      Context.fillRect(idx, 100, 1, 1);
    }
    return oCanvas;
  }
  async toPlay(iCurLine){
    const {state, oAudio, oPointer:{current:oPointer}} = this;
    const {aTimeLine, oneScPx} = this.state;
    clearTimeout(state.timer);
    clearInterval(state.timer02);
    iCurLine = typeof iCurLine == 'number' ? iCurLine : state.iCurLine;
    const {long, end, start} = aTimeLine[iCurLine];
    const iDestination = end * oneScPx;
    const Audio = oAudio.current;
    oPointer.style.left = `${start* oneScPx}px`;
    Audio.currentTime = start;
    Audio.play();
    let timer = setTimeout(()=>{
      Audio.pause();
    }, long * 1000);
    let timer02 = setInterval(()=>{
      const newLeft = oPointer.offsetLeft + 1;
      if (newLeft>=iDestination) {
        return clearInterval(state.timer02);
      }
      oPointer.style.left = `${newLeft}px`;
    }, (long * 1000) / (long * oneScPx));
    this.setState({timer, timer02, iCurLine:iCurLine});
    this.goLine(iCurLine);
  }
  watchKeyDown(){
    const setState = this.setState.bind(this);
    const upAndDown = iDirection => {
      const {aTimeLine, iCurLine} = this.state;
      const iCurLineNew = (()=>{
        let iResult = iCurLine + iDirection;
        if (iResult<0) iResult = 0;
        if (iResult>aTimeLine.length-1) {
          const last = aTimeLine.slice(-1)[0];
          setState({
            aTimeLine: [...aTimeLine, {
              start: last.end + 0.1,
              end: last.end + 10,
              long: (10.1).toFixed(2) * 1,
              text: `新的${iResult}`,
            }],
          });
        };
        return iResult;
      })();
      setState({iCurLine: iCurLineNew});
      this.goLine(iCurLineNew);
    }
    const fnLib = {
      '74': ()=>upAndDown(-1), // Ctrl + j
      '75': ()=>upAndDown(1), // Ctrl + k
      '13': this.toPlay, //enter
    }
    document.onkeydown = function(ev){
      const {keyCode, altKey, ctrlKey, shiftKey} = ev;
      const theFn = fnLib[keyCode] || (xx=>xx);
      console.log(keyCode, ctrlKey, shiftKey, altKey);
      const aWatchedKeyDown = [
        [74, 75].includes(keyCode) && ctrlKey, // j、k
        keyCode===13 && ctrlKey, // enter
      ];
      if (!aWatchedKeyDown.some(Boolean)) return;
      theFn();
      ev.preventDefault();
    }
  }
};

async function componentDidMount(){
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

class A02 extends A01 {
  constructor(props){
    super(props);
    this.name = 'a02';
  }
  log(){
    console.log('log it');
  }
}

export default A02;