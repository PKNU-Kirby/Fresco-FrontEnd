import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, TextInput, Text } from 'react-native';
import Slider from '@react-native-community/slider';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import { sliderQuantityStyles as styles } from './styles';

interface SliderQuantityEditorProps {
  quantity: number;
  unit: string;
  maxQuantity: number;
  isEditMode: boolean;
  onQuantityChange: (quantity: number) => void;
  onTextBlur: () => void;
  onUnitPress: () => void;
  onDeleteRequest?: () => void;
}

const SliderQuantityEditor: React.FC<SliderQuantityEditorProps> = ({
  quantity,
  unit,
  maxQuantity,
  isEditMode,
  onQuantityChange,
  onTextBlur,
  onUnitPress,
  onDeleteRequest,
}) => {
  const [isSliderMode, setIsSliderMode] = useState(false);
  const [localQuantity, setLocalQuantity] = useState(quantity);

  // 단위별 step 계산
  const getStepSize = (maxValue: number) => {
    switch (unit.toLowerCase()) {
      case 'g':
      case 'ml':
        return 1;
      case 'kg':
      case 'l':
        return 0.01;
      case '개':
      default:
        return maxValue <= 10 ? 0.01 : 1;
    }
  };

  const getStepperStep = () => 1;

  const sliderStep = getStepSize(maxQuantity);
  const stepperStep = getStepperStep();

  useEffect(() => {
    setLocalQuantity(quantity);
  }, [quantity]);

  const roundToStep = (value: number, step: number) => {
    return Math.round(value / step) * step;
  };

  const formatQuantity = (value: number | string): number => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return 0;
    if (numValue % 1 === 0) {
      return Math.round(numValue);
    } else {
      return parseFloat(numValue.toFixed(2));
    }
  };

  const checkAndTriggerDelete = (newValue: number) => {
    if (newValue <= 0 && onDeleteRequest) {
      onDeleteRequest();
      return true;
    }
    return false;
  };

  // 🔥 스테퍼: 자유롭게 증가/감소 (maxQuantity 제한 없음)
  const handleStepperChange = (increment: boolean) => {
    const currentValue = localQuantity || 0;
    const step = stepperStep;
    let newValue;

    if (increment) {
      newValue = currentValue + step; // 🔥 maxQuantity 제한 제거
    } else {
      newValue = Math.max(currentValue - step, 0);
      if (checkAndTriggerDelete(newValue)) {
        return;
      }
    }

    newValue = Math.round(newValue);
    setLocalQuantity(newValue);
    onQuantityChange(newValue);
  };

  // 🔥 슬라이더: 0 ~ maxQuantity 범위로 제한
  const handleSliderChange = (value: number) => {
    const roundedValue = roundToStep(value, sliderStep);
    const clampedValue = Math.max(0, Math.min(roundedValue, maxQuantity)); // 🔥 maxQuantity로 clamp

    const finalValue =
      sliderStep < 1
        ? parseFloat(clampedValue.toFixed(2))
        : Math.round(clampedValue);

    setLocalQuantity(finalValue);
    onQuantityChange(finalValue);
  };

  // 🔥 텍스트 입력: 자유롭게 입력 가능
  const handleTextChange = (text: string) => {
    const cleanText = text.replace(/[^0-9.]/g, '');
    const parts = cleanText.split('.');
    if (parts.length > 2) {
      return;
    }

    const numValue = parseFloat(cleanText) || 0;
    setLocalQuantity(numValue); // 🔥 제한 없이 저장
  };

  // 🔥 텍스트 입력 완료: 자유롭게 입력 가능 (maxQuantity 초과 허용)
  const handleTextBlur = () => {
    const numValue = localQuantity || 0;

    if (numValue <= 0) {
      if (checkAndTriggerDelete(0)) {
        return;
      }
    }

    // 🔥 maxQuantity 제한 제거 (자유롭게 입력 가능)
    const finalValue = isSliderMode
      ? roundToStep(numValue, sliderStep)
      : numValue;

    const formattedValue = formatQuantity(finalValue);
    setLocalQuantity(formattedValue);
    onQuantityChange(formattedValue);
    onTextBlur();
  };

  const toggleInputMode = () => {
    setIsSliderMode(!isSliderMode);
  };

  const currentQuantityNum = localQuantity || 0;

  return (
    <View style={styles.sliderQuantityContainer}>
      <View style={styles.quantityEditContainer}>
        <View style={styles.stepper}>
          <TouchableOpacity
            style={[
              styles.quantityButton,
              currentQuantityNum <= 0 && styles.quantityButtonDisabled,
            ]}
            activeOpacity={0.7}
            onPress={() => handleStepperChange(false)}
            disabled={!isEditMode || currentQuantityNum <= 0}
          >
            <FontAwesome6 name="circle-minus" size={20} color="#999" />
          </TouchableOpacity>

          <TextInput
            style={styles.quantityInput}
            value={localQuantity.toString()}
            onChangeText={handleTextChange}
            onBlur={handleTextBlur}
            keyboardType="decimal-pad"
            editable={isEditMode}
            selectTextOnFocus
            placeholder="0"
          />

          <TouchableOpacity style={styles.unitSelector} onPress={onUnitPress}>
            <Text style={styles.quantityUnit}>{unit}</Text>
            <Text style={styles.unitDropdownIcon}>▼</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quantityButton} // 🔥 disabled 스타일 제거
            activeOpacity={0.7}
            onPress={() => handleStepperChange(true)}
            disabled={!isEditMode} // 🔥 maxQuantity 제한 제거
          >
            <FontAwesome6 name="circle-plus" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={
            isSliderMode ? styles.isSlidderButton : styles.isNotSlidderButton
          }
          activeOpacity={0.7}
          onPress={toggleInputMode}
          disabled={!isEditMode}
        >
          <FontAwesome6
            name={isSliderMode ? 'caret-up' : 'caret-down'}
            size={24}
            color="#999"
          />
        </TouchableOpacity>
      </View>

      {isSliderMode && (
        <View style={styles.sliderSection}>
          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={maxQuantity} // 🔥 maxQuantity 고정
              value={Math.min(currentQuantityNum, maxQuantity)} // 🔥 maxQuantity 초과 시 clamp
              onValueChange={handleSliderChange}
              step={sliderStep}
              minimumTrackTintColor="rgba(47, 72, 88, 0.5)"
              maximumTrackTintColor="#d2d2d2"
              thumbTintColor="#c8c8c8"
              disabled={!isEditMode}
            />
          </View>
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabel}>0</Text>
            <Text style={styles.sliderLabel}>
              {formatQuantity(maxQuantity)}
              {unit}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default SliderQuantityEditor;
