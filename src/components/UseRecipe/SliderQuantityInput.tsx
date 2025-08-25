// SliderQuantityInput.tsx
import React, { useState, useEffect } from 'react';
import Slider from '@react-native-community/slider';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import { sliderQuantityStyles } from '../../screens/RecipeScreen/UseRecipeScreen/styles';

interface SliderQuantityInputProps {
  quantity: string;
  unit: string;
  maxQuantity: number;
  availableQuantity: number;
  isEditMode: boolean;
  onQuantityChange: (quantity: string) => void;
  onMaxQuantityChange: (maxQuantity: number) => void;
  onTextBlur: () => void;
}

const SliderQuantityInput: React.FC<SliderQuantityInputProps> = ({
  quantity,
  unit,
  maxQuantity,
  availableQuantity,
  isEditMode,
  onQuantityChange,
  onMaxQuantityChange,
  onTextBlur,
}) => {
  const [isSliderMode, setIsSliderMode] = useState(true);
  const [localQuantity, setLocalQuantity] = useState(quantity);

  // 단위별 step 계산
  const getStepSize = (unit: string, maxValue: number) => {
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
  const sliderStep = getStepSize(unit, maxQuantity);
  const stepperStep = getStepperStep();

  useEffect(() => {
    setLocalQuantity(quantity);
  }, [quantity]);

  // step unit으로 반올림
  const roundToStep = (value: number, step: number) => {
    return Math.round(value / step) * step;
  };

  // Stepper increment, derecment
  const handleStepperChange = (increment: boolean) => {
    const currentValue = parseFloat(localQuantity) || 0;
    const step = stepperStep;

    let newValue;
    if (increment) {
      newValue = Math.min(currentValue + step, maxQuantity);
    } else {
      newValue = Math.max(currentValue - step, 0);
    }

    // to Integer
    newValue = Math.round(newValue);

    const newQuantityStr = newValue.toString();
    setLocalQuantity(newQuantityStr);
    onQuantityChange(newQuantityStr);
  };

  // Sleder change
  const handleSliderChange = (value: number) => {
    const roundedValue = roundToStep(value, sliderStep);
    const clampedValue = Math.max(0, Math.min(roundedValue, maxQuantity));

    // 소수점 처리
    const finalValue =
      sliderStep < 1
        ? parseFloat(clampedValue.toFixed(2))
        : Math.round(clampedValue);

    const newQuantityStr = finalValue.toString();
    setLocalQuantity(newQuantityStr);
    onQuantityChange(newQuantityStr);
  };

  // text Input
  const handleTextChange = (text: string) => {
    // 숫자, 소수점
    const cleanText = text.replace(/[^0-9.]/g, '');
    setLocalQuantity(cleanText);
  };

  const handleTextBlur = () => {
    const numValue = parseFloat(localQuantity) || 0;
    const clampedValue = Math.max(0, Math.min(numValue, maxQuantity));

    // 슬라이더 모드일 때는 스텝 단위로 반올림
    const finalValue = isSliderMode
      ? roundToStep(clampedValue, sliderStep)
      : clampedValue;

    const formattedValue =
      sliderStep < 1 && finalValue !== Math.round(finalValue)
        ? finalValue.toFixed(2)
        : Math.round(finalValue).toString();

    setLocalQuantity(formattedValue);
    onQuantityChange(formattedValue);
    onTextBlur();
  };

  // 최대 수량 업데이트
  const updateMaxQuantity = () => {
    onMaxQuantityChange(availableQuantity);
  };

  const currentQuantityNum = parseFloat(localQuantity) || 0;

  return (
    <View style={sliderQuantityStyles.sliderQuantityContainer}>
      {/* 수량 입력 섹션 */}
      <View style={sliderQuantityStyles.quantityEditContainer}>
        {/* 스테퍼 (정수 단위) */}
        <Text style={sliderQuantityStyles.inputText}>사용할 수량:</Text>
        <View style={sliderQuantityStyles.stepper}>
          <TouchableOpacity
            style={[
              sliderQuantityStyles.quantityButton,
              currentQuantityNum <= 0 &&
                sliderQuantityStyles.quantityButtonDisabled,
            ]}
            activeOpacity={0.7}
            onPress={() => handleStepperChange(false)}
            disabled={!isEditMode || currentQuantityNum <= 0}
          >
            <FontAwesome6 name="circle-minus" size={24} color="#999" />
          </TouchableOpacity>

          <TextInput
            style={sliderQuantityStyles.quantityInput}
            value={localQuantity}
            onChangeText={handleTextChange}
            onBlur={handleTextBlur}
            keyboardType="decimal-pad"
            editable={isEditMode}
            selectTextOnFocus
            placeholder="0"
          />

          <TouchableOpacity
            style={[
              sliderQuantityStyles.quantityButton,
              currentQuantityNum >= maxQuantity &&
                sliderQuantityStyles.quantityButtonDisabled,
            ]}
            activeOpacity={0.7}
            onPress={() => handleStepperChange(true)}
            disabled={!isEditMode || currentQuantityNum >= maxQuantity}
          >
            <FontAwesome6 name="circle-plus" size={24} color="#999" />
          </TouchableOpacity>
        </View>

        {/* 단위 표시 */}
        <View style={sliderQuantityStyles.unitSelector}>
          <Text style={sliderQuantityStyles.quantityUnit}>{unit}</Text>
        </View>

        {/* 슬라이더/스테퍼 토글 버튼 */}
        <TouchableOpacity
          style={
            isSliderMode
              ? sliderQuantityStyles.isSliderButton
              : sliderQuantityStyles.isNotSliderButton
          }
          activeOpacity={0.7}
          onPress={() => setIsSliderMode(!isSliderMode)}
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
        <View style={sliderQuantityStyles.sliderQuantityContainer}>
          <View style={sliderQuantityStyles.sliderSection}>
            <View style={sliderQuantityStyles.sliderContainer}>
              <Slider
                style={sliderQuantityStyles.slider}
                minimumValue={0}
                maximumValue={maxQuantity}
                value={currentQuantityNum}
                onValueChange={handleSliderChange}
                step={sliderStep}
                minimumTrackTintColor="limegreen"
                maximumTrackTintColor="#f2f2f2"
                disabled={!isEditMode}
              />
            </View>

            <View style={sliderQuantityStyles.sliderLabels}>
              <Text style={sliderQuantityStyles.sliderLabel}>0</Text>
              <Text style={sliderQuantityStyles.sliderLabel}>
                {/* 단위에 따른 표시 형식 */}
                {sliderStep < 1
                  ? maxQuantity.toFixed(2)
                  : Math.round(maxQuantity)}
                {unit}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default SliderQuantityInput;
