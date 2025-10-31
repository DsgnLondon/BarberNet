import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { jobsStore, type JobListing as StoreJob } from '../../lib/jobs-store';

type JobType = 'full time' | 'part time' | 'rent a chair' | 'temporary' | 'contract';

export interface JobListing {
  id: string;
  company: string;
  title: string;
  city: string;
  area: string;
  salaryText: string; // formatted salary text
  type: JobType;
  image: any; // require() image
}

const ALL_REGIONS = ['All Regions', 'London', 'Manchester', 'Birmingham', 'Edinburgh'] as const;
const ALL_TYPES: readonly ['All Types', ...JobType[]] = [
  'All Types',
  'full time',
  'part time',
  'rent a chair',
  'temporary',
  'contract',
];

// initial data comes from store

export default function JobsScreen() {
  const router = useRouter();
  const { autoOpen } = useLocalSearchParams<{ autoOpen?: string }>();
  const [items, setItems] = useState<StoreJob[]>(jobsStore.get());
  const [region, setRegion] = useState<(typeof ALL_REGIONS)[number]>('All Regions');
  const [type, setType] = useState<(typeof ALL_TYPES)[number]>('All Types');
  const [showRegion, setShowRegion] = useState(false);
  const [showType, setShowType] = useState(false);
  const [didOpen, setDidOpen] = useState(false);

  useEffect(() => {
    const unsub = jobsStore.subscribe(() => setItems(jobsStore.get()));
    return unsub;
  }, []);

  useEffect(() => {
    if (!didOpen && autoOpen === '1' && items.length > 0) {
      setDidOpen(true);
      router.push({ pathname: '/modal-job-detail', params: { id: items[0].id } });
    }
  }, [autoOpen, didOpen, items, router]);

  const filtered = useMemo(() => {
    return items.filter(j => {
      const city = (j.city || j.location.split(',')[0] || '').trim();
      return (region === 'All Regions' || city === region) && (type === 'All Types' || j.type === type);
    });
  }, [items, region, type]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Page Header */}
        <Text style={styles.headerTitle}>Job Listings</Text>

        {/* Post Job CTA */}
        <Pressable style={styles.postBtn} onPress={() => router.push('/modal-post-job')}>
          <Feather name="plus" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.postBtnText}>Post Job</Text>
        </Pressable>

        {/* Filters */}
        <View style={styles.filtersRow}>
          <Dropdown
            label={region}
            options={ALL_REGIONS as readonly string[]}
            open={showRegion}
            onToggle={() => setShowRegion(v => !v)}
            onSelect={val => {
              setRegion(val as (typeof ALL_REGIONS)[number]);
              setShowRegion(false);
            }}
          />
          <View style={{ width: 12 }} />
          <Dropdown
            label={type}
            options={ALL_TYPES as readonly string[]}
            open={showType}
            onToggle={() => setShowType(v => !v)}
            onSelect={val => {
              setType(val as (typeof ALL_TYPES)[number]);
              setShowType(false);
            }}
          />
        </View>

        {/* Job Cards */}
        <View style={{ marginTop: 8 }}>
          {filtered.map(job => (
            <JobCard key={job.id} job={job} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Dropdown({ label, options, open, onToggle, onSelect }: { label: string; options: readonly string[]; open: boolean; onToggle: () => void; onSelect: (v: string) => void }) {
  return (
    <View style={{ flex: 1 }}>
      <Pressable onPress={onToggle} style={styles.dropdown}>
        <Text style={styles.dropdownLabel}>{label}</Text>
        <Feather name={open ? 'chevron-up' : 'chevron-down'} size={18} color="#6B7280" />
      </Pressable>
      {open && (
        <View style={styles.dropdownMenu}>
          {options.map(v => (
            <Pressable key={v} onPress={() => onSelect(v)} style={styles.dropdownItem}>
              <Text style={styles.dropdownItemText}>{v}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

function JobCard({ job }: { job: StoreJob }) {
  const router = useRouter();
  return (
    <Pressable style={styles.card} onPress={() => router.push({ pathname: '/modal-job-detail', params: { id: job.id } })}>
      <Image
        source={job.images?.[0]?.uri ? { uri: job.images[0].uri } : (job.image || require('../../assets/images/brandlogo.png'))}
        style={styles.cardImage}
      />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{job.company || job.shopName || 'Job Listing'}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
          <Ionicons name="location-outline" size={14} color="#6B7280" />
          <Text style={styles.cardMeta}>  {(job.city && job.area) ? `${job.city}, ${job.area}` : job.location}</Text>
        </View>
        <View style={styles.badgesRow}>
          <View style={[styles.badge, { borderColor: '#10B981', backgroundColor: '#10B9811A' }]}> 
            <Text style={[styles.badgeText, { color: '#10B981' }]}>£ {job.salaryText.replace('£', '')}</Text>
          </View>
          <View style={[styles.badge, { borderColor: '#6B7280', backgroundColor: '#F3F4F6' }]}> 
            <Text style={[styles.badgeText, { color: '#374151' }]}>{job.type}</Text>
          </View>
        </View>
      </View>
      <Feather name="chevron-right" size={20} color="#9CA3AF" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  scroll: { padding: 16 },

  headerTitle: { fontSize: 20, fontWeight: '400', color: '#111827', textAlign: 'center', marginBottom: 14 },

  postBtn: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 12,
  },
  postBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },

  filtersRow: { flexDirection: 'row', marginBottom: 12 },
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
  cardImage: { width: 48, height: 48, borderRadius: 12 },
  cardContent: { flex: 1, marginHorizontal: 12 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  cardMeta: { fontSize: 12, color: '#6B7280' },
  badgesRow: { flexDirection: 'row', marginTop: 8 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
  },
  badgeText: { fontSize: 11, fontWeight: '600' },
});
