import React, { useMemo } from 'react';
import { SafeAreaView, View, Text, StyleSheet, ScrollView, Pressable, Image, Alert, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { jobsStore, type JobListing } from '../lib/../lib/jobs-store';

export default function ModalJobDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const job = useMemo<JobListing | undefined>(() => jobsStore.get().find(j => j.id === String(id)), [id]);

  const imageSource = job?.images?.[0]?.uri
    ? { uri: job.images[0].uri }
    : (job?.image ? job.image : require('../assets/images/brandlogo.png'));
  const title = job?.company || job?.shopName || 'Job Listing';
  const location = (job?.city && job?.area) ? `${job?.city}, ${job?.area}` : (job?.location || '');
  const salary = job?.salaryText || '';
  const type = job?.type || 'full time';
  const desc = job?.description || 'No description provided.';
  const phone = job?.phone || '';

  const contact = async () => {
    if (!phone) { Alert.alert('No phone number', 'This listing did not include a phone number.'); return; }
    const url = `tel:${phone.replace(/\s+/g, '')}`;
    const supported = await Linking.canOpenURL(url);
    if (supported) Linking.openURL(url);
    else Alert.alert('Cannot dial', 'Device cannot open the phone dialer.');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back to Jobs" onPress={() => router.back()} style={styles.backRow}>
          <Feather name="arrow-left" size={18} color="#111827" />
          <Text style={styles.backText}>Back to Jobs</Text>
        </Pressable>

        <View style={styles.card}>
          <Image source={imageSource} style={styles.hero} resizeMode="cover" />

          <Text style={styles.shopName}>{title}</Text>

          <View style={styles.rowMid}>
            <Ionicons name="location-outline" size={16} color="#6B7280" />
            <Text style={styles.locText}>  {location}</Text>
          </View>

          <View style={styles.rowBetween}>
            <View style={styles.rowMid}>
              <Text style={styles.priceSymbol}>£</Text>
              <Text style={styles.salaryText}> {salary.replace('£', '')}</Text>
            </View>
            <View style={styles.badge}><Text style={styles.badgeText}>{type}</Text></View>
          </View>

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.desc}>{desc}</Text>

          <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Contact Information</Text>
          <View style={styles.rowMid}>
            <Feather name="phone" size={16} color="#111827" />
            <Text style={styles.phoneText}>  {phone || '—'}</Text>
          </View>

          <Pressable accessibilityRole="button" accessibilityLabel="Contact" onPress={contact} style={[styles.contactBtn, !phone && styles.contactBtnDisabled]} disabled={!phone}>
            <Feather name="phone" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.contactText}>Contact</Text>
          </Pressable>
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
  hero: { width: '100%', height: 200, borderRadius: 12, marginBottom: 12 },

  shopName: { fontSize: 18, fontWeight: '700', color: '#111827' },
  rowMid: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  locText: { color: '#6B7280' },

  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  priceSymbol: { color: '#10B981', fontWeight: '800' },
  salaryText: { color: '#10B981', fontWeight: '700' },
  badge: { backgroundColor: '#111827', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  badgeText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12 },

  sectionTitle: { marginTop: 12, fontSize: 16, fontWeight: '700', color: '#111827' },
  desc: { marginTop: 6, color: '#4B5563', lineHeight: 22 },

  phoneText: { color: '#111827' },
  contactBtn: { marginTop: 12, height: 48, borderRadius: 12, backgroundColor: '#0F9D8A', alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  contactBtnDisabled: { backgroundColor: '#0F9D8A99' },
  contactText: { color: '#FFFFFF', fontWeight: '700' },
});
