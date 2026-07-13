import React, { useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Animated, 
  Dimensions, 
  StatusBar,
  Image,
  Platform
} from 'react-native';
import { ShieldCheck } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface IntroSplashScreenProps {
  onFinish: () => void;
}

export default function IntroSplashScreen({ onFinish }: IntroSplashScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start animation sequence
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      // Progress bar animation (2.5 seconds)
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 2200,
        useNativeDriver: false,
      }),
      // Continuous Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ),
      // Continuous Float animation for bg elements
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, {
            toValue: 1,
            duration: 4000,
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim, {
            toValue: 0,
            duration: 4000,
            useNativeDriver: true,
          }),
        ])
      )
    ]).start();

    // Redirect after 2.5 seconds
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => onFinish());
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%']
  });

  const floatY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20]
  });

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <LinearGradient
        colors={['#1E3A8A', '#1E3A8A', '#111827']}
        style={styles.gradient}
      >
        {/* Decorative Background Elements */}
        <Animated.View style={[styles.bgCircle, { top: '10%', left: '10%', transform: [{ translateY: floatY }] }]} />
        <Animated.View style={[styles.bgCircle, { bottom: '15%', right: '5%', width: 120, height: 120, opacity: 0.05, transform: [{ translateY: floatY }] }]} />
        
        <Animated.View 
          style={[
            styles.content,
            { 
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { translateY: slideAnim }
              ]
            }
          ]}
        >
          <View style={styles.logoContainer}>
            <Animated.View style={[styles.pulseOuter, { transform: [{ scale: pulseAnim }] }]} />
            <View style={styles.glowBox}>
                <ShieldCheck size={80} color="#FFF" strokeWidth={1.5} />
            </View>
          </View>
          
          <View style={styles.textContainer}>
            <Text style={styles.brandName}>SAFE SHELTER</Text>
            <View style={styles.divider} />
            <Text style={styles.tagline}>GÜVENLİĞİNİZ BİZİM ELİMİZDE</Text>
          </View>

          {/* Loading Progress Bar */}
          <View style={styles.progressContainer}>
            <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
          </View>
        </Animated.View>

        <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
           <Text style={styles.versionText}>v1.0.4 Premium Edition</Text>
        </Animated.View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bgCircle: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  content: {
    alignItems: 'center',
    width: '100%',
    zIndex: 10,
  },
  logoContainer: {
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseOuter: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(96, 165, 250, 0.15)',
  },
  glowBox: {
    width: 140,
    height: 140,
    borderRadius: 45,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    ...Platform.select({
      ios: {
        shadowColor: '#FFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 25,
      },
      android: {
        elevation: 20,
      },
    }),
  },
  textContainer: {
    alignItems: 'center',
  },
  brandName: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 4,
    textShadowColor: 'rgba(96, 165, 250, 0.4)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  divider: {
    width: 40,
    height: 3,
    backgroundColor: '#60A5FA',
    marginVertical: 15,
    borderRadius: 2,
  },
  tagline: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  progressContainer: {
    width: width * 0.6,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    marginTop: 40,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FFF',
    borderRadius: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 50,
  },
  versionText: {
    color: 'rgba(148, 163, 184, 0.4)',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
  },
});
