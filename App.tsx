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
    '', // Adding a token to the state for good measure
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
