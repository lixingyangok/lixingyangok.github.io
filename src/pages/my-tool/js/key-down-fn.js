import * as fn from './my-tool-pure-fn.js';
import {message} from 'antd';

export default class{
  // ▼监听按键
  watchKeyDown(){
    const fnLib = {
      'ctrl + 13': ()=>this.toPlay(), // enter
      'ctrl + 68': ()=>this.toDel(), // d
      'ctrl + 83': ()=>this.toSave(), // s
      'ctrl + 74': ()=>this.previousAndNext(-1), // j
      'ctrl + 75': ()=>this.previousAndNext(1), // k
      'alt + 85': ()=>this.fixRegion('start', -0.35), // u
      'alt + 73': ()=>this.fixRegion('start', 0.35), // i
      'alt + 74': ()=>this.fixRegion('end', -0.35), // <
      'alt + 75': ()=>this.fixRegion('end', 0.35), // >
      'shift + alt + 85': ()=>this.fixRegion('start', -0.1), // n
      'shift + alt + 73': ()=>this.fixRegion('start', 0.1), // m
      'shift + alt + 74': ()=>this.fixRegion('end', -0.1), // <
      'shift + alt + 75': ()=>this.fixRegion('end', 0.1), // >
    }
    const toRunFn = ev => {
      const {ctrlKey, shiftKey, altKey, keyCode} = ev;
      const ctrl = ctrlKey ? 'ctrl + ' : '';
      const shift = shiftKey ? 'shift + ' : '';
      const alt = altKey ? 'alt + ' : '';
      const key = ctrl + shift + alt + keyCode;
      console.log('按下：', keyCode);
      const theFn = fnLib[key];
      if (!theFn) return;
      theFn.bind(this)();
      ev.preventDefault();
      ev.stopPropagation();
    }
    document.onkeydown = toRunFn;
  }
  // ▼上一句，下一句
  previousAndNext(iDirection){
    const {aTimeLine, iCurLine} = this.state;
    let iCurLineNew = iCurLine + iDirection;
    if (iCurLineNew<0) iCurLineNew = 0;
    if (iCurLineNew>aTimeLine.length-1) {
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
  enterKeyDown(ev){
    const {keyCode, altKey, ctrlKey, shiftKey} = ev;
    if (keyCode===13 && !altKey && !ctrlKey && !shiftKey) {
      ev.preventDefault();
      this.previousAndNext(1);
      return false;
    }
  }
  // ▼删除某条
  toDel(){
    const {aTimeLine, iCurLine} = this.state;
    this.setState({
      aTimeLine: aTimeLine.filter((cur, idx) => idx !== iCurLine),
    });
  }
  async toSave(){
    const {aTimeLine, fileName} = this.state;
    if (!fileName) return;
    window.lf.setItem(fileName, aTimeLine);
    message.success('保存成功');
  }
  fixRegion(sKey, iDirection){
    const {aTimeLine, iCurLine} = this.state;
    const oOld = aTimeLine[iCurLine];
    const previous = aTimeLine[iCurLine-1];
    const next = aTimeLine[iCurLine+1];
    let fNewVal = oOld[sKey] + iDirection;
    if (fNewVal < 0) fNewVal = 0;
    if (previous && fNewVal < previous.end){
      fNewVal = previous.end + 0.1;
    }
    if (next && fNewVal > next.start){
      fNewVal = next.start - 0.1;
    }
    aTimeLine[iCurLine] = {...oOld, [sKey]: fNewVal};
    this.setState({aTimeLine});
  }
  onWheelFn(ev){
    const {altKey, ctrlKey, shiftKey, nativeEvent} = ev;
    if (0) console.log(ctrlKey, shiftKey);
    if (altKey){
      this.zoomWave(nativeEvent.deltaY);
    }else{
      this.scrollToFn(nativeEvent.deltaY);
    }
  }
  scrollToFn(deltaY){
    const oDom = this.oBox.current;
    const newVal = (()=>{
      let oldVal = oDom.scrollLeft;
      if (deltaY <= 0) return oldVal - 55;
      else return oldVal + 55;
    })();
    oDom.scrollTo(newVal, 0);
  }
  zoomWave(deltaY){
    const {perSecPx, buffer, isDrawing, duration} = this.state;
    if (isDrawing) return console.error('防抖退出'); //防抖
    this.setState({isDrawing: true});
    let newVal = (()=>{
      let iDirection = deltaY <= 0 ? 2 : -2;
      let result = perSecPx + iDirection;
      if (result<3) result=3;
      return result;
    })();
    const aWave = fn.getPeaks(buffer, newVal);
    const fCanvasWidth = aWave.length / 2;
    console.log(`一共${duration}秒 * 每秒像素${newVal} = ${~~fCanvasWidth}`);
    if (fCanvasWidth > 32000){
      this.setState({isDrawing: false});
      return console.error('超过32000');
    } else if (fCanvasWidth < 500){
      this.setState({isDrawing: false});
      return console.error('小于500');
    }
    // Chrome里面canvas的最大宽度是：32767px;
    // Firefox里面canvas的最大宽度是：32766px;
    this.setState({
      aWave,
      perSecPx: newVal,
    });
    this.toDraw();
  }
}

