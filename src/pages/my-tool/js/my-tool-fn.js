
export default class{
  enterKeyDown(ev){
    const {keyCode, altKey, ctrlKey, shiftKey} = ev;
    if (keyCode===13 && !altKey && !ctrlKey && !shiftKey) {
      ev.preventDefault();
      this.upAndDown(1);
      return false;
    }
  }
  valChanged(ev){
    const text = ev.target.value;
    if(!text[0] || !text[text.length-1]) return;
    const {iCurLine, aTimeLine} = this.state;
    aTimeLine[iCurLine].text = text;
    this.setState({aTimeLine});
  }
  goLine(idx) {
    const oBox = this.oBox.current;
    const oSententList = this.oSententList.current;
    const {oneScPx, aTimeLine} = this.state;
    const oAim = aTimeLine[idx] || aTimeLine[idx-1];
    const leftVal = oneScPx * oAim.start - 500;
    const fHeight = (()=>{
      const oneLineHeight = (oSententList.children[0] || {}).offsetHeight || 0;
      return oneLineHeight * (idx - 2);
    })();
    console.log('fHeight', fHeight);
    oBox.scrollTo(leftVal, 0);
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
  upAndDown(iDirection){
    const {aTimeLine, iCurLine} = this.state;
    let iCurLineNew = iCurLine + iDirection;
    if (iCurLineNew<0) iCurLineNew = 0;
    if (iCurLineNew>aTimeLine.length-1) {
      const oLast = aTimeLine.slice(-1)[0];
      const oNewItem = {
        start: oLast.end + 0.1,
        end: oLast.end + 10,
        long: (10.1).toFixed(2) * 1,
        text: `新的${iCurLineNew}`,
      };
      this.setState({
        aTimeLine: [...aTimeLine, oNewItem],
      });
    };
    console.log('下一个', iCurLineNew);
    this.setState({iCurLine: iCurLineNew});
    this.goLine(iCurLineNew);
  }
  watchKeyDown(){
    const fnLib = {
      '74': ()=>this.upAndDown(-1), // Ctrl + j
      '75': ()=>this.upAndDown(1), // Ctrl + k
      '13': ()=>this.toPlay(), //enter
    }
    const toRunFn = ev => {
      const {keyCode, altKey, ctrlKey, shiftKey} = ev;
      const aWatchedKeyDown = [
        (altKey && ctrlKey && shiftKey),
        [74, 75].includes(keyCode) && ctrlKey, // j、k
        keyCode===13 && ctrlKey, // enter
      ];
      if (!aWatchedKeyDown.some(Boolean)) return;
      const theFn = fnLib[keyCode] || (xx=>xx);
      theFn.bind(this)();
      ev.preventDefault();
    }
    document.onkeydown = toRunFn;
  }
}