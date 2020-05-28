// let res = await fn.getText();
// let regions = fn.getTimeLine(res);
// var plugins = [];
// plugins.push(WaveSurfer.regions.create({
//   regions,
//   drag: false,
// }));

export async function getText() {
  let res = await fetch('./static/Im Lost.srt', {
    method: "get",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
  });
  return await res.text();
};

export function getSeconds(text) {
  const [hour, minute, second, tail] = text.match(/\d+/g);
  let number = (hour * 60 * 60) + (minute * 60) + `${second}.${tail}` * 1;
  return number.toFixed(2) * 1;
};

export function getTimeLine(text, getArr) {
  let strArr = text.split('\n');
  const aLine = [];
  strArr = strArr.filter((cur, idx) => {
    const isTime = /\d{2}:\d{2}:\d{2},\d{3,4} --> \d{2}:\d{2}:\d{2},\d{3,4}/.test(cur);
    if (!isTime) return false;
    aLine.push(strArr[idx+1]);
    return isTime;
  });
  return strArr.map((cur, idx) => {
    const [aa, bb] = cur.split(' --> ');
    const [start, end] = [getSeconds(aa), getSeconds(bb)];
    return {
      start,
      end,
      long: (end - start).toFixed(2) * 1,
      text: aLine[idx],
    };
  });
};

export async function getMp3() {
  const res = await fetch('./static/Im Lost.mp3');
  const arrayBuffer = await res.arrayBuffer();
  let audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const buffer = await audioContext.decodeAudioData(arrayBuffer);
  audioContext = null; // 如果不销毁audioContext对象的话，audio标签是无法播放的
  return buffer; //getPeaks(buffer, 100); // 每秒44100个点分成100份
};

export function getPeaks(buffer, perSecPx) {
  console.log('buffer', buffer);
  const {sampleRate, length} = buffer;
  const sampleSize = ~~(sampleRate / perSecPx); // 每一份的点数：44100 / 100 = 441
  const last = ~~(length / sampleSize)
  const peaks = [];
  const chan = buffer.getChannelData(0);
  let idx = -1;
  while (idx <= last) {
    idx++;
    const start = idx * sampleSize;
    const end = start + sampleSize;
    let min = 0;
    let max = 0;
    for (let j = start; j < end; j++) {
      const value = chan[j];
      if (value > max) max = value;
      else if (value < min) min = value;
    }
    const height = 90;
    peaks[2 * idx] = max * height; // 波峰
    peaks[2 * idx + 1] = min * height; // 波谷
  }
  return peaks;
}