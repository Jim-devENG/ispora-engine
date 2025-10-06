import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Checkbox } from '../../components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { Switch } from '../../components/ui/switch';

interface MobileFormProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  submitLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function MobileForm({
  title,
  description,
  children,
  onSubmit,
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
  onCancel,
  isLoading = false
}: MobileFormProps) {
  return (
    <div className="max-w-md mx-auto p-4 space-y-6">
      {(title || description) && (
        <div className="text-center space-y-2">
          {title && (
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          )}
          {description && (
            <p className="text-gray-600">{description}</p>
          )}
        </div>
      )}

      <Card>
        <CardContent className="p-6">
          <form onSubmit={onSubmit} className="space-y-6">
            {children}
            
            <div className="flex flex-col gap-3 pt-4">
              <Button 
                type="submit" 
                className="w-full h-12 text-base"
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : submitLabel}
              </Button>
              {onCancel && (
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full h-12 text-base"
                  onClick={onCancel}
                >
                  {cancelLabel}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// Mobile-optimized form field components
export function MobileFormField({ 
  label, 
  children, 
  required = false,
  error,
  description 
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  error?: string;
  description?: string;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-base font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {description && (
        <p className="text-sm text-gray-500">{description}</p>
      )}
      <div className="min-h-[44px]">
        {children}
      </div>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}

export function MobileInput({ 
  className = '', 
  ...props 
}: React.ComponentProps<typeof Input>) {
  return (
    <Input 
      className={`h-12 text-base ${className}`}
      {...props} 
    />
  );
}

export function MobileTextarea({ 
  className = '', 
  ...props 
}: React.ComponentProps<typeof Textarea>) {
  return (
    <Textarea 
      className={`min-h-[100px] text-base ${className}`}
      {...props} 
    />
  );
}

export function MobileSelect({ 
  children, 
  className = '',
  ...props 
}: React.ComponentProps<typeof SelectTrigger>) {
  return (
    <Select>
      <SelectTrigger className={`h-12 text-base ${className}`} {...props}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {children}
      </SelectContent>
    </Select>
  );
}

export function MobileCheckbox({ 
  label, 
  description,
  ...props 
}: {
  label: string;
  description?: string;
} & React.ComponentProps<typeof Checkbox>) {
  return (
    <div className="flex items-start space-x-3">
      <Checkbox 
        className="mt-1 h-5 w-5" 
        {...props} 
      />
      <div className="space-y-1">
        <Label className="text-base font-medium cursor-pointer">
          {label}
        </Label>
        {description && (
          <p className="text-sm text-gray-500">{description}</p>
        )}
      </div>
    </div>
  );
}

export function MobileRadioGroup({ 
  options, 
  ...props 
}: {
  options: Array<{ value: string; label: string; description?: string }>;
} & React.ComponentProps<typeof RadioGroup>) {
  return (
    <RadioGroup {...props}>
      {options.map((option) => (
        <div key={option.value} className="flex items-start space-x-3">
          <RadioGroupItem 
            value={option.value} 
            id={option.value}
            className="mt-1 h-5 w-5"
          />
          <div className="space-y-1">
            <Label 
              htmlFor={option.value}
              className="text-base font-medium cursor-pointer"
            >
              {option.label}
            </Label>
            {option.description && (
              <p className="text-sm text-gray-500">{option.description}</p>
            )}
          </div>
        </div>
      ))}
    </RadioGroup>
  );
}

export function MobileSwitch({ 
  label, 
  description,
  ...props 
}: {
  label: string;
  description?: string;
} & React.ComponentProps<typeof Switch>) {
  return (
    <div className="flex items-start space-x-3">
      <Switch 
        className="mt-1" 
        {...props} 
      />
      <div className="space-y-1">
        <Label className="text-base font-medium cursor-pointer">
          {label}
        </Label>
        {description && (
          <p className="text-sm text-gray-500">{description}</p>
        )}
      </div>
    </div>
  );
}
