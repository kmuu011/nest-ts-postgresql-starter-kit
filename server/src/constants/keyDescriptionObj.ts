import { AnyObject } from "../types/common";

interface KeyDescriptionObj {
  [key: string]: any;

  memo: string;
  file: string;
  type: string;
  value: string;
  id: string;
  content: string;
}

const keyDescriptionObj: KeyDescriptionObj = {
  memo: "메모",
  file: "파일",
  type: "타입",
  value: "값",
  id: "아이디",
  content: "내용",
};

const descriptionToKeyObj = Object.keys(keyDescriptionObj).reduce((descObj: AnyObject, key) => {
  descObj[keyDescriptionObj[key as keyof KeyDescriptionObj]] = key;
  return descObj;
}, {});

export {
  keyDescriptionObj,
  descriptionToKeyObj
};