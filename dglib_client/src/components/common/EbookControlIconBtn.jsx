import { ScrollHorizontalIcon, ScrollVerticalIcon, BookCloseIcon, BookOpenIcon } from "../../svg";

const EbookControlIconBtn = ({ type, alt, active, isSelected, onClick }) => {
  let HeaderIcon = null;
  switch (type) {
    case "ScrollVertical":
      HeaderIcon = ScrollVerticalIcon;
      break;
    case "ScrollHorizontal":
      HeaderIcon = ScrollHorizontalIcon;
      break;
    case "BookOpen":
      HeaderIcon = BookOpenIcon;
      break;
    case "BookClose":
      HeaderIcon = BookCloseIcon;
      break;
  }

  const onClickBtn = () => {
    if (active && !isSelected) onClick();
  }

  return (
    <button
      onClick={onClickBtn}
      title={alt}
      className={`relative h-full px-3 flex items-center justify-center z-0 transition-all duration-300 outline-none before:content-[''] before:absolute before:left-0 before:right-0 before:top-0 before:bottom-0 before:m-auto before:-z-10 before:rounded-full before:transition-all before:duration-100 before:bg-green-600 ${
        active
          ? 'opacity-100 cursor-pointer hover:before:w-8 hover:before:h-8 hover:before:opacity-100'
          : 'opacity-30 cursor-default'
      } ${
        isSelected && active
          ? 'before:w-8 before:h-8 before:opacity-70'
          : 'before:w-0 before:h-0 before:opacity-0'
      }`}
        >
      <div className="w-4 h-4">
        <HeaderIcon className="w-4 h-4" />
      </div>
    </button>
  );
}

export default EbookControlIconBtn;