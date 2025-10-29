import { Colors } from "@/constants/colors";
import FeatherIcon from "@expo/vector-icons/Feather";
import { Pressable, StyleSheet, View } from "react-native";

export default function CheckBox({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children?: React.ReactNode;
}) {
  return (
    <Pressable onPress={() => onChange(!checked)}>
      <View style={styles.checkbox}>
        <View style={[styles.checkboxInner, checked && styles.checkboxChecked]}>
          <FeatherIcon name="check" size={12} color={checked ? 'white' : Colors.subtitle} />
        </View>
        {children}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  checkbox: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  checkboxInner: {
    width: 16,
    height: 16,
    borderRadius: 4,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
  },
  checkboxChecked: {
    backgroundColor: Colors.brand,
  },
});