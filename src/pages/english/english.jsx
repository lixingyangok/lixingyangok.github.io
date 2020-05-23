import React from "react";
import { Div } from './style/english.js';
const WaveSurfer = window.WaveSurfer;

async function getText(){
  let res = await fetch('./static/Im Lost.srt', {
    method: "get",
    headers: {"Content-Type": "application/json"},
    credentials: "same-origin",
  });
  return res.text();
};

function getSeconds(text){
  const [hour, minute, second, tail] = text.match(/\d+/g);
  let number = (hour * 60 * 60) + (minute * 60) + `${second}.${tail}` * 1;
  return number.toFixed(2) * 1;
};

function getTimeLine(text){
  let strArr = text.split('\n');
  strArr = strArr.filter(cur=>{
    if (!cur) return false;
    return /\d{2}:\d{2}:\d{2},\d{3,4} --> \d{2}:\d{2}:\d{2},\d{3,4}/.test(cur);
  });
  return strArr.map(cur=>{
    const [aa,bb] = cur.split(' --> ');
    return {
      start: getSeconds(aa),
      end: getSeconds(bb),
      color: "hsla(200, 50%, 70%, 0.4)",
      drag: false,
    };
  }).slice(0, 2);
};



const componentDidMount = async function(){
  let res = await getText();
  let regions = getTimeLine(res);
  var plugins = [];
  plugins.push(WaveSurfer.regions.create({
    regions,
    drag: false,
  }));
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
    ev.cancelBubble = true;
    window.event.preventDefault()
    window.event.stopPropagation()
    window.event.cancelBubble = true
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
    console.log("03-C-Render（双重调用");
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

