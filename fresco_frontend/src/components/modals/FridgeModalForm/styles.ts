import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: 'white',
    paddingTop: 20,
    borderRadius: 10,
    width: '80%',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  switchContainer: {
    marginHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  switchContainerText: {
    marginLeft: 8,
  },
  switch: {
    backgroundColor: 'lightgray',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    minWidth: 50,
    alignItems: 'center',
    marginRight: 2,
  },
  switchActive: {
    backgroundColor: 'limegreen',
  },
  switchText: {
    color: '#333',
    fontWeight: '700',
    fontSize: 12,
  },

  // 하단 버튼들
  buttonRow: {
    borderTopWidth: 0.5,
    borderTopColor: '#e0e0e0',
    flexDirection: 'row',
  },
  buttonRowLeft: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderRightWidth: 0.5,
    borderRightColor: '#e0e0e0',
  },
  buttonRowLeftText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '900',
  },
  buttonRowRight: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonRowRightText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '400',
  },
});
