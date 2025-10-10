import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { styles } from './styles';

interface StepsSectionProps {
  steps: string[];
  isEditMode: boolean;
  onAddStep: () => void;
  onRemoveStep: (index: number) => void;
  onUpdateStep: (index: number, value: string) => void;
}

// 개별 Step Input 컴포넌트
const StepInput: React.FC<{
  index: number;
  value: string;
  onUpdate: (index: number, value: string) => void;
  onRemove: (index: number) => void;
}> = ({ index, value, onUpdate, onRemove }) => {
  const [localValue, setLocalValue] = React.useState(value);

  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  return (
    <View style={styles.stepEditRow}>
      <Text style={styles.stepNumber}>{index + 1}.</Text>
      <TextInput
        style={styles.stepInput}
        value={localValue}
        onChangeText={setLocalValue}
        onBlur={() => onUpdate(index, localValue)}
        placeholder={`${index + 1}번째 조리 과정을 입력하세요`}
        placeholderTextColor="#999"
        multiline
      />
      <TouchableOpacity
        style={styles.removeStepsButton}
        onPress={() => onRemove(index)}
      >
        <Icon name="remove" size={20} color="#FF3B30" />
      </TouchableOpacity>
    </View>
  );
};

export const StepsSection: React.FC<StepsSectionProps> = ({
  steps,
  isEditMode,
  onAddStep,
  onRemoveStep,
  onUpdateStep,
}) => {
  return (
    <View style={styles.section}>
      <View style={styles.sectionContour}>
        <></>
      </View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>조리법</Text>
        {isEditMode && (
          <TouchableOpacity style={styles.addButton} onPress={onAddStep}>
            <Icon name="add" size={20} color="#29a448ff" />
            <Text style={styles.addButtonText}>단계 추가</Text>
          </TouchableOpacity>
        )}
      </View>
      {steps.map((step, index) => (
        <View key={index} style={styles.stepItem}>
          {isEditMode ? (
            <StepInput
              index={index}
              value={step}
              onUpdate={onUpdateStep}
              onRemove={onRemoveStep}
            />
          ) : (
            <>
              <Text style={styles.stepNumber}>{index + 1}.</Text>
              <View style={styles.stepRow}>
                <Text style={styles.stepText}>{step}</Text>
                <View style={styles.stepsContour}>
                  <></>
                </View>
              </View>
            </>
          )}
        </View>
      ))}
    </View>
  );
};
