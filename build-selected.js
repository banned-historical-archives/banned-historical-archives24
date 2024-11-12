const path = require('path');
const iconv = require('iconv-lite');

const fs = require('fs-extra');

function find(str, start, end) {
    const a = str.indexOf(start);
    const b = str.indexOf(end, a + start.length);
    return str.substring(a + start.length, b);
}

const keywords = ['张春桥','江青','王洪文','姚文元','毛远新', '毛泽东', '毛主席', '四人帮', '极左', '左倾', '右倾', '极右','资产阶级', '修正主义', '剥削', '奴隶','文革','文化大革命', '叶剑英', '北决扬', '鲁礼安', '无政府'];
const keywords_special = [
  {year_start: 1958, year_end: 1981, keyword: '邓小平'},
  {year_start: 1958, year_end: 1981, keyword: '刘少奇'},
  {year_start: 1958, year_end: 1961, keyword: '彭德怀'},
  {year_start: 1950, year_end: 1981, keyword: '戚本禹'},

  {year_start: 1966, year_end: 1983, keyword: '揭发'},
  {year_start: 1966, year_end: 1978, keyword: '彭真'},
  {year_start: 1966, year_end: 1978, keyword: '华国锋'},
  {year_start: 1966, year_end: 1978, keyword: '汪东兴'},
  {year_start: 1966, year_end: 1978, content_keyword: '邓榕'},
  {year_start: 1966, year_end: 1978, content_keyword: '邓朴方'},
  {year_start: 1958, year_end: 1981, content_keyword: '邓小平'},

];

function normalize(str) {
    str = str.replace(/松江青[浦年]/g, '').replace(/[浙镇吴隆黄]江青/g, '');
    return str;
  }

function includes(str, arr) {
    for (const i of arr) {
        if (str.indexOf(i) >= 0) {
            return true;
        }
    }
    return false;
}

const base = './txt';
for (const year of fs.readdirSync(base)) {
  console.log(year)
  for (const month of fs.readdirSync(path.join(base, year))) {
    for (const day of fs.readdirSync(path.join(base, year, month))) {
      for (const article of fs.readdirSync(path.join(base, year, month, day))) {
        const raw = iconv.decode(fs.readFileSync(path.join(base, year, month, day, article)), 'gb2312');
        console.log(raw)
        return
      }
    }
  }
    break;
    const raw = fs.readFileSync(
        path.join('json', Math.floor(i/1000).toString(), i.toString() + '.json')
    ).toString();
    const json = JSON.parse(raw);

    const normalized_title = normalize(json.ytitle + json.mtitle + json.ftitle);
    const normalized_content = normalize(raw);
    if (!(
        includes(normalized_title, keywords) || 
        includes(json.authors.join(','), keywords) ||
        keywords_special.reduce((m, k) => {
          return m || (
            k.year_start <= json.date[0].year && k.year_end >= json.date[0].year && (
              k.keyword ? (
                normalized_title.indexOf(k.keyword) >= 0 ||
                json.authors.reduce((m,a) => {
                  return m || a == k.keyword
                }, false)
              ) : normalized_content.indexOf(k.content_keyword) >= 0
            )
          )
        }, false)
    )) continue;
    const dir = path.join(__dirname, 'selected', Math.floor(i / 1000).toString());
    fs.ensureDirSync(dir);
    fs.writeFileSync(path.join(dir, i + '.json'), JSON.stringify(json))
}
console.log('done');

