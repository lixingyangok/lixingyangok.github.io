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
    this.getCorrectFile(ev.dataTransfer.files);
  }
  // ▼input导入文件
  toImport(ev) {
    const {target} = ev;
    if (!target.files.length) return;
    this.getCorrectFile(target.files);
    target.value = '';
  }
  // ▼过滤出正确的文件
  async getCorrectFile(oFiles){
    const aFiles = [...oFiles];
    const audioFile = aFiles.find(cur => {
      const aArr = ["audio/mpeg"];
      return aArr.includes(cur.type);
    });
    if (!audioFile) return this.message.error('不支持此文件');
    this.message.success('导入文件成功');
    this.cleanCanvas();
    this.getFileToDraw(audioFile);
  }
  // ▼绘制波形
  async getFileToDraw(audioFile){
    this.setState({loading: true});
    const fileName = audioFile.name;
    const fileSrc = URL.createObjectURL(audioFile);
    const buffer = await this.fileToBuffer(audioFile);
    this.setState({loading: false});
    // ▼返回内容有：fPerSecPx, aPeaks, duration
    const oBackData = this.getPeaks( 
      buffer, this.state.iPerSecPx, 0,
      this.oWaveWrap.current.offsetWidth,
    );
    this.toDraw(oBackData.aPeaks);
    let aTimeLine = await window.lf.getItem(fileName);
    aTimeLine = aTimeLine || [this.state.oFirstLine];
    this.setState({
      fileName, fileSrc, buffer,
      aTimeLine, ...oBackData,
    });
  }
  // buffer.sampleRate  // 采样率：浮点数，单位为 sample/s
  // buffer.length  // 采样帧率：整形
  // buffer.duration  // 时长：双精度型（单位为秒）
  // buffer.numberOfChannels  // 通道数：整形
  // ▼计算波峰、波谷
  getPeaks(buffer, iPerSecPx, left=0, iCanvasWidth=500) {
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
  // ▼从文件得到 buffer 数据
  fileToBuffer(oFile) {
    const reader = new FileReader();
    let resolveFn = xx => xx;
    const promise = new Promise(resolve => resolveFn = resolve);
    reader.onload = async (evt) => {
      const arrayBuffer = evt.currentTarget.result;
      let audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const buffer = await audioContext.decodeAudioData(arrayBuffer);
      resolveFn(buffer);
      audioContext = null; // 如果不销毁audioContext对象的话，audio标签是无法播放的
    };
    reader.readAsArrayBuffer(oFile);
    return promise;
  }
  // ▼导出文件
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
