import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'cyber';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  isLoading = false,
  disabled,
  ...props 
}) => {
  
  const baseStyles = "inline-flex items-center justify-center font-bold transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed tracking-wider uppercase font-display";
  
  const variants = {
    primary: "bg-moto-accent text-white hover:bg-red-600 shadow-[0_0_15px_rgba(255,31,31,0.4)] hover:shadow-[0_0_25px_rgba(255,31,31,0.6)] rounded-sm skew-x-[-6deg]",
    cyber: "bg-transparent border border-moto-accent text-moto-accent hover:bg-moto-accent hover:text-white shadow-[0_0_10px_rgba(255,31,31,0.2)] hover:shadow-[0_0_20px_rgba(255,31,31,0.5)] rounded-none skew-x-[-6deg]",
    secondary: "bg-white text-black hover:bg-gray-200 rounded-sm skew-x-[-6deg]",
    outline: "border border-gray-600 text-gray-300 hover:border-white hover:text-white rounded-sm bg-transparent",
    ghost: "text-gray-400 hover:text-white hover:bg-white/5 rounded-sm"
  };

  const sizes = {
    sm: "px-4 py-1.5 text-xs",
    md: "px-6 py-2.5 text-sm",
    lg: "px-8 py-4 text-base"
  };

  // Remove skew for inner content to keep text readable
  const contentClass = variant === 'primary' || variant === 'cyber' || variant === 'secondary' ? "skew-x-[6deg]" : "";

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      <span className={`flex items-center gap-2 ${contentClass}`}>
        {isLoading ? (
          <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : null}
        {children}
      </span>
    </button>
  );
};