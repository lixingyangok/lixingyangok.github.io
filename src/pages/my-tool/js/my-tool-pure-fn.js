

// ▼时间轴的时间转秒
export function getSeconds(text) {
  const [hour, minute, second, tail] = text.match(/\d+/g);
  let number = (hour * 60 * 60) + (minute * 60) + `${second}.${tail}` * 1;
  return number.toFixed(2) * 1;
};

// ▼秒-转为时间轴的时间
export function secToStr(fSecond){
  let iHour = Math.floor(fSecond / 3600) + ''; //时
  let iMinut = Math.floor((fSecond - iHour * 3600) / 60) + ''; //分
  let fSec = fSecond - (iHour*3600 + iMinut*60) + ''; //秒
  let [sec01, sec02='000'] = fSec.split('.');
  const sTime = `${iHour.padStart(2, 0)}:${iMinut.padStart(2, 0)}:${sec01.padStart(2, 0)},${sec02.slice(0, 3).padEnd(3,0)}`;
  return sTime;
}

// ▼计算波峰、波谷
export function getPeaks(buffer, perSecPx) {
  // AudioBuffer.sampleRate  // 采样率：浮点数，单位为 sample/s
  // AudioBuffer.length  // 采样帧率：整形
  // AudioBuffer.duration  // 时长：双精度型（单位为秒）
  // AudioBuffer.numberOfChannels  // 通道数：整形
  console.log('buffer', buffer);
  console.time("算波形");
  const {sampleRate, length} = buffer;
  const sampleSize = ~~(sampleRate / perSecPx); // 每一份的点数 = 每秒采样率 / 每秒像素 = xxxx
  const last = ~~(length / sampleSize); //遍历的次数
  const peaks = [];
  const chan = buffer.getChannelData(0);
  let idx = -1;
  while (idx <= last) {
    idx++;
    let start = idx * sampleSize;
    let end = start + sampleSize;
    let min = 0;
    let max = 0;
    while (start < end) {
      const value = chan[start];
      if (value > max) max = value;
      else if (value < min) min = value;
      start++;
    }
    peaks[2 * idx] = max; // 波峰
    peaks[2 * idx + 1] = min; // 波谷
  }
  console.timeEnd("算波形");
  return peaks;
}

export async function getMp3() {
  const res = await fetch('./static/Im Lost.mp3');
  console.log('音频返回', res);
  const arrayBuffer = await res.arrayBuffer();
  let audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const buffer = await audioContext.decodeAudioData(arrayBuffer);
  audioContext = null; // 如果不销毁audioContext对象的话，audio标签是无法播放的
  return buffer; //getPeaks(buffer, 100); // 每秒44100个点分成100份
};

export async function getText() {
  let res = await fetch('./static/Im Lost.srt', {
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