import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  TextInput,
  Animated,
  Text,
} from 'react-native';
import Slider from '@react-native-community/slider';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';

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
  const [isSliderMode, setIsSliderMode] = useState(false);
  const [slideAnimation] = useState(new Animated.Value(0));
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  // 편집 모드가 변경될 때 사용자 조작 상태 리셋
  useEffect(() => {
    if (!isEditMode) {
      setHasUserInteracted(false);
      setIsSliderMode(false);
    }
  }, [isEditMode]);

  // 슬라이더 토글 애니메이션
  const toggleSliderMode = () => {
    const toValue = isSliderMode ? 0 : 1;
    setIsSliderMode(!isSliderMode);

    Animated.timing(slideAnimation, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

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

  const handleIncrement = () => {
    const currentNum = parseFloat(quantity) || 0;
    const isInteger = Number.isInteger(maxQuantity);
    const increment = isInteger ? 1 : 0.1;
    const newQuantity = currentNum + increment;

    // 플러스 버튼으로 현재 maxQuantity를 초과하는 경우에만 maxQuantity 업데이트
    if (newQuantity > maxQuantity) {
      onMaxQuantityChange?.(newQuantity);
    }

    setHasUserInteracted(true);
    onQuantityChange(
      isInteger ? newQuantity.toString() : newQuantity.toFixed(1),
    );
  };

  const handleDecrement = () => {
    const currentNum = parseFloat(quantity) || 0;
    const isInteger = Number.isInteger(maxQuantity);
    const increment = isInteger ? 1 : 0.1;
    const newQuantity = Math.max(isInteger ? 0 : 0.1, currentNum - increment);

    setHasUserInteracted(true);
    onQuantityChange(
      isInteger ? newQuantity.toString() : newQuantity.toFixed(1),
    );
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

  const handleTextBlur = () => {
    // 빈 값이거나 0이면 적절한 최소값으로 설정
    const isInteger = Number.isInteger(maxQuantity);
    const minValue = isInteger ? 1 : 0.1;

    if (quantity === '' || parseFloat(quantity) === 0) {
      onQuantityChange(minValue.toString());
    } else {
      // 유효한 숫자로 정리
      const numValue = parseFloat(quantity) || minValue;
      const cleanValue = Math.max(minValue, numValue);
      const roundedValue = isInteger
        ? cleanValue
        : Math.round(cleanValue * 10) / 10;
      onQuantityChange(roundedValue.toString());
    }
    onTextBlur();
  };

  // 슬라이더 높이 애니메이션
  const sliderHeight = slideAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 80],
  });

  const sliderOpacity = slideAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  return (
    <View style={styles.container}>
      {/* 메인 수량 조절 컨트롤 */}
      <View style={styles.mainControls}>
        {/* 감소 버튼 */}
        <TouchableOpacity
          style={styles.controlButton}
          activeOpacity={0.7}
          onPress={handleDecrement}
        >
          <FontAwesome6 name="minus" size={16} color="#666" />
        </TouchableOpacity>

        {/* 수량 입력 */}
        <TextInput
          style={styles.quantityInput}
          value={quantity}
          onChangeText={handleTextChange}
          onBlur={handleTextBlur}
          keyboardType="decimal-pad"
          selectTextOnFocus
          placeholder="0"
          placeholderTextColor="#999"
        />

        {/* 단위 버튼 */}
        <TouchableOpacity style={styles.unitButton} onPress={onUnitPress}>
          <Text style={styles.unitText}>{unit}</Text>
        </TouchableOpacity>

        {/* 증가 버튼 */}
        <TouchableOpacity
          style={styles.controlButton}
          activeOpacity={0.7}
          onPress={handleIncrement}
        >
          <FontAwesome6 name="plus" size={16} color="#666" />
        </TouchableOpacity>

        {/* 슬라이더 토글 버튼 */}
        <TouchableOpacity
          style={styles.toggleButton}
          activeOpacity={0.7}
          onPress={toggleSliderMode}
        >
          <FontAwesome6
            name={isSliderMode ? 'chevron-up' : 'chevron-down'}
            size={16}
            color="#666"
          />
        </TouchableOpacity>
      </View>

      {/* 슬라이더 영역 (애니메이션) */}
      <Animated.View
        style={[
          styles.sliderContainer,
          {
            height: sliderHeight,
            opacity: sliderOpacity,
          },
        ]}
      >
        <View style={styles.sliderContent}>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={maxQuantity}
            step={Number.isInteger(maxQuantity) ? 1 : 0.1}
            value={parseFloat(quantity) || 0}
            onValueChange={handleSliderChange}
            minimumTrackTintColor="#4CAF50"
            maximumTrackTintColor="#e0e0e0"
            thumbTintColor="#4CAF50"
          />

          {/* 슬라이더 범위 표시 */}
          <View style={styles.rangeLabels}>
            <Text style={styles.rangeText}>0</Text>
            <Text style={styles.rangeText}>{maxQuantity}</Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

// 스타일
const styles = {
  container: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    marginVertical: 4,
  },
  mainControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 44,
  },
  controlButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  quantityInput: {
    flex: 1,
    height: 36,
    backgroundColor: '#fff',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  unitButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  unitText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  toggleButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sliderContainer: {
    overflow: 'hidden',
    marginTop: 8,
  },
  sliderContent: {
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  slider: {
    height: 40,
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginTop: -8,
  },
  rangeText: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
};

export default SliderQuantityEditor;
