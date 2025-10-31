import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, type Href } from 'expo-router';
import { barbersStore, type Region as StoreRegion, type BarberProfile } from '../../lib/barbers-store';

type Region = 'All Regions' | StoreRegion;

const REGIONS: Region[] = ['All Regions', 'London', 'Manchester', 'Birmingham', 'Edinburgh'];

export default function BarbersScreen() {
  const router = useRouter();
  const { autoOpen } = useLocalSearchParams<{ autoOpen?: string }>();
  const [region, setRegion] = useState<Region>('All Regions');
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<BarberProfile[]>(barbersStore.get());
  const [didOpen, setDidOpen] = useState(false);

  useEffect(() => {
    const unsub = barbersStore.subscribe(() => setItems(barbersStore.get()));
    return unsub;
  }, []);

  useEffect(() => {
    if (!didOpen && autoOpen === '1' && items.length > 0) {
      setDidOpen(true);
      const first = items[0];
      router.push((`/modal-barber-detail?id=${first.id}`) as any);
    }
  }, [autoOpen, didOpen, items, router]);

  const filtered = useMemo(() => {
    return items.filter(b => region === 'All Regions' || b.city === region);
  }, [region, items]);

  const addHref: Href = '/modal-add-barber';
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Text style={styles.headerTitle}>Barber Profiles</Text>

        {/* Add Yourself */}
        <Pressable style={styles.addBtn} onPress={() => router.push(addHref)}>
          <Feather name="plus" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.addBtnText}>Add Yourself</Text>
        </Pressable>

        {/* Filter */}
        <View style={{ marginBottom: 12 }}>
          <Pressable style={styles.dropdown} onPress={() => setOpen(v => !v)}>
            <Text style={styles.dropdownLabel}>{region}</Text>
            <Feather name={open ? 'chevron-up' : 'chevron-down'} size={18} color="#6B7280" />
          </Pressable>
          {open && (
            <View style={styles.dropdownMenu}>
              {REGIONS.map(r => (
                <Pressable key={r} style={styles.dropdownItem} onPress={() => { setRegion(r); setOpen(false); }}>
                  <Text style={styles.dropdownItemText}>{r}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* Profiles */}
        <View style={{ marginTop: 12 }}>
          {filtered.map(p => (
            <ProfileCard key={p.id} p={p} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ProfileCard({ p }: { p: BarberProfile }) {
  const router = useRouter();
  return (
    <Pressable style={styles.card} onPress={() => router.push((`/modal-barber-detail?id=${p.id}`) as any)}>
      <Image source={p.avatar} style={styles.avatar} />
      <View style={{ flex: 1, marginHorizontal: 12 }}>
        <Text style={styles.name}>{p.name}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
          <Ionicons name="location-outline" size={14} color="#6B7280" />
          <Text style={styles.meta}>  {p.city}, {p.area}</Text>
        </View>
        <Text style={styles.experience}>{p.years} years experience</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
          {p.skills.slice(0, 3).map(s => (
            <View key={s} style={styles.skillChip}><Text style={styles.skillText}>{s}</Text></View>
          ))}
          {p.skills.length > 3 ? (
            <View style={styles.moreChip}><Text style={styles.moreText}>+{p.skills.length - 3}</Text></View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  scroll: { padding: 16 },

  headerTitle: { fontSize: 20, fontWeight: '400', color: '#111827', textAlign: 'center', marginBottom: 14 },

  addBtn: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 12,
  },
  addBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },

  dropdown: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  dropdownLabel: { color: '#111827', fontSize: 14 },
  dropdownMenu: {
    marginTop: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  dropdownItem: { paddingVertical: 10, paddingHorizontal: 12 },
  dropdownItemText: { color: '#111827', fontSize: 14 },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  name: { fontSize: 15, fontWeight: '700', color: '#111827' },
  meta: { fontSize: 12, color: '#6B7280' },
  experience: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  skillChip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: '#F3F4F6', marginRight: 8, marginBottom: 8 },
  skillText: { fontSize: 11, color: '#111827', fontWeight: '600' },
  moreChip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: '#E5E7EB', marginRight: 8, marginBottom: 8 },
  moreText: { fontSize: 11, color: '#6B7280', fontWeight: '600' },
});
