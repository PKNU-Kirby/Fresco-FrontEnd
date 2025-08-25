import React, { useState, useMemo } from 'react';
import {
  SafeAreaView,
  View,
  TouchableOpacity,
  SectionList,
  Text,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import BackButton from '../../components/_common/BackButton';
import DateRangePicker from '../../components/modals/DateRangePicker';
import { RootStackParamList } from '../../../App';
import { styles } from './styles';

type UsageRecord = {
  id: number;
  userId: number;
  userName: string;
  userAvatar: string;
  itemName: string;
  quantity: string;
  unit: string;
  usedAt: string; // ISO string
  time: string; // "오후 2:30"
};

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

  const [activeFilter, setActiveFilter] = useState('최근 한 주'); // 수정: 정확한 텍스트
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);
  const [customDateRange, setCustomDateRange] = useState<{
    start: string;
    end: string;
  } | null>(null);

  // Mock 사용 기록 데이터 (날짜 형식 수정)
  const mockUsageData: UsageRecord[] = useMemo(
    () => [
      {
        id: 1,
        userId: 1,
        userName: '김후정',
        userAvatar: '♟',
        itemName: '양배추',
        quantity: '1',
        unit: '개',
        usedAt: '2024-07-14T14:30:00Z',
        time: '오후 2:30',
      },
      {
        id: 2,
        userId: 2,
        userName: '황정민',
        userAvatar: '♟',
        itemName: '우유',
        quantity: '250',
        unit: 'ml',
        usedAt: '2024-07-14T09:15:00Z',
        time: '오전 9:15',
      },
      {
        id: 3,
        userId: 3,
        userName: '황유진',
        userAvatar: '♟',
        itemName: '계란',
        quantity: '2',
        unit: '개',
        usedAt: '2025-07-03T19:45:00Z',
        time: '오후 7:45',
      },
      {
        id: 4,
        userId: 1,
        userName: '황유진',
        userAvatar: '♟',
        itemName: '닭가슴살',
        quantity: '300',
        unit: 'g',
        usedAt: '2025-07-13T12:20:00Z',
        time: '오후 12:20',
      },
      {
        id: 5,
        userId: 2,
        userName: '김후정',
        userAvatar: '♟',
        itemName: '토마토',
        quantity: '3',
        unit: '개',
        usedAt: '2024-07-12T16:10:00Z',
        time: '오후 4:10',
      },
    ],
    [],
  );

  const handleBack = () => {
    navigation.goBack();
  };

  const handleFilterPress = (filter: string) => {
    if (filter === '원하는 기간') {
      setShowDateRangePicker(true);
    } else {
      setActiveFilter(filter);
      setCustomDateRange(null); // 다른 필터 선택시 커스텀 기간 초기화
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

  // 날짜별로 그룹핑 및 필터링 (수정된 버전)
  const groupedData = useMemo(() => {
    let filteredData = mockUsageData;

    // 필터에 따른 데이터 필터링
    const now = new Date();
    if (activeFilter === '최근 한 주') {
      // 수정: 정확한 텍스트
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filteredData = mockUsageData.filter(
        record => new Date(record.usedAt) >= oneWeekAgo,
      );
    } else if (activeFilter === '최근 한 달') {
      // 수정: 정확한 텍스트
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filteredData = mockUsageData.filter(
        record => new Date(record.usedAt) >= oneMonthAgo,
      );
    } else if (activeFilter === '원하는 기간' && customDateRange) {
      // 날짜 범위 필터링 로직 개선
      try {
        const startDate = new Date(customDateRange.start.replace(/\./g, '-'));
        const endDate = new Date(customDateRange.end.replace(/\./g, '-'));
        endDate.setHours(23, 59, 59, 999); // 종료일 마지막 시간까지 포함

        filteredData = mockUsageData.filter(record => {
          const recordDate = new Date(record.usedAt);
          return recordDate >= startDate && recordDate <= endDate;
        });
      } catch (error) {
        console.error('날짜 범위 필터링 오류:', error);
        filteredData = mockUsageData; // 오류 시 전체 데이터 반환
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
  }, [mockUsageData, activeFilter, customDateRange]);

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
            를 사용했습니다
          </Text>
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
        keyExtractor={item => item.id.toString()}
        renderItem={renderUsageItem}
        renderSectionHeader={renderSectionHeader}
        style={styles.listContainer}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
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
