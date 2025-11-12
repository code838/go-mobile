import { Colors } from '@/constants/colors';
import { getImageUrl } from '@/constants/urls';
import { AreaInfo } from '@/model/AreaInfo';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useImmer } from 'use-immer';
import BottomSheet from './BottomSheet';

interface AreaCodeSelectSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (area: AreaInfo) => void;
  selectedAreaCode?: string;
  areaList: AreaInfo[];
}

/**
 * 地区选择器组件
 * 用于选择国家/地区和对应的手机号前缀
 */
export default function AreaCodeSelectSheet({
  visible,
  onClose,
  onSelect,
  selectedAreaCode,
  areaList
}: AreaCodeSelectSheetProps) {
  const { t } = useTranslation();
  const [state, setState] = useImmer({
    searchText: '',
  });

  /**
   * 选择地区
   */
  function handleSelect(area: AreaInfo) {
    onSelect(area);
    onClose();
  }

  /**
   * 设置搜索文本
   */
  function setSearchText(text: string) {
    setState(draft => {
      draft.searchText = text;
    });
  }

  // 过滤地区列表
  const filteredAreaList = areaList.filter(area => 
    area.area.includes(state.searchText)
  );

  return (
    <BottomSheet visible={visible} title={t('areaCode.selectCountry')} onClose={onClose}>
      {/* 搜索框 */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={t('areaCode.searchPlaceholder')}
          placeholderTextColor="#6e6e70"
          value={state.searchText}
          onChangeText={setSearchText}
          keyboardType="phone-pad"
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {filteredAreaList.map((area, index) => {
          const isSelected = area.area === selectedAreaCode;
          return (
            <Pressable
              key={`${area.area}-${index}`}
              style={[styles.areaItem, isSelected && styles.areaItemSelected]}
              onPress={() => handleSelect(area)}
              android_ripple={{ color: 'rgba(255, 255, 255, 0.1)' }}>
              {/* 国旗图标 */}
              <Image 
                source={{ uri: getImageUrl(area.image) }} 
                style={styles.flagIcon} 
                contentFit="contain"
              />

              {/* 地区码 */}
              <View style={styles.areaInfo}>
                <Text style={[styles.areaCode, isSelected && styles.areaCodeSelected]}>
                  {area.area}
                </Text>
              </View>

              {/* 选中标记 */}
              {isSelected && (
                <View style={styles.checkMark}>
                  <View style={styles.checkCircle}>
                    <Text style={styles.checkText}>✓</Text>
                  </View>
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    height: 40,
    paddingHorizontal: 12,
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },
  scrollView: {
    maxHeight: 400,
  },
  content: {
    gap: 4,
  },
  areaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  areaItemSelected: {
    borderColor: Colors.brand,
  },
  flagIcon: {
    width: 28,
    height: 20,
    borderRadius: 2,
  },
  areaInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  areaCode: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.title,
  },
  areaCodeSelected: {
    color: Colors.brand,
  },
  checkMark: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.title,
  },
});

