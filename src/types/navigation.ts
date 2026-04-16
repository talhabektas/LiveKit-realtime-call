import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Home: undefined;
  Room: {
    roomName: string;
    participantName: string;
    token: string;
  };
};

export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
export type RoomScreenProps = NativeStackScreenProps<RootStackParamList, 'Room'>;
