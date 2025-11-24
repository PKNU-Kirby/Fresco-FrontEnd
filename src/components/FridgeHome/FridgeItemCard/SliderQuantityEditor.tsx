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
  onMaxQuantityChange?: (maxQuantity: number) => void;
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
  onMaxQuantityChange,
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
        return 1; // 정수 단위

      case 'kg':
      case 'l':
        return 0.01; // 0.01 단위

      case '개':
      default:
        return maxValue <= 10 ? 0.01 : 1; // 10개 이하면 0.01, 이상이면 정수
    }
  };

  // Stepper step unit : 1.0
  const getStepperStep = () => 1;

  // Slider step unit
  const sliderStep = getStepSize(maxQuantity);
  const stepperStep = getStepperStep();

  useEffect(() => {
    setLocalQuantity(quantity);
  }, [quantity]);

  // step unit으로 반올림
  const roundToStep = (value: number, step: number) => {
    return Math.round(value / step) * step;
  };

  // Quantity 포맷 -> 정수면 소수점 없이, 소수면 둘째자리까지
  const formatQuantity = (value: number | string): number => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return 0;

    if (numValue % 1 === 0) {
      return Math.round(numValue);
    } else {
      return parseFloat(numValue.toFixed(2));
    }
  };

  // 0이 되면 삭제 모달 트리거
  const checkAndTriggerDelete = (newValue: number) => {
    if (newValue <= 0 && onDeleteRequest) {
      onDeleteRequest();
      return true;
    }
    return false;
  };

  // Stepper increment, decrement
  const handleStepperChange = (increment: boolean) => {
    const currentValue = localQuantity || 0;
    const step = stepperStep;

    let newValue;
    if (increment) {
      newValue = Math.min(currentValue + step, maxQuantity);
    } else {
      newValue = Math.max(currentValue - step, 0);
      if (checkAndTriggerDelete(newValue)) {
        return;
      }
    }

    // to Integer
    newValue = Math.round(newValue);

    setLocalQuantity(newValue);
    onQuantityChange(newValue);
  };

  // Slider change
  const handleSliderChange = (value: number) => {
    const roundedValue = roundToStep(value, sliderStep);
    const clampedValue = Math.max(0, Math.min(roundedValue, maxQuantity));

    // 소수점 처리
    const finalValue =
      sliderStep < 1
        ? parseFloat(clampedValue.toFixed(2))
        : Math.round(clampedValue);

    setLocalQuantity(finalValue);
    onQuantityChange(finalValue);
  };

  // text Input
  const handleTextChange = (text: string) => {
    // 숫자, 소수점만 허용
    const cleanText = text.replace(/[^0-9.]/g, '');

    const parts = cleanText.split('.');
    if (parts.length > 2) {
      return; // 소수점이 2개 이상이면 무시
    }

    const numValue = parseFloat(cleanText) || 0;
    setLocalQuantity(numValue);
  };

  const handleTextBlur = () => {
    const numValue = localQuantity || 0;

    // 0 이하면 삭제 모달
    if (numValue <= 0) {
      if (checkAndTriggerDelete(0)) {
        return;
      }
    }

    const clampedValue = Math.max(0, Math.min(numValue, maxQuantity));

    // 슬라이더 모드일 때는 스텝 단위로 반올림
    const finalValue = isSliderMode
      ? roundToStep(clampedValue, sliderStep)
      : clampedValue;

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
      {/* 수량 입력 섹션 */}
      <View style={styles.quantityEditContainer}>
        {/* 스테퍼 (정수 단위) */}
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
            style={[
              styles.quantityButton,
              currentQuantityNum >= maxQuantity &&
                styles.quantityButtonDisabled,
            ]}
            activeOpacity={0.7}
            onPress={() => handleStepperChange(true)}
            disabled={!isEditMode || currentQuantityNum >= maxQuantity}
          >
            <FontAwesome6 name="circle-plus" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* 슬라이더/스테퍼 토글 버튼 */}
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

      {/* 슬라이더 섹션 (단위별 스텝 적용) */}
      {isSliderMode && (
        <View style={styles.sliderSection}>
          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={maxQuantity}
              value={currentQuantityNum}
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
