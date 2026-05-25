import { forwardRef, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const variants = {
  default: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm shadow-primary/20',
  destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm shadow-destructive/20',
  outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground text-foreground shadow-sm',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  ghost: 'hover:bg-accent text-muted-foreground hover:text-accent-foreground',
  link: 'text-primary underline-offset-4 hover:underline',
  gradient: 'gradient-primary text-white shadow-md shadow-primary/20',
} as const;

const sizes = {
  default: 'h-10 px-4 py-2',
  sm: 'h-8 rounded-lg px-3 text-xs',
  lg: 'h-11 rounded-xl px-8 text-base',
  icon: 'h-10 w-10 rounded-xl',
} as const;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]',
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
