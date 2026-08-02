import type { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return <div style={{ maxWidth: 1100, margin: '0 auto' }}>{children}</div>;
}
