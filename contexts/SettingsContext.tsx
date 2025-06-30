import React, { createContext, useContext, useState, ReactNode } from 'react';

export type WeightUnit = 'Pounds' | 'Kilograms';

interface SettingsContextType {
  weightUnit: WeightUnit;
  setWeightUnit: (unit: WeightUnit) => void;
  weightUnitLabel: string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const weightUnitLabels = {
  Pounds: 'Lbs',
  Kilograms: 'Kg'
};

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('Pounds');

  const weightUnitLabel = weightUnitLabels[weightUnit];

  return (
    <SettingsContext.Provider value={{
      weightUnit,
      setWeightUnit,
      weightUnitLabel
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}; 