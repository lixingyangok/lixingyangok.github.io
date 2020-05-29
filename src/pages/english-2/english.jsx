import React from "react";
import * as fn from './js/english.js';
import {Div, MyBox, Textarea} from './style/english.js';

const componentDidMount = async function(){
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

export default class extends React.Component {
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
      cur: 1,
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
          return <span className={idx===state.cur ? 'cur sentence' : 'sentence'} key={idx}
            style={{left: `${cur.start * oneScPx}px`, width: `${cur.long * oneScPx}px`}}
            onClick={()=>this.toPlay(cur)}
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
      <ul>
        {state.aTimeLine.map((cur, idx)=>{
          return <li className="one-line" key={idx} onClick={()=>this.toPlay(cur)}>
            {cur.text}
          </li>
        })}
      </ul>
    </Div>
  }
  componentDidMount = componentDidMount;
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
      Context.fillStyle = '#444';
      Context.fillRect(
        idx, (100 - cur1), 1, Math.ceil(cur1 - cur2),
      );
      Context.fillStyle = '#000';
      Context.fillRect(idx, 100, 1, 1);
    }
    return oCanvas;
  }
  async toPlay(oOneLine){
    clearTimeout(this.state.timer);
    clearInterval(this.state.timer02);
    const oPointer = this.oPointer.current;
    const Audio = this.oAudio.current;
    const {long, end, start} = oOneLine;
    const {oneScPx} = this.state;
    const aim = end * oneScPx;
    Audio.currentTime = start;
    Audio.play();
    oPointer.style.left = `${start* oneScPx}px`;
    let timer = setTimeout(()=>{
      Audio.pause();
    }, long * 1000);
    let timer02 = setInterval(()=>{

      const newLeft = oPointer.offsetLeft + 1;
      if (newLeft>=aim) clearInterval(this.state.timer02);
      oPointer.style.left = `${newLeft}px`;
    }, long * oneScPx / (long * 1000));
    this.setState({timer, timer02});
  }
  watchKeyDown(){
    const setState = this.setState.bind(this);
    const oBox = this.oBox.current;
    const upAndDown = newVal => {
      const {state, state:{aTimeLine, oneScPx}} = this;
      const cur = (()=>{
        let newCur = state.cur + newVal;
        if (newCur<0) newCur = 0;
        if (newCur>aTimeLine.length-1) {
          const last = aTimeLine.slice(-1)[0];
          setState({
            aTimeLine: [...aTimeLine, {
              start: last.end + 0.1,
              end: last.end + 10,
              long: (10.1).toFixed(2) * 1,
              text: `新的${newCur}`,
            }],
          });
        };
        return newCur;
      })();
      // debugger;
      const leftVal = (
        oneScPx * this.state.aTimeLine[cur].start
      ) - 500;
      setState({cur});
      oBox.scrollTo(leftVal, 0);
    }
    const fnLib = {
      '74': ()=>upAndDown(-1),
      '75': ()=>upAndDown(1),
      '13': ()=>{
        const {state:{cur, aTimeLine}} = this;
        this.toPlay(aTimeLine[cur]);
      },
    }
    document.onkeydown = function(ev){
      const {keyCode, altKey, ctrlKey, shiftKey} = ev;
      const theFn = fnLib[keyCode] || (xx=>xx);
      console.log(keyCode, ctrlKey, shiftKey, altKey);
      if([74, 75].includes(keyCode) && ctrlKey) { // j, k
        theFn();
        ev.preventDefault();
      }else if (keyCode===13 && ctrlKey){
        theFn();
        ev.preventDefault();
      }
    }
  }
};

