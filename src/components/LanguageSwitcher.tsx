import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [buttonLayout, setButtonLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const currentLang = i18n.language;

  const switchLanguage = async (lang: 'en' | 'zh') => {
    try {
      await i18n.changeLanguage(lang);
      await AsyncStorage.setItem('language', lang);
      setVisible(false);
    } catch (error) {
      console.error('切换语言失败:', error);
    }
  };

  return (
    <>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setVisible(true)}
        onLayout={(event) => {
          const { x, y, width, height } = event.nativeEvent.layout;
          // 需要获取相对于屏幕的位置
          event.target.measure((fx, fy, w, h, px, py) => {
            setButtonLayout({ x: px, y: py, width: w, height: h });
          });
        }}
      >
        <Ionicons name="earth" size={20} color="#FFFFFF" />
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setVisible(false)}
        >
          <View
            style={[
              styles.dropdown,
              {
                position: 'absolute',
                top: buttonLayout.y + buttonLayout.height + 4,
                right: 16,
              },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.option,
                currentLang === 'en' && styles.optionActive,
              ]}
              onPress={() => switchLanguage('en')}
            >
              <Text
                style={[
                  styles.optionText,
                  currentLang === 'en' && styles.optionTextActive,
                ]}
              >
                English
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.option,
                currentLang === 'zh' && styles.optionActive,
              ]}
              onPress={() => switchLanguage('zh')}
            >
              <Text
                style={[
                  styles.optionText,
                  currentLang === 'zh' && styles.optionTextActive,
                ]}
              >
                简体中文
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 36,
    height: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  dropdown: {
    backgroundColor: '#1D1D1D',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    width: 120,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  option: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
  },
  optionActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  optionText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  optionTextActive: {
    color: '#6741FF',
    fontWeight: '600',
  },
});

