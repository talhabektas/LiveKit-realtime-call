import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native';
import {
  LiveKitRoom,
  useParticipants,
  useLocalParticipant,
  useConnectionState,
  AudioSession,
} from '@livekit/react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, RoomScreenProps } from '../types/navigation';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Room'>;

// ─── Inner component — runs inside LiveKitRoom context ───────────────────────
function ActiveCallView({
  roomName,
  onLeave,
}: {
  roomName: string;
  onLeave: () => void;
}) {
  const participants = useParticipants();
  const { localParticipant, isMicrophoneEnabled } = useLocalParticipant();
  const connectionState = useConnectionState();

  const toggleMute = async () => {
    await localParticipant?.setMicrophoneEnabled(!isMicrophoneEnabled);
  };

  const renderParticipant = ({ item }: { item: { identity: string; isMicrophoneEnabled: boolean } }) => (
    <View style={styles.participantRow}>
      <Text style={styles.participantName}>{item.identity}</Text>
      <Text style={styles.micIcon}>
        {item.isMicrophoneEnabled ? '🎙️' : '🔇'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.roomTitle}>{roomName}</Text>

      <Text style={styles.statusText}>{connectionState}</Text>

      <Text style={styles.sectionLabel}>
        Katılımcılar ({participants.length})
      </Text>

      <FlatList
        data={participants}
        keyExtractor={(item) => item.identity}
        renderItem={renderParticipant}
        style={styles.participantList}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Başka katılımcı yok</Text>
        }
      />

      <TouchableOpacity
        style={[styles.muteButton, !isMicrophoneEnabled && styles.mutedButton]}
        onPress={toggleMute}
      >
        <Text style={styles.muteButtonText}>
          {isMicrophoneEnabled ? 'Mikrofonu Kapat' : 'Mikrofonu Aç'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.leaveButton} onPress={onLeave}>
        <Text style={styles.leaveButtonText}>Aramadan Çık</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Root screen — manages LiveKitRoom and AudioSession ─────────────────────
export function RoomScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RoomScreenProps['route']>();
  const { roomName, token } = route.params;

  const liveKitUrl = process.env.EXPO_PUBLIC_LIVEKIT_URL ?? '';

  if (!liveKitUrl) {
    return (
      <View style={styles.container}>
        <Text style={[styles.statusText, { color: '#e94560', marginTop: 40 }]}>
          .env dosyasında EXPO_PUBLIC_LIVEKIT_URL eksik
        </Text>
      </View>
    );
  }

  const [connected, setConnected] = useState(true);
  const isLeavingRef = useRef(false);

  useEffect(() => {
    AudioSession.startAudioSession();
    return () => {
      AudioSession.stopAudioSession();
    };
  }, []);

  const handleLeave = () => {
    isLeavingRef.current = true;
    setConnected(false);
    navigation.goBack();
  };

  return (
    <LiveKitRoom
      serverUrl={liveKitUrl}
      token={token}
      connect={connected}
      audio={true}
      onDisconnected={() => {
        if (!isLeavingRef.current) {
          navigation.goBack();
        }
      }}
      onError={(error) => {
        console.error('LiveKit error:', error);
        Alert.alert('Bağlantı Hatası', error?.message ?? 'LiveKit bağlantısı kesildi');
      }}
    >
      <ActiveCallView roomName={roomName} onLeave={handleLeave} />
    </LiveKitRoom>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    padding: 20,
  },
  roomTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#e0e0e0',
    textAlign: 'center',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  participantList: {
    flex: 1,
    marginBottom: 20,
  },
  participantRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#16213e',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
  },
  participantName: {
    color: '#e0e0e0',
    fontSize: 16,
  },
  micIcon: {
    fontSize: 20,
  },
  emptyText: {
    color: '#555',
    textAlign: 'center',
    marginTop: 20,
  },
  muteButton: {
    backgroundColor: '#0f3460',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  mutedButton: {
    backgroundColor: '#555',
  },
  muteButtonText: {
    color: '#e0e0e0',
    fontSize: 16,
    fontWeight: '600',
  },
  leaveButton: {
    backgroundColor: '#e94560',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  leaveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
