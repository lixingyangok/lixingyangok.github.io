import React from "react";
import * as fn from './js/english.js';
import { Div } from './style/english.js';
const WaveSurfer = window.WaveSurfer;


const componentDidMount = async function(){
  let res = await fn.getText();
  let regions = fn.getTimeLine(res);
  var plugins = [];
  var p01 = WaveSurfer.regions.create({
    regions,
    drag: false,
  })
  plugins.push(p01);
  console.log(p01);
  plugins.push(WaveSurfer.timeline.create({
    container: "#wave-timeline",
  }));
  var myWave = WaveSurfer.create({
    container: "#a99",
    scrollParent: true,
    height: 180,
    minPxPerSec: 40,
    plugins,
  });
  console.log('myWave', myWave);
  myWave.load('./static/Im Lost.mp3');
  this.setState({
    aSentences: regions,
    myWave,
  });
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
  constructor(props){
    super(props);
    this.state = {
      myWave: {},
      aSentences: [],
      iZoom: 50,
    };
  }
  render() {
    const {aSentences} = this.state;
    return (
      <Div>
        <div id="wave-timeline"></div>
        <div id="a99" className="a99"></div>
        <br/><br/>
        <div>
          {[...Array(8)].map((cur,idx)=>{
            return <button key={idx} onClick={()=>this.zoomIt((idx+1) * 30)} >
              {(idx+1) * 30}
            </button>
          })}
        </div>
        <div className="sentence-wrap" >
          {aSentences.map((cur,idx)=>{
            return <span className="sentence" key={idx}
              onClick={()=>this.playIt(idx)}
            >
              {cur.start} - {cur.end}
            </span>
          })}
        </div>
      </Div>
    );
  }
  componentDidMount = componentDidMount;
  playIt(idx){
    const {myWave, aSentences} = this.state;
    myWave.play(aSentences[idx].start, aSentences[idx].end);
    // console.log(idx);
  }
  zoomIt(value){
    this.state.myWave.zoom(value);
  }
}


