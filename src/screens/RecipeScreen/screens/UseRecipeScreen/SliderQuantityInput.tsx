import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, TextInput, Text, Alert } from 'react-native';
import Slider from '@react-native-community/slider';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import { sliderQuantityStyles as styles } from './styles';

interface SliderQuantityEditorProps {
  quantity: string;
  unit: string;
  maxQuantity: number;
  availableQuantity: number; // 🔧 새로 추가: 현재 보유 수량
  isEditMode: boolean;
  onQuantityChange: (quantity: string) => void;
  onMaxQuantityChange?: (maxQuantity: number) => void;
  onTextBlur: () => void;
}

const SliderQuantityInput: React.FC<SliderQuantityEditorProps> = ({
  quantity,
  unit,
  maxQuantity,
  availableQuantity, // 🔧 현재 보유 수량
  isEditMode,
  onQuantityChange,
  onMaxQuantityChange,
  onTextBlur,
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

  // 🔧 수량에 따른 정밀도 결정 함수
  const getPrecisionConfig = (quantity: number) => {
    const isSmallQuantity = quantity < 10;
    return {
      decimalPlaces: isSmallQuantity ? 2 : 0, // 10 미만: 소수점 2자리, 10 이상: 정수
      step: isSmallQuantity ? 0.01 : 1, // 10 미만: 0.01 단위, 10 이상: 1 단위
      minValue: isSmallQuantity ? 0.01 : 1, // 10 미만: 0.01, 10 이상: 1
    };
  };

  // 🔧 수량 포맷팅 함수
  const formatQuantity = (value: number): string => {
    const config = getPrecisionConfig(value);
    if (config.decimalPlaces === 0) {
      return Math.round(value).toString(); // 정수로 표시
    }
    return value.toFixed(config.decimalPlaces);
  };

  // 🔧 수량 유효성 검사 함수
  const validateQuantity = (inputQuantity: number): boolean => {
    return inputQuantity <= availableQuantity;
  };

  // 🔧 보유량 초과 시 경고 및 옵션 제공
  const handleExceedQuantity = (inputQuantity: number, inputText: string) => {
    Alert.alert(
      '수량 초과',
      `현재 보유량은 ${availableQuantity}${unit}입니다.\n입력한 수량: ${inputQuantity}${unit}\n\n식재료를 모두 사용하시겠습니까?`,
      [
        {
          text: '취소',
          style: 'cancel',
          onPress: () => {
            // 이전 값으로 되돌리기 (또는 보유량으로 설정)
            const validQuantity = Math.min(
              parseFloat(quantity) || 0,
              availableQuantity,
            );
            onQuantityChange(formatQuantity(validQuantity));
          },
        },
        {
          text: '전체 사용',
          onPress: () => {
            // 보유량 전체를 사용량으로 설정
            onQuantityChange(formatQuantity(availableQuantity));
            Alert.alert(
              '전체 사용 설정',
              `${formatQuantity(
                availableQuantity,
              )}${unit}를 모두 사용하도록 설정되었습니다.`,
              [{ text: '확인' }],
            );
          },
        },
      ],
      { cancelable: false },
    );
  };

  const handleSliderChange = (value: number) => {
    console.log('🎚️ Slider changed:', {
      rawValue: value,
      maxQuantity,
      availableQuantity,
      currentQuantity: quantity,
    });

    setHasUserInteracted(true);

    // 🔧 수량에 따른 정밀도 적용
    const config = getPrecisionConfig(value);
    const roundedValue = Math.round(value / config.step) * config.step;

    // 🔧 슬라이더는 자동으로 보유량을 초과할 수 없도록 제한
    const validQuantity = Math.min(roundedValue, availableQuantity);
    const formattedQuantity = formatQuantity(validQuantity);

    console.log('🎯 Final quantity:', formattedQuantity);
    onQuantityChange(formattedQuantity);
  };

  const handleSliderComplete = (value: number) => {
    setIsSliding(false);
    setHasUserInteracted(true);
    handleSliderChange(value);
  };

  const handleIncrement = () => {
    const currentNum = parseFloat(quantity) || 0;
    const config = getPrecisionConfig(currentNum || 1); // 🔧 0일 때는 1 기준으로 config 설정
    const newQuantity = currentNum + config.step;

    // 🔧 증가 시 보유량 체크
    if (newQuantity > availableQuantity) {
      handleExceedQuantity(newQuantity, formatQuantity(newQuantity));
      return;
    }

    // 플러스 버튼으로 현재 maxQuantity를 초과하는 경우에만 maxQuantity 업데이트
    if (newQuantity > maxQuantity) {
      onMaxQuantityChange?.(newQuantity);
    }

    setHasUserInteracted(true);
    onQuantityChange(formatQuantity(newQuantity));
  };

  const handleDecrement = () => {
    const currentNum = parseFloat(quantity) || 0;
    const config = getPrecisionConfig(currentNum);
    const newQuantity = Math.max(0, currentNum - config.step); // 🔧 0까지 감소 가능

    setHasUserInteracted(true);
    onQuantityChange(formatQuantity(newQuantity));
  };

  const handleTextChange = (text: string) => {
    // 숫자와 소수점만 허용
    let numericText = text.replace(/[^0-9.]/g, '');

    // 소수점이 여러 개 있으면 첫 번째만 유지
    const parts = numericText.split('.');
    if (parts.length > 2) {
      numericText = parts[0] + '.' + parts.slice(1).join('');
    }

    // 🔧 10 미만일 때는 소수점 둘째자리까지, 10 이상일 때는 정수만 허용
    if (parts.length === 2) {
      const integerPart = parseFloat(parts[0]) || 0;

      if (integerPart >= 10) {
        // 10 이상이면 소수점 제거하고 정수만
        numericText = Math.round(parseFloat(numericText)).toString();
      } else {
        // 10 미만이면 소수점 둘째자리까지
        if (parts[1].length > 2) {
          numericText = parts[0] + '.' + parts[1].substring(0, 2);
        }
      }
    }

    setHasUserInteracted(true);

    // 🔧 텍스트 입력 중에는 일단 값을 저장 (유효성 검사는 blur에서)
    onQuantityChange(numericText);
  };

  const handleTextFocus = () => {
    setIsInputFocused(true);
    setHasUserInteracted(true);
  };

  const handleTextBlur = () => {
    setIsInputFocused(false);

    const inputValue = parseFloat(quantity) || 0;

    // 🔧 보유량 초과 체크
    if (inputValue > availableQuantity && inputValue > 0) {
      handleExceedQuantity(inputValue, quantity);
      return; // 경고 처리 후 함수 종료
    }

    // 🔧 빈 값이거나 0이면 0으로 설정 (최소값 제한 제거)
    if (quantity === '' || inputValue <= 0) {
      onQuantityChange('0');
    } else {
      // 유효한 숫자로 정리
      const cleanValue = Math.min(inputValue, availableQuantity);
      onQuantityChange(formatQuantity(cleanValue));

      // maxQuantity 업데이트 로직
      if (cleanValue > maxQuantity) {
        onMaxQuantityChange?.(cleanValue);
      }
    }

    onTextBlur();
  };

  const toggleInputMode = () => {
    setIsSliderMode(!isSliderMode);
  };

  // 🔧 실제 슬라이더 최대값은 보유량과 maxQuantity 중 작은 값
  const effectiveMaxQuantity = Math.min(maxQuantity, availableQuantity);

  // 🔧 현재 수량에 따른 슬라이더 설정
  const currentQuantityValue = parseFloat(quantity) || 0;
  const sliderConfig = getPrecisionConfig(
    Math.max(currentQuantityValue, effectiveMaxQuantity),
  );

  return (
    <View style={styles.sliderQuantityContainer}>
      {/* 🔧 보유량 표시 추가 */}
      <View style={styles.availableQuantityInfo}>
        <Text style={styles.availableQuantityText}>
          보유: {formatQuantity(availableQuantity)}
          {unit}
        </Text>
      </View>

      {/* 수량 입력 섹션 */}
      <View style={styles.quantityEditContainer}>
        <View style={styles.stepper}>
          <TouchableOpacity
            style={[
              styles.quantityButton,
              // 🔧 0일 때는 비활성화
              parseFloat(quantity) <= 0 && styles.quantityButtonDisabled,
            ]}
            activeOpacity={0.7}
            onPress={handleDecrement}
            disabled={parseFloat(quantity) <= 0}
          >
            <FontAwesome6
              name="circle-minus"
              size={20}
              color={parseFloat(quantity) <= 0 ? '#ccc' : '#999'}
            />
          </TouchableOpacity>
          <TextInput
            style={[
              styles.quantityInput,
              // 🔧 보유량 초과 시 경고 색상
              parseFloat(quantity) > availableQuantity &&
                styles.quantityInputError,
            ]}
            value={quantity}
            onChangeText={handleTextChange}
            onFocus={handleTextFocus}
            onBlur={handleTextBlur}
            keyboardType="decimal-pad"
            selectTextOnFocus
            placeholder="0"
          />
          <TouchableOpacity style={styles.unitSelector}>
            <Text style={styles.quantityUnit}>{unit}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.quantityButton,
              // 🔧 보유량에 도달하면 비활성화
              parseFloat(quantity) >= availableQuantity &&
                styles.quantityButtonDisabled,
            ]}
            activeOpacity={0.7}
            onPress={handleIncrement}
            disabled={parseFloat(quantity) >= availableQuantity}
          >
            <FontAwesome6
              name="circle-plus"
              size={20}
              color={
                parseFloat(quantity) >= availableQuantity ? '#ccc' : '#999'
              }
            />
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
              maximumValue={effectiveMaxQuantity} // 🔧 실제 사용 가능한 최대값
              step={sliderConfig.step} // 🔧 수량에 따른 동적 step
              value={Math.min(parseFloat(quantity) || 0, effectiveMaxQuantity)}
              onValueChange={handleSliderChange}
              onSlidingStart={() => setIsSliding(true)}
              onSlidingComplete={handleSliderComplete}
              minimumTrackTintColor="limegreen"
              maximumTrackTintColor="#f2f2f2"
              thumbTintColor="#c8c8c8"
            />
            {/* 수량 범위 표시 */}
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabel}>0</Text>
              <Text style={styles.sliderLabel}>
                {formatQuantity(effectiveMaxQuantity)}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default SliderQuantityInput;
