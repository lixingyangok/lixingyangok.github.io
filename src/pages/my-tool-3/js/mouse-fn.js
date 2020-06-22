/*
 * @Author: 李星阳
 * @LastEditors: 李星阳
 * @Description: 
 */

export default class {
  // ▼处理左键点击和拖动
  mouseDownFn(ev01) {
    if (ev01.button !== 0) return; // 只处理左键点击
    const oWaveWrap = this.oWaveWrap.current;
    const downPoint = ev01.clientX; // 把落点提前准备出来
    this.setTime('start', this.getPointSec(ev01));
    oWaveWrap.onmousemove = ev02 => {
      const keyName = ev02.clientX >= downPoint ? 'end' : 'start';
      this.setTime(keyName, this.getPointSec(ev02));
      ev02.preventDefault();
      ev02.stopPropagation();
      return false;
    };
    document.onmouseup = function () {
      oWaveWrap.onmousemove = () => 0;
    };
  }
  // ▼处理右键点击事件
  clickOnWave(ev) {
    if (ev.button !== 2) return; // 只处理右键点击
    this.setTime('end', this.getPointSec(ev));
    ev.preventDefault();
    ev.stopPropagation();
    return false;
  }
  // ▼在波形上滚动滚轮
  wheelOnWave(ev) {
    const { altKey, ctrlKey, shiftKey, wheelDeltaY, deltaY } = ev;
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
}


