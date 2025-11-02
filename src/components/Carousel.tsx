import { IMG_BASE_URL } from '@/constants/api';
import type { CarouselImage } from '@/types';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dimensions,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  View
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

interface CarouselProps {
  type: 1 | 2; // 1: 首页图, 2: 邀请页图
  images: CarouselImage[];
  height?: number;
}

export default function Carousel({ type, images, height = 160 }: CarouselProps) {
  const { i18n } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  // 根据当前语言过滤图片
  const langCode = i18n.language === 'zh' ? 'zh_CN' : 'en_US';
  const filteredImages = images
    .filter(img => img.language === langCode)
    .sort((a, b) => a.showOrder - b.showOrder);

  // 自动轮播
  useEffect(() => {
    if (filteredImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => {
        const nextIndex = (prev + 1) % filteredImages.length;
        try {
          flatListRef.current?.scrollToIndex({
            index: nextIndex,
            animated: true,
          });
        } catch (error) {
          // 忽略滚动错误
        }
        return nextIndex;
      });
    }, 5000); // 每5秒切换一次

    return () => clearInterval(interval);
  }, [filteredImages.length]);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const cardWidth = screenWidth - 32; // 减去padding
    const index = Math.round(offsetX / cardWidth);
    setCurrentIndex(index);
  };

  if (filteredImages.length === 0) {
    // 显示默认图片
    const defaultImage = require('@/assets/images/hero-banner.png')
    
    return (
      <View style={[styles.container, { height }]}>
        <Image source={defaultImage} style={styles.image} resizeMode="cover" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { height }]}>
      <FlatList
        ref={flatListRef}
        data={filteredImages}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={[styles.imageContainer, { width: screenWidth - 32 }]}>
            <Image
              source={{ uri: `${IMG_BASE_URL}${item.image}` }}
              style={styles.image}
              resizeMode="cover"
            />
          </View>
        )}
      />

      {/* 指示器 */}
      {filteredImages.length > 1 && (
        <View style={styles.indicatorContainer}>
          {filteredImages.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                index === currentIndex
                  ? styles.indicatorActive
                  : styles.indicatorInactive,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  imageContainer: {
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  indicatorContainer: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  indicator: {
    height: 6,
    borderRadius: 3,
  },
  indicatorActive: {
    width: 24,
    backgroundColor: '#FFFFFF',
  },
  indicatorInactive: {
    width: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
});

