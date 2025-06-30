import { StyleSheet, TouchableOpacity, Text, ScrollView, View, Modal, Dimensions, TextInput } from 'react-native';
import { View as ThemedView } from '@/components/Themed';
import { Link, router } from 'expo-router';
import { useState, useRef } from 'react';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';

// This will eventually come from an external source
const workoutTypes = [
  { id: '1', name: 'Push', color: '#007AFF' },
  { id: '2', name: 'Pull', color: '#007AFF' },
  { id: '3', name: 'Legs', color: '#007AFF' },
];

const { height: screenHeight } = Dimensions.get('window');

export default function WorkoutSelectionScreen() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [workoutName, setWorkoutName] = useState('');
  const [exercises, setExercises] = useState([{ id: 1, name: '' }]);
  const [openSwipeableId, setOpenSwipeableId] = useState<number | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    workoutName: boolean;
    exercises: { [key: number]: boolean };
  }>({
    workoutName: false,
    exercises: {}
  });
  const swipeableRefs = useRef<{ [key: number]: Swipeable | null }>({});

  const handleWorkoutPress = (workoutType: string) => {
    console.log(`${workoutType} workout selected`);
    router.push('/(tabs)/workout/workout');
  };

  const handleAddWorkout = () => {
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    // Reset form when closing
    setWorkoutName('');
    setExercises([{ id: 1, name: '' }]);
    setOpenSwipeableId(null);
    setValidationErrors({
      workoutName: false,
      exercises: {}
    });
  };

  const addExercise = () => {
    const newId = exercises.length + 1;
    setExercises([...exercises, { id: newId, name: '' }]);
  };

  const deleteExercise = (id: number) => {
    // Close any open swipeable
    if (openSwipeableId && swipeableRefs.current[openSwipeableId]) {
      swipeableRefs.current[openSwipeableId]?.close();
    }
    
    const updatedExercises = exercises.filter(exercise => exercise.id !== id);
    // Renumber exercises to maintain sequential order
    const renumberedExercises = updatedExercises.map((exercise, index) => ({
      ...exercise,
      id: index + 1
    }));
    setExercises(renumberedExercises);
    setOpenSwipeableId(null);
    
    // Update validation errors for renumbered exercises
    const newValidationErrors = { ...validationErrors.exercises };
    delete newValidationErrors[id];
    const renumberedValidationErrors: { [key: number]: boolean } = {};
    renumberedExercises.forEach((exercise, index) => {
      const oldId = exercises.find(e => e.name === exercise.name)?.id;
      if (oldId && newValidationErrors[oldId]) {
        renumberedValidationErrors[index + 1] = newValidationErrors[oldId];
      }
    });
    setValidationErrors({
      ...validationErrors,
      exercises: renumberedValidationErrors
    });
  };

  const updateExercise = (id: number, name: string) => {
    setExercises(exercises.map(exercise => 
      exercise.id === id ? { ...exercise, name } : exercise
    ));
    
    // Clear validation error when user starts typing
    if (name.trim() !== '' && validationErrors.exercises[id]) {
      setValidationErrors({
        ...validationErrors,
        exercises: {
          ...validationErrors.exercises,
          [id]: false
        }
      });
    }
  };

  const updateWorkoutName = (name: string) => {
    setWorkoutName(name);
    
    // Clear validation error when user starts typing
    if (name.trim() !== '' && validationErrors.workoutName) {
      setValidationErrors({
        ...validationErrors,
        workoutName: false
      });
    }
  };

  const handleSwipeOpen = (id: number) => {
    // Close any previously open swipeable
    if (openSwipeableId && openSwipeableId !== id && swipeableRefs.current[openSwipeableId]) {
      swipeableRefs.current[openSwipeableId]?.close();
    }
    setOpenSwipeableId(id);
  };

  const handleSwipeClose = () => {
    setOpenSwipeableId(null);
  };

  const validateForm = () => {
    const errors = {
      workoutName: workoutName.trim() === '',
      exercises: {} as { [key: number]: boolean }
    };

    exercises.forEach(exercise => {
      if (exercise.name.trim() === '') {
        errors.exercises[exercise.id] = true;
      }
    });

    setValidationErrors(errors);
    return !errors.workoutName && Object.keys(errors.exercises).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    // Filter out empty exercises
    const validExercises = exercises.filter(exercise => exercise.name.trim() !== '');
    
    const workoutData = {
      name: workoutName.trim(),
      exercises: validExercises
    };

    console.log('Submitting workout:', workoutData);
    // TODO: Send request to add workout
    // await addWorkout(workoutData);
    
    // Close modal and reset form
    closeModal();
  };

  const renderDeleteButton = (id: number) => (
    <TouchableOpacity
      style={styles.deleteButton}
      onPress={() => deleteExercise(id)}
    >
      <Text style={styles.deleteButtonText}>Delete</Text>
    </TouchableOpacity>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemedView style={styles.container}>
        <Text style={styles.title}>Workout Selection</Text>
        
        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
          indicatorStyle="black"
        >
          {workoutTypes.map((workout) => (
            <TouchableOpacity
              key={workout.id}
              style={[styles.workoutButton, { backgroundColor: workout.color }]}
              onPress={() => handleWorkoutPress(workout.name)}
            >
              <Text style={styles.workoutButtonText}>{workout.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.bottomContainer}>
          <TouchableOpacity style={styles.addButton} onPress={handleAddWorkout}>
            <Text style={styles.addButtonText}>Add Workout</Text>
          </TouchableOpacity>
        </View>

        <Modal
          visible={isModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={closeModal}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity 
              style={styles.modalBackground} 
              activeOpacity={1} 
              onPress={closeModal}
            />
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View style={styles.modalTitleContainer}>
                  <Text style={styles.modalTitle}>Add Workout</Text>
                </View>
                <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.workoutNameContainer}>
                <Text style={styles.fieldLabel}>Workout Name</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    validationErrors.workoutName && styles.errorInput
                  ]}
                  value={workoutName}
                  onChangeText={updateWorkoutName}
                  placeholder="Enter workout name"
                  placeholderTextColor="#999"
                />
                {validationErrors.workoutName && (
                  <Text style={styles.errorText}>Workout name is required</Text>
                )}
              </View>

              <View style={styles.exercisesSection}>
                <View style={styles.exercisesHeader}>
                  <Text style={styles.fieldLabel}>Exercises</Text>
                </View>
                <ScrollView 
                  style={styles.exercisesScrollView} 
                  showsVerticalScrollIndicator={true}
                  contentContainerStyle={styles.exercisesScrollContent}
                  scrollIndicatorInsets={{ right: 1 }}
                  indicatorStyle="black"
                >
                  {exercises.map((exercise, index) => (
                    <View key={exercise.id} style={index === 0 ? styles.firstExerciseContainer : undefined}>
                      <Swipeable
                        ref={(ref) => {
                          if (ref) {
                            swipeableRefs.current[exercise.id] = ref;
                          }
                        }}
                        renderRightActions={exercises.length > 1 ? () => renderDeleteButton(exercise.id) : undefined}
                        rightThreshold={40}
                        onSwipeableOpen={() => handleSwipeOpen(exercise.id)}
                        onSwipeableClose={handleSwipeClose}
                        enabled={exercises.length > 1}
                      >
                        <View style={[
                          styles.exerciseContainer,
                          validationErrors.exercises[exercise.id] && styles.errorExerciseContainer
                        ]}>
                          <View style={styles.exerciseRow}>
                            <View style={[
                              styles.exerciseNumberContainer,
                              validationErrors.exercises[exercise.id] && styles.errorExerciseNumberContainer
                            ]}>
                              <Text style={styles.exerciseNumber}>Exercise {exercise.id}</Text>
                            </View>
                            <TextInput
                              style={[
                                styles.exerciseInput,
                                validationErrors.exercises[exercise.id] && styles.errorExerciseInput
                              ]}
                              value={exercise.name}
                              onChangeText={(name) => updateExercise(exercise.id, name)}
                              placeholder={`Enter exercise ${exercise.id} name`}
                              placeholderTextColor="#999"
                            />
                          </View>
                        </View>
                      </Swipeable>
                      <View style={styles.errorContainer}>
                        {validationErrors.exercises[exercise.id] && (
                          <Text style={styles.errorText}>Exercise name is required</Text>
                        )}
                      </View>
                    </View>
                  ))}
                </ScrollView>

                <View style={styles.modalFooter}>
                  <TouchableOpacity style={styles.addExerciseButton} onPress={addExercise}>
                    <Text style={styles.addExerciseButtonText}>+ Add Exercise</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                    <Text style={styles.submitButtonText}>Create Workout</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      </ThemedView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 15,
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 5,
  },
  workoutButton: {
    width: '100%',
    height: 80,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  workoutButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  bottomContainer: {
    paddingVertical: 20,
    paddingBottom: 40,
  },
  addButton: {
    width: '100%',
    height: 60,
    backgroundColor: '#34C759',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    height: screenHeight * 0.75,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: 'bold',
  },
  workoutNameContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  exercisesSection: {
    flex: 1,
  },
  exercisesHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  fieldLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  errorInput: {
    borderColor: '#FF3B30',
    backgroundColor: '#FFF5F5',
  },
  exercisesScrollView: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  exercisesScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  exerciseContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  errorExerciseContainer: {
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FF3B30',
    shadowColor: '#FF3B30',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseNumberContainer: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 12,
    minWidth: 100,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    justifyContent: 'center',
    height: '100%',
  },
  exerciseNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  exerciseInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: 'transparent',
  },
  errorExerciseInput: {
    backgroundColor: '#FFF5F5',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    marginRight: 1,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  addExerciseButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  addExerciseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#34C759',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorExerciseNumberContainer: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 12,
    paddingVertical: 12,
    minWidth: 100,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    justifyContent: 'center',
    height: '100%',
  },
  errorContainer: {
    padding: 5,
    height: 22,
    justifyContent: 'center',
  },
  firstExerciseContainer: {
    marginTop: 10,
  },
}); 