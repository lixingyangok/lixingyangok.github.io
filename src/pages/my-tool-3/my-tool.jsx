import React from "react";
import * as cpnt from "./style/my-tool-style.js";
import theFn from "./js/my-tool.js";
import keyDownFn from "./js/key-down-fn.js";
import * as fn from "./js/my-tool-pure-fn.js";
import MouseFn from './js/mouse-fn.js';
import {Button} from "antd";

export default class Tool extends window.mix(
  React.Component,
  theFn,
  keyDownFn,
  MouseFn,
) {
  oCanvas = React.createRef();
  oAudio = React.createRef();
  oWaveWrap = React.createRef();
  oPointer = React.createRef();
  oSententList = React.createRef();
  constructor(props) {
    super(props);
    const oFirstLine = {
      start_: "00:00:01,000",
      end_: "00:00:05,000",
      start: 1,
      end: 5,
      long: 4,
      text: "",
    };
    this.state = {
      buffer: {}, //音频数据
      aPeaks: [], //波形数据
      duration: 0, //音频长度（秒
      playTimer: null, // 定时器
      iCurLine: 0, //当前行
      oFirstLine, //默认行
      aTimeLine: [oFirstLine], //字幕
      fileName: "", //文件名
      fileSrc: "", //文件地址
      iHeight: 50,
      iCanvasHeight: 150,
      iPerSecPx: 55, //人为定义的每秒像素数
      fPerSecPx: 0, //实际每秒像素数
      drawing: false, //是否在绘制中（用于防抖
      mouseDraggingFn: ()=>0,
    };
  }
  render() {
    const {
      buffer,
      aTimeLine,
      iCurLine,
      iCanvasHeight,
      duration,
      iPerSecPx,
      // fPerSecPx,
    } = this.state;
    const sampleSize = ~~(buffer.sampleRate / iPerSecPx); // 每一份的点数 = 每秒采样率 / 每秒像素
    const fPerSecPx = buffer.length / sampleSize / duration;
    return (
      <cpnt.Div>
        <audio src={`./static/${fn.fileName}.mp3`} ref={this.oAudio} />
        <cpnt.WaveWrap ref={this.oWaveWrap}
          onScroll={() => this.onScrollFn()}
          style={{height: `${iCanvasHeight + 20}px`}}
        >
          <cpnt.TimeBar style={{width: `${fPerSecPx * duration}px`}} 
            onContextMenu={ev => this.clickOnWave(ev)}
            onMouseDown={ev=>this.mouseDownFn(ev)}
          >
            <i className="pointer" ref={this.oPointer}/>
            <section>
              {aTimeLine.map(({ start, end }, idx) => {
                return (
                  <cpnt.Region key={idx}
                    className={idx === iCurLine ? "cur region" : "region"}
                    style={{left: `${start * fPerSecPx}px`, width: `${(end - start) * fPerSecPx}px`}}
                  >
                    {idx + 1}
                  </cpnt.Region>
                );
              })}
            </section>
            {/* ▼刻度（秒）*/}
            <section>
              {[...Array(~~duration).keys()].map((cur, idx) => {
                return (
                  <span className="second-mark" key={cur}
                    style={{ width: fPerSecPx + "px", left: idx*fPerSecPx + "px" }}
                  >
                    {cur}
                  </span>
                );
              })}
            </section>
          </cpnt.TimeBar>
          <canvas height={iCanvasHeight} ref={this.oCanvas} />
        </cpnt.WaveWrap>
        <cpnt.BtnBar>
          <div>
            <Button type="primary" onClick={() => this.toSave()}>
              保存
            </Button>
            &nbsp;
            <Button onClick={() => this.toExport()}>导出</Button>&nbsp;
            <input type="file" onChange={(ev) => this.toImport(ev)} />
          </div>
        </cpnt.BtnBar>
        {/* 分界 */}
        <cpnt.InputWrap>
          {(() => {
            if (!aTimeLine[iCurLine]) return <span />;
            return (
              <textarea value={(aTimeLine[iCurLine] || {}).text}
                onChange={(ev) => this.valChanged(ev)}
                onKeyDown={(ev) => this.enterKeyDown(ev)}
              />
            );
          })()}
        </cpnt.InputWrap>
        {/* 分界 */}
        <cpnt.SentenceWrap ref={this.oSententList}>
          {aTimeLine.map((cur, idx) => {
            return (
              <li className={`one-line ${idx === iCurLine ? "cur" : ""}`}
                key={idx} onClick={() => this.goLine(idx)}
              >
                <i className="idx"
                  style={{width: `${String(aTimeLine.length || 0).length}em`}}
                >
                  {idx + 1}
                </i>
                <span className="time">
                  <em>{cur.start_}</em>&nbsp;-&nbsp;<em>{cur.end_}</em>
                </span>
                {cur.text}
              </li>
            );
          })}
        </cpnt.SentenceWrap>
      </cpnt.Div>
    );
  }
  // ▼以下是生命周期
  async componentDidMount() {
    this.watchKeyDown(); 
    this.oWaveWrap.current.addEventListener( //注册滚轮事件
      "mousewheel", ev => this.wheelOnWave(ev),
      {passive: false},
    );
    // ▼加载
    const buffer = await fn.getMp3();
    const sText = await fn.getText();
    const aTimeLine = fn.getTimeLine(sText).slice(0); //字幕
    this.setState({buffer, aTimeLine});
    this.bufferToPeaks();
    this.toDraw();
  }
}
