import React from "react";
import * as fn from './js/english.js';
import {Div, MyBox} from './style/english.js';
const WaveSurfer = window.WaveSurfer;

const componentDidMount = async function(){
  let res = await fn.getText();
  let regions = fn.getTimeLine(res);
  var plugins = [WaveSurfer.timeline.create({
    container: "#wave-timeline",
  }),WaveSurfer.regions.create({
    regions,
    drag: false,
  })];
  var myWave = WaveSurfer.create({
    container: "#a99",
    scrollParent: true,
    height: 150,
    minPxPerSec: 30,
    plugins,
  });
  myWave.load('./static/Im Lost.mp3');
  let aWave = await fn.getMp3()
  console.log('波', aWave.slice(0, 10));
  this.setState({
    myWave,
    aWave,
  });
  // this.toDraw();
  document.addEventListener('keydown', function(ev){
    if (ev.keyCode === 9){ //tab
      myWave.playPause()
    }
    ev.preventDefault();
    ev.stopPropagation();
    return false
  });
}

export default class extends React.Component {
  myCanvas = React.createRef();
  oCanvas = React.createRef();
  constructor(props){
    super(props);
    this.state = {
      myWave: {},
      aWave: [],
      iZoom: 50,
    };
  }
  render() {
    const {state} = this;
    return (
      <Div>
        <audio controls="controls" src="./static/Im Lost.mp3"/>
        <div id="wave-timeline"></div>
        <div id="a99" className="a99"></div>
        <MyBox>
          <canvas width={state.aWave.length/2} height={200} ref={this.oCanvas}/>
        </MyBox>
        <br/><br/>
        <div>
          {[...Array(8)].map((cur,idx)=>{
            return <button key={idx} onClick={()=>this.zoomIt((idx+1) * 30)} >
              缩放{(idx+1) * 5}
            </button>
          })}
        </div>
      </Div>
    );
  }
  componentDidMount = componentDidMount;
  zoomIt(value){
    this.state.myWave.zoom(value);
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
      Context.fillStyle = '#444';
      Context.fillRect(
        idx, (100 - cur1), 1, Math.ceil(cur1 - cur2),
      );
      Context.fillStyle = '#000';
      Context.fillRect(idx, 100, 1, 1);
    }
    return oCanvas;
  }
  playIt(idx){
    const {myWave, aSentences} = this.state;
    myWave.play(aSentences[idx].start, aSentences[idx].end);
    // console.log(idx);
  }
};

// 