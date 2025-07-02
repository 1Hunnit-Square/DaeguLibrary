import EbookMenuWrapper from "./EbookMenuWrapper";
import { useState, forwardRef, useRef, useCallback, useEffect } from "react";
import EbookControlIconBtn from "../components/common/EbookControlIconBtn";
import { DownIcon } from "../svg";
import EbookOptionSlider from "../components/common/EbookOptionSlider";

const EbookOptionMenu = ( {control, bookStyle, emitEvent, bookFlow, onToggle, bookOption, onBookStyleChange, onBookOptionChange}, ref ) => {
    const [fontFamily, setFontFamily] = useState(bookStyle.fontFamily)
    const valueList = [
      "맑은 고딕",           
      "굴림",               
      "돋움",
      "바탕",
      "궁서",      
  ];
    const [fontSize, setFontSize] = useState(bookStyle.fontSize);
    const [lineHeight, setLineHeight] = useState(bookStyle.lineHeight);
    const [marginHorizontal, setMarginHorizontal] = useState(bookStyle.marginHorizontal);
    const [marginVertical, setMarginVertical] = useState(bookStyle.marginVertical);
    const [isScrollHorizontal, setIsScrollHorizontal] = useState(true);
    const [viewType, setViewType] = useState({
        active: true,
        spread: true,
    })
    const dropdownRef = useRef(null);
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const value = fontFamily === "맑은 고딕" ? "맑은 고딕" : fontFamily;
    const dropDownOnToggle = useCallback(() => setDropdownVisible(!dropdownVisible), [dropdownVisible]);
    const onDropdownClose = useCallback((e) => {
      if (!dropdownRef || !dropdownRef.current) return;
      if (!dropdownRef.current.contains(e.target)) {
        dropDownOnToggle();
      }
    })

    const onClickDirection = (type) => {
    if (type === "Horizontal") {
      setIsScrollHorizontal(true);
      setViewType({ ...viewType, active: true });
      onBookOptionChange({
        ...bookOption,
        flow: "paginated"
      });
    } else {
      setIsScrollHorizontal(false);
      setViewType({ ...viewType, active: false });
      onBookOptionChange({
        ...bookOption,
        flow: "scrolled-doc"
      });
    }
  }
  const onClickViewType = (isSpread) => {
    if (isSpread) {
      setViewType({ ...viewType, spread: true });
      onBookOptionChange({
        ...bookOption,
        spread: "auto"
      });
    } else {
      setViewType({ ...viewType, spread: false });
      onBookOptionChange({
        ...bookOption,
        spread: "none"
      });
    }
  }
  const onSelectFontFamily = (font) => setFontFamily(font);

  const onChangeSlider = (type, e) => {
    if (!e || !e.target) return;
    switch (type) {
      case 'FontSize':
        setFontSize(e.target.value);
        break;
      case 'LineHeight':
        setLineHeight(e.target.value);
        break;
      case 'MarginHorizontal':
        setMarginHorizontal(e.target.value);
        break;
      case 'MarginVertical':
        setMarginVertical(e.target.value);
        break;
      default:
        break;
    }
  }

  useEffect(() => {
  if (dropdownVisible) {
    document.addEventListener('click', onDropdownClose);
  } else {
    document.removeEventListener('click', onDropdownClose);
  }
  return () => {
    document.removeEventListener('click', onDropdownClose);
  }
}, [dropdownVisible, onDropdownClose]);

useEffect(() => {
    const timer = window.setTimeout(() => {
      onBookStyleChange({
        fontFamily,
        fontSize,
        lineHeight,
        marginHorizontal,
        marginVertical
      });
    }, 250);

    return () => window.clearTimeout(timer);
  }, [
    fontFamily,
    fontSize,
    lineHeight,
    marginHorizontal,
    marginVertical
  ]);

  useEffect(() => emitEvent(), [bookStyle, emitEvent]);


    return (
        <>
            {control?.display && <EbookMenuWrapper
                title="옵션"
                show={control.open}
                onClose={onToggle}
                ref={ref}
            >
                <div name="optionLayout" className="box-border p-6">
                    <div name="optionWrapper" className="mb-6">
                        <div name="optionTitle" className="text-sm font-medium mb-4">
                            읽기 방향
                        </div>
                        <div name="BtnWrapper" className="flex items-center justify-around py-2">
                           <EbookControlIconBtn type="ScrollHorizontal"
                          alt="Horizontal View"
                          active={true}
                          isSelected={isScrollHorizontal}
                          onClick={() => onClickDirection("Horizontal")}/>
                          <EbookControlIconBtn type="ScrollVertical"
                          alt="Vertical View"
                          active={true}
                          isSelected={!isScrollHorizontal}
                          onClick={() => onClickDirection("Vertical")} />
                        </div>
                    </div>
                    <div name="optionWrapper" className="mb-6">
                        <div name="optionTitle" className="text-sm font-medium mb-4">
                            보기 방식
                        </div>
                        <div name="BtnWrapper" className="flex items-center justify-around py-2">
                           <EbookControlIconBtn type="BookOpen"
                          alt="Two Page View"
                          active={viewType.active}
                          isSelected={viewType.spread}
                          onClick={() => onClickViewType(true)} />
                          <EbookControlIconBtn type="BookClose"
                          alt="One Page View"
                          active={viewType.active}
                          isSelected={!viewType.spread}
                          onClick={() => onClickViewType(false)} />
                        </div>
                    </div>
                    <div name="optionWrapper optionDropdown" className="mb-6">
                        <div name="optionTitle" className="text-sm font-medium mb-4">
                              폰트
                        </div>
                        <div name="ropdownWrapper" className="relative" ref={dropdownRef}>
                          <div name="dropdownValue">
                            <div name="container" className={`flex items-center justify-between relative w-full h-10
                            bg-white border-2 box-border px-4 cursor-pointer z-[4] transition-all duration-100 text-left outline-none hover:border-green-600 focus:border-green-600
                              ${dropdownVisible
                                ? 'border-green-600 rounded-t-[20px]'
                                : 'border-gray-300 rounded-[20px]'
                              }
                            `} title="폰트 선택"
                            onClick={dropDownOnToggle}>
                              <div name="content" className="flex-grow mr-4 text-sm">
                                {value}
                              </div>
                              <div name="icon" className={`flex w-3 h-3 opacity-30 ${dropdownVisible ? '[&>svg]:rotate-180' : '[&>svg]:rotate-0'} [&>svg]:origin-center [&>svg]:transition-transform`}>
                                <DownIcon />
                              </div>
                            </div>
                          </div>
                          <div name="dropdownItemWrapper" className={`
                            absolute top-full left-0 w-full max-h-[200px] overflow-y-auto
                            box-border pb-4 bg-white border-2 border-green-600 z-[3]
                            transition-all duration-400 origin-top
                            ${dropdownVisible
                              ? 'rounded-b-[20px] opacity-100 -translate-y-0.5 scale-y-100'
                              : 'rounded-[20px] opacity-0 -translate-y-10 scale-y-0 pointer-events-none'
                            }
                          `}>
                          {valueList.map(font => (
                            <div name="dropdownItem" className="w-full h-10 box-border px-4 transition-all
                            duration-100 text-sm leading-10 cursor-pointer text-left outline-none hover:bg-black/5 focus:bg-black/5"
                              onClick={() => {
                              onSelectFontFamily(font)
                              dropDownOnToggle()}} key={font}>
                                {font === "Origin" ? "Original" : font}
                            </div>
                          ))}
                          </div>
                        </div>
                    </div>
                    <EbookOptionSlider active={true} title="폰트 크기" minValue={8} maxValue={36} defaultValue={fontSize} step={1} onChange={(e) => onChangeSlider("FontSize", e) } />
                    <EbookOptionSlider active={true} title="줄 간격" minValue={1} maxValue={3} defaultValue={lineHeight} step={0.1} onChange={(e) => onChangeSlider("LineHeight", e) } />
                    <EbookOptionSlider active={true} title="좌우 여백" minValue={0} maxValue={100} defaultValue={marginHorizontal} step={1} onChange={(e) => onChangeSlider("MarginHorizontal", e) } />
                    <EbookOptionSlider active={bookFlow === "paginated"} title="상하여백" minValue={0} maxValue={100} defaultValue={marginVertical} step={1} onChange={(e) => onChangeSlider("MarginVertical", e) } />
                </div>
            </EbookMenuWrapper>}

        </>
    );
}

export default forwardRef(EbookOptionMenu);