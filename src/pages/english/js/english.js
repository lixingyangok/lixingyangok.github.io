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
  const {numberOfChannels, sampleRate, length} = buffer;
  // 每一份的点数=44100 / 100 = 441
  const sampleSize = ~~(sampleRate / perSecPx);
  const first = 0;
  const last = ~~(length / sampleSize)
  const peaks = [];

  const chan = buffer.getChannelData(0);
  for (let i = first; i <= last; i++) {
    const start = i * sampleSize;
    const end = start + sampleSize;
    let min = 0;
    let max = 0;
    for (let j = start; j < end; j++) {
      const value = chan[j];
      if (value > max) {
        max = value;
      }
      if (value < min) {
        min = value;
      }
    }
    // 波峰
    peaks[2 * i] = max;
    // 波谷
    peaks[2 * i + 1] = min;
  }
  return peaks;
}

export async function getMp3() {
  //	创建音频对象
  let audioContext = new (window.AudioContext || window.webkitAudioContext)();
  let source = audioContext.createBufferSource();
  const request = new XMLHttpRequest();
  request.open('GET','./static/Im Lost.mp3', true);
  request.responseType = 'arraybuffer';
  request.onload = function () {
    const audioData = request.response;	//	audioData为 arrayBuffer 类型数据
    //使用web audio api解码
    audioContext.decodeAudioData(audioData, function (buffer) {
      // 每秒绘制100个点，就是将每秒44100个点分成100份，
      // 每一份算出最大值和最小值来代表每10毫秒内的波峰和波谷
      // const perSecPx = 100;
      const perSecPx = 1;
      // 获取所有波峰波谷，peaks 即为最后所需波形数据
      const peaks = getPeaks(buffer, perSecPx);
      //	销毁audioContext 和 source 对象，因为前端是使用audio标签播放的
      //  audio标签能满足大部分需求，Web Audio Api控制起来真的很不简单。
      //  如果不销毁audioContext对象的话，audio标签是无法播放的
      source = null;
      audioContext = null;
      console.log('peaks', peaks);
    }, function (err) { console.log("Error with decoding audio data" + err.err) });
  };
  request.send();
};
