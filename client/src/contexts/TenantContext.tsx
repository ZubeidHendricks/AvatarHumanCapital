import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import axios from 'axios';
import type { TenantConfig } from '@shared/schema';

interface TenantContextType {
  tenant: TenantConfig | null;
  loading: boolean;
  error: string | null;
}

const TenantContext = createContext<TenantContextType>({
  tenant: null,
  loading: true,
  error: null,
});

export function TenantProvider({ children }: { children: ReactNode }) {
  const [tenant, setTenant] = useState<TenantConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTenant() {
      try {
        const response = await axios.get<TenantConfig>('/api/tenant/current');
        setTenant(response.data);
        
        // Apply branding to document
        if (response.data.primaryColor) {
          document.documentElement.style.setProperty('--primary', response.data.primaryColor);
        }
        
        // Update document title
        if (response.data.companyName) {
          document.title = `${response.data.companyName} - AHC`;
        }
      } catch (err) {
        console.error('Failed to load tenant:', err);
        setError('Failed to load tenant configuration');
      } finally {
        setLoading(false);
      }
    }

    loadTenant();
  }, []);

  return (
    <TenantContext.Provider value={{ tenant, loading, error }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}
