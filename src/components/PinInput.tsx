import React, { useRef, useEffect, useState } from 'react';

interface PinInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  onComplete?: (value: string) => void;
  autoFocus?: boolean;
}

export function PinInput({
  value,
  onChange,
  disabled = false,
  onComplete,
  autoFocus = false
}: PinInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([null, null, null, null]);
  const [supportsWebkitSecurity, setSupportsWebkitSecurity] = useState(false);
  
  // Convert string value to array of digits, padding with empty strings
  const digits = value.split('').concat(Array(4).fill('')).slice(0, 4);

  useEffect(() => {
    // Check for webkit-text-security support to determine best masking strategy
    const supports = typeof document.body.style.webkitTextSecurity !== 'undefined';
    setSupportsWebkitSecurity(supports);
  }, []);

  useEffect(() => {
    if (autoFocus && !value) {
      inputRefs.current[0]?.focus();
    }
  }, [autoFocus, value]);

  const handleDigitChange = (index: number, inputValue: string) => {
    // Extract only the new digit, handling manual masking characters
    const cleanValue = inputValue.replace(/●/g, '');
    const newValue = cleanValue.replace(/[^0-9]/g, '').slice(-1);
    
    const newDigits = [...digits];
    
    if (newValue) {
      // Typing a digit
      newDigits[index] = newValue;
      const newPin = newDigits.join('');
      onChange(newPin);
      
      if (index < 3) {
        inputRefs.current[index + 1]?.focus();
      } else if (index === 3 && onComplete) {
        onComplete(newPin);
      }
    } else if (inputValue === '' || (digits[index] && inputValue === '')) {
      // Clearing a digit
      newDigits[index] = '';
      onChange(newDigits.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        // If current is empty, move back and delete previous
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        onChange(newDigits.join(''));
        inputRefs.current[index - 1]?.focus();
      } else {
        // Just clear current
        const newDigits = [...digits];
        newDigits[index] = '';
        onChange(newDigits.join(''));
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  return (
    <div className="flex gap-4 justify-center">
      {Array.from({ length: 4 }).map((_, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          // Use type="text" when webkitTextSecurity is supported to prevent OS password peeking
          type={supportsWebkitSecurity ? "text" : "password"}
          inputMode="numeric"
          // Manual masking: show bullet instead of digit
          value={digits[index] ? '●' : ''}
          onChange={(e) => handleDigitChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          disabled={disabled}
          maxLength={supportsWebkitSecurity ? 2 : 1} // Allow 2 chars briefly for masking logic
          className="w-14 h-14 text-center text-2xl font-bold bg-secondary border-2 border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-primary placeholder-tertiary disabled:opacity-50"
          style={{ 
            WebkitTextSecurity: 'disc',
            MozAppearance: 'textfield'
          } as React.CSSProperties}
          placeholder="-"
          autoComplete="new-password"
        />
      ))}
    </div>
  );
}
