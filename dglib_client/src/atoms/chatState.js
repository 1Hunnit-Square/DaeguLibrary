import { atom } from 'recoil';

export const chatHistoryState = atom({
  key: 'chatHistoryState',
  default: [
    { role: "model", parts: "안녕하세용! 책벌레, 꿈틀이에용! 무엇이든 궁금한 게 있다면 꿈틀이에게 물어봐주세용! 꿈틀꿈틀🌱" }
  ]
});

export const isChatOpenState = atom({
  key: 'isChatOpenState',
  default: false
});

export const clientIdState = atom({
  key: 'clientIdState',
  default: ""
});

export const isChatAnimatingState = atom({
  key: 'isChatAnimatingState',
  default: false
});
