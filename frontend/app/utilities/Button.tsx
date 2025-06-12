type ButtonProps = {
  variant?: "filled" | "outlined";
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
};

const Button = ({
  variant = "filled",
  children,
  onClick,
  className = "",
}: ButtonProps) => {
  const baseStyles =
    "px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150";

  const filledStyles =
    "border-2 border-blue-400 text-blue-400 text-white bg-blue-400 hover:bg-transparent hover:text-blue-400";

  const outlinedStyles =
    "border-2 border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white";

  const variantStyles = variant === "outlined" ? outlinedStyles : filledStyles;

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${variantStyles} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
