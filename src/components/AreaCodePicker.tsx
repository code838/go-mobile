import { Colors } from '@/constants/colors';
import { getImageUrl } from '@/constants/urls';
import { AreaInfo } from '@/model/AreaInfo';
import { useBoundStore } from '@/store';
import { Image } from 'expo-image';
import { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useImmer } from 'use-immer';
import AreaCodeDropdown from './AreaCodeDropdown';

interface AreaCodePickerProps {
  value: string;
  onChange: (areaCode: string) => void;
}

/**
 * 地区码选择器
 * 显示当前选择的国旗和区号，点击可打开选择器
 */
export default function AreaCodePicker({ value, onChange }: AreaCodePickerProps) {
  const areaInfo = useBoundStore(state => state.areaInfo);
  const buttonRef = useRef<View>(null);
  const [state, setState] = useImmer({
    showDropdown: false,
    buttonLayout: { x: 0, y: 0, width: 0, height: 0 },
  });

  // 查找当前选择的地区信息
  const selectedArea = areaInfo.find(area => area.area === value);

  /**
   * 打开下拉菜单
   */
  function openDropdown() {
    // 测量按钮位置
    buttonRef.current?.measureInWindow((x, y, width, height) => {
      setState(draft => {
        draft.buttonLayout = { x, y, width, height };
        draft.showDropdown = true;
      });
    });
  }

  /**
   * 关闭下拉菜单
   */
  function closeDropdown() {
    setState(draft => {
      draft.showDropdown = false;
    });
  }

  /**
   * 选择地区
   */
  function handleSelect(area: AreaInfo) {
    onChange(area.area);
  }

  // 如果还没有选择地区，且地区列表已加载，默认选择第一个（通常是中国+86）
  useEffect(() => {
    if (!value && areaInfo.length > 0) {
      // 尝试找到+86，如果没有就用第一个
      const defaultArea = areaInfo.find(area => area.area === '+86') || areaInfo[0];
      onChange(defaultArea.area);
    }
  }, [areaInfo, value]);

  return (
    <>
      <Pressable 
        ref={buttonRef}
        style={styles.container} 
        onPress={openDropdown}
      >
        {selectedArea ? (
          <>
            {/* 国旗图标 */}
            <Image 
              source={{ uri: getImageUrl(selectedArea.image) }} 
              style={styles.flagIcon} 
              contentFit="contain"
            />
            {/* 区号 */}
            <Text style={styles.areaCode}>{selectedArea.area}</Text>
          </>
        ) : (
          <Text style={styles.areaCode}>+86</Text>
        )}
        {/* 下拉箭头 */}
        <View style={styles.arrow}>
          <View style={styles.arrowIcon} />
        </View>
      </Pressable>

      {/* 地区选择下拉菜单 */}
      <AreaCodeDropdown
        visible={state.showDropdown}
        onClose={closeDropdown}
        onSelect={handleSelect}
        selectedAreaCode={value}
        areaList={areaInfo}
        buttonLayout={state.buttonLayout}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 12,
    height: 48,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  flagIcon: {
    width: 28,
    height: 20,
    borderRadius: 2,
  },
  areaCode: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
  },
  arrow: {
    width: 12,
    height: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowIcon: {
    width: 0,
    height: 0,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderTopWidth: 5,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#6e6e70',
  },
});

