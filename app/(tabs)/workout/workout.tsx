import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Alert, Modal, Dimensions } from 'react-native';
import { View as ThemedView } from '@/components/Themed';
import { useState, useEffect, useRef } from 'react';
import Colors from '@/constants/Colors';
import { PanGestureHandler, Swipeable, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { 
  useSharedValue, 
  useAnimatedGestureHandler, 
  useAnimatedStyle, 
  withSpring,
  runOnJS
} from 'react-native-reanimated';
import { useSettings } from '@/contexts/SettingsContext';
import { loadWorkoutTemplates, WorkoutTemplate } from '../services';

const { height: screenHeight } = Dimensions.get('window');

interface WorkoutData {
  title: string;
  exercises: string[];
}

interface ExerciseSet {
  reps: string;
  weight: string;
}

export default function WorkoutScreen() {
  const [workoutData, setWorkoutData] = useState<WorkoutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exerciseSets, setExerciseSets] = useState<ExerciseSet[][]>([]);
  const [isAddExerciseModalVisible, setIsAddExerciseModalVisible] = useState(false);
  const [newExercises, setNewExercises] = useState([{ id: 1, name: '' }]);
  const [validationErrors, setValidationErrors] = useState<{ [key: number]: boolean }>({});
  const [openSwipeableId, setOpenSwipeableId] = useState<number | null>(null);
  const swipeableRefs = useRef<{ [key: number]: Swipeable | null }>({});
  const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false);
  const [showDeleteExerciseConfirmation, setShowDeleteExerciseConfirmation] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState<number | null>(null);
  const { weightUnitLabel } = useSettings();

  useEffect(() => {
    loadWorkoutData();
  }, []);

  const loadWorkoutData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // TODO: Replace with actual API call
      // const response = await fetch('/api/workout/current');
      // const data = await response.json();
      
      // Mock data for now
      const mockData: WorkoutData = {
        title: "Push",
        exercises: ["Bench Press", "Shoulder Press"]
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setWorkoutData(mockData);
      
      // Initialize exercise sets
      const initialSets: ExerciseSet[][] = [];
      mockData.exercises.forEach((_, index) => {
        initialSets[index] = [{ reps: '', weight: '' }];
      });
      setExerciseSets(initialSets);
    } catch (err) {
      setError('Failed to load workout data');
      console.error('Error loading workout:', err);
    } finally {
      setLoading(false);
    }
  };

  const addSet = (exerciseIndex: number) => {
    const newSets = [...exerciseSets];
    if (!newSets[exerciseIndex]) {
      newSets[exerciseIndex] = [];
    }
    newSets[exerciseIndex].push({ reps: '', weight: '' });
    setExerciseSets(newSets);
  };

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    const newSets = [...exerciseSets];
    if (newSets[exerciseIndex] && newSets[exerciseIndex].length > 1) {
      newSets[exerciseIndex].splice(setIndex, 1);
      setExerciseSets(newSets);
    }
  };

  const updateSet = (exerciseIndex: number, setIndex: number, field: 'reps' | 'weight', value: string) => {
    const newSets = [...exerciseSets];
    if (newSets[exerciseIndex] && newSets[exerciseIndex][setIndex]) {
      newSets[exerciseIndex][setIndex] = { ...newSets[exerciseIndex][setIndex], [field]: value };
      setExerciseSets(newSets);
    }
  };

  const handleAddExercise = () => {
    setIsAddExerciseModalVisible(true);
  };

  const closeAddExerciseModal = () => {
    setIsAddExerciseModalVisible(false);
    setNewExercises([{ id: 1, name: '' }]);
    setValidationErrors({});
  };

  const addNewExercise = () => {
    const newId = newExercises.length + 1;
    setNewExercises([...newExercises, { id: newId, name: '' }]);
  };

  const deleteNewExercise = (id: number) => {
    // Close any open swipeable
    if (openSwipeableId && swipeableRefs.current[openSwipeableId]) {
      swipeableRefs.current[openSwipeableId]?.close();
    }
    
    if (newExercises.length > 1) {
      const updatedExercises = newExercises.filter(exercise => exercise.id !== id);
      // Renumber exercises to maintain sequential order
      const renumberedExercises = updatedExercises.map((exercise, index) => ({
        ...exercise,
        id: index + 1
      }));
      setNewExercises(renumberedExercises);
      
      // Update validation errors for renumbered exercises
      const newValidationErrors: { [key: number]: boolean } = {};
      renumberedExercises.forEach((exercise, index) => {
        const oldId = newExercises.find(e => e.name === exercise.name)?.id;
        if (oldId && validationErrors[oldId]) {
          newValidationErrors[index + 1] = validationErrors[oldId];
        }
      });
      setValidationErrors(newValidationErrors);
    }
    setOpenSwipeableId(null);
  };

  const handleSwipeOpen = (id: number) => {
    console.log('Modal swipe opened for exercise:', id);
    // Close any previously open swipeable
    if (openSwipeableId && openSwipeableId !== id && swipeableRefs.current[openSwipeableId]) {
      swipeableRefs.current[openSwipeableId]?.close();
    }
    setOpenSwipeableId(id);
  };

  const handleSwipeClose = () => {
    console.log('Modal swipe closed');
    setOpenSwipeableId(null);
  };

  const updateNewExercise = (id: number, name: string) => {
    setNewExercises(newExercises.map(exercise => 
      exercise.id === id ? { ...exercise, name } : exercise
    ));
    
    // Clear validation error when user starts typing
    if (name.trim() !== '' && validationErrors[id]) {
      setValidationErrors({
        ...validationErrors,
        [id]: false
      });
    }
  };

  const validateExercises = () => {
    const errors: { [key: number]: boolean } = {};
    newExercises.forEach(exercise => {
      if (exercise.name.trim() === '') {
        errors[exercise.id] = true;
      }
    });
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddExercisesSubmit = () => {
    // Filter out empty exercises
    const validExercises = newExercises.filter(exercise => exercise.name.trim() !== '');
    
    if (validExercises.length === 0) {
      // If no valid exercises, just close the modal (cancel)
      closeAddExerciseModal();
      return;
    }

    // Validate all exercises
    if (!validateExercises()) {
      return;
    }

    // Add the new exercises to the workout
    if (workoutData) {
      const updatedWorkoutData = {
        ...workoutData,
        exercises: [...workoutData.exercises, ...validExercises.map(ex => ex.name)]
      };
      setWorkoutData(updatedWorkoutData);

      // Initialize exercise sets for new exercises
      const newSets = [...exerciseSets];
      validExercises.forEach((_, index) => {
        const exerciseIndex = workoutData.exercises.length + index;
        newSets[exerciseIndex] = [{ reps: '', weight: '' }];
      });
      setExerciseSets(newSets);
    }

    closeAddExerciseModal();
  };

  const getValidExercisesCount = () => {
    return newExercises.filter(exercise => exercise.name.trim() !== '').length;
  };

  const handleWorkoutSubmit = () => {
    setShowSubmitConfirmation(true);
  };

  const confirmWorkoutSubmit = () => {
    setShowSubmitConfirmation(false);
    
    // Prepare workout data for submission
    const workoutSubmissionData = {
      workoutName: workoutData?.title,
      exercises: workoutData?.exercises.map((exerciseName, exerciseIndex) => ({
        name: exerciseName,
        sets: exerciseSets[exerciseIndex]?.map((set, setIndex) => ({
          setNumber: setIndex + 1,
          reps: set.reps || '0',
          weight: set.weight || '0'
        })) || []
      })) || []
    };

    console.log('Workout data ready for submission:', workoutSubmissionData);
    
    // TODO: Send workout data to API
    // await submitWorkout(workoutSubmissionData);
    
    Alert.alert(
      'Workout Submitted!',
      'Your workout has been successfully submitted.',
      [{ text: 'OK', onPress: () => console.log('Workout submission confirmed') }]
    );
  };

  const cancelWorkoutSubmit = () => {
    setShowSubmitConfirmation(false);
  };

  const handleDeleteExercise = (exerciseIndex: number) => {
    setExerciseToDelete(exerciseIndex);
    setShowDeleteExerciseConfirmation(true);
  };

  const confirmDeleteExercise = () => {
    if (exerciseToDelete !== null && workoutData) {
      // Remove the exercise from workout data
      const updatedExercises = workoutData.exercises.filter((_, index) => index !== exerciseToDelete);
      const updatedWorkoutData = {
        ...workoutData,
        exercises: updatedExercises
      };
      setWorkoutData(updatedWorkoutData);

      // Remove the exercise sets
      const newSets = [...exerciseSets];
      newSets.splice(exerciseToDelete, 1);
      setExerciseSets(newSets);
    }
    
    setShowDeleteExerciseConfirmation(false);
    setExerciseToDelete(null);
  };

  const cancelDeleteExercise = () => {
    setShowDeleteExerciseConfirmation(false);
    setExerciseToDelete(null);
  };

  const SwipeableSetRow = ({ exerciseIndex, setIndex, set, children }: {
    exerciseIndex: number;
    setIndex: number;
    set: { reps: string; weight: string };
    children: React.ReactNode;
  }) => {
    const translateX = useSharedValue(0);
    const deleteOpacity = useSharedValue(0);

    const gestureHandler = useAnimatedGestureHandler({
      onStart: (_, context: any) => {
        context.startX = translateX.value;
      },
      onActive: (event, context: any) => {
        const newTranslateX = context.startX + event.translationX;
        // Allow both left and right swipe (positive and negative values)
        translateX.value = Math.max(-80, Math.min(80, newTranslateX));
        deleteOpacity.value = Math.abs(translateX.value) / 80;
      },
      onEnd: (event) => {
        if (event.translationX > 40) {
          // Swipe right threshold
          translateX.value = withSpring(80);
          deleteOpacity.value = withSpring(1);
        } else if (event.translationX < -40) {
          // Swipe left threshold
          translateX.value = withSpring(-80);
          deleteOpacity.value = withSpring(1);
        } else {
          translateX.value = withSpring(0);
          deleteOpacity.value = withSpring(0);
        }
      },
    });

    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ translateX: translateX.value }],
      };
    });

    const deleteButtonStyle = useAnimatedStyle(() => {
      return {
        opacity: deleteOpacity.value,
      };
    });

    const handleDelete = () => {
      if (exerciseSets[exerciseIndex] && exerciseSets[exerciseIndex].length > 1) {
        removeSet(exerciseIndex, setIndex);
        // Reset position after deletion
        translateX.value = withSpring(0);
        deleteOpacity.value = withSpring(0);
      }
    };

    return (
      <View style={styles.swipeableContainer}>
        {/* Delete button on the right side (for left swipe) */}
        <Animated.View style={[styles.deleteButton, deleteButtonStyle]}>
          <TouchableOpacity 
            style={styles.deleteButtonTouchable}
            onPress={handleDelete}
            disabled={exerciseSets[exerciseIndex]?.length <= 1}
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </Animated.View>
        
        {/* Delete button on the left side (for right swipe) */}
        <Animated.View style={[styles.deleteButtonLeft, deleteButtonStyle]}>
          <TouchableOpacity 
            style={styles.deleteButtonTouchable}
            onPress={handleDelete}
            disabled={exerciseSets[exerciseIndex]?.length <= 1}
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </Animated.View>
        
        <PanGestureHandler onGestureEvent={gestureHandler}>
          <Animated.View style={[styles.setRowContainer, animatedStyle]}>
            {children}
          </Animated.View>
        </PanGestureHandler>
      </View>
    );
  };

  const renderDeleteButton = (id: number) => (
    <TouchableOpacity
      style={styles.deleteButton}
      onPress={() => {
        console.log('Delete button pressed for exercise:', id);
        deleteNewExercise(id);
      }}
    >
      <Text style={styles.deleteButtonText}>Delete</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <Text style={styles.loadingText}>Loading workout...</Text>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </ThemedView>
    );
  }

  if (!workoutData) {
    return (
      <ThemedView style={styles.container}>
        <Text style={styles.errorText}>No workout data available</Text>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Text style={styles.title}>Workout: {workoutData.title}</Text>
      
      <ScrollView style={styles.exercisesContainer} showsVerticalScrollIndicator={true}>
        {workoutData.exercises.map((exercise, exerciseIndex) => (
          <View key={exerciseIndex} style={styles.exerciseItem}>
            <View style={styles.exerciseHeader}>
              <View style={styles.exerciseHeaderLeft}>
                <Text style={styles.exerciseNumber}>Exercise {exerciseIndex + 1}</Text>
                <Text style={styles.exerciseName}>{exercise}</Text>
              </View>
              <TouchableOpacity 
                style={styles.deleteExerciseButton}
                onPress={() => handleDeleteExercise(exerciseIndex)}
              >
                <Text style={styles.deleteExerciseButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.setsContainer}>
              {exerciseSets[exerciseIndex]?.map((set, setIndex) => (
                <SwipeableSetRow 
                  key={`${exerciseIndex}-${setIndex}`}
                  exerciseIndex={exerciseIndex} 
                  setIndex={setIndex} 
                  set={set}
                >
                  <View style={styles.setRow}>
                    <Text style={styles.setNumber}>Set {setIndex + 1}:</Text>
                    <View style={styles.inputContainer}>
                      <TextInput
                        style={styles.input}
                        value={set.reps}
                        onChangeText={(value) => updateSet(exerciseIndex, setIndex, 'reps', value)}
                        placeholder="Reps"
                        keyboardType="numeric"
                        placeholderTextColor="#999"
                      />
                    </View>
                    <View style={styles.inputContainer}>
                      <TextInput
                        style={styles.input}
                        value={set.weight}
                        onChangeText={(value) => updateSet(exerciseIndex, setIndex, 'weight', value)}
                        placeholder="Weight"
                        keyboardType="numeric"
                        placeholderTextColor="#999"
                      />
                      <Text style={styles.inputLabel}>{weightUnitLabel}</Text>
                    </View>
                  </View>
                </SwipeableSetRow>
              ))}
              <TouchableOpacity style={styles.addSetButton} onPress={() => addSet(exerciseIndex)}>
                <Text style={styles.addSetButtonText}>+ Add Set</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.addExerciseButton} onPress={handleAddExercise}>
          <Text style={styles.addExerciseButtonText}>Add Exercise</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.submitWorkoutButton} onPress={handleWorkoutSubmit}>
          <Text style={styles.submitWorkoutButtonText}>Submit Workout</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={isAddExerciseModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeAddExerciseModal}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackground} 
            activeOpacity={1} 
            onPress={closeAddExerciseModal}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <Text style={styles.modalTitle}>Add Exercises</Text>
              </View>
              <TouchableOpacity onPress={closeAddExerciseModal} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.exercisesSection}>
              <ScrollView 
                style={styles.exercisesScrollView} 
                showsVerticalScrollIndicator={true}
                contentContainerStyle={styles.exercisesScrollContent}
                scrollIndicatorInsets={{ right: 1 }}
                indicatorStyle="black"
              >
                {newExercises.map((exercise, index) => (
                  <View key={exercise.id} style={index === 0 ? styles.firstExerciseContainer : undefined}>
                    <Swipeable
                      ref={(ref) => {
                        if (ref) {
                          swipeableRefs.current[exercise.id] = ref;
                        }
                      }}
                      renderRightActions={newExercises.length > 1 ? () => renderDeleteButton(exercise.id) : undefined}
                      rightThreshold={40}
                      onSwipeableOpen={() => handleSwipeOpen(exercise.id)}
                      onSwipeableClose={handleSwipeClose}
                      enabled={newExercises.length > 1}
                      friction={2}
                      overshootRight={false}
                    >
                      <View style={[
                        styles.exerciseContainer,
                        validationErrors[exercise.id] && styles.errorExerciseContainer
                      ]}>
                        <View style={styles.exerciseRow}>
                          <View style={[
                            styles.exerciseNumberContainer,
                            validationErrors[exercise.id] && styles.errorExerciseNumberContainer
                          ]}>
                            <Text style={styles.modalExerciseNumber}>Exercise {exercise.id}</Text>
                          </View>
                          <TextInput
                            style={[
                              styles.exerciseInput,
                              validationErrors[exercise.id] && styles.errorExerciseInput
                            ]}
                            value={exercise.name}
                            onChangeText={(name) => updateNewExercise(exercise.id, name)}
                            placeholder={`Enter exercise ${exercise.id} name`}
                            placeholderTextColor="#999"
                          />
                        </View>
                      </View>
                    </Swipeable>
                    <View style={styles.errorContainer}>
                      {validationErrors[exercise.id] && (
                        <Text style={styles.modalErrorText}>Exercise name is required</Text>
                      )}
                    </View>
                  </View>
                ))}
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity style={styles.addNewExerciseButton} onPress={addNewExercise}>
                  <Text style={styles.addNewExerciseButtonText}>+ Add Exercise</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.submitButton, 
                    getValidExercisesCount() === 0 && styles.cancelButton
                  ]} 
                  onPress={handleAddExercisesSubmit}
                >
                  <Text style={[
                    styles.submitButtonText,
                    getValidExercisesCount() === 0 && styles.cancelButtonText
                  ]}>
                    {getValidExercisesCount() === 0 ? 'Cancel' : 'Submit'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Submit Confirmation Modal */}
      <Modal
        visible={showSubmitConfirmation}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelWorkoutSubmit}
      >
        <View style={styles.confirmationModalOverlay}>
          <View style={styles.confirmationModalContent}>
            <Text style={styles.confirmationModalTitle}>Submit Workout</Text>
            <Text style={styles.confirmationModalText}>
              Are you sure you want to submit this workout? This action cannot be undone.
            </Text>
            
            <View style={styles.confirmationModalButtons}>
              <TouchableOpacity 
                style={styles.cancelConfirmationButton} 
                onPress={cancelWorkoutSubmit}
              >
                <Text style={styles.cancelConfirmationButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.confirmSubmitButton} 
                onPress={confirmWorkoutSubmit}
              >
                <Text style={styles.confirmSubmitButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Exercise Confirmation Modal */}
      <Modal
        visible={showDeleteExerciseConfirmation}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelDeleteExercise}
      >
        <View style={styles.confirmationModalOverlay}>
          <View style={styles.confirmationModalContent}>
            <Text style={styles.confirmationModalTitle}>Delete Exercise</Text>
            <Text style={styles.confirmationModalText}>
              Are you sure you want to delete this exercise? This action cannot be undone.
            </Text>
            
            <View style={styles.confirmationModalButtons}>
              <TouchableOpacity 
                style={styles.cancelConfirmationButton} 
                onPress={cancelDeleteExercise}
              >
                <Text style={styles.cancelConfirmationButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.confirmDeleteButton} 
                onPress={confirmDeleteExercise}
              >
                <Text style={styles.confirmDeleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ThemedView>
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
    marginVertical: 10,
    color: '#333',
  },
  exercisesContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 10,
    marginTop: 10,
  },
  exerciseItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    position: 'relative',
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  exerciseHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 10,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
    flex: 1,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#FF3B30',
  },
  setsContainer: {
    marginLeft: 10,
  },
  setsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 2,
  },
  setNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginRight: 5,
    flexShrink: 0,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    flexShrink: 0,
    justifyContent: 'flex-end',
    flex: 1,
  },
  input: {
    width: 90,
    height: 44,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  addSetButton: {
    backgroundColor: '#007AFF',
    borderRadius: 4,
    padding: 12,
    alignItems: 'center',
  },
  addSetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  swipeableContainer: {
    position: 'relative',
    marginBottom: 8,
    overflow: 'hidden',
  },
  deleteButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 80,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    zIndex: 1,
  },
  deleteButtonTouchable: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  setRowContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 2,
  },
  bottomContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  addExerciseButton: {
    backgroundColor: '#007AFF',
    borderRadius: 4,
    padding: 12,
    alignItems: 'center',
  },
  addExerciseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  submitWorkoutButton: {
    backgroundColor: '#34C759',
    borderRadius: 4,
    padding: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  submitWorkoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
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
  exercisesSection: {
    flex: 1,
  },
  exercisesScrollView: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  exercisesScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  firstExerciseContainer: {
    marginTop: 10,
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
  modalExerciseNumber: {
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
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  addNewExerciseButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  addNewExerciseButtonText: {
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
  cancelButton: {
    backgroundColor: '#FF3B30',
  },
  cancelButtonText: {
    color: '#fff',
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
  errorExerciseNumberContainer: {
    backgroundColor: '#FF3B30',
  },
  errorExerciseInput: {
    backgroundColor: '#FFF5F5',
  },
  errorContainer: {
    padding: 5,
    height: 22,
    justifyContent: 'center',
  },
  modalErrorText: {
    color: '#FF3B30',
    fontSize: 12,
    fontWeight: '500',
  },
  confirmationModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  confirmationModalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    maxWidth: 400,
  },
  confirmationModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  confirmationModalText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  confirmationModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cancelConfirmationButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  cancelConfirmationButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  confirmSubmitButton: {
    backgroundColor: '#34C759',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  confirmSubmitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteExerciseButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  deleteExerciseButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  confirmDeleteButton: {
    backgroundColor: '#34C759',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  confirmDeleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButtonLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 80,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    zIndex: 1,
  },
}); 