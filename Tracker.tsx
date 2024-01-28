import React, {useRef, useMemo, useCallback, ReactElement} from 'react';
import {
  ScrollViewProps,
  TouchableOpacityProps,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';

type ScrollEvent = {
  type: 'scroll' | 'onScrollBeginDrag' | 'onScrollEndDrag';
  page: string;
  destination: 'up' | 'down';
  percentScrolled: string;
  time: string;
};

type ClickEvent = {
  type: 'click';
  page: string;
  target?: any;
  time: string;
};

type EventType = ScrollEvent | ClickEvent;

type EventTypes = 'onScrollBeginDrag' | 'click' | 'onScrollEndDrag' | 'onPress';

interface TrackerProps {
  children: ReactElement<ScrollViewProps | TouchableOpacityProps>;
  onEvent?: (event: EventType) => void;
  pageName?: string;
  eventTypes?: EventTypes[];
}

const Tracker: React.FC<TrackerProps> = ({
  children,
  onEvent,
  pageName = 'Home View',
  eventTypes = ['onScrollBeginDrag', 'click', 'onScrollEndDrag', 'onPress'],
}) => {
  const prevScrollY = useRef<number>(0);

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString(); // Adjust the format as needed
  };

  const trackEvent = useCallback(
    (
      event: NativeSyntheticEvent<NativeScrollEvent> | any,
      eventType: EventTypes,
    ): void => {
      if (eventTypes.includes(eventType)) {
        let eventData: EventType;

        if (eventType.includes('onScroll')) {
          const offsetY = event.nativeEvent.contentOffset.y;
          const contentSize = event.nativeEvent.contentSize.height;
          const layoutSize = event.nativeEvent.layoutMeasurement.height;

          // Calculate the percentage of the page scrolled
          const percentScrolled =
            ((offsetY / (contentSize - layoutSize)) * 100).toFixed(2) + '%';

          // Determine the scroll direction
          const destination: 'up' | 'down' =
            offsetY > prevScrollY.current ? 'down' : 'up';

          prevScrollY.current = offsetY;

          eventData = {
            type: eventType as 'onScrollBeginDrag' | 'onScrollEndDrag',
            page: pageName,
            destination,
            percentScrolled,
            time: formatTimestamp(event.timeStamp),
          };
        } else {
          eventData = {
            type: eventType as 'click',
            page: pageName,
            time: formatTimestamp(event.timeStamp),
          };
        }

        if (onEvent) {
          onEvent(eventData);
        }
      }
    },
    [eventTypes, onEvent, pageName],
  );

  // Memoize the event handlers
  const eventHandlers = useMemo(
    () =>
      eventTypes.reduce(
        (handlers, eventType) => ({
          ...handlers,
          [eventType]: (event: NativeSyntheticEvent<NativeScrollEvent> | any) =>
            trackEvent(event, eventType),
        }),
        {},
      ),
    [eventTypes, trackEvent],
  );

  return <>{React.cloneElement(children, eventHandlers)}</>;
};

export default Tracker;
