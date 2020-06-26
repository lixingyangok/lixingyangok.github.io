/*
 * @Author: 李星阳
 * @LastEditors: 李星阳
 * @Description: 
 */

import * as fn from './my-tool-pure-fn.js';
export default class {
  // ▼拖入文件
  pushFiles(ev) {
    ev.preventDefault();
    if (ev.type != 'drop') return;
    const aFiles = [...ev.dataTransfer.files];
    const audioFile = aFiles.find(cur => cur.arrayBuffer);
    if (!audioFile) return console.log('格式不支持');
    console.log('音频文件', audioFile, audioFile.arrayBuffer);
  }
  // ▼音频数据转换波峰数据
  bufferToPeaks(perSecPx_, leftPoint = 0) {
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
};
