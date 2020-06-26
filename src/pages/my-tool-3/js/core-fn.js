export default class {
  // ▼输入框文字改变
  valChanged(ev) {
    const text = ev.target.value;
    if (!text[0] || !text[text.length - 1]) return;
    const { iCurLine, aTimeLine } = this.state;
    aTimeLine[iCurLine].text = text;
    this.setState({ aTimeLine });
  }
  // ▼跳至某行
  async goLine(idx) {
    // await new Promise(resolve => resolve(), 100);
    const oWaveWrap = this.oWaveWrap.current;
    const {scrollLeft, offsetWidth} = oWaveWrap;
    const {fPerSecPx, aTimeLine} = this.state;
    const {start, end, long} = aTimeLine[idx] || aTimeLine[idx - 1];
    if (
      (start * fPerSecPx < scrollLeft) || //【起点】超出可视区
      (end * fPerSecPx > scrollLeft + offsetWidth) //【终点】超出可视区
    ) {
      const leftVal = (()=>{
        const startPx = fPerSecPx * start;
        const restPx = offsetWidth - long * fPerSecPx;
        if (restPx<=0) return startPx - 20;
        return startPx - restPx / 2;
      })();
      oWaveWrap.scrollTo(leftVal, 0);
    }
    // ▲波形定位，▼下方句子定位
    const oSententList = this.oSententList.current;
    const fHeight = (() => {
      const oneLineHeight = (oSententList.children[0] || {}).offsetHeight || 0;
      return oneLineHeight * (idx - 2);
    })();
    oSententList.scrollTo(0, fHeight);
    this.setState({iCurLine: idx});
  }
  // ▼绘制
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
  // ▼播放
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
  // ▼得到点击处的秒数，收受一个事件对象
  getPointSec({clientX}){
    const {fPerSecPx} = this.state;
    const {offsetLeft, scrollLeft} = this.oWaveWrap.current;
    const iLeftPx = clientX - offsetLeft + scrollLeft; //鼠标左侧的px值
    const iNowSec = iLeftPx / fPerSecPx; //当前指向时间（秒）
    return iNowSec;
  }
  // ▼设定时间
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
    oCurLine.start_ = this.secToStr(oCurLine.start);
    oCurLine.end_ = this.secToStr(oCurLine.end);
    oCurLine.long = oCurLine.end - oCurLine.start;
    aTimeLine[iCurLine] = oCurLine;
    this.setState({aTimeLine});
  }
  // ▼时间轴的时间转秒
  getSeconds(text) {
    const [hour, minute, second, tail] = text.match(/\d+/g);
    let number = (hour * 60 * 60) + (minute * 60) + `${second}.${tail}` * 1;
    return number.toFixed(2) * 1;
  };
  // ▼秒-转为时间轴的时间
  secToStr(fSecond){
    let iHour = Math.floor(fSecond / 3600) + ''; //时
    let iMinut = Math.floor((fSecond - iHour * 3600) / 60) + ''; //分
    let fSec = fSecond - (iHour*3600 + iMinut*60) + ''; //秒
    let [sec01, sec02='000'] = fSec.split('.');
    const sTime = `${iHour.padStart(2, 0)}:${iMinut.padStart(2, 0)}:${sec01.padStart(2, 0)},${sec02.slice(0, 3).padEnd(3,0)}`;
    return sTime;
  }
}

