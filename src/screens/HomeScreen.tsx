import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Keyboard,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import { decodeToken, sanitizeToken } from '../utils/tokenInfo';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

// Token uygulamada ÜRETİLMEZ. Dışarıda (LiveKit Cloud dashboard veya `lk token
// create ...`) üretilip buraya yapıştırılır. Kolaylık için .env'deki
// EXPO_PUBLIC_LIVEKIT_TOKEN varsa varsayılan olarak yüklenir; her cihaza farklı
// identity vermek için alandaki token elle değiştirilebilir.
const DEFAULT_TOKEN = process.env.EXPO_PUBLIC_LIVEKIT_TOKEN ?? '';

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const [token, setToken] = useState(DEFAULT_TOKEN);
  const [loading, setLoading] = useState(false);

  const canJoin = token.trim().length > 0;

  const handleJoin = async () => {
    if (!canJoin) return;
    Keyboard.dismiss();
    setLoading(true);
    try {
      const clean = sanitizeToken(token);
      const { room, identity } = decodeToken(clean);
      navigation.navigate('Room', {
        roomName: room,
        participantName: identity,
        token: clean,
      });
    } catch (e) {
      Alert.alert(
        'Geçersiz Token',
        e instanceof Error ? e.message : 'Token okunamadı',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        <Text style={styles.title}>Sesli Aramaya Katıl</Text>

        <Text style={styles.label}>LiveKit Token</Text>
        <TextInput
          style={styles.tokenInput}
          placeholder="LiveKit token'ını buraya yapıştır (eyJhbGci...)"
          placeholderTextColor="#888"
          value={token}
          onChangeText={setToken}
          autoCapitalize="none"
          autoCorrect={false}
          multiline
          textAlignVertical="top"
        />

        <Text style={styles.hint}>
          Token, oda adını ve identity'yi içinde taşır. Her cihaza aynı oda için
          farklı identity'li bir token yapıştır.
        </Text>

        <TouchableOpacity
          style={styles.dismissLink}
          onPress={() => Keyboard.dismiss()}
        >
          <Text style={styles.dismissText}>Klavyeyi Kapat</Text>
        </TouchableOpacity>

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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  container: {
    flexGrow: 1,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    padding: 24,
  },
  dismissLink: {
    alignSelf: 'center',
    paddingVertical: 8,
    marginBottom: 4,
  },
  dismissText: {
    color: '#8aa0c8',
    fontSize: 13,
    fontWeight: '600',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#e0e0e0',
    marginBottom: 32,
    textAlign: 'center',
  },
  label: {
    fontSize: 13,
    color: '#aaa',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tokenInput: {
    width: '100%',
    minHeight: 120,
    backgroundColor: '#16213e',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#e0e0e0',
    fontSize: 13,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  hint: {
    fontSize: 12,
    color: '#777',
    marginBottom: 24,
    lineHeight: 17,
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
