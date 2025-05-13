const Button = ({ children, onClick, className = '' }) => (
    <button
      onClick={onClick}
      className={`cursor-pointer px-4 py-2 bg-[#00893B] text-white rounded hover:bg-[#006C2D] ${className}`}
    >
      {children}
    </button>
  );

export default Button;