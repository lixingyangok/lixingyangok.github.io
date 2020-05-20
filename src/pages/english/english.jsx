import React from "react";
import mp3 from "./mp3/Im Lost.mp3";
import styled from "styled-components";

const regions = `
1
00:00:08,370 --> 00:00:12,050
Hi everyone, I'm Lisa. Hey guys I'm John

2
00:00:12,050 --> 00:00:15,450
Today we will learn how to ask for directions

3
00:00:15,450 --> 00:00:17,570
Ok, how to ask for directions

`.split('\n').filter(cur=>{
  if (!cur) return false;
  return /\d{2}:\d{2}:\d{2},\d{3,4} --> \d{2}:\d{2}:\d{2},\d{3,4}/.test(cur)   //false;
}).map(cur=>{
  const [aa,bb] = cur.split(' --> ');
  return {
    start: aa.replace('00:00:', '').replace(',', '.') * 1,
    end: bb.replace('00:00:', '').replace(',', '.') * 1,
    color: "hsla(200, 50%, 70%, 0.4)",
  };
});
console.log(regions);

const Div = styled.div`
  margin: 30px;
  .a99{
    background: pink;
  }
`;
const WaveSurfer = window.WaveSurfer;
console.log('WaveSurfer---', WaveSurfer);

var plugins = [];
plugins.push(WaveSurfer.regions.create({
  regions,
  dragSelection: { slop: 5 },
}));
plugins.push(WaveSurfer.timeline.create({
  container: "#wave-timeline",
}));

const componentDidMount = function(){
  var wavesurfer = WaveSurfer.create({
    container: "#a99",
    scrollParent: true,
    height: 160,
    plugins,
  });
  wavesurfer.load(mp3);
  wavesurfer.on("ready", function () {
    const idx = 2;
    wavesurfer.play(regions[idx].start, regions[idx].end);
    // console.log('加载完成');
    // wavesurfer.play();
  });
}

export default class extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      wavesurfer: 0,
    };
  }
  render() {
    console.log("03-C-Render（双重调用");
    return (
      <Div>
        <audio controls>
          <source src={mp3} type="audio/mpeg"/>
        </audio>
        <div id="a99" className="a99"></div>
        <div id="wave-timeline"></div>
      </Div>
    );
  }
  componentDidMount = componentDidMount;
  componentDidMount1() {
    var plugins = [];
    plugins.push(WaveSurfer.regions.create({
      regions: [
        { start: 1, end: 3, loop: false, color: "hsla(400, 100%, 30%, 0.5)" },
        { start: 5, end: 7, loop: false, color: "hsla(200, 50%, 70%, 0.4)" },
      ],
      dragSelection: { slop: 5 },
    }));
    plugins.push(WaveSurfer.timeline.create({
      container: "#wave-timeline",
    }));
    var wavesurfer = WaveSurfer.create({
      container: "#a99",
      scrollParent: true,
      height: 160,
      plugins,
    });
    console.log('WaveSurfer2-------', wavesurfer);
    wavesurfer.load(mp3);
    wavesurfer.on("ready", function () {
      console.log('加载完成');
      // wavesurfer.play();
    });
  }
}

