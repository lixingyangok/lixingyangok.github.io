
export async function getText() {
  let res = await fetch('./static/Im Lost.srt', {
    method: "get",
    headers: {"Content-Type": "application/json"},
    credentials: "same-origin",
  });
  return await res.text();
};

export function getSeconds(text) {
  const [hour, minute, second, tail] = text.match(/\d+/g);
  let number = (hour * 60 * 60) + (minute * 60) + `${second}.${tail}` * 1;
  return number.toFixed(2) * 1;
};

export function secToStr(fSecond){
  let iHour = Math.floor(fSecond / 3600) + ''; //时
  let iMinut = Math.floor((fSecond - iHour * 3600) / 60) + ''; //分
  let fSec = fSecond - (iHour*3600 + iMinut*60) + ''; //秒
  let [sec01, sec02='000'] = fSec.split('.');
  const sTime = `${iHour.padStart(2, 0)}:${iMinut.padStart(2, 0)}:${sec01.padStart(2, 0)},${sec02.slice(0, 3).padEnd(3,0)}`;
  return sTime
}

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

export function funDownload(content, filename=`未命名-${new Date()+1}.txt`) {
  // 字符内容转变成blob地址
  var blob = new Blob([content]);
  Object.assign(document.createElement('a'), {
    download: filename,
    href: URL.createObjectURL(blob),
  }).click();
  // 创建隐藏的可下载链接
  var eleLink = document.createElement('a');
  eleLink.download = filename;
  eleLink.href = URL.createObjectURL(blob);
  eleLink.click(); // 触发点击
  // eleLink.style.display = 'none';
  // document.body.appendChild(eleLink);
  // document.body.removeChild(eleLink); // 然后移除
};