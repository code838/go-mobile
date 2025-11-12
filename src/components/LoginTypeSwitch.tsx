import { Colors } from '@/constants/colors';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

export type LoginType = 'phone' | 'email';

interface LoginTypeSwitchProps {
  value: LoginType;
  onChange: (type: LoginType) => void;
}

/**
 * 登录类型切换组件
 * 支持手机号和邮箱切换，带有流畅的动画效果
 */
export default function LoginTypeSwitch({ value, onChange }: LoginTypeSwitchProps) {
  const { t } = useTranslation();
  const [containerWidth, setContainerWidth] = useState(0);
  
  // 动画值
  const translateX = useSharedValue(4);
  const phoneOpacity = useSharedValue(1);
  const emailOpacity = useSharedValue(0.6);

  // 获取容器宽度
  function handleLayout(event: LayoutChangeEvent) {
    const { width } = event.nativeEvent.layout;
    setContainerWidth(width);
  }

  // 当 value 改变时更新动画值
  useEffect(() => {
    if (containerWidth === 0) return;
    
    // 滑块宽度是容器宽度的一半
    const sliderWidth = (containerWidth - 8) / 2;
    
    translateX.value = withTiming(value === 'phone' ? 4 : sliderWidth + 4, {
      duration: 200,
    });
    phoneOpacity.value = withTiming(value === 'phone' ? 1 : 0.6, {
      duration: 200,
    });
    emailOpacity.value = withTiming(value === 'email' ? 1 : 0.6, {
      duration: 200,
    });
  }, [value, containerWidth]);

  // 滑块动画样式
  const sliderAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  // 手机号文字动画样式
  const phoneTextAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: phoneOpacity.value,
    };
  });

  // 邮箱文字动画样式
  const emailTextAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: emailOpacity.value,
    };
  });

  return (
    <View style={styles.container} onLayout={handleLayout}>
      {/* 背景滑块 */}
      <Animated.View style={[styles.slider, sliderAnimatedStyle]} />
      
      {/* 手机号选项 */}
      <Pressable
        style={styles.option}
        onPress={() => onChange('phone')}
      >
        <Animated.View style={phoneTextAnimatedStyle}>
          <Text style={[
            styles.optionText,
            value === 'phone' && styles.activeText
          ]}>
            {t('loginType.phone')}
          </Text>
        </Animated.View>
      </Pressable>

      {/* 邮箱选项 */}
      <Pressable
        style={styles.option}
        onPress={() => onChange('email')}
      >
        <Animated.View style={emailTextAnimatedStyle}>
          <Text style={[
            styles.optionText,
            value === 'email' && styles.activeText
          ]}>
            {t('loginType.email')}
          </Text>
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 4,
    position: 'relative',
    width: '100%',
  },
  slider: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: '50%',
    height: '100%',
    backgroundColor: Colors.brand,
    borderRadius: 6,
    marginLeft: -4,
  },
  option: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6e6e70',
  },
  activeText: {
    color: '#fff',
  },
});

