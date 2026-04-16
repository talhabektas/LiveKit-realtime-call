import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { RoomScreen } from '../RoomScreen';
import { useParticipants, useLocalParticipant, useConnectionState } from '@livekit/react-native';

const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ goBack: mockGoBack }),
  useRoute: () => ({
    params: {
      roomName: 'test-room',
      participantName: 'test-user',
      token: 'mock-token',
    },
  }),
}));

describe('RoomScreen', () => {
  beforeEach(() => {
    mockGoBack.mockClear();
    (useConnectionState as jest.Mock).mockReturnValue('connected');
    (useParticipants as jest.Mock).mockReturnValue([
      { identity: 'alice', isMicrophoneEnabled: true },
      { identity: 'bob', isMicrophoneEnabled: false },
    ]);
    (useLocalParticipant as jest.Mock).mockReturnValue({
      localParticipant: {
        identity: 'test-user',
        setMicrophoneEnabled: jest.fn(),
      },
      isMicrophoneEnabled: true,
    });
  });

  it('oda adını başlık olarak gösterir', () => {
    const { getByText } = render(<RoomScreen />);
    expect(getByText('test-room')).toBeTruthy();
  });

  it('katılımcıları listeler', () => {
    const { getByText } = render(<RoomScreen />);
    expect(getByText('alice')).toBeTruthy();
    expect(getByText('bob')).toBeTruthy();
  });

  it('"Aramadan Çık" butonuna basınca goBack çağrılır', () => {
    const { getByText } = render(<RoomScreen />);
    fireEvent.press(getByText('Aramadan Çık'));
    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });

  it('bağlantı durumunu gösterir', () => {
    const { getByText } = render(<RoomScreen />);
    expect(getByText(/connected/i)).toBeTruthy();
  });
});
