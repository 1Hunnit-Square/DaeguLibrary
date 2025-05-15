import { useState, useRef, useEffect } from 'react';
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
    const menuRefs = useRef([]);
    const menuItems = useRecoilValue(menuItemsSelector);
    const navigate = useNavigate();

    useEffect(() => {
        if (menuRefs.current.length === menuItems.length) {
            const widths = menuRefs.current.map(ref =>
                ref?.getBoundingClientRect().width || 0
            );
            setMenuWidths(widths);
        }
    }, [menuItems.length]);

    const handleNavigation = (e, path) => {
        e.preventDefault();
        if (isHovering || activeMenuIndex !== null) {
            setIsHovering(false);
            setActiveMenuIndex(null);
        }
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

    return (
        <div className="relative w-full" onMouseLeave={handleMouseLeave}>
            <div className="flex justify-center py-3 bg-white relative">
                <div className="flex items-end">
                    {menuItems.map((menu, index) => (
                        <div
                            key={menu.id}
                            ref={el => {
                                if (el && !menuRefs.current[index]) {
                                    menuRefs.current[index] = el;
                                }
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
                        className="absolute left-0 w-full bg-white border-b border-b-gray-300 z-10 shadow-md"
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
    );
};

export default MainMenu;
