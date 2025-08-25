import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { styles } from './styles';
interface StepsSectionProps {
  steps: string[];
  completedSteps: boolean[];
  onToggleStep: (index: number) => void;
}

const StepsSection: React.FC<StepsSectionProps> = ({
  steps,
  completedSteps,
  onToggleStep,
}) => {
  return (
    <View style={styles.section}>
      <View style={styles.stepsContainer}>
        <Text style={styles.sectionTitle}>조리 과정</Text>
        {steps.map((step, index) => {
          const cleanStep = step.replace(/^\d+\.\s*/, '');
          const isCompleted = completedSteps[index] || false;

          return (
            <TouchableOpacity
              key={index}
              style={[styles.stepCard, isCompleted && styles.stepCardCompleted]}
              onPress={() => onToggleStep(index)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.stepCheckbox,
                  isCompleted && styles.stepCheckboxCompleted,
                ]}
              >
                {isCompleted ? (
                  <Icon name="check" size={16} color="#fff" />
                ) : (
                  <Text style={styles.stepNumber}>{index + 1}</Text>
                )}
              </View>
              <View style={styles.stepContent}>
                <Text
                  style={[
                    styles.stepText,
                    isCompleted && styles.stepTextCompleted,
                  ]}
                >
                  {cleanStep}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* 진행률 표시 */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            진행률: {completedSteps.filter(Boolean).length}/{steps.length} 단계
            완료
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${
                    (completedSteps.filter(Boolean).length / steps.length) * 100
                  }%`,
                },
              ]}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

export default StepsSection;
