import React from 'react';
import {View, TouchableOpacity} from 'react-native';
import CustomText from '../../common/CustomText';
import {styles} from './styles';

type FridgeItem = {
  id: number;
  name: string;
  quantity: string;
  expiryDate: string;
  imageUri?: string;
  storageType: string;
  itemCategory: string;
  fridgeId: number;
};

type FridgeItemCardProps = {
  item: FridgeItem;
  isEditMode?: boolean;
  onPress?: () => void;
};

const FridgeItemCard: React.FC<FridgeItemCardProps> = ({
  item,
  isEditMode = false,
  onPress,
}) => {
  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <CardComponent style={styles.itemCard} onPress={onPress}>
      <View style={styles.itemImageContainer}>
        <View style={styles.itemImagePlaceholder} />
      </View>
      <View style={styles.itemInfo}>
        <CustomText style={styles.itemName}>{item.name}</CustomText>
        <View style={styles.itemDetails}>
          <CustomText style={styles.itemQuantity}>
            {item.quantity} 개
          </CustomText>
          <CustomText style={styles.itemExpiry}>{item.expiryDate}</CustomText>
        </View>
        <CustomText style={styles.itemStatus}>
          {item.storageType} | {item.itemCategory}
        </CustomText>
      </View>
      {isEditMode && (
        <View style={styles.editModeActions}>
          <TouchableOpacity style={styles.editButton}>
            <CustomText style={styles.editButtonText}>편집</CustomText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton}>
            <CustomText style={styles.deleteButtonText}>삭제</CustomText>
          </TouchableOpacity>
        </View>
      )}
    </CardComponent>
  );
};

export default FridgeItemCard;
