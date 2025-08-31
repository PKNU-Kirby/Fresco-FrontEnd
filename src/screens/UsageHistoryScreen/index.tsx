import React, { useState, useMemo, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  TouchableOpacity,
  SectionList,
  Text,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import BackButton from '../../components/_common/BackButton';
import DateRangePicker from '../../components/Recipe/modals/DateRangePicker';
import { RootStackParamList } from '../../../App';
import {
  UsageTrackingService,
  UsageRecord,
} from '../../utils/UseageTrackingService';
import { styles } from './styles';

type Props = {
  route: {
    params: {
      fridgeId: string; // string으로 변경
    };
  };
};

const UsageHistoryScreen = ({ route }: Props) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { fridgeId } = route.params;

  const [activeFilter, setActiveFilter] = useState('최근 한 주');
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);
  const [customDateRange, setCustomDateRange] = useState<{
    start: string;
    end: string;
  } | null>(null);
  const [usageRecords, setUsageRecords] = useState<UsageRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 사용 기록 로드
  useEffect(() => {
    loadUsageRecords();
  }, [fridgeId]);

  const loadUsageRecords = async () => {
    try {
      setIsLoading(true);
      const records = await UsageTrackingService.getFridgeUsageRecords(
        fridgeId,
      );
      setUsageRecords(records);
    } catch (error) {
      console.error('사용 기록 로드 실패:', error);
      setUsageRecords([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleFilterPress = (filter: string) => {
    if (filter === '원하는 기간') {
      setShowDateRangePicker(true);
    } else {
      setActiveFilter(filter);
      setCustomDateRange(null);
    }
  };

  const handleDateRangeSelect = (startDate: string, endDate: string) => {
    setCustomDateRange({ start: startDate, end: endDate });
    setActiveFilter('원하는 기간');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return '오늘';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return '어제';
    } else {
      return `${date.getMonth() + 1}월 ${date.getDate()}일`;
    }
  };

  // 사용 유형별 텍스트 생성
  const getUsageText = (record: UsageRecord) => {
    const baseText = `${record.userName}님이 ${record.itemName} ${record.quantity}${record.unit}를 `;

    switch (record.usageType) {
      case 'consume':
        return baseText + '사용했습니다';
      case 'modify':
        return baseText + '수정했습니다';
      case 'delete':
        return baseText + '삭제했습니다';
      case 'recipe_use':
        return baseText + `사용했습니다 (${record.details})`;
      default:
        return baseText + '처리했습니다';
    }
  };

  // 날짜별로 그룹핑 및 필터링
  const groupedData = useMemo(() => {
    let filteredData = usageRecords;

    // 필터에 따른 데이터 필터링
    const now = new Date();
    if (activeFilter === '최근 한 주') {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filteredData = usageRecords.filter(
        record => new Date(record.usedAt) >= oneWeekAgo,
      );
    } else if (activeFilter === '최근 한 달') {
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filteredData = usageRecords.filter(
        record => new Date(record.usedAt) >= oneMonthAgo,
      );
    } else if (activeFilter === '원하는 기간' && customDateRange) {
      try {
        const startDate = new Date(customDateRange.start.replace(/\./g, '-'));
        const endDate = new Date(customDateRange.end.replace(/\./g, '-'));
        endDate.setHours(23, 59, 59, 999);

        filteredData = usageRecords.filter(record => {
          const recordDate = new Date(record.usedAt);
          return recordDate >= startDate && recordDate <= endDate;
        });
      } catch (error) {
        console.error('날짜 범위 필터링 오류:', error);
        filteredData = usageRecords;
      }
    }

    const grouped = filteredData.reduce((acc, record) => {
      const date = new Date(record.usedAt).toDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(record);
      return acc;
    }, {} as Record<string, UsageRecord[]>);

    // SectionList 형태로 변환
    return Object.entries(grouped)
      .map(([date, records]) => ({
        title: formatDate(date),
        data: records.sort(
          (a, b) => new Date(b.usedAt).getTime() - new Date(a.usedAt).getTime(),
        ),
      }))
      .sort(
        (a, b) =>
          new Date(b.data[0].usedAt).getTime() -
          new Date(a.data[0].usedAt).getTime(),
      );
  }, [usageRecords, activeFilter, customDateRange]);

  const renderUsageItem = ({ item }: { item: UsageRecord }) => (
    <View style={styles.usageCard}>
      <View style={styles.usageHeader}>
        <Text style={styles.usageAvatar}>{item.userAvatar}</Text>
        <View style={styles.usageInfo}>
          <Text style={styles.usageText}>
            <Text style={styles.userName}>{item.userName}</Text>님이{' '}
            <Text style={styles.itemName}>{item.itemName}</Text>{' '}
            <Text style={styles.quantity}>
              {item.quantity}
              {item.unit}
            </Text>
            {item.usageType === 'recipe_use'
              ? '를 사용했습니다'
              : item.usageType === 'delete'
              ? '를 삭제했습니다'
              : item.usageType === 'modify'
              ? '를 수정했습니다'
              : '를 사용했습니다'}
          </Text>
          {item.details && (
            <Text style={styles.usageDetails}>{item.details}</Text>
          )}
          <Text style={styles.usageTime}>{item.time}</Text>
        </View>
      </View>
    </View>
  );

  const renderSectionHeader = ({ section }: { section: { title: string } }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>- {section.title}</Text>
    </View>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>사용 기록이 없습니다</Text>
      <Text style={styles.emptySubText}>
        식재료를 사용하거나 수정하면 기록이 나타납니다
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <BackButton onPress={handleBack} />
          <Text style={styles.headerTitle}>식재료 사용 기록</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>사용 기록을 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <BackButton onPress={handleBack} />
        <Text style={styles.headerTitle}>식재료 사용 기록</Text>
        <View style={styles.headerRight} />
      </View>

      {/* 필터 바 */}
      <View style={styles.filterBar}>
        {['최근 한 주', '최근 한 달', '원하는 기간'].map(filter => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterButton,
              activeFilter === filter && styles.filterButtonActive,
            ]}
            onPress={() => handleFilterPress(filter)}
          >
            <Text
              style={[
                styles.filterButtonText,
                activeFilter === filter && styles.filterButtonTextActive,
              ]}
            >
              {filter === '원하는 기간' && customDateRange
                ? `${customDateRange.start} ~ ${customDateRange.end}`
                : filter}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 사용 기록 리스트 */}
      <SectionList
        sections={groupedData}
        keyExtractor={item => item.id}
        renderItem={renderUsageItem}
        renderSectionHeader={renderSectionHeader}
        ListEmptyComponent={renderEmptyList}
        style={styles.listContainer}
        contentContainerStyle={[
          styles.listContent,
          groupedData.length === 0 && styles.emptyListContent,
        ]}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        onRefresh={loadUsageRecords}
        refreshing={isLoading}
      />

      {/* 기간 선택 모달 */}
      <DateRangePicker
        visible={showDateRangePicker}
        onDateRangeSelect={handleDateRangeSelect}
        onClose={() => setShowDateRangePicker(false)}
      />
    </SafeAreaView>
  );
};

export default UsageHistoryScreen;
