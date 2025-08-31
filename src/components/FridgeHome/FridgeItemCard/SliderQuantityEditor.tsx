import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, TextInput, Text } from 'react-native';
import Slider from '@react-native-community/slider';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import { sliderQuantityStyles as styles } from './styles';

interface SliderQuantityEditorProps {
  quantity: string;
  unit: string;
  maxQuantity: number;
  isEditMode: boolean;
  onQuantityChange: (quantity: string) => void;
  onMaxQuantityChange?: (maxQuantity: number) => void;
  onTextBlur: () => void;
  onUnitPress: () => void;
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
}) => {
  const [_isSliding, setIsSliding] = useState(false);
  const [_isInputFocused, setIsInputFocused] = useState(false);
  const [_hasUserInteracted, setHasUserInteracted] = useState(false);
  const [isSliderMode, setIsSliderMode] = useState(false);

  // 수량 포맷 함수: 정수면 소수점 없이, 소수면 둘째자리까지
  const formatQuantity = (value: number | string): string => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return '0';

    // 정수인지 확인 (소수점이 .00인 경우도 정수로 취급)
    if (numValue % 1 === 0) {
      return Math.round(numValue).toString();
    } else {
      return numValue.toFixed(2);
    }
  };

  // 편집 모드가 변경될 때 사용자 조작 상태 리셋
  useEffect(() => {
    if (!isEditMode) {
      setHasUserInteracted(false);
    }
  }, [isEditMode]);

  // 단위별 슬라이더 스텝 크기 계산
  const getSliderStepSize = (unit: string, maxValue: number) => {
    const normalizedUnit = unit.toLowerCase();

    switch (normalizedUnit) {
      case 'g':
      case 'ml':
        return 1.0; // 정수 단위

      case '개':
        return maxValue >= 10 ? 1.0 : 0.01; // 10개 이상이면 1.0, 미만이면 0.01

      case 'kg':
      case 'l':
        if (maxValue < 1) {
          return 0.01; // 1 미만일 때 0.01
        } else if (maxValue < 10) {
          return 0.1; // 1 이상 10 미만일 때 0.1
        } else {
          return 1.0; // 10 이상일 때 1.0
        }

      default:
        return 1.0;
    }
  };

  // 스테퍼는 무조건 1.0 단위
  const getStepperStep = () => 1.0;

  const sliderStep = getSliderStepSize(unit, maxQuantity);
  const stepperStep = getStepperStep();

  // 값을 스텝 단위로 반올림
  const roundToStep = (value: number, step: number) => {
    return Math.round(value / step) * step;
  };

  // 스테퍼 증가/감소 (무조건 1.0 단위)
  const handleStepperChange = (increment: boolean) => {
    const currentValue = parseFloat(quantity) || 0;
    const step = stepperStep;

    let newValue;
    if (increment) {
      newValue = currentValue + step;
      // 플러스 버튼으로 maxQuantity 초과 시 maxQuantity 업데이트
      if (newValue > maxQuantity) {
        onMaxQuantityChange?.(newValue);
      }
    } else {
      newValue = Math.max(0, currentValue - step);
    }

    // 스테퍼는 항상 정수
    newValue = Math.round(newValue);

    setHasUserInteracted(true);
    onQuantityChange(newValue.toString());
  };

  // 슬라이더 변경 (단위별 스텝 적용)
  const handleSliderChange = (value: number) => {
    console.log('🎚️ Slider changed:', {
      rawValue: value,
      maxQuantity,
      unit,
      step: sliderStep,
      roundedValue: roundToStep(value, sliderStep),
    });

    setHasUserInteracted(true);
    const roundedValue = roundToStep(value, sliderStep);
    const clampedValue = Math.max(0, Math.min(roundedValue, maxQuantity));

    // 소수점 처리
    let finalValue;
    if (sliderStep >= 1) {
      finalValue = Math.round(clampedValue);
    } else if (sliderStep === 0.1) {
      finalValue = Math.round(clampedValue * 10) / 10;
    } else {
      // 0.01
      finalValue = Math.round(clampedValue * 100) / 100;
    }

    onQuantityChange(finalValue.toString());
  };

  const handleSliderComplete = (value: number) => {
    setIsSliding(false);
    setHasUserInteracted(true);
    handleSliderChange(value);
  };

  // 직접 입력 처리
  const handleTextChange = (text: string) => {
    // 숫자와 소수점만 허용
    let cleanText = text.replace(/[^0-9.]/g, '');

    // 소수점이 여러 개 있으면 첫 번째만 유지
    const parts = cleanText.split('.');
    if (parts.length > 2) {
      cleanText = parts[0] + '.' + parts.slice(1).join('');
    }

    setHasUserInteracted(true);

    // 키보드 입력으로 maxQuantity 초과 시 maxQuantity 업데이트
    if (cleanText !== '') {
      const numValue = parseFloat(cleanText) || 0;
      if (numValue > maxQuantity) {
        onMaxQuantityChange?.(numValue);
      }
    }

    onQuantityChange(cleanText);
  };

  const handleTextFocus = () => {
    setIsInputFocused(true);
    setHasUserInteracted(true);
  };

  const handleTextBlur = () => {
    setIsInputFocused(false);

    // 빈 값이면 0으로 설정
    if (quantity === '' || parseFloat(quantity) === 0) {
      onQuantityChange('0');
    } else {
      // 유효한 숫자로 정리
      const numValue = parseFloat(quantity) || 0;
      const clampedValue = Math.max(0, numValue);

      // 슬라이더 모드일 때는 스텝 단위로 반올림
      let finalValue;
      if (isSliderMode) {
        finalValue = roundToStep(clampedValue, sliderStep);
        if (sliderStep >= 1) {
          onQuantityChange(Math.round(finalValue).toString());
        } else if (sliderStep === 0.1) {
          onQuantityChange((Math.round(finalValue * 10) / 10).toString());
        } else {
          // 0.01
          onQuantityChange((Math.round(finalValue * 100) / 100).toString());
        }
      } else {
        onQuantityChange(clampedValue.toString());
      }
    }
    onTextBlur();
  };

  const toggleInputMode = () => {
    setIsSliderMode(!isSliderMode);
  };

  const currentQuantityNum = parseFloat(quantity) || 0;
  const thumbColor = '#c8c8c8';

  return (
    <View style={styles.sliderQuantityContainer}>
      {/* 수량 입력 섹션 */}
      <View style={styles.quantityEditContainer}>
        {/* 스테퍼 (무조건 1.0 단위) */}
        <View style={styles.stepper}>
          <TouchableOpacity
            style={styles.quantityButton}
            activeOpacity={0.7}
            onPress={() => handleStepperChange(false)}
            disabled={!isEditMode || currentQuantityNum <= 0}
          >
            <FontAwesome6 name="circle-minus" size={20} color="#999" />
          </TouchableOpacity>

          <TextInput
            style={styles.quantityInput}
            value={quantity}
            onChangeText={handleTextChange}
            onFocus={handleTextFocus}
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
            style={styles.quantityButton}
            activeOpacity={0.7}
            onPress={() => handleStepperChange(true)}
            disabled={!isEditMode}
          >
            <FontAwesome6 name="circle-plus" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* 슬라이더/스테퍼 토글 버튼 */}
        {isSliderMode ? (
          <TouchableOpacity
            style={styles.isSlidderButton}
            activeOpacity={0.7}
            onPress={toggleInputMode}
            disabled={!isEditMode}
          >
            <FontAwesome6 name={'caret-up'} size={24} color={'#999'} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.isNotSlidderButton}
            activeOpacity={0.7}
            onPress={toggleInputMode}
            disabled={!isEditMode}
          >
            <FontAwesome6 name={'caret-down'} size={24} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* 슬라이더 섹션 (단위별 스텝 적용) */}
      {isSliderMode && (
        <View style={styles.sliderSection}>
          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={maxQuantity}
              step={sliderStep} // 단위별 스텝 적용
              value={currentQuantityNum}
              onValueChange={handleSliderChange}
              onSlidingStart={() => setIsSliding(true)}
              onSlidingComplete={handleSliderComplete}
              minimumTrackTintColor="limegreen"
              maximumTrackTintColor="#f2f2f2"
              thumbTintColor={thumbColor}
              disabled={!isEditMode}
            />
          </View>

          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabel}>0</Text>
            <Text style={styles.sliderLabel}>
              {/* 포맷된 최대값 표시 */}
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
