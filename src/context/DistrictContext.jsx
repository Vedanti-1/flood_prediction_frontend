import { createContext, useContext, useState } from 'react';

const DistrictContext = createContext(null);

export function DistrictProvider({ children }) {
  const [district, setDistrict] = useState('');
  return (
    <DistrictContext.Provider value={{ district, setDistrict }}>
      {children}
    </DistrictContext.Provider>
  );
}

export function useDistrict() {
  const ctx = useContext(DistrictContext);
  if (!ctx) throw new Error('useDistrict must be used within DistrictProvider');
  return ctx;
}
