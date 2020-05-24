import React from "react";
import * as fn from './js/english.js';
import { Div } from './style/english.js';
const WaveSurfer = window.WaveSurfer;


const componentDidMount = async function(){
  fn.getMp3()
  // let mp3 = await fn.getMp3();
  // console.log('mp3', mp3);
  //使用web audio api解码
	// audioContext.decodeAudioData(
  //   mp3, 
  //   function (buffer) {
  //     // 每秒绘制100个点，就是将每秒44100个点分成100份，
  //     // 每一份算出最大值和最小值来代表每10毫秒内的波峰和波谷
  //     // const perSecPx = 100;
  //     const perSecPx = 1;
  //     // 获取所有波峰波谷，peaks 即为最后所需波形数据
  //     const peaks = fn.getPeaks(buffer, perSecPx);
  //     // 销毁audioContext 和 source 对象，因为前端是使用audio标签播放的
  //     // audio标签能满足大部分需求，WebAudio Api控制起来真的很不简单。
  //     // 如果不销毁audioContext对象的话，audio标签是无法播放的
  //     console.log(peaks);
  //     source = null;
  //     audioContext = null;
  //   }, function (err) {console.log('出错了', err)}
  // );




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
        <audio controls="controls" src="./static/Im Lost.mp3"/>
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


