import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Vibration,
  Easing,
  Animated,
  Dimensions,
  TouchableOpacity,
  TextInput,
} from 'react-native';

const {height, width} = Dimensions.get('window');

interface Colors {
  background: string;
  button: string;
  text: string;
}

const colors: Colors = {
  background: '#424242',
  button: '#FFAF49',
  text: '#FFFFFF',
};

const timers = [...Array(13).keys()].map(i => (i === 0 ? 1 : i * 5));
const itemSize = width * 0.38;
const itemSpacing = (width - itemSize) / 2;

const App = () => {
  const [duration, setDuration] = useState(timers[0]);
  const xScrollRef = useRef(new Animated.Value(0)).current;
  const timerAnimationRef = useRef(new Animated.Value(height)).current;
  const animatedButtonRef = useRef(new Animated.Value(0)).current;
  const animatedTextInputRef = useRef(new Animated.Value(0)).current;
  const inputRef = useRef();

  useEffect(() => {
    const eListener = animatedTextInputRef.addListener(({value}) => {
      inputRef?.current?.setNativeProps({
        text: Math.ceil(value).toString(),
      });
    });
    return () => {
      animatedTextInputRef.removeAllListeners(eListener);
      animatedTextInputRef.removeAllListeners();
    };
  }, []);

  const animations = useCallback(() => {
    animatedTextInputRef.setValue(duration);
    Animated.sequence([
      Animated.timing(animatedButtonRef, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(timerAnimationRef, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(animatedTextInputRef, {
          toValue: 0,
          duration: duration * 1000,
          useNativeDriver: true,
        }),
        Animated.timing(timerAnimationRef, {
          toValue: height,
          duration: duration * 1000,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      Animated.timing(animatedButtonRef, {
        toValue: 0,
        duration: duration * 1000,
        useNativeDriver: true,
      }).start();
    });
  }, [duration]);

  const opacity = animatedButtonRef.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  const translateY = animatedButtonRef.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 200],
  });

  const textOpacity = animatedButtonRef.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden />
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          {
            height,
            width,
            backgroundColor: colors.button,
            transform: [
              {
                translateY: timerAnimationRef,
              },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          {
            justifyContent: 'flex-end',
            alignItems: 'center',
            paddingBottom: 100,
            opacity,
            transform: [
              {
                translateY,
              },
            ],
          },
        ]}>
        <Text style={[styles.text, {fontSize: 20}]}>CountDownApp</Text>
        <TouchableOpacity onPress={animations}>
          <View style={styles.roundButton}></View>
        </TouchableOpacity>
      </Animated.View>
      <View
        style={{
          position: 'absolute',
          top: height / 3,
          left: 0,
          right: 0,
          flex: 1,
        }}>
        <Animated.View
          style={{
            position: 'absolute',
            width: itemSize,
            justifyContent: 'center',
            alignSelf: 'center',
            alignItems: 'center',
            opacity: textOpacity,
          }}>
          <TextInput
            ref={inputRef}
            style={styles.text}
            defaultValue={duration.toString()}
          />
        </Animated.View>
        <Animated.FlatList
          data={timers}
          horizontal
          bounces={false}
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={event => {
            const index = Math.round(
              event.nativeEvent.contentOffset.x / itemSize,
            );
            setDuration(timers[index]);
          }}
          onScroll={Animated.event(
            [{nativeEvent: {contentOffset: {x: xScrollRef}}}],
            {useNativeDriver: true},
          )}
          snapToInterval={itemSize}
          decelerationRate={'fast'}
          style={{flexGrow: 0, opacity}}
          contentContainerStyle={{
            paddingHorizontal: itemSpacing,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          renderItem={({item, index}) => {
            const inputRange = [
              (index - 1) * itemSize,
              index * itemSize,
              (index + 1) * itemSize,
            ];

            const opacity = xScrollRef.interpolate({
              inputRange,
              outputRange: [0.4, 1, 0.4],
            });

            const scale = xScrollRef.interpolate({
              inputRange,
              outputRange: [0.6, 1, 0.6],
            });
            return (
              <View
                style={{
                  width: itemSize,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Animated.Text
                  style={[styles.text, {opacity, transform: [{scale}]}]}>
                  {item}
                </Animated.Text>
              </View>
            );
          }}
          keyExtractor={item => item.toString()}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  roundButton: {
    backgroundColor: colors.button,
    borderRadius: 80,
    height: 80,
    width: 80,
  },
  text: {
    color: colors.text,
    fontSize: itemSize * 0.7,
    fontWeight: '800',
  },
});

export default App;
