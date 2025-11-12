import { Colors } from '@/constants/colors';
import { getImageUrl } from '@/constants/urls';
import { AreaInfo } from '@/model/AreaInfo';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useImmer } from 'use-immer';

interface AreaCodeDropdownProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (area: AreaInfo) => void;
  selectedAreaCode?: string;
  areaList: AreaInfo[];
  buttonLayout?: { x: number; y: number; width: number; height: number };
}

/**
 * 地区选择下拉菜单组件
 * 使用下拉菜单方式显示，而不是底部弹窗
 */
export default function AreaCodeDropdown({
  visible,
  onClose,
  onSelect,
  selectedAreaCode,
  areaList,
  buttonLayout,
}: AreaCodeDropdownProps) {
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

  if (!visible) return null;

  // 计算下拉菜单的位置和宽度
  const dropdownTop = buttonLayout ? buttonLayout.y + buttonLayout.height + 8 : 120;
  const dropdownLeft = buttonLayout ? buttonLayout.x : 48;
  const dropdownWidth = buttonLayout ? buttonLayout.width : 120;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      {/* 背景遮罩 */}
      <Pressable style={styles.overlay} onPress={onClose}>
        {/* 下拉菜单容器 */}
        <View 
          style={[
            styles.dropdownContainer,
            { 
              top: dropdownTop,
              left: dropdownLeft,
              width: dropdownWidth,
            }
          ]}
          onStartShouldSetResponder={() => true}
        >
          {/* 地区列表 */}
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
                  <Text style={[styles.areaCode, isSelected && styles.areaCodeSelected]}>
                    {area.area}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  dropdownContainer: {
    position: 'absolute',
    maxHeight: 320,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 8,
    backgroundColor: '#1A1A1C',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  scrollView: {
    maxHeight: 300,
  },
  content: {
    gap: 2,
  },
  areaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 4,
  },
  areaItemSelected: {
    backgroundColor: 'rgba(255, 107, 0, 0.15)',
  },
  flagIcon: {
    width: 28,
    height: 20,
    borderRadius: 2,
  },
  areaCode: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.title,
  },
  areaCodeSelected: {
    color: Colors.brand,
    fontWeight: '700',
  },
});

