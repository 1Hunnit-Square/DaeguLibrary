const Footer = () => {
    return (
        <footer className="bg-[#f4f3f3] text-gray-700 border-t-1 border-gray-200 py-8">
            <div className="container mx-auto max-w-[80%]">
                <div className="flex flex-col md:flex-row justify-between items-start">
                    
                    <div className="mb-4 md:mb-0">
                        <div className="flex items-center mb-3">
                            <div>
                                <img src="/logo.png" className="w-35" />
                            </div>
                        </div>
                        
                        <div className="text-sm text-gray-700">
                            <div className="flex items-center mb-1">
                                <span className="inline-block">(42407) 대구광역시 남구 대명동 68-2</span>
                            </div>
                            <div className="flex items-center mb-1">
                                <span className="inline-block">대표전화 053) 269-3513</span>
                            </div>
                            <div className="flex items-center">
                                <span className="inline-block">팩스 053) 269-3530</span>
                            </div>
                        </div>
                    </div>

                   
                    <div className="hidden md:block">
                        <div 
                            className="hover:text-green-700 hover:cursor-pointer py-1 px-4 rounded text-sm"
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        >
                            TOP
                        </div>
                    </div>
                </div>

                <div className="mt-6 pt-4">
                    <ul className="flex flex-wrap gap-x-4 text-sm text-gray-700">
                        <li className="mb-2">
                            <a href="#" className="hover:text-green-700">개인정보처리방침</a>
                        </li>
                        <li className="mb-2">
                            <a href="#" className="hover:text-green-700">이용약관</a>
                        </li>
                        <li className="mb-2">
                            <a href="#" className="hover:text-green-700">이메일수집거부</a>
                        </li>
                        <li className="mb-2">
                            <a href="#" className="hover:text-green-700">사이트맵</a>
                        </li>
                    </ul>
                </div>
            </div>
        </footer>
    );
}

export default Footer;