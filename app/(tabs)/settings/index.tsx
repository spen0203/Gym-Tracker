import { StyleSheet, TouchableOpacity, View as RNView } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useSettings } from '@/contexts/SettingsContext';
import { useState } from 'react';

export default function SettingsScreen() {
  const { weightUnit, setWeightUnit, weightUnitLabel } = useSettings();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleWeightUnitChange = (unit: 'Pounds' | 'Kilograms') => {
    setWeightUnit(unit);
    setIsDropdownOpen(false);
  };

  const weightUnitOptions = [
    { label: 'Pounds (Lbs)', value: 'Pounds' },
    { label: 'Kilograms (Kg)', value: 'Kilograms' }
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Weight Unit</Text>
        <Text style={styles.sectionDescription}>Select your preferred weight unit for workouts</Text>
        
        <View style={styles.dropdownContainer}>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <Text style={styles.dropdownButtonText}>
              {weightUnit} ({weightUnitLabel})
            </Text>
            <Text style={[styles.dropdownArrow, isDropdownOpen && styles.dropdownArrowUp]}>
              ▼
            </Text>
          </TouchableOpacity>
          
          {isDropdownOpen && (
            <View style={styles.dropdownOptions}>
              {weightUnitOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.dropdownOption,
                    weightUnit === option.value && styles.selectedOption
                  ]}
                  onPress={() => handleWeightUnitChange(option.value as 'Pounds' | 'Kilograms')}
                >
                  <Text style={[
                    styles.dropdownOptionText,
                    weightUnit === option.value && styles.selectedOptionText
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#333',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  sectionDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginTop: 5,
    backgroundColor: '#fff',
  },
  dropdownButton: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownArrow: {
    fontSize: 16,
    color: '#666',
  },
  dropdownOptions: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginTop: 5,
    backgroundColor: '#fff',
  },
  dropdownOption: {
    padding: 10,
  },
  selectedOption: {
    backgroundColor: '#e0e0e0',
  },
  dropdownOptionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedOptionText: {
    fontWeight: 'bold',
  },
  dropdownArrowUp: {
    transform: [{ rotate: '180deg' }],
  },
}); 