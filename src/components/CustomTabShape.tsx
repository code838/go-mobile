import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

const TAB_BAR_HEIGHT = 60;
const BUTTON_SIZE = 40;
const CURVE_HEIGHT = 30;   // 凸起曲線的高度（從平坦處向上突出的高度）
const TOP_CORNER_RADIUS = 16;

const CustomBottomShape = ({ backgroundColor = '#262626' }) => {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const bottomPadding = insets.bottom;

  // SVG 總高度：基礎高度 + 底部安全區域 + 凸起曲線的高度
  const SVG_TOTAL_HEIGHT = TAB_BAR_HEIGHT + bottomPadding + CURVE_HEIGHT;

  // 導航欄平坦頂部的 Y 座標 (考慮了凸起的高度，使其看起來像是從 TAB_BAR_HEIGHT 處開始)
  const FLAT_TOP_Y = CURVE_HEIGHT + TOP_CORNER_RADIUS;

  // 整個 SVG 的底部 Y 座標
  const BOTTOM_Y = SVG_TOTAL_HEIGHT;

  // X 軸中心點，用於定位中間的凸起
  const CENTER_X = width / 2;

  // 曲線控制點的參數 (可調整這些值來改變曲線的形狀和寬度)
  const CURVE_START_X_ADJ = BUTTON_SIZE * 1.2; // 凸起部分開始/結束距離中心的 X 偏移
  const CURVE_CONTROL_X_ADJ = BUTTON_SIZE * 0.7; // 貝茲曲線控制點的 X 偏移
  const CURVE_CONTROL_Y_ADJ = CURVE_HEIGHT * 0.8; // 貝茲曲線控制點的 Y 偏移

  // 繪製 SVG 路徑 (d 屬性)
  const path = [
    `M 0, ${FLAT_TOP_Y}`, // 1. 從左上角圓角下方開始 (M = Move To)
    `Q 0, ${CURVE_HEIGHT}, ${TOP_CORNER_RADIUS}, ${CURVE_HEIGHT}`, // 2. 繪製左上角圓角 (Q = Quadratic Bezier Curve)
    `L ${CENTER_X - CURVE_START_X_ADJ}, ${CURVE_HEIGHT}`, // 3. 直線到凸起曲線開始處 (L = Line To)

    // 4. 繪製平滑的凸起曲線 (C = Cubic Bezier Curve)
    // 第一段曲線：從左側凸起開始點到最高點
    `C ${CENTER_X - CURVE_CONTROL_X_ADJ}, ${CURVE_HEIGHT}`,                  // 控制點 1 (X1, Y1)
    `  ${CENTER_X - CURVE_CONTROL_X_ADJ}, ${CURVE_HEIGHT - CURVE_CONTROL_Y_ADJ}`, // 控制點 2 (X2, Y2)
    `  ${CENTER_X}, ${CURVE_HEIGHT - CURVE_CONTROL_Y_ADJ}`,                  // 終點 (X, Y) - 曲線的最高點

    // 第二段曲線：從最高點到右側凸起結束點
    `C ${CENTER_X + CURVE_CONTROL_X_ADJ}, ${CURVE_HEIGHT - CURVE_CONTROL_Y_ADJ}`, // 控制點 1 (X1, Y1)
    `  ${CENTER_X + CURVE_CONTROL_X_ADJ}, ${CURVE_HEIGHT}`,                  // 控制點 2 (X2, Y2)
    `  ${CENTER_X + CURVE_START_X_ADJ}, ${CURVE_HEIGHT}`,                   // 終點 (X, Y) - 右側凸起結束

    `L ${width - TOP_CORNER_RADIUS}, ${CURVE_HEIGHT}`, // 5. 直線到右上角圓角
    `Q ${width}, ${CURVE_HEIGHT}, ${width}, ${FLAT_TOP_Y}`, // 6. 繪製右上角圓角
    `L ${width}, ${BOTTOM_Y}`, // 7. 直線到右下角
    `L 0, ${BOTTOM_Y}`, // 8. 直線到左下角
    `Z`, // 9. 閉合路徑
  ].join(' '); // 將所有路徑命令連接成一個字串

  return (
    <View style={[styles.container, { height: SVG_TOTAL_HEIGHT, width }]}>
      <Svg
        width={width}
        height={SVG_TOTAL_HEIGHT}
        style={styles.svgAbsolute} // 確保 SVG 填滿容器
      >
        <Path d={path} fill={backgroundColor} stroke="#1D1D1D" strokeWidth={1} />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  svgAbsolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default CustomBottomShape;