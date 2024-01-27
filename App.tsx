import React, {useEffect, useReducer} from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';

import {useOutgoingCall} from './useCall';

const initialState = {
  ready: false,
  number: '',
  ringing: false,
  inCall: false,
  held: false,
  error: null,
  accessToken:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImN0eSI6InR3aWxpby1mcGE7dj0xIn0.eyJqdGkiOiJTS2Q0YTAyOWI0YzA3YjYyMDEwMTgxM2ZhNWM0ZTk4NmMzLTE3MDYzNjE1MTgiLCJncmFudHMiOnsiaWRlbnRpdHkiOiJ1c2VyIiwidm9pY2UiOnsiaW5jb21pbmciOnsiYWxsb3ciOnRydWV9LCJvdXRnb2luZyI6eyJhcHBsaWNhdGlvbl9zaWQiOiJBUGQwMzU4NGY2M2Q3NzI0OTcyNmEzMWU0NGUzMTUzOThmIn19fSwiaWF0IjoxNzA2MzYxNTE4LCJleHAiOjE3MDYzNjUxMTgsImlzcyI6IlNLZDRhMDI5YjRjMDdiNjIwMTAxODEzZmE1YzRlOTg2YzMiLCJzdWIiOiJBQ2M3YjUyZTViZGRjNjNjMmE2ZjIxOTA2YzA4MGY2YzdjIn0.6o5m3d9wV3LXu4AH9cVZVUIDiAIJJb2iNkUTcz1tc1E', // Adding a token to the state for good measure
  sip: 'testopop.sip.twilio.com',
};

const reducer = (state: any, action: any) => ({...state, ...action});

const App = () => {
  const [state] = useReducer(reducer, initialState);
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {backgroundColor: isDarkMode ? 'black' : 'white'};

  const {sip, accessToken} = state;

  const {handleCall, callStatus, loading} = useOutgoingCall({
    sip,
    accessToken,
  });

  if (loading) {
    return (
      <SafeAreaView style={backgroundStyle}>
        <View style={styles.container}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <View style={styles.container}>
        <View style={styles.centeredContent}>
          <TouchableOpacity onPress={handleCall} style={styles.button}>
            <Text style={styles.buttonText}>{callStatus}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, justifyContent: 'center'},
  centeredContent: {alignItems: 'center'},
  button: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#007bff',
    borderRadius: 5,
    height: 40,
  },
  buttonText: {color: 'white', fontSize: 18},
  status: {textAlign: 'center', marginTop: 100, fontSize: 18, color: 'red'},
});

export default App;
