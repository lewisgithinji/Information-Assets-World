import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Check, X } from 'lucide-react';

interface PasswordStrengthIndicatorProps {
  password: string;
}

export default function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const checks = [
    {
      label: 'At least 8 characters',
      test: (pwd: string) => pwd.length >= 8
    },
    {
      label: 'Contains uppercase letter',
      test: (pwd: string) => /[A-Z]/.test(pwd)
    },
    {
      label: 'Contains lowercase letter', 
      test: (pwd: string) => /[a-z]/.test(pwd)
    },
    {
      label: 'Contains number',
      test: (pwd: string) => /\d/.test(pwd)
    },
    {
      label: 'Contains special character',
      test: (pwd: string) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd)
    }
  ];

  const passedChecks = checks.filter(check => check.test(password)).length;
  const strength = (passedChecks / checks.length) * 100;

  const getStrengthColor = () => {
    if (strength < 40) return 'bg-red-500';
    if (strength < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthLabel = () => {
    if (strength < 40) return 'Weak';
    if (strength < 70) return 'Medium';
    return 'Strong';
  };

  if (!password) return null;

  return (
    <div className="space-y-3 mt-2">
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span>Password Strength</span>
          <span className={`font-medium ${
            strength < 40 ? 'text-red-600' : 
            strength < 70 ? 'text-yellow-600' : 
            'text-green-600'
          }`}>
            {getStrengthLabel()}
          </span>
        </div>
        <Progress 
          value={strength} 
          className="h-2"
        />
      </div>
      
      <div className="space-y-1">
        {checks.map((check, index) => {
          const passed = check.test(password);
          return (
            <div key={index} className="flex items-center gap-2 text-sm">
              {passed ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <X className="h-4 w-4 text-red-600" />
              )}
              <span className={passed ? 'text-green-600' : 'text-muted-foreground'}>
                {check.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}