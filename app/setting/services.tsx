import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import NavigationBar from '@/components/NavigationBar';
import PageDecoration from '@/components/PageDecoration';
import { Colors } from '@/constants/colors';
import { systemApi } from '@/services/api';

type Category = 'all' | 'account' | 'product';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'account' | 'product';
}

export default function ServicesScreen() {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [serviceInfo, setServiceInfo] = useState<{type: number; account: string}[] | null>(null);

  const getServiceInfo = async () => {
    const { data } = await systemApi.getServiceInfo();
    if (data.code === 0) {
      setServiceInfo(data.data);
    }
  }

  const openLink = (type: number) => {
    const url = serviceInfo?.find((item) => item.type === type)?.account;
    if (url) {
      Linking.openURL(url);
    }
  }

  useEffect(() => {
    getServiceInfo();
  }, []);
  // FAQ数据
  const faqData: FAQItem[] = [
    {
      id: 'q1',
      question: t('services.faqList.q1'),
      answer: t('services.faqList.a1'),
      category: 'account',
    },
    {
      id: 'q2',
      question: t('services.faqList.q2'),
      answer: t('services.faqList.a2'),
      category: 'account',
    },
    {
      id: 'q3',
      question: t('services.faqList.q3'),
      answer: t('services.faqList.a3'),
      category: 'account',
    },
    {
      id: 'q4',
      question: t('services.faqList.q4'),
      answer: t('services.faqList.a4'),
      category: 'account',
    },
    {
      id: 'q5',
      question: t('services.faqList.q5'),
      answer: t('services.faqList.a5'),
      category: 'account',
    },
    {
      id: 'q6',
      question: t('services.faqList.q6'),
      answer: t('services.faqList.a6'),
      category: 'product',
    },
    {
      id: 'q7',
      question: t('services.faqList.q7'),
      answer: t('services.faqList.a7'),
      category: 'product',
    },
    {
      id: 'q8',
      question: t('services.faqList.q8'),
      answer: t('services.faqList.a8'),
      category: 'product',
    },
    // 充值相关
    {
      id: 'q9',
      question: t('services.faqList.q9'),
      answer: t('services.faqList.a9'),
      category: 'account',
    },
    {
      id: 'q10',
      question: t('services.faqList.q10'),
      answer: t('services.faqList.a10'),
      category: 'account',
    },
    {
      id: 'q11',
      question: t('services.faqList.q11'),
      answer: t('services.faqList.a11'),
      category: 'account',
    },
    // 提现相关
    {
      id: 'q12',
      question: t('services.faqList.q12'),
      answer: t('services.faqList.a12'),
      category: 'account',
    },
    {
      id: 'q13',
      question: t('services.faqList.q13'),
      answer: t('services.faqList.a13'),
      category: 'account',
    },
    {
      id: 'q14',
      question: t('services.faqList.q14'),
      answer: t('services.faqList.a14'),
      category: 'account',
    },
    // 闪兑相关
    {
      id: 'q15',
      question: t('services.faqList.q15'),
      answer: t('services.faqList.a15'),
      category: 'account',
    },
    {
      id: 'q16',
      question: t('services.faqList.q16'),
      answer: t('services.faqList.a16'),
      category: 'account',
    },
    {
      id: 'q17',
      question: t('services.faqList.q17'),
      answer: t('services.faqList.a17'),
      category: 'account',
    },
  ];

  // 根据分类过滤FAQ
  const filteredFAQs =
    selectedCategory === 'all'
      ? faqData
      : faqData.filter((item) => item.category === selectedCategory);

  // 切换展开状态
  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }

  return (
    <View style={styles.container}>
      <PageDecoration />
      <NavigationBar title={t('services.title')} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {/* 常见问题 */}
        <Text style={styles.sectionTitle}>{t('services.faq')}</Text>

        {/* 分类标签 */}
        <View style={styles.categoryContainer}>
          <Pressable
            style={[
              styles.categoryButton,
              selectedCategory === 'all' && styles.categoryButtonActive,
            ]}
            onPress={() => setSelectedCategory('all')}>
            <Text
              style={[
                styles.categoryText,
                selectedCategory === 'all' && styles.categoryTextActive,
              ]}>
              {t('services.categoryAll')}
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.categoryButton,
              selectedCategory === 'account' && styles.categoryButtonActive,
            ]}
            onPress={() => setSelectedCategory('account')}>
            <Text
              style={[
                styles.categoryText,
                selectedCategory === 'account' && styles.categoryTextActive,
              ]}>
              {t('services.categoryAccount')}
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.categoryButton,
              selectedCategory === 'product' && styles.categoryButtonActive,
            ]}
            onPress={() => setSelectedCategory('product')}>
            <Text
              style={[
                styles.categoryText,
                selectedCategory === 'product' && styles.categoryTextActive,
              ]}>
              {t('services.categoryProduct')}
            </Text>
          </Pressable>
        </View>

        {/* FAQ列表 */}
        <View style={styles.faqList}>
          {filteredFAQs.map((item) => {
            const isExpanded = expandedIds.has(item.id);
            return (
              <Pressable
                key={item.id}
                style={styles.faqItem}
                onPress={() => toggleExpand(item.id)}>
                <View style={styles.faqHeader}>
                  <Text style={styles.faqQuestion}>{item.question}</Text>
                  <Image
                    source={require('@/assets/images/chevron-right.png')}
                    style={[
                      styles.chevronIcon,
                      isExpanded && styles.chevronIconExpanded,
                    ]}
                    contentFit="contain"
                  />
                </View>
                {isExpanded && (
                  <Text style={styles.faqAnswer}>{item.answer}</Text>
                )}
              </Pressable>
            );
          })}
        </View>

        {/* 联系我们 */}
        <View style={styles.contactSection}>
          <Text style={styles.sectionTitle}>{t('services.contactUs')}</Text>
          <View style={styles.socialIcons}>
            <Pressable onPress={() => openLink(4)}>
              <Image
                source={require('@/assets/images/service-wechat.png')}
                style={styles.socialIcon}
                contentFit="contain"
              />
            </Pressable>
            <Pressable onPress={() => openLink(3)}>
              <Image
                source={require('@/assets/images/service-qq.png')}
                style={styles.socialIcon}
                contentFit="contain"
              />
            </Pressable>
            <Pressable onPress={() => openLink(1)}>
              <Image
                source={require('@/assets/images/service-telegram.png')}
                style={styles.socialIcon}
                contentFit="contain"
              />
            </Pressable>
            <Pressable onPress={() => openLink(2)}>
              <Image
                source={require('@/assets/images/service-whatsapp.png')}
                style={styles.socialIcon}
                contentFit="contain"
              />
            </Pressable>
          </View>
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
  scrollView: {
    flex: 1,
    paddingTop: 20,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.brand,
  },
  categoryContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryButton: {
    backgroundColor: Colors.card,
    paddingHorizontal: 12,
    borderRadius: 4,
    height: 26,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryButtonActive: {
    backgroundColor: Colors.brand,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.secondary,
  },
  categoryTextActive: {
    color: Colors.title,
  },
  faqList: {
    gap: 12,
  },
  faqItem: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: '#1D1D1D',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 4,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  faqQuestion: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: Colors.subtitle,
  },
  chevronIcon: {
    width: 20,
    height: 20,
    marginLeft: 8,
  },
  chevronIconExpanded: {
    transform: [{ rotate: '90deg' }],
  },
  faqAnswer: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.secondary,
    lineHeight: 18,
  },
  contactSection: {
    paddingTop: 24,
    borderTopWidth: 0,
    gap: 24,
  },
  socialIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  socialIcon: {
    width: 40,
    height: 40,
  },
});

