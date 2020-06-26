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
        start_: this.secToStr(start),
        end_: this.secToStr(end),
      };
      this.setState({
        aTimeLine: [...aTimeLine, oNewItem],
      });
    };
    this.setState({iCurLine: iCurLineNew});
    this.goLine(iCurLineNew);
  }
  // ▼按下回车键
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
  // ▼保存字幕到本地
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
}

