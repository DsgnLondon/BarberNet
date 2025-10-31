import React, { useMemo } from 'react';
import { SafeAreaView, View, Text, StyleSheet, ScrollView, Pressable, Image, Alert, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { shopsStore, type ShopListing } from '../lib/shops-store';

export default function ModalShopDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const shop = useMemo<ShopListing | undefined>(() => shopsStore.get().find(s => s.id === String(id)), [id]);

  const imageSource = shop?.image ? shop.image : require('../assets/images/brandlogo.png');
  const title = shop?.name || 'Shop Listing';
  const location = (shop?.city && shop?.area) ? `${shop?.city}, ${shop?.area}` : (shop?.location || '');
  const price = shop?.priceGBP ?? 0;
  const chairs = shop?.chairs ?? 0;
  const desc = shop?.description || 'No description provided.';
  const phone = shop?.phone || '';

  const contact = async () => {
    if (!phone) { Alert.alert('No phone number', 'This listing did not include a phone number.'); return; }
    const url = `tel:${phone.replace(/\s+/g, '')}`;
    const supported = await Linking.canOpenURL(url);
    if (supported) Linking.openURL(url);
    else Alert.alert('Cannot dial', 'Device cannot open the phone dialer.');
  };

  const formatPriceGBP = (v: number) => {
    try { return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(v); }
    catch { return `£${Math.round(v).toLocaleString('en-GB')}`; }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back to Shops" onPress={() => router.back()} style={styles.backRow}>
          <Feather name="arrow-left" size={18} color="#111827" />
          <Text style={styles.backText}>Back to Shops</Text>
        </Pressable>

        <View style={styles.card}>
          <Image source={imageSource} style={styles.hero} resizeMode="cover" />

          <Text style={styles.shopName}>{title}</Text>

          <View style={styles.rowMid}>
            <Ionicons name="location-outline" size={16} color="#6B7280" />
            <Text style={styles.locText}>  {location}</Text>
          </View>

          <View style={styles.rowBetween}>
            <Text style={styles.price}>{formatPriceGBP(price)}</Text>
            <View style={styles.rowMid}>
              <Ionicons name="people-outline" size={14} color="#6B7280" />
              <Text style={styles.chairsText}>  {chairs} chairs</Text>
            </View>
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
  price: { color: '#10B981', fontWeight: '800', fontSize: 16 },
  chairsText: { color: '#6B7280', fontSize: 12 },

  sectionTitle: { marginTop: 12, fontSize: 16, fontWeight: '700', color: '#111827' },
  desc: { marginTop: 6, color: '#4B5563', lineHeight: 22 },

  phoneText: { color: '#111827' },
  contactBtn: { marginTop: 12, height: 48, borderRadius: 12, backgroundColor: '#0F9D8A', alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  contactBtnDisabled: { backgroundColor: '#0F9D8A99' },
  contactText: { color: '#FFFFFF', fontWeight: '700' },
});
