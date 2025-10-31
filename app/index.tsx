import React, { useEffect } from 'react';
import { Image, SafeAreaView, View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { AntDesign, FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { hasEntered, markEntered } from '../lib/session';

export default function Welcome() {
  const router = useRouter();
  useEffect(() => {
    (async () => {
      const seen = await hasEntered();
      if (seen) router.replace('/(tabs)/home');
    })();
  }, [router]);

  const goIn = async () => { await markEntered(); router.replace('/(tabs)/home'); };
  const onGoogle = async () => goIn();
  const onFacebook = async () => goIn();
  const onApple = async () => goIn();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Image
            source={require('../assets/images/brandlogo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>BarberNet</Text>
          <Text style={styles.subtitle}>Connect barbers, shops, and suppliers across the UK</Text>
        </View>

        <View style={styles.actions}>
          <Pressable onPress={onGoogle} style={[styles.button, styles.googleBtn]}>
            <AntDesign name="google" size={18} color="#4285F4" style={styles.icon} />
            <Text style={[styles.btnText, styles.googleText]}>Continue with Google</Text>
          </Pressable>

          <View style={{ height: 6 }} />

          <Pressable onPress={onFacebook} style={[styles.button, styles.facebookBtn]}>
            <FontAwesome name="facebook" size={18} color="#FFFFFF" style={styles.icon} />
            <Text style={[styles.btnText, styles.facebookText]}>Continue with Facebook</Text>
          </Pressable>

          <View style={{ height: 6 }} />

          <Pressable onPress={onApple} style={[styles.button, styles.appleBtn]}>
            <FontAwesome name="apple" size={18} color="#FFFFFF" style={styles.icon} />
            <Text style={[styles.btnText, styles.appleText]}>Continue with Apple</Text>
          </Pressable>
        </View>

        <Text style={styles.legal}>By continuing, you agree to our Terms & Privacy.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 48,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
  },
  logo: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  title: {
    marginTop: 12,
    fontSize: 28,
    fontWeight: '700',
    color: '#2F6061',
    letterSpacing: 0.2,
  },
  subtitle: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
    color: '#4B5563',
    paddingHorizontal: 12,
  },
  actions: {
    gap: 6,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 14,
  },
  icon: {
    position: 'absolute',
    left: 18,
  },
  googleBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  googleText: {
    color: '#111827',
  },
  facebookBtn: {
    backgroundColor: '#1877F2',
  },
  facebookText: {
    color: '#FFFFFF',
  },
  appleBtn: {
    backgroundColor: '#000000',
  },
  appleText: {
    color: '#FFFFFF',
  },
  btnText: {
    fontSize: 16,
    fontWeight: Platform.OS === 'ios' ? '600' : '700',
  },
  legal: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 13,
    marginBottom: 20,
  },
});
