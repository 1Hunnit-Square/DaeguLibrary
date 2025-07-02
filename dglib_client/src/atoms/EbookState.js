import { atom } from 'recoil';

export const bookInfoState = atom({
  key: 'bookInfoState',
  default: {
    ebookCover: '',
    ebookTitle: '',
    ebookAuthor: '',
    ebookPublisher: '',
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
    base: '',
    currentPage: 0,
  },
});

export const bookLabelState = atom({
  key: "bookLabelState",
  default: {
    ebookId: "",
    highlights: [],
  }
});
