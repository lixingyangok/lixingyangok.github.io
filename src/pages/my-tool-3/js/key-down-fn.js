import * as fn from './my-tool-pure-fn.js';
import { message } from 'antd';
import keyMap from './key-map.js';

export default class {
  getFn(keyStr){
    const fnLib = {
      '`': () => this.toPlay(null, true),
      'Tab': () => this.toPlay(),
      // ctrl 系列
      'ctrl + Enter': () => this.toPlay(),
      'ctrl + d': () => this.toDel(),
      'ctrl + s': () => this.toSave(),
      // alt 系列
      'alt + j': () => this.previousAndNext(-1),
      'alt + k': () => this.previousAndNext(1),
      'alt + ,': () => this.changeWaveHeigh(-1),
      'alt + .': () => this.changeWaveHeigh(1),
      'alt + u': () => this.fixRegion('start', -0.35),
      'alt + i': () => this.fixRegion('start', 0.35),
      // ▼ 其它，用于微调
      'shift + alt + u': () => this.fixRegion('start', -0.1),
      'shift + alt + i': () => this.fixRegion('start', 0.1),
      'shift + alt + j': () => this.fixRegion('end', -0.1),
      'shift + alt + k': () => this.fixRegion('end', 0.1),
    }
    const fn = fnLib[keyStr];
    if (!fn) return false;
    return fn.bind(this);
  }
  // ▼按下按键事件
  keyDowned(ev){
    const {ctrlKey, shiftKey, altKey, keyCode} = ev;
    const ctrl = ctrlKey ? 'ctrl + ' : '';
    const shift = shiftKey ? 'shift + ' : '';
    const alt = altKey ? 'alt + ' : '';
    const keyStr = ctrl + shift + alt + keyMap[keyCode];
    const theFn = this.getFn(keyStr);
    console.log('按下：', keyCode);
    if (!theFn) return;
    theFn();
    ev.preventDefault();
    ev.stopPropagation();
  }
  // ▼切换当前句子（上一句，下一句）
  previousAndNext(iDirection) {
    const { aTimeLine, iCurLine } = this.state;
    let iCurLineNew = iCurLine + iDirection;
    if (iCurLineNew < 0) iCurLineNew = 0;
    if (iCurLineNew > aTimeLine.length - 1) {
      const oLast = aTimeLine.slice(-1)[0];
      const start = oLast.end + 0.05;
      const end = oLast.end + 10.05;
      const oNewItem = {
        start,
        end,
        long: end - start,
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
  // ▼微调区域
  fixRegion(sKey, iDirection) {
    const { aTimeLine, iCurLine } = this.state;
    const oOld = aTimeLine[iCurLine];
    const previous = aTimeLine[iCurLine - 1];
    const next = aTimeLine[iCurLine + 1];
    let fNewVal = oOld[sKey] + iDirection;
    if (fNewVal < 0) fNewVal = 0;
    if (previous && fNewVal < previous.end) {
      fNewVal = previous.end + 0.05;
    }
    if (next && fNewVal > next.start) {
      fNewVal = next.start - 0.05;
    }
    this.setTime(sKey, fNewVal);
  }
  // ▼使其横向滚动
  scrollToFn(deltaY) {
    const oDom = this.oWaveWrap.current;
    const iLong = 350;
    const newVal = (() => {
      let oldVal = oDom.scrollLeft;
      if (deltaY >= 0) return oldVal - iLong;
      else return oldVal + iLong;
    })();
    oDom.scrollTo(newVal, 0);
  }
  // ▼横向缩放。接收一个事件对象
  zoomWave(ev){
    if (this.state.drawing) return; //防抖
    const {iPerSecPx: perSecPxOld, fPerSecPx, buffer} = this.state;
    const {clientX, deltaY} = ev;
    const [min, max, iStep] = [10, 250, 20]; //每秒最小/最大px
    if ((perSecPxOld<=min && deltaY>=0) || (perSecPxOld>=max && deltaY<=0)){
      return this.setState({drawing: false});
    }
    const oWaveWrap = this.oWaveWrap.current;
    const {offsetLeft, scrollLeft} = oWaveWrap;
    const iLeftPx = clientX - offsetLeft + scrollLeft; //鼠标左侧的px值
    const iNowSec = iLeftPx / fPerSecPx; //当前指向时间（秒）
    const iPerSecPx = (() => {
      const iDirection = iStep * (deltaY <= 0 ? 1 : -1);
      let result = perSecPxOld + iDirection;
      if (result < min) return min;
      else if (result > max) return max;
      return result;
    })();
    const sampleSize = ~~(buffer.sampleRate / iPerSecPx); // 每一份的点数 = 每秒采样率 / 每秒像素
    const fPerSecPx_ = buffer.length / sampleSize / buffer.duration;
    const iNewLeftPx = (iNowSec * fPerSecPx_) - (clientX - offsetLeft);
    this.setState({iPerSecPx, fPerSecPx_, drawing: true});
    oWaveWrap.scrollTo(iNewLeftPx, 0);
    this.oPointer.current.style.left = (()=>{
      const {currentTime} = this.oAudio.current;
      return `${currentTime * fPerSecPx_}px`;
    })();
    if (iNewLeftPx<=0) this.onScrollFn();
  }
  // 改变波形高度
  changeWaveHeigh(deltaY) {
    let { iHeight } = this.state;
    const [min, max, iStep] = [10, 350, 10];
    if (deltaY >= 0) iHeight += iStep;
    else iHeight -= iStep;
    if (iHeight < min) iHeight = min;
    if (iHeight > max) iHeight = max;
    this.setState({ iHeight });
    this.toDraw();
  }
  // 监听滚动
  onScrollFn() {
    let {buffer, iPerSecPx} = this.state;
    let {offsetWidth, scrollLeft} = this.oWaveWrap.current;
    const {aPeaks, fPerSecPx} = fn.getPeaks(
      buffer, iPerSecPx, scrollLeft, offsetWidth,
    );
    this.oCanvas.current.style.left = scrollLeft + 'px';
    this.setState({aPeaks, fPerSecPx});
    this.toDraw(aPeaks);
  }
}

