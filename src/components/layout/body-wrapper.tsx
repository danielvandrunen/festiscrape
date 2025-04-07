'use client';

import React from 'react';

interface BodyWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function BodyWrapper({ children, className }: BodyWrapperProps) {
  return (
    <div className={className}>
      {children}
    </div>
  );
} 