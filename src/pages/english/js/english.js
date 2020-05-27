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
  return res.text();
};

export function getSeconds(text) {
  const [hour, minute, second, tail] = text.match(/\d+/g);
  let number = (hour * 60 * 60) + (minute * 60) + `${second}.${tail}` * 1;
  return number.toFixed(2) * 1;
};

export function getTimeLine(text) {
  let strArr = text.split('\n');
  strArr = strArr.filter(cur => {
    if (!cur) return false;
    return /\d{2}:\d{2}:\d{2},\d{3,4} --> \d{2}:\d{2}:\d{2},\d{3,4}/.test(cur);
  });
  return strArr.map(cur => {
    const [aa, bb] = cur.split(' --> ');
    return {
      start: getSeconds(aa),
      end: getSeconds(bb),
      color: "hsla(200, 50%, 70%, 0.4)",
      drag: false,
    };
  }).slice(0, 2);
};

export function getPeaks(buffer, perSecPx) {
  // numberOfChannels
  const {sampleRate, length} = buffer;
  // 每一份的点数=44100 / 100 = 441
  const sampleSize = ~~(sampleRate / perSecPx);
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
    peaks[2 * idx] = max * 60; // 波峰
    peaks[2 * idx + 1] = min * 60; // 波谷
  }
  return peaks;
}

export async function getMp3() {
  //	创建音频对象
  let audioContext = new (window.AudioContext || window.webkitAudioContext)();
  let source = audioContext.createBufferSource();
  let resovle = xx=>xx;
  const myPromise = new Promise(fn=>resovle=fn);
  const res = await fetch('./static/Im Lost.mp3');
  const arrayBuffer = await res.arrayBuffer();
  const theFn = function (buffer){
    // 使用web audio api解码
    // 每秒绘制100个点，就是将每秒44100个点分成100份，
    // 每一份算出最大值和最小值来代表每10毫秒内的波峰和波谷
    // 获取所有波峰波谷，peaks 即为最后所需波形数据
    const peaks = getPeaks(buffer, 100); 
    resovle(peaks);
    // audio标签能满足大部分需求，Web Audio Api控制起来真的很不简单。
    source = null; // 销毁audioContext 和 source 对象，因为前端是使用audio标签播放的
    audioContext = null; // 如果不销毁audioContext对象的话，audio标签是无法播放的
    if (0) console.log(source);
  };
  audioContext.decodeAudioData(
    arrayBuffer, // audioData为 arrayBuffer 类型数据
    theFn,
    err => console.log("音频解码出错" + err),
  );
  return myPromise;
};
