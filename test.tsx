return (
  <SafeAreaView style={styles.container} edges={['top']}>
    <ShoppingListHeader listName={fridgeName} />

    <KeyboardAvoidingView
      style={styles.content}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <Buttons
        isListEditMode={isEditMode}
        onEditModeToggle={handleEditToggle}
        onClearCheckedItems={handleClearCheckedItems}
        hasCheckedItems={hasCheckedItems}
      />
      <>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2F4858" />
            <Text style={styles.loadingText}>데이터 불러오는 중...</Text>
          </View>
        ) : displayItems.length === 0 ? (
          <>
            {isAddingNewItem && (
              <View style={styles.topInputContainer}>
                <NewItemCard
                  onSave={handleAddNewItem}
                  onCancel={handleCancelAddItem}
                />
              </View>
            )}
            <View style={styles.emptyContainer}>
              {!isAddingNewItem && (
                <>
                  <MaterialIcons name="shopping-cart" size={80} color="#ccc" />
                  <Text style={styles.emptyTitle}>장바구니가 비어있어요</Text>
                  <Text style={styles.emptySubtitle}>
                    식재료를 추가해 보세요!
                  </Text>
                </>
              )}
            </View>

            {!isAddingNewItem && (
              <View style={styles.emptyButtonContainer}>
                <TouchableOpacity
                  style={addItemStyles.addButton}
                  onPress={handleStartAddItem}
                  disabled={isSyncing}
                >
                  <MaterialIcons name="add" size={32} color="#666" />
                </TouchableOpacity>
              </View>
            )}
          </>
        ) : (
          <DraggableFlatList
            data={displayItems}
            keyExtractor={item => `cart-item-${item.id}`}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            activationDistance={10}
            dragItemOverflow={true}
            extraData={pendingChanges}
            renderItem={({ item, drag, isActive, getIndex }) => (
              <CartItemCard
                ref={ref => {
                  if (ref) {
                    itemRefs.current.set(item.id, ref);
                  } else {
                    itemRefs.current.delete(item.id);
                  }
                }}
                item={item}
                isEditMode={isEditMode}
                onToggleCheck={handleToggleCheck}
                onNameChange={handleNameChange}
                onQuantityChange={handleQuantityChange}
                onUnitChange={handleUnitChange}
                onDelete={handleDeleteItem}
                onDrag={drag}
                isActive={isActive}
                isFirstItem={getIndex?.() === 0}
              />
            )}
            ListFooterComponent={renderFooter}
          />
        )}
      </>
    </KeyboardAvoidingView>

    {/* 아이템 삭제 확인 모달 */}
    <ItemDeleteConfirmModal
      visible={showDeleteModal}
      itemName={itemToDelete?.name || ''}
      onConfirm={handleConfirmDelete}
      onCancel={handleCancelDelete}
    />

    {/* 체크된 아이템 비우기 확인 모달 */}
    <FlushConfirmModal
      visible={showClearModal}
      itemCount={cartItems.filter(item => item.purchased).length}
      onConfirm={handleConfirmClear}
      onCancel={handleCancelClear}
    />

    {/* ✅ 에러/알림 모달 */}
    <ConfirmModal
      isAlert={false}
      visible={errorModalVisible}
      title={errorModalTitle}
      message={errorModalMessage}
      iconContainer={{ backgroundColor: '#fae1dd' }}
      icon={{ name: 'error-outline', color: 'tomato', size: 48 }}
      confirmText="확인"
      cancelText=""
      confirmButtonStyle="primary"
      onConfirm={() => setErrorModalVisible(false)}
      onCancel={() => setErrorModalVisible(false)}
    />
  </SafeAreaView>
);
