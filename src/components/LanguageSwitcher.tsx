import { changeLanguage } from '@/config/i18n';
import { useBoundStore } from '@/store';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';


export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [buttonLayout, setButtonLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const currentLang = i18n.language;

  const languageList = useBoundStore(state => state.languageList);

  const switchLanguage = async (lang: string) => {
    try {
      await changeLanguage(lang);
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
                maxHeight: 300
              },
            ]}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              {languageList.map((item) => (
                <TouchableOpacity
                  key={item.langflag}
                  style={[
                    styles.option,
                    currentLang === item.langflag && styles.optionActive,
                  ]}
                  onPress={() => switchLanguage(item.langflag)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      currentLang === item.langflag && styles.optionTextActive,
                    ]}
                  >
                    {item.langname}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
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
    width: 160,
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
    gap: 8,
  },
  optionActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  flagIcon: {
    width: 24,
    height: 16,
    borderRadius: 2,
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

