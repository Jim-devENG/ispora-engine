import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';

const buttonVariants = cva('modern-button focus-visible-modern duration-200 hover-lift', {
  variants: {
    variant: {
      default: 'modern-button-primary shadow-sm hover:shadow-md',
      destructive:
        'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm hover:shadow-md',
      outline: 'modern-button-secondary hover:shadow-sm',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm',
      ghost: 'hover:bg-accent hover:text-accent-foreground transition-all duration-200',
      link: 'text-primary underline-offset-4 hover:underline p-0 h-auto',
    },
    size: {
      default: 'h-10 px-6 py-2 has-[>svg]:px-4 rounded-lg',
      sm: 'h-8 px-4 py-1.5 has-[>svg]:px-3 rounded-md text-xs',
      lg: 'h-12 px-8 py-3 has-[>svg]:px-6 rounded-lg text-base',
      icon: 'size-10 rounded-lg',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<'button'> &
    VariantProps<typeof buttonVariants> & {
      asChild?: boolean;
    }
>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      ref={ref}
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
});

Button.displayName = 'Button';

export { Button, buttonVariants };
