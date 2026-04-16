import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import { generateToken } from '../utils/tokenGenerator';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const [roomName, setRoomName] = useState('');
  const [participantName, setParticipantName] = useState('');
  const [loading, setLoading] = useState(false);

  const canJoin = roomName.trim().length > 0 && participantName.trim().length > 0;

  const handleJoin = async () => {
    if (!canJoin) return;
    setLoading(true);
    try {
      const token = generateToken(roomName.trim(), participantName.trim());
      navigation.navigate('Room', {
        roomName: roomName.trim(),
        participantName: participantName.trim(),
        token,
      });
    } catch (e) {
      Alert.alert(
        'Hata',
        e instanceof Error ? e.message : 'Token oluşturulamadı',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sesli Aramaya Katıl</Text>

      <TextInput
        style={styles.input}
        placeholder="Oda adı"
        placeholderTextColor="#888"
        value={roomName}
        onChangeText={setRoomName}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <TextInput
        style={styles.input}
        placeholder="Kullanıcı adı"
        placeholderTextColor="#888"
        value={participantName}
        onChangeText={setParticipantName}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <TouchableOpacity
        style={[styles.button, !canJoin && styles.buttonDisabled]}
        onPress={handleJoin}
        disabled={!canJoin || loading}
        accessibilityState={{ disabled: !canJoin || loading }}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Odaya Katıl</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#e0e0e0',
    marginBottom: 32,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#16213e',
    borderRadius: 10,
    paddingHorizontal: 16,
    color: '#e0e0e0',
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#e94560',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#555',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
