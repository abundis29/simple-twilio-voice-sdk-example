import {useCallback, useEffect, useRef, useState} from 'react';
import {Call} from '@twilio/voice-react-native-sdk';
import {settlePromise} from './util/settlePromise';
import {voice} from './util/voice';
import RNCallKeep, {IOptions} from 'react-native-callkeep';
import {Platform} from 'react-native';
import randomUuid from 'uuid-random';

const isIOS = Platform.OS === 'ios';

interface UseOutgoingCallProps {
  sip: string;
  accessToken: string;
}

interface UseOutgoingCallResult {
  outgoingCall: Call | null;
  handleCall: () => void;
  cleanup: () => void;
  setup: () => void;
  callStatus: string;
  meta?: object;
  loading: boolean;
}

const options: IOptions = {
  ios: {appName: 'SPEED'},
  android: {
    alertTitle: 'Incoming call',
    alertDescription: 'You have an incoming call',
    cancelButton: 'Decline',
    okButton: 'Ok',
    additionalPermissions: [],
    selfManaged: false,
  },
};

export const useOutgoingCall = ({
  sip,
  accessToken,
}: UseOutgoingCallProps): UseOutgoingCallResult => {
  const outgoingCallRef = useRef<Call | null>(null);
  const [callStatus, setCallStatus] = useState('Call');
  const [loading, setLoading] = useState(true);

  const handleCallFailure = useCallback((error: unknown) => {
    setCallStatus('Call Failed');
    console.error('Failed to make a call:', error);
  }, []);

  const addCallListeners = (
    outgoingCall: Call,
    uuid: string,
    callInfo: {callUUID?: string; number: any; name: any},
  ) => {
    outgoingCall.on(Call.Event.Ringing, () => setCallStatus('Ringing...'));

    outgoingCall.on(Call.Event.Connected, () => {
      setCallStatus('Call Connected');
      uuid && RNCallKeep.setCurrentCallActive(uuid);
      RNCallKeep.updateDisplay(uuid, callInfo.number, callInfo.name);
    });

    outgoingCall.on(Call.Event.Disconnected, error => {
      setCallStatus('Call Disconnected');
      console.log('Call Disconnected');
      if (!isIOS) {
        RNCallKeep.backToForeground();
      }
      RNCallKeep.endAllCalls();
      if (error) {
        console.error('Disconnected:', error);
        outgoingCall.disconnect();
      }
      setTimeout(() => setCallStatus('Call'), 4000);
    });
  };

  const handleCall = async () => {
    setCallStatus('Calling...');

    try {
      if (!accessToken) {
        throw new Error('Access token is invalid or not provided.');
      }

      const outgoingCallResult = await settlePromise(
        voice.connect(accessToken, {
          params: {answerOnBridge: 'true', to: sip},
        }),
      );

      if (outgoingCallResult.status === 'rejected') {
        console.error('NATIVE_MODULE_REJECTED:', outgoingCallResult.reason);
        return;
      }

      const newOutgoingCall = outgoingCallResult.value;

      newOutgoingCall.on(
        Call.Event.ConnectFailure,
        (error: Error) => error && console.error('ConnectFailure:', error),
      );

      Object.values(Call.Event).forEach(callEvent => {
        newOutgoingCall.on(callEvent, () =>
          console.info('🚧 Event:', callEvent),
        );
        if (callEvent === 'disconnected') {
          // console.log('🏎', uuid);
        }
      });

      newOutgoingCall.once(Call.Event.Connected, () => {});

      outgoingCallRef.current = newOutgoingCall;

    //   const callSid = newOutgoingCall.getSid();
      const uuid = randomUuid().toLowerCase();

      const callInfo = {
        callUUID: uuid || 'default_callUUID',
        number: newOutgoingCall.getFrom() || 'fake',
        name: 'FAKE CALL 🔥',
      };

      // The rest of your handleCall logic...

      RNCallKeep.addEventListener('endCall', data => {
        console.info('RNCallKeep Event: Perform End Call Action', data);
        cleanup(); // Cleanup the outgoing call
      });

      // You might want to refactor addCallListeners according to your needs
      addCallListeners(newOutgoingCall, uuid, callInfo);
    } catch (error) {
      handleCallFailure(error);
    }
  };

  const cleanup = useCallback(() => {
    const currentOutgoingCall = outgoingCallRef.current;
    if (currentOutgoingCall) {
      // Perform any cleanup logic needed
      currentOutgoingCall.disconnect();
      outgoingCallRef.current = null;
      setCallStatus('Call'); // Reset call status
    }
  }, []);

  const setup = async () => {
    try {
      await RNCallKeep.setup(options).then(result =>
        console.info(result, 'Setup result'),
      );
      RNCallKeep.setAvailable(true);
      setLoading(false);
    } catch (error) {
      console.error(error);
    }

    console.info('RNCallKeep setup completed');

    RNCallKeep.addEventListener('didChangeAudioRoute', () => {});
  };

  useEffect(() => {
    // Cleanup the outgoing call when the component unmounts
    setup();
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    setup,
    outgoingCall: outgoingCallRef.current,
    handleCall,
    cleanup,
    callStatus,
    loading,
  };
};
