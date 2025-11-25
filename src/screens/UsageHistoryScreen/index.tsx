import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  SectionList,
  Text,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import BackButton from '../../components/_common/BackButton';
import DateRangePicker from '../../components/modals/DateRangePicker';
import { RootStackParamList } from '../../../App';
import {
  UsageTrackingService,
  UsageRecord,
} from '../../services/UsageTrackingService';
import { AsyncStorageService } from '../../services/AsyncStorageService';
import { getTokenUserId } from '../../utils/authUtils';
import { styles } from './styles';

type Props = {
  route: {
    params: {
      fridgeId: number;
    };
  };
};

const UsageHistoryScreen = ({ route }: Props) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { fridgeId } = route.params;

  const [activeFilter, setActiveFilter] = useState('일주일');
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);
  const [customDateRange, setCustomDateRange] = useState<{
    start: string;
    end: string;
  } | null>(null);
  const [usageRecords, setUsageRecords] = useState<UsageRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 🟢 useFridgeSelect와 동일한 방식으로 사용자 정보 로드
  const initializeUser = async () => {
    try {
      const tokenUserId = Number(await getTokenUserId());
      const localUserId = Number(await AsyncStorageService.getCurrentUserId());

      console.log('✅ 토큰 사용자 ID:', tokenUserId);
      console.log('✅ 로컬 사용자 ID:', localUserId);

      if (!tokenUserId) {
        // console.error('❌ 토큰 사용자 ID 없음');
        return;
      }
    } catch (error) {
      // console.error('❌ 사용자 정보 로드 실패:', error);
    }
  };

  // 사용 기록 로드
  const loadUsageRecords = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log(`📡 냉장고 ${fridgeId}의 사용 기록 로드 시작...`);
      const records = await UsageTrackingService.getFridgeUsageRecords(
        fridgeId,
      );
      console.log(`✅ ${records.length}개의 사용 기록 로드 완료`);

      // usedQuantity가 0인 기록 필터링 & 사용자 이름 매핑
      const recordsWithUserName = records
        .filter(record => record.usedQuantity !== 0) // 🟢 usedQuantity가 0이 아닌 것만 표시
        .map(record => {
          // 🟢 백엔드에서 제공하는 consumerName 사용
          const displayName = record.consumerName || '알 수 없음';

          console.log(
            `👤 기록 ${record.id}: consumerName=${record.consumerName}, displayName=${displayName}, usedQuantity=${record.usedQuantity}`,
          );

          return {
            ...record,
            userName: displayName,
          };
        });

      setUsageRecords(recordsWithUserName);
    } catch (error) {
      // console.error('❌ 사용 기록 로드 실패:', error);
      setUsageRecords([]);
    } finally {
      setIsLoading(false);
    }
  }, [fridgeId]);

  // 초기 사용자 정보 로드
  useEffect(() => {
    initializeUser();
  }, []);

  // 사용자 정보 로드 후 사용 기록 로드
  useEffect(() => {
    loadUsageRecords();
  }, [loadUsageRecords]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleFilterPress = (filter: string) => {
    if (filter === '기간 선택') {
      setShowDateRangePicker(true);
    } else {
      setActiveFilter(filter);
      setCustomDateRange(null);
    }
  };

  const handleDateRangeSelect = (startDate: string, endDate: string) => {
    setCustomDateRange({ start: startDate, end: endDate });
    setActiveFilter('기간 선택');
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

  // 날짜별로 그룹핑 및 필터링
  const groupedData = useMemo(() => {
    let filteredData = usageRecords;

    // 필터에 따른 데이터 필터링
    const now = new Date();
    if (activeFilter === '일주일') {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filteredData = usageRecords.filter(
        record => new Date(record.usedAt) >= oneWeekAgo,
      );
    } else if (activeFilter === '한 달') {
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filteredData = usageRecords.filter(
        record => new Date(record.usedAt) >= oneMonthAgo,
      );
    } else if (activeFilter === '기간 선택' && customDateRange) {
      try {
        const startDate = new Date(customDateRange.start.replace(/\./g, '-'));
        const endDate = new Date(customDateRange.end.replace(/\./g, '-'));
        endDate.setHours(23, 59, 59, 999);
        filteredData = usageRecords.filter(record => {
          const recordDate = new Date(record.usedAt);
          return recordDate >= startDate && recordDate <= endDate;
        });
      } catch (error) {
        // console.error('날짜 범위 필터링 오류:', error);
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

  // 사용 유형별 텍스트 반환 (usedQuantity 고려)
  const getUsageTypeText = (
    usageType: UsageRecord['usageType'],
    usedQuantity: number,
    itemName: string,
  ) => {
    // usedQuantity가 음수인 경우 (수량 증가)
    if (usedQuantity < 0) {
      return `${itemName}의 수량을 ${Math.abs(
        usedQuantity,
      )}만큼 증가시켰습니다`;
    }

    // usedQuantity가 양수인 경우 (일반적인 사용/수정/삭제)
    switch (usageType) {
      case 'consume':
        return '사용했습니다';
      case 'modify':
        return '수정했습니다';
      case 'delete':
        return '삭제했습니다';
      case 'recipe_use':
        return '사용했습니다';
      default:
        return '처리했습니다';
    }
  };

  const renderUsageItem = ({ item }: { item: UsageRecord }) => {
    // usedQuantity가 음수인 경우 다른 형식으로 표시
    const isIncrease = item.usedQuantity < 0;

    return (
      <View style={styles.usageCard}>
        <View style={styles.usageHeader}>
          <View style={styles.userIconContainer}>
            <Ionicons name="person-circle" size={44} color="#2F4858" />
          </View>
          <View style={styles.usageInfo}>
            {isIncrease ? (
              // 수량 증가인 경우
              <Text style={styles.usageText}>
                <Text style={styles.userName}>{item.consumerName}</Text> 님이{' '}
                {getUsageTypeText(
                  item.usageType,
                  item.usedQuantity,
                  item.itemName,
                )}
              </Text>
            ) : (
              // 일반적인 사용/수정/삭제인 경우
              <Text style={styles.usageText}>
                <Text style={styles.userName}>{item.consumerName}</Text> 님이{' '}
                <Text style={styles.itemName}>{item.itemName}</Text>{' '}
                <Text style={styles.quantity}>
                  {item.usedQuantity}
                  {item.unit}
                </Text>
                를{' '}
                {getUsageTypeText(
                  item.usageType,
                  item.usedQuantity,
                  item.itemName,
                )}
              </Text>
            )}
            <Text style={styles.usageTime}>{item.time}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderSectionHeader = ({ section }: { section: { title: string } }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>- {section.title}</Text>
    </View>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIcon}>
        <Ionicons name="time-outline" size={64} color="#999" />
      </View>
      <Text style={styles.emptyText}>사용 기록이 없습니다</Text>
      <Text style={styles.emptySubText}>
        식재료를 사용하거나 수정하면 기록이 나타납니다
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <View style={styles.leftSection}>
            <BackButton onPress={handleBack} />
          </View>
          <View style={styles.centerSection}>
            <Text style={styles.headerTitle}>사용 기록</Text>
          </View>
          <View style={styles.rightSection} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2F4858" />
          <Text style={styles.loadingText}>사용 기록을 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.leftSection}>
          <BackButton onPress={handleBack} />
        </View>
        <View style={styles.centerSection}>
          <Text style={styles.headerTitle}>사용 기록</Text>
        </View>
        <View style={styles.rightSection} />
      </View>

      {/* 필터 바 */}
      <View style={styles.filterBar}>
        {['일주일', '한 달', '기간 선택'].map(filter => (
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
              {filter === '기간 선택' && customDateRange
                ? `${customDateRange.start} ~ ${customDateRange.end}`
                : filter}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 사용 기록 리스트 */}
      <SectionList
        sections={groupedData}
        keyExtractor={item => `${item.id}-${item.usedAt}`}
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
