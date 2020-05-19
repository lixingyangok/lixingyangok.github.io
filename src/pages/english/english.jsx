import React from "react";
import pic01 from './img/pic01.jpg';
import mp3 from './mp3/english.mp3';
import WaveSurfer from 'wavesurfer.js';
import styled from 'styled-components';

const WaterBox  = styled.div`
  height: 300px;
  background: pink;
`;
console.log( WaveSurfer );

export default function () {
  React.useEffect(
    // 1参是个函数，定义在useState之后，可拿到state值
    // 在 return 之后执行（类似在render之后执行）
      ()=>{
          console.log('React.useEffect 1参执行');
          var wavesurfer = WaveSurfer.create({
              container: '#a99',
              scrollParent: !true,
          });
          wavesurfer.load(mp3);
          wavesurfer.on('ready', function () {
              wavesurfer.play();
          });
          // wavesurfer.playPause()
      },
      // ▼2参为空那么：在【挂载或更新（即state更新）】后就执行1参的方法，连1参返回的方法也执行!!!
      // ▼2参为空数组，相当于 componentDidMount，仅仅在【挂载后】执行一次，在卸载时执行1参返回的方法
      // ▼一般数组，当【监听到数组内值发生变化后】，执行1参的方法
      [],
  );
  return <h1>
    <img src={pic01} alt=""/>
    <audio controls>
      <source src={mp3} type="audio/mpeg"/>
    </audio>
    <WaterBox id="a99" >
      123
    </WaterBox>
  </h1>;
}
