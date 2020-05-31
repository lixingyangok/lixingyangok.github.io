
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
      // if(idx > aTimeLine.length - 4){
      //   console.log('快到底了', oneLineHeight * (idx + 6));
      //   return oneLineHeight * (idx + 6);
      // }
      return oneLineHeight * (idx - 2);
    })();
    oSententList.scrollTo(0, fHeight);
  }
  toDraw(){
    const {aWave} = this.state;
    const oCanvas = this.oCanvas.current;
    const Context = oCanvas.getContext('2d');
    let idx = -1;
    let width = aWave.length / 2;
    while(idx<width){
      idx++;
      const cur1 = aWave[idx * 2];
      const cur2 = aWave[idx * 2 + 1];
      Context.fillStyle = '#55c655';
      Context.fillRect(
        idx, (100 - cur1), 1, Math.ceil(cur1 - cur2),
      );
      Context.fillStyle = '#4ddc4d';
      Context.fillRect(idx, 100, 1, 1);
    }
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
    }, (long * 1000) / (long * oneScPx));
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
}