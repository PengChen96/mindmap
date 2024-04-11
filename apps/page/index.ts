import { initPage } from './common/init-page';
import './common/common.less';
// import baseballImage from './img/resume/baseball.png';

const data = {
  "1": {
    "children": [
      "9825228c-af047f60b7e7",
      "e9215a5d-a02070e4b10b",
      "c30d5cc4-56258c64d2de",
      "9d771ba5-c37abf8452a9",
      "f41e881c-8ca5430fcc3f"
    ],
    "label": "RockyRen的技能树",
    "direction": 0,
    "isRoot": true,
    "isExpand": true
  },
  "9825228c-af047f60b7e7": {
    "children": [
      "aa6590b3-7df3907ff1e7",
      "0ea9ae09-fb1baf703117",
      "a79fd8fc-d67cd5cb0372"
    ],
    "label": "棒球",
    "direction": 1,
    "isRoot": false,
    "isExpand": true
  },
  "aa6590b3-7df3907ff1e7": {
    "children": [

    ],
    "label": "前腾讯棒球协会队长",
    "direction": 1,
    "isRoot": false,
    "isExpand": true,
    "buttonData": {
      "params": "params",
      "onClick": (p) => {
        console.log('buttonData', p);
      }
    }
  },
  "0ea9ae09-fb1baf703117": {
    "children": [
      "40ec5809-3bd6775f333e"
    ],
    "label": "守备位置",
    "direction": 1,
    "isRoot": false,
    "isExpand": true,
  },
  // "40ec5809-3bd6775f333e": {
  //   "children": [
  //
  //   ],
  //   "label": "一个喜欢玩土的二垒手",
  //   "direction": 1,
  //   "isRoot": false,
  //   "isExpand": true,
  //   "imageData": {
  //     "width": 138,
  //     "height": 203.4,
  //     "src": baseballImage,
  //     "toward": "left"
  //   }
  // }
};

initPage({
  pageName: 'resume',
  options: {
    data,
  },
});
