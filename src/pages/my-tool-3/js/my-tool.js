import * as fn from './my-tool-pure-fn.js';

export default class {
  valChanged(ev) {
    const text = ev.target.value;
    if (!text[0] || !text[text.length - 1]) return;
    const { iCurLine, aTimeLine } = this.state;
    aTimeLine[iCurLine].text = text;
    this.setState({ aTimeLine });
  }
  async goLine(idx) {
    // await new Promise(resolve => resolve(), 100);
    const oWaveWrap = this.oWaveWrap.current;
    const { iPerSecPx, aTimeLine } = this.state;
    const oAim = aTimeLine[idx] || aTimeLine[idx - 1];
    const leftVal = iPerSecPx * oAim.start - 500;
    oWaveWrap.scrollTo(leftVal, 0);
    // 分界
    const oSententList = this.oSententList.current;
    const fHeight = (() => {
      const oneLineHeight = (oSententList.children[0] || {}).offsetHeight || 0;
      return oneLineHeight * (idx - 2);
    })();
    oSententList.scrollTo(0, fHeight);
    this.setState({iCurLine: idx});
  }
  toDraw(aPeaks_) {
    const { iHeight } = this.state;
    const aPeaks = aPeaks_ || this.state.aPeaks;
    const oWaveWrap = this.oWaveWrap.current;
    const oCanvas = this.oCanvas.current;
    const Context = oCanvas.getContext('2d');
    const { height } = oCanvas;
    const width = oWaveWrap.offsetWidth;
    const halfHeight = height / 2;
    oCanvas.width = width;
    Context.fillStyle = 'black';
    Context.fillRect(0, 0, width, height);
    let idx = -1;
    let fCanvasWidth = aPeaks.length / 2;
    while (idx < fCanvasWidth) {
      idx++;
      const cur1 = aPeaks[idx * 2] * iHeight;
      const cur2 = aPeaks[idx * 2 + 1] * iHeight;
      Context.fillStyle = '#55c655';
      Context.fillRect(
        idx, (halfHeight - cur1), 1, Math.ceil(cur1 - cur2),
      );
      Context.fillStyle = '#4ddc4d';
      Context.fillRect(idx, halfHeight, 1, 1);
    }
    this.setState({drawing: false});
    return oCanvas;
  }
  async toPlay(iCurLine, isFromHalf) {
    const {state} = this;
    const {aTimeLine, fPerSecPx} = this.state;
    clearInterval(state.playTimer); //把之前的关闭再说
    iCurLine = typeof iCurLine === 'number' ? iCurLine : state.iCurLine;
    const {start, long} = aTimeLine[iCurLine];
    const Audio = this.oAudio.current;
    const {style} = this.oPointer.current;
    const fStartTime = start + (isFromHalf ? long / 2 : 0);
    style.left = `${fStartTime * fPerSecPx}px`;
    Audio.currentTime = fStartTime;
    Audio.play();
    const iSecFrequency = 100; //每秒执行次数
    const playTimer = setInterval(() => {
      const {fPerSecPx, aTimeLine} = this.state;
      const {long, end} = aTimeLine[iCurLine];
      const step = long * fPerSecPx / (long * iSecFrequency);
      const newLeft = Number.parseFloat(style.left) + step;
      const fEndPx = end * fPerSecPx;
      if (newLeft >= fEndPx || Audio.currentTime >= end) {
        Audio.pause();
        style.left = `${fEndPx}px`;
        return clearInterval(this.state.playTimer);
      }
      style.left = `${newLeft}px`;
    }, 1000 / iSecFrequency);
    this.setState({playTimer, iCurLine});
    this.goLine(iCurLine);
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
  async toImport(ev = {}) {
    const { target = { files: [] } } = ev;
    const file = target.files[0];
    if (!file) return;
    const fileName = file.name;
    const fileSrc = URL.createObjectURL(file);
    this.setState({ fileName, fileSrc });
    let buffer = await this.fileToBuffer(file);
    this.showWaveByBuffer(buffer);
    let aTimeLine = await window.lf.getItem(fileName);
    aTimeLine = aTimeLine || [this.state.oFirstLine];
    this.setState({ aTimeLine });
  }
  showWaveByBuffer(buffer) {
    const aWave = fn.getPeaks(buffer, 50);
    const fCanvasWidth = aWave.length / 2; // 画布宽度
    this.setState({
      buffer,
      aWave,
      fCanvasWidth,
      duration: buffer.duration,
      fPerSecPx: fCanvasWidth / buffer.duration,
    });
    this.toDraw();
    this.watchKeyDown();
  }
  // ▼音频数据转换波峰数据
  bufferToPeaks(perSecPx_, leftPoint=0) {
    const oWaveWrap = this.oWaveWrap.current;
    const { offsetWidth, scrollLeft } = oWaveWrap;
    const { buffer, iPerSecPx } = this.state;
    const obackData = fn.getPeaks(
      buffer, (perSecPx_ || iPerSecPx), scrollLeft, offsetWidth,
    );
    // ▲返回内容：{aPeaks, fPerSecPx, duration};
    this.setState({ ...obackData });
    return obackData.aPeaks;
  }
  // ▼得到点击处的秒数，收受一个事件对象
  getPointSec({clientX}){
    const {fPerSecPx} = this.state;
    const {offsetLeft, scrollLeft} = this.oWaveWrap.current;
    const iLeftPx = clientX - offsetLeft + scrollLeft; //鼠标左侧的px值
    const iNowSec = iLeftPx / fPerSecPx; //当前指向时间（秒）
    return iNowSec;
  }
  // ▼
  setTime(key, val){
    const {aTimeLine, iCurLine} = this.state;
    const oCurLine = aTimeLine[iCurLine];
    const {start, end} = oCurLine;
    if (key === 'start' && val > end) {
      oCurLine.start = end;
      oCurLine.end = val;
    } else if (key==='end' && val < start){
      oCurLine.start = val;
      oCurLine.end = start;
    } else {
      oCurLine[key] = val;
    }
    oCurLine.start_ = fn.secToStr(oCurLine.start);
    oCurLine.end_ = fn.secToStr(oCurLine.end);
    oCurLine.long = oCurLine.end - oCurLine.start;
    aTimeLine[iCurLine] = oCurLine;
    this.setState({aTimeLine});
  }
}
