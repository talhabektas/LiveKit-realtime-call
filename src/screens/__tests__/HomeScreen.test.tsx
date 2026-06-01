import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { HomeScreen } from '../HomeScreen';

// decodeToken'ı mock'la — burada JWT çözümlemeyi değil, ekran davranışını test ediyoruz.
jest.mock('../../utils/tokenInfo', () => ({
  decodeToken: jest.fn(() => ({ room: 'incident-test', identity: 'talha' })),
  sanitizeToken: jest.fn((s: string) => s.trim()),
}));

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: mockNavigate }),
}));

describe('HomeScreen', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('token yapıştırma alanı render edilir', () => {
    const { getByPlaceholderText } = render(<HomeScreen />);
    expect(getByPlaceholderText(/token'ını buraya yapıştır/i)).toBeTruthy();
  });

  it('"Odaya Katıl" butonu token boşken navigate etmez', () => {
    const { getByText } = render(<HomeScreen />);
    fireEvent.press(getByText('Odaya Katıl'));
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('token yapıştırılınca decode edilip Room ekranına yönlendirir', async () => {
    const { getByPlaceholderText, getByText } = render(<HomeScreen />);
    fireEvent.changeText(
      getByPlaceholderText(/token'ını buraya yapıştır/i),
      'header.payload.signature',
    );
    fireEvent.press(getByText('Odaya Katıl'));
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('Room', {
        roomName: 'incident-test',
        participantName: 'talha',
        token: 'header.payload.signature',
      });
    });
  });
});
