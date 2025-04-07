'use client';

import React, { useEffect, useState } from 'react';

interface HydrationWrapperProps {
  children: React.ReactNode;
}

export default function HydrationWrapper({ children }: HydrationWrapperProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // During server-side rendering and the first render on the client,
  // we'll return null to avoid hydration mismatches
  if (!isClient) {
    return null;
  }

  // After hydration is complete, we'll render the children
  return <>{children}</>;
} 