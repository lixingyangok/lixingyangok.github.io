/*
 * @Author: 李星阳
 * @LastEditors: 李星阳
 * @Description: 
 */

export default class {
  // ▼拖入文件
  pushFiles(ev) {
    ev.preventDefault();
    if (ev.type !== 'drop') return;
    this.getFileToInit(ev.dataTransfer.files);
  }
  // ▼input导入文件
  toImport(ev) {
    const {target} = ev;
    if (!target.files.length) return;
    this.getFileToInit(target.files);
    target.value = '';
  }
  async getFileToInit(oFiles){
    const aFiles = [...oFiles];
    const audioFile = aFiles.find(cur => {
      const aArr = ["audio/mpeg"];
      return aArr.includes(cur.type);
    });
    if (!audioFile) return console.log('格式不支持');
    // console.log('格式正确');
    const fileName = audioFile.name;
    const fileSrc = URL.createObjectURL(audioFile);
    this.setState({fileName, fileSrc});
    let buffer = await this.fileToBuffer(audioFile);
    this.showWaveByBuffer(buffer);
    let aTimeLine = await window.lf.getItem(fileName);
    aTimeLine = aTimeLine || [this.state.oFirstLine];
    this.setState({aTimeLine});
  }
  // ▼音频数据转换波峰数据
  bufferToPeaks(perSecPx_, leftPoint = 0) {
    const oWaveWrap = this.oWaveWrap.current;
    const { offsetWidth, scrollLeft } = oWaveWrap;
    const { buffer, iPerSecPx } = this.state;
    const obackData = this.getPeaks(
      buffer, (perSecPx_ || iPerSecPx), scrollLeft, offsetWidth,
    );
    // ▲返回内容：{aPeaks, fPerSecPx, duration};
    this.setState({ ...obackData });
    return obackData.aPeaks;
  }
  showWaveByBuffer(buffer) {
    const aWave = this.getPeaks(buffer, 50);
    const fCanvasWidth = aWave.length / 2; // 画布宽度
    this.setState({
      buffer,
      aWave,
      fCanvasWidth,
      duration: buffer.duration,
      fPerSecPx: fCanvasWidth / buffer.duration,
    });
    this.toDraw();
    // this.watchKeyDown();
  }
  fileToBuffer(oFile) {
    const reader = new FileReader();
    let resolveFn = xx => xx;
    const promise = new Promise(resolve => resolveFn = resolve);
    let audioContext = new (window.AudioContext || window.webkitAudioContext)();
    reader.onload = async (evt) => {
      const arrayBuffer = evt.currentTarget.result;
      const buffer = await audioContext.decodeAudioData(arrayBuffer);
      audioContext = null; // 如果不销毁audioContext对象的话，audio标签是无法播放的
      resolveFn(buffer);
    }
    reader.readAsArrayBuffer(oFile);
    return promise;
  }
  toExport() {
    const { aTimeLine } = this.state;
    const aStr = aTimeLine.map(({ start_, end_, text }, idx) => {
      return `${idx + 1}\n${start_} --> ${end_}\n${text}\n`;
    });
    const blob = new Blob([aStr.join('\n')]);
    Object.assign(document.createElement('a'), {
      download: `字幕文件-${new Date() * 1}.srt`,
      href: URL.createObjectURL(blob),
    }).click();
  }
  // ▼计算波峰、波谷
  getPeaks(buffer, iPerSecPx, left=0, iCanvasWidth=500) {
    // buffer.sampleRate  // 采样率：浮点数，单位为 sample/s
    // buffer.length  // 采样帧率：整形
    // buffer.duration  // 时长：双精度型（单位为秒）
    // buffer.numberOfChannels  // 通道数：整形
    const oChannel = buffer.getChannelData(0);
    const sampleSize = ~~(buffer.sampleRate / iPerSecPx); // 每一份的点数 = 每秒采样率 / 每秒像素
    const aPeaks = [];
    let idx = left;
    const last = idx + iCanvasWidth;
    while (idx <= last) {
      let start = idx * sampleSize;
      const end = start + sampleSize;
      let min = 0;
      let max = 0;
      while (start < end) {
        const value = oChannel[start];
        if (value > max) max = value;
        else if (value < min) min = value;
        start++;
      }
      aPeaks[2 * idx] = max; // 波峰
      aPeaks[2 * idx + 1] = min; // 波谷
      idx++;
    }
    return {
      fPerSecPx: buffer.length / sampleSize / buffer.duration,
      aPeaks: aPeaks.slice(left*2),
      duration: buffer.duration,
    };
  }
};
