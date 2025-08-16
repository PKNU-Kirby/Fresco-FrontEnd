/**
 *
  <CustomText>안녕하세요</CustomText>

  <CustomText weight="bold" color="limegreen" size={16}>제목 텍스트</CustomText>

  <CustomText weight="medium" color="limegreen" style={{ marginTop: 10 }}>
  설명 텍스트
  </CustomText>

*/

import React from 'react';
import { Text, TextProps, StyleProp, TextStyle } from 'react-native';

type FontWeight = 'regular' | 'medium' | 'bold' | 'extrabold';

interface CustomTextProps extends TextProps {
  weight?: FontWeight;
  style?: StyleProp<TextStyle>;
  children: React.ReactNode;
  color?: string;
  size?: number;
}

const FONT_FAMILY_MAP: Record<FontWeight, string> = {
  regular: 'Pretendard-Regular',
  medium: 'Pretendard-Medium',
  bold: 'Pretendard-Bold',
  extrabold: 'Pretendard-ExtraBold',
};

const DEFAULT_TEXT_COLOR = '#333';
const DEFAULT_FONT_WEIGHT: FontWeight = 'regular';

const CustomText: React.FC<CustomTextProps> = ({
  weight = DEFAULT_FONT_WEIGHT,
  style,
  children,
  color = DEFAULT_TEXT_COLOR,
  size,
  ...rest
}) => {
  const computedStyle: TextStyle = {
    fontFamily: FONT_FAMILY_MAP[weight],
    color,
    ...(size && { fontSize: size }),
  };

  return (
    <Text style={[computedStyle, style]} {...rest}>
      {children}
    </Text>
  );
};

export default CustomText;
