import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CustomHeaderProps {
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  leftDisabled?: boolean;
  rightDisabled?: boolean;
}

const { width } = Dimensions.get('window');

export default function CustomHeader({
  leftIcon = 'menu',
  rightIcon = 'settings',
  onLeftPress,
  onRightPress,
  leftDisabled = false,
  rightDisabled = false,
}: CustomHeaderProps) {
  return (
    <View style={styles.header}>
      {/* Left Section */}
      {!leftDisabled && (
        <TouchableOpacity
          style={styles.iconContainer}
          onPress={onLeftPress}
        >
          <Ionicons name={leftIcon} size={24} color="#000" />
        </TouchableOpacity>
      )}

      {/* Center Section */}
      <View style={styles.centerContainer}>
        <Text style={styles.title}>Lift.io</Text>
      </View>

      {/* Right Section */}
      {!rightDisabled && (
        <TouchableOpacity
          style={styles.iconContainer}
          onPress={onRightPress}
        >
          <Ionicons name={rightIcon} size={24} color="#000" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 125,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: 'black',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e8e8e8',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#333',
  },
}); 