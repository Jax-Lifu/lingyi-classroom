import type { Subject } from "@lingyi-classroom/shared";

export const topics: Record<
  Subject,
  { name: string; mark: string; detail: string; unit: string; first: string }
> = {
  hanzi: {
    name: "常用汉字",
    mark: "字",
    detail: "看字形，听组词",
    unit: "个字",
    first: "hanzi-706b",
  },
  numbers: {
    name: "认识数字",
    mark: "123",
    detail: "数数点点，认识 0 到 20",
    unit: "个数字",
    first: "n-3",
  },
  math: {
    name: "十以内加减",
    mark: "+ −",
    detail: "摆一摆，算一算",
    unit: "道题",
    first: "add-3-2",
  },
  pinyin: {
    name: "汉语拼音",
    mark: "ā",
    detail: "听发音，找拼音",
    unit: "项",
    first: "initial-b",
  },
  poems: {
    name: "小学古诗文",
    mark: "诗",
    detail: "逐句听读，遮句接背",
    unit: "条教材收录",
    first: "",
  },
  english: {
    name: "生活英语",
    mark: "Aa",
    detail: "听英语，认身边的词",
    unit: "个词",
    first: "en-cat",
  },
};
