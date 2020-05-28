import React from "react";
import * as fn from './js/english.js';
import {Div, MyBox} from './style/english.js';

const componentDidMount = async function(){
  const [buffer, sText] = await Promise.all([fn.getMp3(), fn.getText()]);
  const aWave = fn.getPeaks(buffer, 70);
  const aTimeLine = fn.getTimeLine(sText);
  const iWidth = aWave.length / 2; // 画布宽度
  console.log(`一秒${iWidth / buffer.duration}像素`);
  this.setState({
    buffer,
    aWave,
    aTimeLine,
    iWidth,
    duration: buffer.duration,
    fSecondToPx: iWidth / buffer.duration,
  });
  this.toDraw();
  
}

export default class extends React.Component {
  oCanvas = React.createRef();
  oAudio = React.createRef();
  constructor(props){
    super(props);
    this.state = {
      buffer: {}, //音频数据
      aWave: [], //波形数据
      iWidth: 0,
      aTimeLine: [], //
      duration: 0,
      fSecondToPx: 0,
      timer: null,
    };
  }
  render() {
    const {state} = this;
    const {fSecondToPx} = state;
    return <Div>
      <audio controls="controls" src="./static/Im Lost.mp3" ref={this.oAudio}/>
      <MyBox>
        <canvas width={state.iWidth} height={200} ref={this.oCanvas}/>
        {state.aTimeLine.map((cur,idx)=>{
          return <span className="sentence" key={idx} 
            style={{left: `${cur.start * fSecondToPx}px`, width: `${cur.long * fSecondToPx}px`}}
            onClick={()=>this.toPlay(cur)}
          />
        })}
      </MyBox>
      <br/><br/>
      <div>
        {[...Array(8)].map((cur,idx)=>{
          return <button key={idx} onClick={()=>this.zoomIt((idx+1) * 30)} >
            缩放{(idx+1) * 10}
          </button>
        })}
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
  toPlay(oOneLine){
    clearTimeout(this.state.timer);
    const Audio = this.oAudio.current;
    // Audio.pauseAudio();
    Audio.currentTime = oOneLine.start;
    Audio.play();
    let timer = setTimeout(()=>{
      Audio.pause();
    }, oOneLine.long * 1000);
    console.log(timer);
    this.setState({timer});
    console.log(oOneLine);
  }

};

// 