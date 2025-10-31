import React, { useMemo } from 'react';
import { SafeAreaView, View, Text, StyleSheet, ScrollView, Pressable, Image, Linking, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { barbersStore, type BarberProfile } from '../lib/barbers-store';

export default function ModalBarberDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const barber = useMemo<BarberProfile | undefined>(() => barbersStore.get().find(b => b.id === String(id)), [id]);

  const avatar = barber?.avatar || require('../assets/images/brandlogo.png');
  const name = barber?.name || 'Barber Profile';
  const location = barber ? `${barber.city}${barber.area ? ', ' + barber.area : ''}` : '';
  const years = barber?.years ?? 0;
  const skills = barber?.skills || [];
  const bio = barber?.bio || 'No bio provided.';
  const phone = barber?.contact?.phone || '';
  const email = barber?.contact?.email || '';

  const dial = async () => {
    if (!phone) { Alert.alert('No phone number', 'This profile has no phone number.'); return; }
    const url = `tel:${phone.replace(/\s+/g, '')}`;
    const ok = await Linking.canOpenURL(url);
    if (ok) Linking.openURL(url); else Alert.alert('Cannot dial', 'Device cannot open the phone dialer.');
  };

  const mail = async () => {
    if (!email) { Alert.alert('No email', 'This profile has no email.'); return; }
    const url = `mailto:${email}`;
    const ok = await Linking.canOpenURL(url);
    if (ok) Linking.openURL(url); else Alert.alert('Cannot email', 'Device cannot open the mail app.');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back to Barbers" onPress={() => router.back()} style={styles.backRow}>
          <Feather name="arrow-left" size={18} color="#111827" />
          <Text style={styles.backText}>Back to Barbers</Text>
        </Pressable>

        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Image source={avatar} style={styles.avatar} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.title}>{name}</Text>
              <View style={styles.rowMid}>
                <Ionicons name="location-outline" size={16} color="#6B7280" />
                <Text style={styles.locText}>  {location}</Text>
              </View>
              <Text style={styles.metaText}>{years} years experience</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Skills</Text>
          <View style={styles.skillsGrid}>
            {skills.length ? skills.map(s => (
              <View key={s} style={styles.skillChip}><Text style={styles.skillText}>{s}</Text></View>
            )) : <Text style={styles.muted}>No skills listed.</Text>}
          </View>

          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.bio}>{bio}</Text>

          <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Contact</Text>
          <View style={styles.contactCol}>
            <View style={styles.rowMid}><Feather name="phone" size={16} color="#111827" /><Text style={styles.contactText}>  {phone || '—'}</Text></View>
            <View style={[styles.rowMid, { marginTop: 6 }]}><Feather name="mail" size={16} color="#111827" /><Text style={styles.contactText}>  {email || '—'}</Text></View>
          </View>

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
            <Pressable accessibilityRole="button" accessibilityLabel="Call barber" onPress={dial} disabled={!phone} style={[styles.ctaBtn, !phone && styles.ctaDisabled]}>
              <Feather name="phone" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.ctaText}>Call</Text>
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="Email barber" onPress={mail} disabled={!email} style={[styles.ctaBtn, !email && styles.ctaDisabled]}>
              <Feather name="mail" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.ctaText}>Email</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  scroll: { padding: 16 },
  backRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  backText: { marginLeft: 6, color: '#111827' },

  card: { backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', padding: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 72, height: 72, borderRadius: 36 },
  title: { fontSize: 18, fontWeight: '700', color: '#111827' },
  rowMid: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  locText: { color: '#6B7280' },
  metaText: { color: '#6B7280', marginTop: 4 },

  sectionTitle: { marginTop: 12, fontSize: 16, fontWeight: '700', color: '#111827' },
  skillsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 },
  skillChip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: '#F3F4F6', marginRight: 8, marginBottom: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  skillText: { fontSize: 12, color: '#111827', fontWeight: '600' },
  muted: { color: '#6B7280' },

  bio: { marginTop: 6, color: '#4B5563', lineHeight: 22 },
  contactCol: { marginTop: 6 },
  contactText: { color: '#111827' },

  ctaBtn: { flex: 1, height: 48, borderRadius: 12, backgroundColor: '#10B981', alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  ctaDisabled: { backgroundColor: '#10B98199' },
  ctaText: { color: '#FFFFFF', fontWeight: '700' },
});
