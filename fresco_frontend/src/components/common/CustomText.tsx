import React from 'react';
import {Text, TextProps, StyleProp, TextStyle} from 'react-native';

type FontWeight = 'regular' | 'medium' | 'bold' | 'extrabold';

interface CustomTextProps extends TextProps {
  weight?: FontWeight;
  style?: StyleProp<TextStyle>;
  children: React.ReactNode;
}

const fontMap: Record<FontWeight, string> = {
  regular: 'Pretendard-Regular',
  medium: 'Pretendard-Medium',
  bold: 'Pretendard-Bold',
  extrabold: 'Pretendard-ExtraBold',
};

// props 분해
const CustomText: React.FC<CustomTextProps> = ({
  weight = 'regular', // default : Pretendard-Regular
  style, // user custom style
  children, // Text
  ...rest
}) => {
  const computedStyle: TextStyle = {
    fontFamily: fontMap[weight],
    color: '#000000',
  };
  return (
    <Text style={[computedStyle, style]} {...rest}>
      {children}
    </Text>
  );
};

export default CustomText;
