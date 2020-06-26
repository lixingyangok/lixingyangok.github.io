/*
 * @Author: 李星阳
 * @LastEditors: 李星阳
 * @Description: 
 */ 

export const fileName = '伊索寓言';

export async function getMp3() {
  const res = await fetch(`./static/${fileName}.mp3`);
  console.log('音频文件', res);
  // console.log('音频返回', res);
  const arrayBuffer = await res.arrayBuffer();
  let audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const buffer = await audioContext.decodeAudioData(arrayBuffer);
  audioContext = null; // 如果不销毁audioContext对象的话，audio标签是无法播放的
  return buffer; 
};

export async function getText() {
  let res = await fetch(`./static/${fileName}.srt`, {
    method: "get",
    headers: {"Content-Type": "application/json"},
    credentials: "same-origin",
  });
  return await res.text();
};

export function getTimeLine(text, getArr) {
  let strArr = text.split('\n');
  const aLine = [];
  strArr = strArr.filter((cur, idx) => {
    const isTime = /\d{2}:\d{2}:\d{2},\d{3} --> \d{2}:\d{2}:\d{2},\d{3}/.test(cur);
    if (!isTime) return false;
    aLine.push(strArr[idx+1]);
    return isTime;
  });
  return strArr.map((cur, idx) => {
    const [aa, bb] = cur.split(' --> ');
    const [start, end] = [getSeconds(aa), getSeconds(bb)];
    return {
      start_: aa,
      end_: bb,
      start,
      end,
      long: (end - start).toFixed(2) * 1,
      text: aLine[idx].trim(),
    };
  });
};

