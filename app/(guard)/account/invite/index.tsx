import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import NavigationBar from '@/components/NavigationBar';
import PageDecoration from '@/components/PageDecoration';
import { Colors } from '@/constants/colors';
import { useBoundStore } from '@/store';
import { toast } from '@/utils/toast';
import { Image } from 'expo-image';


export default function InvitePage() {
  const { t } = useTranslation();
  const user = useBoundStore(state => state.user);
  const inviteCode = user!.inviteLink.slice(-6);
  /**
   * 复制邀请码
   */
  async function handleCopyCode() {
    await Clipboard.setStringAsync(inviteCode);
    toast.success(t('invite.copySuccess'));
  }

  /**
   * 复制邀请链接
   */
  async function handleCopyLink() {
    await Clipboard.setStringAsync(user!.inviteLink);
    toast.success(t('invite.copySuccess'));
  }

  /**
   * 查看邀请记录
   */
  function handleInviteRecord() {
    router.push('/account/invite/records?tab=invite');
  }

  /**
   * 查看返佣记录
   */
  function handleCommissionRecord() {
    router.push('/account/invite/records?tab=commission');
  }

  return (
    <View style={styles.container}>
      {/* 渐变背景 */}
      <PageDecoration />
      {/* 导航栏 */}
      <NavigationBar title={t('invite.title')} />

      {/* 内容区域 */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* 横幅图片 */}
        <Image source={require('@/assets/images/invite-post.png')} style={styles.heroBanner} />

        {/* 邀请信息卡片 */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>{t('invite.inviteTitle')}</Text>

          <View style={styles.infoContent}>
            {/* 已邀请人数 */}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('invite.invitedCount')}</Text>
              <Text style={styles.infoValue}>{user!.inviteUsers}</Text>
            </View>

            {/* 邀请码和操作按钮 */}
            <View style={styles.codeRow}>
              <Text style={styles.infoLabel}>{t('invite.inviteCode')}</Text>
              <Text style={styles.infoValue}>{user!.inviteLink.slice(-6)}</Text>
              <Pressable style={styles.copyButton} onPress={handleCopyCode}>
                <Text style={styles.copyButtonText}>{t('invite.copy')}</Text>
              </Pressable>
              <Pressable style={styles.copyButton} onPress={handleCopyLink}>
                <Text style={styles.copyButtonText}>{t('invite.copyLink')}</Text>
              </Pressable>
            </View>

            {/* 返佣收益 */}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('invite.commissionEarned')}</Text>
              <Text style={styles.infoValue}>
                {user!.invitePoints} {t('invite.points')}
              </Text>
            </View>
          </View>

          {/* 记录链接 */}
          <View style={styles.recordLinks}>
            <Pressable style={styles.underlineLink} onPress={handleInviteRecord}>
              <Text style={styles.recordLink}>{t('invite.inviteRecord')}</Text>
            </Pressable>
            <Pressable style={styles.underlineLink} onPress={handleCommissionRecord}>
              <Text style={styles.recordLink}>{t('invite.commissionRecord')}</Text>
            </Pressable>
          </View>
        </View>

        {/* 邀请规则卡片 */}
        <View style={styles.rulesCard}>
          <Text style={styles.cardTitle}>{t('invite.rulesTitle')}</Text>
          <Text style={styles.ruleTitle}>{t('invite.rule1Title')}</Text>
          <Text style={styles.ruleContent}>{t('invite.rule1Content')}</Text>
          <Text style={styles.ruleTitle}>{t('invite.rule2Title')}</Text>
          <Text style={styles.ruleContent}>{t('invite.rule2Content')}</Text>
          <Text style={styles.ruleTitle}>{t('invite.rule3Title')}</Text>
          <Text style={styles.ruleContent}>{t('invite.rule3Content', { points: user!.invitePoints })}</Text>
        </View>

        {/* 温馨提示卡片 */}
        <View style={styles.tipsCard}>
          <Text style={styles.cardTitle}>{t('invite.tipsTitle')}</Text>
          <Text style={styles.tipTitle}>{t('invite.tip1Title')}</Text>
          <Text style={styles.tipContent}>{t('invite.tip1Content')}</Text>
          <Text style={styles.tipTitle}>{t('invite.tip2Title')}</Text>
          <Text style={styles.tipContent}>{t('invite.tip2Content')}</Text>
          <Text style={styles.tipTitle}>{t('invite.tip3Title')}</Text>
          <Text style={styles.tipContent}>{t('invite.tip3Content')}</Text>
          <Text style={styles.tipTitle}>{t('invite.tip4Title')}</Text>
          <Text style={styles.tipContent}>{t('invite.tip4Content')}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    position: 'relative',
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 24,
  },
  heroBanner: {
    width: '100%',
    height: 160,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(29, 29, 29, 1)',
    overflow: 'hidden',
  },
  heroBannerGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  heroBannerText: {
    fontSize: 48,
    fontWeight: '700',
    color: Colors.title,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  heroBannerSubtext: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.title,
    opacity: 0.9,
  },
  infoCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.subtitle,
  },
  infoContent: {
    gap: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.secondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.subtitle,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'wrap',
  },
  copyButton: {
    backgroundColor: Colors.brand,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 8,
  },
  copyButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.title,
  },
  recordLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  recordLink: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.brand,
  },
  underlineLink: {
    borderBottomWidth: 1,
    paddingBottom: 4,
    borderBottomColor: Colors.brand,
  },
  rulesCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.subtitle,
  },
  ruleTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.subtitle,
  },
  ruleContent: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.secondary,
    lineHeight: 18,
  },
  tipsCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  tipTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.subtitle,
  },
  tipContent: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.secondary,
    lineHeight: 18,
  },
});

