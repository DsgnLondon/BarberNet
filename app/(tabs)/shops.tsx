import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { shopsStore, type ShopListing as StoreShop } from '../../lib/shops-store';

type Region =
  | 'All Regions'
  | 'London'
  | 'Manchester'
  | 'Edinburgh'
  | 'Birmingham';

 

const REGIONS: Region[] = ['All Regions', 'London', 'Manchester', 'Edinburgh', 'Birmingham'];

function formatPriceGBP(v: number) {
  try {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(v);
  } catch {
    return `£${Math.round(v).toLocaleString('en-GB')}`;
  }
}

export default function ShopsScreen() {
  const router = useRouter();
  const { autoOpen } = useLocalSearchParams<{ autoOpen?: string }>();
  const [regionOpen, setRegionOpen] = useState(false);
  const [region, setRegion] = useState<Region>('All Regions');
  const [shops, setShops] = useState<StoreShop[]>(shopsStore.get());
  const [didOpen, setDidOpen] = useState(false);

  useEffect(() => {
    const unsub = shopsStore.subscribe(() => setShops(shopsStore.get()));
    return unsub;
  }, []);

  useEffect(() => {
    if (!didOpen && autoOpen === '1' && shops.length > 0) {
      setDidOpen(true);
      const first = shops[0];
      router.push((`/modal-shop-detail?id=${first.id}`) as any);
    }
  }, [autoOpen, didOpen, shops, router]);

  const filtered = useMemo(() => {
    if (region === 'All Regions') return shops;
    return shops.filter(s => (s.city || s.location?.split(',')[0]) === region);
  }, [region, shops]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.header}>Shops for Sale</Text>

        <Pressable style={styles.listBtn} onPress={() => router.push('/modal-list-shop')}>
          <Feather name="plus" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.listBtnText}>List Your Shop</Text>
        </Pressable>

        <View style={{ marginBottom: 12 }}>
          <Pressable style={styles.filter} onPress={() => setRegionOpen(v => !v)}>
            <Text style={styles.filterLabel}>{region}</Text>
            <Feather name={regionOpen ? 'chevron-up' : 'chevron-down'} size={18} color="#6B7280" />
          </Pressable>
          {regionOpen ? (
            <View style={styles.dropdown}>
              {REGIONS.map(r => (
                <Pressable key={r} style={styles.dropdownItem} onPress={() => { setRegion(r); setRegionOpen(false); }}>
                  <Text style={styles.dropdownItemText}>{r}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>

        <View style={{ height: 8 }} />

        {filtered.map(item => (
          <Pressable key={item.id} style={styles.card} onPress={() => router.push((`/modal-shop-detail?id=${item.id}`) as any)}> 
            <Image source={item.image || require('../../assets/images/brandlogo.png')} style={styles.cardImg} />
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <View style={styles.rowMid}>
                <Ionicons name="location-outline" size={14} color="#6B7280" />
                <Text style={styles.locText}> {(item.city && item.area) ? `${item.city}, ${item.area}` : item.location}</Text>
              </View>
              <View style={styles.rowBetween}>
                <Text style={styles.price}>{formatPriceGBP(item.priceGBP)}</Text>
                <View style={styles.rowMid}>
                  <Ionicons name="people-outline" size={14} color="#6B7280" />
                  <Text style={styles.chairsText}> {item.chairs ?? 0} chairs</Text>
                </View>
              </View>
              <Text numberOfLines={2} style={styles.desc}>{item.description}</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  scroll: { padding: 16 },
  header: { fontSize: 20, fontWeight: '400', color: '#111827', textAlign: 'center', marginBottom: 14 },
  listBtn: { height: 48, borderRadius: 12, backgroundColor: '#10B981', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', marginBottom: 12 },
  listBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
  filter: { height: 44, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#FFFFFF', paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  filterLabel: { color: '#111827', fontSize: 14 },
  dropdown: { marginTop: 6, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, backgroundColor: '#FFFFFF', overflow: 'hidden' },
  dropdownItem: { paddingHorizontal: 12, paddingVertical: 10 },
  dropdownItemText: { color: '#111827' },
  card: { flexDirection: 'row', borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 10, marginTop: 12 },
  cardImg: { width: 64, height: 64, borderRadius: 12, marginRight: 12 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  rowMid: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  locText: { color: '#6B7280', fontSize: 12 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  price: { color: '#10B981', fontWeight: '800', fontSize: 16 },
  chairsText: { color: '#6B7280', fontSize: 12 },
  desc: { marginTop: 6, color: '#6B7280', fontSize: 12 },
});
