import { atom } from 'recoil';

export const chatHistoryState = atom({
  key: 'chatHistoryState',
  default: [
    { role: "model", parts: "안녕하세요! 대구도서관 챗봇 AI 꿈틀이예요! 🐾 무엇을 도와드릴까요?" }
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