import EbookMenuWrapper from "./EbookMenuWrapper";
import { useState, forwardRef } from "react";
import EbookControlIconBtn from "../components/common/EbookControlIconBtn";

const EbookOptionMenu = ( {control, bookStyle, emitEvent, bookFlow, onToggle, bookOption, onBookStyleChange, onBookOptionChange}, ref ) => {
    const [fontFamily, setFontFamily] = useState('Origin' | 'Roboto')
    const [fontSize, setFontSize] = useState(16);
    const [lineHeight, setLineHeight] = useState(1.5);
    const [marginHorizontal, setMarginHorizontal] = useState(20);
    const [marginVertical, setMarginVertical] = useState(20);
    const [isScrollHorizontal, setIsScrollHorizontal] = useState(true);
    const [viewType, setViewType] = useState({
        active: true,
        spread: true,
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
                            뷰 방향
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

                </div>
            </EbookMenuWrapper>}

        </>
    );
}

export default forwardRef(EbookOptionMenu);