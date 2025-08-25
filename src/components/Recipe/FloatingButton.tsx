/*
Recipe Screen Sub Menu Buttons
*
- Scroll To Top Button
- Plus Button : 45deg Rotate when Clicked
- Sub Menu : fade in-out 0 to 1 when Plus Button Clicked
--- AI Button
--- Create Recipe Button
*
*/

import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, Text, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import { floatingButtonStyles as styles } from './styles';

interface FloatingButtonProps {
  isMenuOpen: boolean;
  onToggleMenu: () => void;
  onRecipeRegister: () => void;
  onAIRecommend: () => void;
  showScrollToTop?: boolean;
  onScrollToTop?: () => void;
}

const FloatingButton: React.FC<FloatingButtonProps> = ({
  isMenuOpen,
  onToggleMenu,
  onRecipeRegister,
  onAIRecommend,
  showScrollToTop = false,
  onScrollToTop,
}) => {
  const fadeAnim = useRef(new Animated.Value(isMenuOpen ? 1 : 0)).current; // Sub Menu Fade
  const rotateAnim = useRef(new Animated.Value(isMenuOpen ? 1 : 0)).current; // Plus Button Rotate
  const translateXAnim = useRef(new Animated.Value(isMenuOpen ? 1 : 0)).current; // Plus Button Background Move
  const scrollButtonFadeAnim = useRef(
    new Animated.Value(showScrollToTop ? 1 : 0),
  ).current; // Scroll Button Fade

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: isMenuOpen ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: isMenuOpen ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateXAnim, {
        toValue: isMenuOpen ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isMenuOpen, fadeAnim, rotateAnim, translateXAnim]);

  useEffect(() => {
    Animated.timing(scrollButtonFadeAnim, {
      toValue: showScrollToTop && !isMenuOpen ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showScrollToTop, isMenuOpen, scrollButtonFadeAnim]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  const translateX = translateXAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [35, 0],
  });

  return (
    <>
      {/* Scroll To Top Button */}
      {showScrollToTop && onScrollToTop && !isMenuOpen && (
        <Animated.View
          style={[
            styles.scrollToTopContainer,
            { opacity: scrollButtonFadeAnim },
          ]}
        >
          <TouchableOpacity
            style={styles.scrollToTopButton}
            onPress={onScrollToTop}
            activeOpacity={0.8}
          >
            <Icon name="north" size={24} color="white" />
          </TouchableOpacity>
        </Animated.View>
      )}

      <View style={styles.container}>
        {/* Floating Menus */}
        <Animated.View
          style={[
            isMenuOpen ? styles.floatingMenuOpen : styles.floatingMenuClosed,
            { opacity: fadeAnim },
          ]}
        >
          <TouchableOpacity
            style={[styles.menuItem, styles.aiMenuItem]}
            onPress={onAIRecommend}
            activeOpacity={0.8}
          >
            <Icon name="auto-awesome" size={20} color="white" />
            <Text style={styles.menuText}>AI 추천받기</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.menuItem, styles.registerMenuItem]}
            onPress={onRecipeRegister}
            activeOpacity={0.8}
          >
            <FontAwesome6 name="plus" size={24} color="#fff" />
            <Text style={styles.menuText}>레시피 등록</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Plus Button */}
        <Animated.View style={[{ transform: [{ translateX: translateX }] }]}>
          <TouchableOpacity
            style={styles.plusButton}
            onPress={onToggleMenu}
            activeOpacity={0.8}
          >
            <Animated.View
              style={{
                transform: [{ rotate: rotation }],
              }}
            >
              <Icon name="add" size={32} color="#f8f8f8" />
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </>
  );
};

export default FloatingButton;
