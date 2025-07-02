import React from 'react';
import {TouchableOpacity} from 'react-native';
import CustomText from '../common/CustomText';
import styles from '../../screens/FridgeSelectScreen/styles';

interface FridgeSection {
  id: string;
  name: string;
}

interface Fridge {
  id: string;
  name: string;
  sections: FridgeSection[];
}

interface Props {
  fridge: Fridge;
  isEditMode: boolean;
  onSelect: (id: string) => void;
  onEdit: (fridge: Fridge) => void;
  onAdd: () => void;
}

const FridgeTile = ({fridge, isEditMode, onSelect, onEdit, onAdd}: Props) => {
  const isAdd = fridge.id === 'add';

  return (
    <TouchableOpacity
      style={[styles.fridgeTile, isAdd && styles.addTile]}
      onPress={() => (isAdd ? onAdd() : onSelect(fridge.id))}>
      {isEditMode && !isAdd && (
        <TouchableOpacity
          style={styles.editIcon}
          onPress={e => {
            e.stopPropagation?.();
            onEdit(fridge);
          }}>
          <CustomText style={styles.editIconText}>✏️</CustomText>
        </TouchableOpacity>
      )}
      <CustomText style={[styles.tileText, isAdd && styles.addTileText]}>
        {fridge.name}
      </CustomText>
    </TouchableOpacity>
  );
};

export default FridgeTile;
