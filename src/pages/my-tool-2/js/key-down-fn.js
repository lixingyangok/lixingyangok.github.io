import * as fn from './my-tool-pure-fn.js';
import { message } from 'antd';

export default class {
  // ▼监听按键
  watchKeyDown() {
    const fnLib = {
      '9': () => this.toPlay(), // enter
      // 
      'ctrl + 13': () => this.toPlay(), // enter
      'ctrl + 68': () => this.toDel(), // d
      'ctrl + 83': () => this.toSave(), // s
      // 
      'alt + 74': () => this.previousAndNext(-1), // j
      'alt + 75': () => this.previousAndNext(1), // k
      'alt + 188': () => this.changeWaveHeigh(-1), // ,
      'alt + 190': () => this.changeWaveHeigh(1), // .
      'alt + 85': () => this.fixRegion('start', -0.35), // u
      'alt + 73': () => this.fixRegion('start', 0.35), // i
      // 
      'shift + alt + 85': () => this.fixRegion('start', -0.1), // n
      'shift + alt + 73': () => this.fixRegion('start', 0.1), // m
      'shift + alt + 74': () => this.fixRegion('end', -0.1), // <
      'shift + alt + 75': () => this.fixRegion('end', 0.1), // >
    }
    const toRunFn = ev => {
      const { ctrlKey, shiftKey, altKey, keyCode } = ev;
      const ctrl = ctrlKey ? 'ctrl + ' : '';
      const shift = shiftKey ? 'shift + ' : '';
      const alt = altKey ? 'alt + ' : '';
      const key = ctrl + shift + alt + keyCode;
      const theFn = fnLib[key];
      // console.log('按下：', keyCode);
      if (!theFn) return;
      theFn.bind(this)();
      ev.preventDefault();
      ev.stopPropagation();
    }
    document.onkeydown = toRunFn;
  }
  // ▼上一句，下一句
  previousAndNext(iDirection) {
    const { aTimeLine, iCurLine } = this.state;
    let iCurLineNew = iCurLine + iDirection;
    if (iCurLineNew < 0) iCurLineNew = 0;
    if (iCurLineNew > aTimeLine.length - 1) {
      const oLast = aTimeLine.slice(-1)[0];
      const start = oLast.end + 0.1;
      const end = oLast.end + 10.1;
      const oNewItem = {
        start,
        end,
        long: 10.1,
        text: '',
        start_: fn.secToStr(start),
        end_: fn.secToStr(end),
      };
      this.setState({
        aTimeLine: [...aTimeLine, oNewItem],
      });
    };
    this.setState({iCurLine: iCurLineNew});
    this.goLine(iCurLineNew);
  }
  // ▼按钮回车键
  enterKeyDown(ev) {
    const { keyCode, altKey, ctrlKey, shiftKey } = ev;
    if (keyCode === 13 && !altKey && !ctrlKey && !shiftKey) {
      ev.preventDefault();
      this.previousAndNext(1);
      return false;
    }
  }
  // ▼删除某条
  toDel() {
    const { aTimeLine, iCurLine } = this.state;
    this.setState({
      aTimeLine: aTimeLine.filter((cur, idx) => idx !== iCurLine),
    });
  }
  async toSave() {
    const { aTimeLine, fileName } = this.state;
    if (!fileName) return;
    window.lf.setItem(fileName, aTimeLine);
    message.success('保存成功');
  }
  fixRegion(sKey, iDirection) {
    const { aTimeLine, iCurLine } = this.state;
    const oOld = aTimeLine[iCurLine];
    const previous = aTimeLine[iCurLine - 1];
    const next = aTimeLine[iCurLine + 1];
    let fNewVal = oOld[sKey] + iDirection;
    if (fNewVal < 0) fNewVal = 0;
    if (previous && fNewVal < previous.end) {
      fNewVal = previous.end + 0.1;
    }
    if (next && fNewVal > next.start) {
      fNewVal = next.start - 0.1;
    }
    aTimeLine[iCurLine] = { ...oOld, [sKey]: fNewVal };
    this.setState({ aTimeLine });
  }
  // ▼使其横向滚动
  scrollToFn(deltaY) {
    const oDom = this.oWaveWrap.current;
    const iLong = 300;
    const newVal = (() => {
      let oldVal = oDom.scrollLeft;
      if (deltaY >= 0) return oldVal - iLong;
      else return oldVal + iLong;
    })();
    oDom.scrollTo(newVal, 0);
  }
  // ▼横向缩放。接收一个事件对象
  zoomWave(ev){
    console.time('zoomWave');
    const oWaveWrap = this.oWaveWrap.current;
    const {offsetLeft, scrollLeft} = oWaveWrap;
    const {clientX, deltaY} = ev;
    const {perSecPx: perSecPxOld} = this.state;
    const iLeftPx = clientX - offsetLeft + scrollLeft; //鼠标左侧的px值
    const iNowSec = iLeftPx / perSecPxOld; //当前指向时间（秒）
    const perSecPx = (() => {
      const iDirection = 10 * (deltaY <= 0 ? 1 : -1);
      let result = perSecPxOld + iDirection;
      const [min, max] = [20, 200]; //每秒最小/最大px
      if (result < min) result = min;
      else if (result > max) result = max;
      return result;
    })();
    const iNewLeftPx = (iNowSec * perSecPx) - (clientX - offsetLeft);
    oWaveWrap.scrollTo(iNewLeftPx, 0);
    console.timeEnd('zoomWave');
    this.setState({perSecPx});
  }
  // 改变波形高度
  changeWaveHeigh(deltaY) {
    let { iHeight } = this.state;
    const min = 10;
    const max = 350;
    const iStep = 10;
    if (deltaY >= 0) iHeight += iStep;
    else iHeight -= iStep;
    if (iHeight < min) iHeight = min;
    if (iHeight > max) iHeight = max;
    this.setState({ iHeight });
    this.toDraw();
  }
  // 监听滚动
  onScrollFn(ev) {
    console.log('滚动了');
    const oCanvas = this.oCanvas.current;
    const left = ev.target.scrollLeft;
    oCanvas.style.left = left + 'px';
    const {buffer, perSecPx} = this.state;
    const {offsetWidth} = this.oWaveWrap.current;
    const {aPeaks} = fn.getPeaks(buffer, perSecPx, left, offsetWidth);
    this.setState({aPeaks});
    this.toDraw(aPeaks);
  }
  // ▼在波形上滚动
  wheelOnWave(ev){
    const {altKey, ctrlKey, shiftKey, wheelDeltaY, deltaY} = ev; 
    if (0) console.log(shiftKey, deltaY);
    if (ctrlKey) {
      this.zoomWave(ev);
    } else if (altKey) {
      this.changeWaveHeigh(wheelDeltaY);
    } else {
      this.scrollToFn(wheelDeltaY);
    }
    ev.preventDefault();
    ev.stopPropagation();
    ev.returnValue = false;
  }
  // ▼控制***
  wheelOnSpan(ev) {
    const { altKey, ctrlKey, shiftKey, nativeEvent: { deltaY } } = ev;
    if (0) console.log(ctrlKey, shiftKey, altKey, deltaY);
  }
}

