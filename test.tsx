<View style={styles.itemInfo}>
  <View style={styles.itemHeader}>
    <Text style={styles.itemName}>{item.name}</Text>
    
    {isEditMode ? (
      <TouchableOpacity
        style={styles.expiaryContainer}
        onPress={() => setShowDatePicker(true)}
      >
        <Text
          style={[
            styles.itemExpiryNormal,
            isExpiringSoon && styles.itemExpiringSoon,
            isExpired && styles.itemExpired,
            getEditExpiryStyle(),
          ]}
        >
          {localExpiryDate}
        </Text>
      </TouchableOpacity>
    ) : (
      <Text style={styles.itemExpiry}>
        {localExpiryDate}
      </Text>
    )}
  </View>