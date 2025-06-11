export const menuVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { 
        opacity: 1, 
        height: 'auto',
        transition: { 
            duration: 0.4, 
            ease: [0.22, 1, 0.36, 1],
            staggerChildren: 0.07
        }
    },
    exit: { 
        opacity: 0, 
        height: 0,
        transition: {
            duration: 0.3,
            ease: [0.65, 0, 0.35, 1]
        }
    }
};

export const subMenuVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: { y: 0, opacity: 1 }
};


export const subMenuContainerVariants = {
    visible: {
        transition: {
            staggerChildren: 0.05
        }
    }
};