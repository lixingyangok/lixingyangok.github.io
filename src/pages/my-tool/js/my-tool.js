import * as fn from './my-tool-pure-fn.js';

export default class{
  valChanged(ev){
    const text = ev.target.value;
    if(!text[0] || !text[text.length-1]) return;
    const {iCurLine, aTimeLine} = this.state;
    aTimeLine[iCurLine].text = text;
    this.setState({aTimeLine});
  }
  async goLine(idx) {
    await new Promise(resolve=>resolve(), 100);
    const oBox = this.oBox.current;
    const {oneScPx, aTimeLine} = this.state;
    const oAim = aTimeLine[idx] || aTimeLine[idx-1];
    const leftVal = oneScPx * oAim.start - 500;
    oBox.scrollTo(leftVal, 0);
    // 分界
    const oSententList = this.oSententList.current;
    const fHeight = (()=>{
      const oneLineHeight = (oSententList.children[0] || {}).offsetHeight || 0;
      return oneLineHeight * (idx - 2);
    })();
    oSententList.scrollTo(0, fHeight);
  }
  toDraw(){
    console.time('画波形');
    const {aWave, iHeight} = this.state;
    const oCanvas = this.oCanvas.current;
    const Context = oCanvas.getContext('2d');
    const {width, height} = oCanvas;
    oCanvas.width = aWave.length / 2;
    Context.fillStyle = 'black';
    Context.fillRect(0, 0, width, height);
    let idx = -1;
    let fCanvasWidth = aWave.length / 2;

    while (idx < fCanvasWidth) {
      idx++;
      const cur1 = aWave[idx * 2] * iHeight;
      const cur2 = aWave[idx * 2 + 1] * iHeight;
      Context.fillStyle = '#55c655';
      Context.fillRect(
        idx, (100 - cur1), 1, Math.ceil(cur1 - cur2),
      );
      Context.fillStyle = '#4ddc4d';
      Context.fillRect(idx, 100, 1, 1);
    }
    console.timeEnd('画波形');
    return oCanvas;
  }
  async toPlay(iCurLine){
    const {state, oAudio, oPointer:{current:oPointer}} = this;
    const {aTimeLine, oneScPx} = this.state;
    clearTimeout(state.timer);
    clearInterval(state.timer02);
    iCurLine = typeof iCurLine == 'number' ? iCurLine : state.iCurLine;
    const {long, end, start} = aTimeLine[iCurLine];
    const iDestination = end * oneScPx;
    const Audio = oAudio.current;
    oPointer.style.left = `${start* oneScPx}px`;
    Audio.currentTime = start;
    Audio.play();
    let timer = setTimeout(()=>{
      Audio.pause();
    }, long * 1000);
    let timer02 = setInterval(()=>{
      const newLeft = oPointer.offsetLeft + 1;
      if (newLeft>=iDestination) {
        return clearInterval(state.timer02);
      }
      oPointer.style.left = `${newLeft}px`;
    }, 1000 / oneScPx);
    this.setState({timer, timer02, iCurLine});
    this.goLine(iCurLine);
  }
  toExport(){
    const {aTimeLine} = this.state;
    const aStr = aTimeLine.map(({start_, end_, text}, idx)=>{
      return `${idx+1}\n${start_} --> ${end_}\n${text}\n`;
    });
    const blob = new Blob([aStr.join('\n')]);
    Object.assign(document.createElement('a'), {
      download: `字幕文件-${new Date()*1}.srt`,
      href: URL.createObjectURL(blob),
    }).click();
  }
  fileToBuffer(oFile){
    const reader = new FileReader();
    let resolveFn = xx=>xx;
    const promise = new Promise(resolve=>resolveFn=resolve);
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
  async toImport(ev={}){
    const {target={files:[]}} = ev;
    const file = target.files[0];
    if (!file) return;
    const fileName = file.name;
    const fileSrc = URL.createObjectURL(file);  
    this.setState({fileName, fileSrc});
    let buffer = await this.fileToBuffer(file);
    this.showWaveByBuffer(buffer);
    let aTimeLine = await window.lf.getItem(fileName);
    aTimeLine = aTimeLine || [this.state.oFirstLine];
    this.setState({aTimeLine});
  }
  showWaveByBuffer(buffer){
    const aWave = fn.getPeaks(buffer, 50);
    const fCanvasWidth = aWave.length / 2; // 画布宽度
    this.setState({
      buffer,
      aWave,
      fCanvasWidth,
      duration: buffer.duration,
      oneScPx: fCanvasWidth / buffer.duration,
    });
    this.toDraw();
    this.watchKeyDown();
  }
}