const EBookHeader = ({onNavToggle, onOptionToggle}) => {
    return (
        <div className="h-16 border flex items-center justify-end">
            <h1 className="text-xl font-bold mr-10 hover:cursor-pointer" onClick={() => {
                onNavToggle();
            }}>목차</h1>
            <h1 className="text-xl font-bold mr-10 hover:cursor-pointer" onClick={() => {
                onOptionToggle();
            }}>설정</h1>

        </div>
    );
}

export default EBookHeader;