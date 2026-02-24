import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
  className?: string;
}

export function OTPInput({
  length = 5,
  value,
  onChange,
  onComplete,
  disabled = false,
  error = false,
  className
}: OTPInputProps) {
  const [otp, setOtp] = useState<string[]>(value.split('').slice(0, length));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Update internal state when external value changes
    const newOtp = value.split('').slice(0, length);
    while (newOtp.length < length) newOtp.push('');
    setOtp(newOtp);
  }, [value, length]);

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(0, 1); // Take only first character
    setOtp(newOtp);

    const otpString = newOtp.join('');
    onChange(otpString);

    // Auto-focus next input
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if complete
    if (otpString.length === length && onComplete) {
      onComplete(otpString);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // Move to previous input on backspace if current is empty
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const pastedDigits = pastedData.replace(/\D/g, '').slice(0, length);
    
    if (pastedDigits) {
      const newOtp = [...otp];
      for (let i = 0; i < pastedDigits.length; i++) {
        newOtp[i] = pastedDigits[i];
      }
      setOtp(newOtp);
      
      const otpString = newOtp.join('');
      onChange(otpString);
      
      if (otpString.length === length && onComplete) {
        onComplete(otpString);
      }
      
      // Focus last filled input or next empty
      const focusIndex = Math.min(pastedDigits.length, length - 1);
      inputRefs.current[focusIndex]?.focus();
    }
  };

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          pattern="\d*"
          maxLength={1}
          value={otp[index] || ''}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className={cn(
            "w-12 h-12 text-center text-xl font-bold border-2 rounded-lg transition-all",
            "focus:outline-none focus:ring-2 focus:ring-offset-2",
            error 
              ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200 dark:border-rose-800 dark:focus:ring-rose-900" 
              : "border-slate-200 focus:border-teal-500 focus:ring-teal-200 dark:border-slate-800 dark:focus:ring-teal-900",
            disabled && "opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-900"
          )}
          style={{
            backgroundColor: error ? '#fff1f2' : '#f8f9fa',
            color: '#122f2b'
          }}
        />
      ))}
    </div>
  );
}