import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Colors } from "@/constants/colors";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { systemApi } from "@/services/api";
import { toast } from "@/utils/toast";
import { WebView } from "react-native-webview";
import NavigationBar from "@/components/NavigationBar";
import { useTranslation } from "react-i18next";

export default function ProtocolPage() {
  const params = useLocalSearchParams();
  const type = params.type as '1' | '2';
  const { t } = useTranslation();
  const [content, setContent] = useState<string>('');

  const getProtocol = async () => {
    try {
      const { data } = await systemApi.getProtocol();
      if (data.code === 0) {
        setContent(data.data.find((item: any) => item.type == type)?.content || '');
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message);
    }
  }
  useEffect(() => {
    getProtocol();
  }, [])
  return (
    <View style={styles.container}>
      <NavigationBar title={type === '1' ? t('protocol.userAgreement') : t('protocol.privacyPolicy')} />
      {!!content ? <WebView source={{ html: content }} /> : <ActivityIndicator />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});