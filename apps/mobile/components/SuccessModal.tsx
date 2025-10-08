import React, { useRef, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import LottieView from 'lottie-react-native';

interface SuccessModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

export default function SuccessModal({ visible, onClose, title, message }: SuccessModalProps) {
  const animationRef = useRef<LottieView>(null);

  useEffect(() => {
    // Setiap kali modal terlihat (dari false ke true), mainkan animasi dari awal.
    if (visible) {
      animationRef.current?.play(0); // 'play(0)' untuk memastikan animasi reset
    }
  }, [visible]);

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <LottieView
            ref={animationRef}
            // PERBAIKAN 1: Gunakan path relatif
            source={require('../assets/lottie/success.json')}
            style={styles.lottie}
            // PERBAIKAN 2: Jangan autoPlay dan jangan loop
            autoPlay={false}
            loop={false}
          />
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalText}>{message}</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={onClose}
          >
            <Text style={styles.buttonText}>Lanjutkan</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  lottie: {
    width: 150,
    height: 150,
    marginBottom: 15,
  },
  modalTitle: {
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalText: {
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    elevation: 2,
    minWidth: 120,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});