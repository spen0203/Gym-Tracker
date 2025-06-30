import { StyleSheet, TouchableOpacity, Text } from 'react-native';
import { View } from '@/components/Themed';
import { Link } from 'expo-router';

export default function TabOneScreen() {
  return (
    <View style={styles.container}>
      <Link href="/(tabs)/workout" asChild>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Workout</Text>
        </TouchableOpacity>
      </Link>
      
      <Link href="/(tabs)/statistics" asChild>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Statistics</Text>
        </TouchableOpacity>
      </Link>
      
      <Link href="/(tabs)/settings" asChild>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Settings</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  button: {
    width: '80%',
    height: 80,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
});
