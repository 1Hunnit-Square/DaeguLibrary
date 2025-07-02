import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { menuItemsSelector } from './menuItems';
import { useRecoilValue } from 'recoil';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    menuVariants,
    subMenuVariants,
    subMenuContainerVariants,
} from '../animations/menuAnimation';

const MainMenu = () => {
    const [isHovering, setIsHovering] = useState(false);
    const [menuWidths, setMenuWidths] = useState([]);
    const [activeMenuIndex, setActiveMenuIndex] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeMobileSubmenu, setActiveMobileSubmenu] = useState(null);
    const menuRefs = useRef([]);
    const menuItems = useRecoilValue(menuItemsSelector);
    const navigate = useNavigate();
    

    useLayoutEffect(() => {
        const calculateWidths = () => {
            if (window.innerWidth >= 1024 && menuRefs.current.length === menuItems.length) {
                const widths = menuRefs.current.map(ref => 
                    ref ? ref.getBoundingClientRect().width : 0
                );
                setMenuWidths(widths);
            }
        };

        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setTimeout(calculateWidths, 150);
            } else {
                setMenuWidths([]);
            }
        };

       
        calculateWidths();

        window.addEventListener('resize', handleResize);
        
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [menuItems.length]);

    const handleNavigation = (e, path) => {
        e.preventDefault();
        if (isHovering || activeMenuIndex !== null) {
            setIsHovering(false);
            setActiveMenuIndex(null);
        }
        setIsMobileMenuOpen(false);
        setActiveMobileSubmenu(null);
        navigate(path);
    };

    const handleMouseEnter = (index) => {
        if (activeMenuIndex !== index) {
            setActiveMenuIndex(index);
        }
        if (!isHovering) {
            setIsHovering(true);
        }
    };

    const handleMouseLeave = () => {
        if (isHovering || activeMenuIndex !== null) {
            setIsHovering(false);
            setActiveMenuIndex(null);
        }
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
        setActiveMobileSubmenu(null);
    };

    const toggleMobileSubmenu = (index) => {
        setActiveMobileSubmenu(activeMobileSubmenu === index ? null : index);
    };

    return (
        <div className="relative w-full">

            <div className="hidden lg:block" onMouseLeave={handleMouseLeave}>
                <div className="flex justify-center py-3 bg-white relative">
                    <div className="flex items-end">
                        {menuItems.map((menu, index) => (
                            <div
                                key={menu.id}
                                ref={el => {
                                    menuRefs.current[index] = el; 
                                }}
                                className="px-12 relative"
                                onMouseEnter={() => handleMouseEnter(index)}
                            >
                                <div className="h-full flex items-center justify-center relative">
                                    <a
                                        href={menu.link}
                                        onClick={(e) => handleNavigation(e, menu.link)}
                                        className={`block text-center whitespace-nowrap ${
                                            activeMenuIndex === index
                                                ? 'text-emerald-700 font-bold scale-105'
                                                : 'hover:text-emerald-500'
                                        }`}
                                    >
                                        {menu.title}
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="w-full h-[1px] bg-gray-300"></div>

                <AnimatePresence>
                    {isHovering && (
                        <motion.div
                            className="absolute left-0 w-full bg-white border-b border-b-gray-300 z-150 shadow-md"
                            variants={menuVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            <div className="flex justify-center">
                                {menuItems.map((menu, index) => (
                                    <div
                                        key={menu.id}
                                        className="px-6 flex justify-center"
                                        style={{ width: `${menuWidths[index] || 0}px` }}
                                        onMouseEnter={() => handleMouseEnter(index)}
                                    >
                                        <motion.ul
                                            className="py-4 text-center"
                                            initial="hidden"
                                            animate="visible"
                                            variants={subMenuContainerVariants}
                                        >
                                            {menu.subMenus.map((subMenu, subIndex) => (
                                                <motion.li
                                                    key={subIndex}
                                                    className="py-2"
                                                    variants={subMenuVariants}
                                                    transition={{ duration: 0.3 }}
                                                >
                                                    <a
                                                        href={subMenu.link}
                                                        onClick={(e) => handleNavigation(e, subMenu.link)}
                                                        className="block text-xs whitespace-nowrap hover:text-emerald-700 hover:font-bold"
                                                    >
                                                        {subMenu.name}
                                                    </a>
                                                </motion.li>
                                            ))}
                                        </motion.ul>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* 햄버거 */}
            <div className="lg:hidden bg-white border-b border-gray-300 relative">
                <div className="flex justify-between items-center px-4 py-3">
                    <span className=""></span>
                    <button
                        onClick={toggleMobileMenu}
                        className="p-2 rounded-md hover:bg-gray-100 focus:outline-none"
                    >
                        <div className="space-y-1">
                            <div className={`w-6 h-0.5 bg-gray-600 transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></div>
                            <div className={`w-6 h-0.5 bg-gray-600 transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></div>
                            <div className={`w-6 h-0.5 bg-gray-600 transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></div>
                        </div>
                    </button>
                </div>

                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            className="absolute top-full left-0 w-full bg-white border-t border-gray-200 shadow-lg z-150 overflow-hidden"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                            <div className="max-h-96 overflow-y-auto">
                                {menuItems.map((menu, index) => (
                                    <motion.div
                                        key={menu.id}
                                        className="border-b border-gray-100 last:border-b-0"
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05, duration: 0.2 }}
                                    >
                                        <button
                                            onClick={() => toggleMobileSubmenu(index)}
                                            className="w-full px-4 py-3 text-left flex justify-between items-center hover:bg-gray-50 focus:outline-none"
                                        >
                                            <span className="font-medium text-gray-900">{menu.title}</span>
                                            <svg
                                                className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                                                    activeMobileSubmenu === index ? 'rotate-180' : ''
                                                }`}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>

                                        <AnimatePresence>
                                            {activeMobileSubmenu === index && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="bg-gray-50 overflow-hidden"
                                                >
                                                    {menu.subMenus.map((subMenu, subIndex) => (
                                                        <motion.a
                                                            key={subIndex}
                                                            href={subMenu.link}
                                                            onClick={(e) => handleNavigation(e, subMenu.link)}
                                                            className="block px-8 py-2 text-sm text-gray-600 hover:text-emerald-700 hover:bg-gray-100"
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: subIndex * 0.03, duration: 0.15 }}
                                                        >
                                                            {subMenu.name}
                                                        </motion.a>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default MainMenu;