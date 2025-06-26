const EbookOptionSlider = ({active, title, minValue, maxValue, defaultValue, step, onChange}) => {
    const percentage = Math.round((defaultValue - minValue) / (maxValue - minValue) * 100);

    return (
        <div name="optionWrapper" className="mb-6">
            <div name="optionTitle" className="text-sm font-medium mb-4">{title}</div>

            <div name="sliderWrapper" className="flex items-center h-5">
                <div name="optionValue" className={`inline-block text-sm mr-2 w-10 text-right leading-5 ${active ? 'text-green-800' : 'text-gray-400'}`}>{defaultValue}</div>
                    <span name="icon" className="text-[12px] font-medium text-gray-400 mx-2 leading-[20px]">-</span>
                    <div name="sliderInWrapper" className="flex flex-1 relative w-auto">
                        <div name="sliderBackground" className="absolute w-full h-[6px] bg-[#eee] rounded-[6px] z-0"></div>
                        <div name="sliderBar"
                            className={`
                            absolute top-1/2 left-0 -translate-y-1/2 h-[6px] rounded-l-[6px] z-[1]
                            ${active ? 'bg-green-600' : 'bg-gray-300'}
                            `}
                            style={{ width: `${percentage}%` }}>
                        </div>
                        <input
                            name="slider"
                            type="range"
                            min={minValue}
                            max={maxValue}
                            step={step}
                            value={defaultValue}
                            onChange={onChange}
                            className={`
                                appearance-none w-full h-[6px] bg-transparent rounded-[6px] m-0 z-[2] outline-none
                                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[18px] [&::-webkit-slider-thumb]:h-[18px]
                                [&::-webkit-slider-thumb]:rounded-[18px] [&::-webkit-slider-thumb]:bg-white
                                [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:duration-200
                                [&::-webkit-slider-thumb]:shadow-[0px_8px_12px_rgba(0,0,0,0.2)]
                                ${active
                                ? `[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-green-600 [&::-webkit-slider-thumb]:cursor-pointer
                                hover:[&::-webkit-slider-thumb]:bg-green-100 hover:[&::-webkit-slider-thumb]:shadow-[0px_8px_12px_rgba(0,0,0,0.2)]
                                active:[&::-webkit-slider-thumb]:shadow-none active:[&::-webkit-slider-thumb]:bg-green-600
                                focus:[&::-webkit-slider-thumb]:shadow-none focus:[&::-webkit-slider-thumb]:bg-green-500`
                                : '[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-gray-400 [&::-webkit-slider-thumb]:cursor-default'
                                }
                                ${!active ? 'pointer-events-none select-none' : ''}
                            `}
                            />
                    </div>
                    <span name="icon" className="text-[12px] font-medium text-gray-400 mx-2 leading-[20px]">+</span>
            </div>
        </div>
    )
}

export default EbookOptionSlider;