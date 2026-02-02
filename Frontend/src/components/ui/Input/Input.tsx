import React from 'react';
import './Input.module.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  fullWidth = false,
  className = '',
  ...props
}) => {
  const baseClasses = 'input';
  const errorClass = error ? 'input-error' : '';
  const widthClass = fullWidth ? 'w-full' : '';
  
  const classes = [
    baseClasses,
    errorClass,
    widthClass,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={`input-wrapper ${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label className="input-label">
          {label}
        </label>
      )}
      <input
        className={classes}
        {...props}
      />
      {error && (
        <div className="input-error-message">
          {error}
        </div>
      )}
    </div>
  );
};