import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { HomeScreen } from '../HomeScreen';

// tokenGenerator mock'la — bu testte JWT üretimini test etmiyoruz
jest.mock('../../utils/tokenGenerator', () => ({
  generateToken: jest.fn(() => 'mock-jwt-token'),
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

  it('oda adı ve kullanıcı adı inputları render edilir', () => {
    const { getByPlaceholderText } = render(<HomeScreen />);
    expect(getByPlaceholderText('Oda adı')).toBeTruthy();
    expect(getByPlaceholderText('Kullanıcı adı')).toBeTruthy();
  });

  it('"Odaya Katıl" butonu başta disabled — boşken navigate etmez', () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText('Odaya Katıl')).toBeTruthy();
    // Alanlar boşken tıklama navigate'i tetiklememeli
    fireEvent.press(getByText('Odaya Katıl'));
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('iki alan dolu olunca buton aktif olur ve Room ekranına navigate eder', async () => {
    const { getByPlaceholderText, getByText } = render(<HomeScreen />);
    fireEvent.changeText(getByPlaceholderText('Oda adı'), 'test-room');
    fireEvent.changeText(getByPlaceholderText('Kullanıcı adı'), 'alice');
    fireEvent.press(getByText('Odaya Katıl'));
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('Room', {
        roomName: 'test-room',
        participantName: 'alice',
        token: 'mock-jwt-token',
      });
    });
  });
});
