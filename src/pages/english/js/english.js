export async function getText() {
  let res = await fetch('./static/Im Lost.srt', {
    method: "get",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
  });
  return res.text();
};

export function getSeconds(text) {
  const [hour, minute, second, tail] = text.match(/\d+/g);
  let number = (hour * 60 * 60) + (minute * 60) + `${second}.${tail}` * 1;
  return number.toFixed(2) * 1;
};

export function getTimeLine(text) {
  let strArr = text.split('\n');
  strArr = strArr.filter(cur => {
    if (!cur) return false;
    return /\d{2}:\d{2}:\d{2},\d{3,4} --> \d{2}:\d{2}:\d{2},\d{3,4}/.test(cur);
  });
  return strArr.map(cur => {
    const [aa, bb] = cur.split(' --> ');
    return {
      start: getSeconds(aa),
      end: getSeconds(bb),
      color: "hsla(200, 50%, 70%, 0.4)",
      drag: false,
    };
  }).slice(0, 2);
};
