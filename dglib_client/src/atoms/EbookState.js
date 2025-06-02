import { atom } from 'recoil';

export const bookInfoState = atom({
  key: 'bookInfoState',
  default: {
    coverURL: '',
    title: '',
    description: '',
    published_date: '',
    modified_date: '',
    author: '',
    publisher: '',
    language: ''
  },
});

export const bookTocState = atom({
  key: 'bookTocState',
  default: [],
});

export const currentLocationState = atom({
  key: 'currentLocationState',
  default: {
    chapterName: '',
    progress: 0,
    startCfi: '',
    endCfi: '',
    base: ''
  },
});