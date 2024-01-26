import React, {useState} from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import {Call, Voice} from '@twilio/voice-react-native-sdk';

const makeOutgoingCall = async () => {
  const sip = 'testopop.sip.twilio.com';
  const accessToken = '';
  const voice = new Voice();

  try {
    if (!accessToken) {
      throw new Error('Access token is invalid or not provided.');
    }

    const outgoingCallResult = await settlePromise(
      voice.connect(accessToken, {
        params: {
          url: sip,
          To: '+08091919191',
          From: 'LOLO',
          recipientType: 'client',
        },
      }),
    );

    if (outgoingCallResult.status === 'rejected') {
      console.log('NATIVE_MODULE_REJECTED:', outgoingCallResult.reason);
      return;
    }

    const outgoingCall = outgoingCallResult.value;

    outgoingCall.on(
      Call.Event.ConnectFailure,
      error => error && console.error('ConnectFailure:', error),
    );

    Object.values(Call.Event).forEach(callEvent =>
      outgoingCall.on(callEvent, () => console.info('Event:', callEvent)),
    );

    outgoingCall.once(Call.Event.Connected, () => {});

    return outgoingCall;
  } catch (error) {
    console.error('Failed to make a call:', error);
  }
};

const App = () => {
  const [callStatus, setCallStatus] = useState('Call');
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {backgroundColor: isDarkMode ? 'black' : 'white'};

  const handlePress = async () => {
    setCallStatus('Calling...');

    try {
      const outgoingCall = await makeOutgoingCall();

      if (outgoingCall) {
        outgoingCall.on(Call.Event.ConnectFailure, error => {
          setCallStatus('Call Failed');
          console.error('ConnectFailure:', error);
        });

        outgoingCall.on(Call.Event.Ringing, () => {
          setCallStatus('Ringing...');
          console.info('Event: ringing');
        });

        outgoingCall.on(Call.Event.Connected, () => {
          setCallStatus('Call Connected');
          console.info('Event: connected');
        });

        outgoingCall.on(Call.Event.Disconnected, error => {
          setCallStatus('Call Disconnected');
          console.info('Event: disconnected');
          if (error) {
            console.error('Disconnected:', error);
          }
          setTimeout(() => {
            setCallStatus('Call');
          }, 4000);
        });
      } else {
        setCallStatus('Call Failed');
      }
    } catch (error) {
      setCallStatus('Call Failed');
      console.error('Failed to make a call:', error);
    }
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <View style={styles.container}>
        <View style={styles.centeredContent}>
          <TouchableOpacity onPress={handlePress} style={styles.button}>
            <Text style={styles.buttonText}>{callStatus}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  centeredContent: {
    alignItems: 'center',
  },
  button: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#007bff',
    borderRadius: 5,
    height: 40,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
  status: {
    textAlign: 'center',
    marginTop: 100,
    fontSize: 18,
    color: 'red',
  },
});

export default App;

export async function settlePromise<T>(
  promise: Promise<T>,
): Promise<
  {status: 'fulfilled'; value: T} | {status: 'rejected'; reason: unknown}
> {
  return promise
    .then(value => ({status: 'fulfilled' as const, value}))
    .catch(reason => ({status: 'rejected' as const, reason}));
}
