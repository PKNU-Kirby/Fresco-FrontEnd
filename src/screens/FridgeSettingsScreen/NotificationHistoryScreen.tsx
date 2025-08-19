import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  RefreshControl,
} from 'react-native';
import { NotificationStorageService, NotificationData, ExpiringItemsByFridge } from '../services/NotificationStorageService';

interface NotificationHistoryScreenProps {
  userId: string;
  onBack?: () => void;
}

const NotificationHistoryScreen: React.FC<NotificationHistoryScreenProps> = ({
  userId,
  onBack,
}) => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadNotificationHistory();
  }, []);

  const loadNotificationHistory = async () => {
    try {
      setLoading(true);
      const history = await NotificationStorageService.getNotificationHistory();
      // 현재 사용자의 알림만 필터링
      const userNotifications = history.filter(n => n.userId === userId);
      setNotifications(userNotifications);
    } catch (error) {
      console.error('알림 히스토리 로드 실패:', error);
      Alert.alert('오류', '알림 기록을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNotificationHistory();
    setRefreshing(false);
  };

  const handleNotificationPress = async (notification: NotificationData) => {
    try {
      // 읽음 처리
      if (!notification.isRead) {
        await NotificationStorageService.markNotificationAsRead(notification.id);
        setNotifications(prev =>
          prev.map(n =>
            n.id === notification.id ? { ...n, isRead: true } : n
          )
        );
      }

      // 상세 정보 표시
      showNotificationDetails(notification);
    } catch (error) {
      console.error('알림 처리 실패:', error);
    }
  };

  const showNotificationDetails = (notification: NotificationData) => {
    const { fridges } = notification.data;
    
    const fridgeDetails = fridges
      .map((fridge: ExpiringItemsByFridge) => {
        const itemList = fridge.items
          .map(item => `  • ${item.name} (${item.daysLeft}일 남음)`)
          .join('\n');
        
        return