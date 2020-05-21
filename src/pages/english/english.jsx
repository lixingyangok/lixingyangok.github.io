import React from "react";
import styled from "styled-components";

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
  getSeconds(strArr[0].split(' --> ')[0]);
  return strArr.map(cur=>{
    const [aa,bb] = cur.split(' --> ');
    return {
      start: getSeconds(aa),
      end: getSeconds(bb),
      color: "hsla(200, 50%, 70%, 0.4)",
    };
  });
};

const Div = styled.div`
  margin: 30px;
  .a99{
    background: pink;
    .wavesurfer-handle{
      width: 1px !important;
    }
  }
  .sentence-wrap{
    margin: 30px 0 0;
  }
  .sentence{
    display: inline-block;
    background: yellow;
    margin: 5px 10px 0 0;
    padding: 3px 10px;
    border-radius: 3px;
  }
`;

const WaveSurfer = window.WaveSurfer;

const componentDidMount = async function(){
  let res = await getText();

  let regions = getTimeLine(res);
  
  var plugins = [];
  plugins.push(WaveSurfer.regions.create({
    regions,
    dragSelection: {slop: 5},
  }));
  plugins.push(WaveSurfer.timeline.create({
    container: "#wave-timeline",
  }));
  var wavesurfer = WaveSurfer.create({
    container: "#a99",
    scrollParent: true,
    height: 180,
    plugins,
    minPxPerSec: 80,
  });
  wavesurfer.load('./static/Im Lost.mp3');
  wavesurfer.on("ready", function () {
    // wavesurfer.zoom(80);
    // const idx = 5;
    // wavesurfer.play(regions[idx].start, regions[idx].end);
    // console.log('加载完成');
    // wavesurfer.play();
  });
  this.setState({
    aSentences: regions,
    wavesurfer,
  });
}


export default class extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      wavesurfer: {},
      aSentences: [],
      iZoom: 50,
    };
  }
  render() {
    console.log("03-C-Render（双重调用");
    const {aSentences} = this.state;
    return (
      <Div>
        <div id="a99" className="a99"></div>
        <div id="wave-timeline"></div>
        <br/><br/>
        <div>
          {[...Array(8)].map((cur,idx)=>{
            return <button onClick={()=>this.zoomIt((idx+1) * 20)} >
              {(idx+1) * 20}
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
    const {wavesurfer, aSentences} = this.state;
    wavesurfer.play(aSentences[idx].start, aSentences[idx].end);
    // console.log(idx);
  }
  zoomIt(value){
    this.state.wavesurfer.zoom(value);
  }
}

