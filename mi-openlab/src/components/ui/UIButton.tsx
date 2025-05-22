import type { ButtonHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

export type UIButtonVariant = 'primary' | 'outline' | 'ghost' | 'danger';

interface UIButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: UIButtonVariant;
  isLoading?: boolean;
  icon?: ReactNode;
}

export default function UIButton({
  children,
  variant = 'primary',
  isLoading = false,
  icon,
  className,
  disabled,
  ...props
}: UIButtonProps) {
  const baseStyles =
    'inline-flex items-center gap-2 justify-center rounded-lg text-sm font-medium transition px-4 py-2 focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variants: Record<UIButtonVariant, string> = {
    primary:
      'bg-primary text-white hover:bg-blue-700 focus:ring-blue-500 dark:bg-blue-600 dark:hover:bg-blue-500',
    outline:
      'border border-gray-300 text-dark dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-700 focus:ring-gray-400',
    ghost:
      'text-dark dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-700 focus:ring-gray-300',
    danger:
      'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={clsx(
        baseStyles,
        variants[variant],
        disabled && 'opacity-60 cursor-not-allowed',
        className
      )}
      {...props}
    >
      {isLoading ? (
        <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
      ) : (
        <>
          {icon && <span className="text-lg">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
}
