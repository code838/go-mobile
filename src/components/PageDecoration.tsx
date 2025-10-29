
import { StyleSheet } from 'react-native';
import Svg, { Circle, Defs, Stop, RadialGradient as SvgRadialGradient } from 'react-native-svg';
export default function PageDecoration() {
  return (
    <Svg
      width="300"
      height="300"
      style={styles.bgDecoration}>
      <Defs>
        <SvgRadialGradient id="gradient1" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#2F226D" stopOpacity="0.3" />
          <Stop offset="100%" stopColor="#0E0E10" stopOpacity="0.1" />
        </SvgRadialGradient>
      </Defs>
      <Circle cx="150" cy="150" r="150" fill="url(#gradient1)" />
    </Svg>
  )
}

const styles = StyleSheet.create({
  bgDecoration: {
    top: 40,
    right: -50,
    position: 'absolute',
  },
})