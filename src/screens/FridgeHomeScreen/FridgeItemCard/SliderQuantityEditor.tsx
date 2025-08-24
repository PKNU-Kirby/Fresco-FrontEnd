import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, TextInput } from 'react-native';
import Slider from '@react-native-community/slider';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import CustomText from '../../../components/common/CustomText';
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
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [isSliderMode, setIsSliderMode] = useState(false);

  // 편집 모드가 변경될 때 사용자 조작 상태 리셋
  useEffect(() => {
    if (!isEditMode) {
      setHasUserInteracted(false);
    }
  }, [isEditMode]);

  const handleSliderChange = (value: number) => {
    console.log('🎚️ Slider changed:', {
      rawValue: value,
      maxQuantity,
      step: Number.isInteger(maxQuantity) ? 1 : 0.1,
      currentQuantity: quantity,
      isMaxQuantityInteger: Number.isInteger(maxQuantity),
    });

    setHasUserInteracted(true);
    const isMaxQuantityInteger = Number.isInteger(maxQuantity);

    let newQuantity: string;
    if (isMaxQuantityInteger) {
      newQuantity = Math.round(value).toString();
    } else {
      newQuantity = (Math.round(value * 10) / 10).toString();
    }

    console.log('🎯 Final quantity:', newQuantity);
    onQuantityChange(newQuantity);
  };

  const handleSliderComplete = (value: number) => {
    setIsSliding(false);
    setHasUserInteracted(true);
    handleSliderChange(value);
  };

  const handleIncrement = () => {
    const currentNum = parseFloat(quantity) || 0;
    const newQuantity = currentNum + 1;

    // 플러스 버튼으로 현재 maxQuantity를 초과하는 경우에만 maxQuantity 업데이트
    if (newQuantity > maxQuantity) {
      onMaxQuantityChange?.(newQuantity);
    }

    setHasUserInteracted(true);
    onQuantityChange(newQuantity.toString());
  };

  const handleDecrement = () => {
    const currentNum = parseFloat(quantity) || 0;
    const newQuantity = Math.max(0, currentNum - 1);
    setHasUserInteracted(true);
    onQuantityChange(newQuantity.toString());
  };

  const handleTextChange = (text: string) => {
    // 숫자와 소수점만 허용
    let numericText = text.replace(/[^0-9.]/g, '');

    // 소수점이 여러 개 있으면 첫 번째만 유지
    const parts = numericText.split('.');
    if (parts.length > 2) {
      numericText = parts[0] + '.' + parts.slice(1).join('');
    }

    // 소수점 한 자리까지만 허용
    if (parts.length === 2 && parts[1].length > 1) {
      numericText = parts[0] + '.' + parts[1].substring(0, 1);
    }

    setHasUserInteracted(true);

    // 키보드 입력으로 maxQuantity 초과 시 maxQuantity 업데이트
    if (numericText !== '') {
      const numValue = parseFloat(numericText) || 0;
      if (numValue > maxQuantity) {
        onMaxQuantityChange?.(numValue);
      }
    }

    onQuantityChange(numericText);
  };

  const handleTextFocus = () => {
    setIsInputFocused(true);
    setHasUserInteracted(true);
  };

  const handleTextBlur = () => {
    setIsInputFocused(false);
    // 빈 값이거나 0이면 0.1로 설정
    if (quantity === '' || parseFloat(quantity) === 0) {
      onQuantityChange('0.1');
    } else {
      // 유효한 숫자로 정리 (소수점 1자리까지)
      const numValue = parseFloat(quantity) || 0.1;
      const cleanValue = Math.max(0.1, numValue);
      const roundedValue = Math.round(cleanValue * 10) / 10;
      onQuantityChange(roundedValue.toString());
    }
    onTextBlur();
  };

  const toggleInputMode = () => {
    setIsSliderMode(!isSliderMode);
  };

  const thumbColor = '#c8c8c8';

  return (
    <View style={styles.sliderQuantityContainer}>
      {/* 수량 입력 섹션 */}
      <View style={styles.quantityEditContainer}>
        <View style={styles.stepper}>
          <TouchableOpacity
            style={styles.quantityButton}
            activeOpacity={0.7}
            onPress={handleDecrement}
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
            selectTextOnFocus
            placeholder="0"
          />
          <TouchableOpacity style={styles.unitSelector} onPress={onUnitPress}>
            <CustomText style={styles.quantityUnit}>{unit}</CustomText>
            <CustomText style={styles.unitDropdownIcon}>▼</CustomText>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quantityButton}
            activeOpacity={0.7}
            onPress={handleIncrement}
          >
            <FontAwesome6 name="circle-plus" size={20} color="#999" />
          </TouchableOpacity>
        </View>
        {isSliderMode ? (
          <TouchableOpacity
            style={styles.isSlidderButton}
            activeOpacity={0.7}
            onPress={toggleInputMode}
          >
            <FontAwesome6 name={'caret-up'} size={24} color={'#999'} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.isNotSlidderButton}
            activeOpacity={0.7}
            onPress={toggleInputMode}
          >
            <FontAwesome6 name={'caret-down'} size={24} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* 슬라이더 섹션 - 슬라이더 모드일 때만 표시 */}
      {isSliderMode && (
        <View style={styles.sliderSection}>
          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={maxQuantity}
              step={Number.isInteger(maxQuantity) ? 1 : 0.1}
              value={parseFloat(quantity) || 0}
              onValueChange={handleSliderChange}
              onSlidingStart={() => setIsSliding(true)}
              onSlidingComplete={handleSliderComplete}
              minimumTrackTintColor="limegreen"
              maximumTrackTintColor="#f2f2f2"
              thumbTintColor={thumbColor}
            />
            {/* 수량 범위 표시 */}
            <View style={styles.sliderLabels}>
              <CustomText style={styles.sliderLabel}>0</CustomText>
              <CustomText style={styles.sliderLabel}>{maxQuantity}</CustomText>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default SliderQuantityEditor;
