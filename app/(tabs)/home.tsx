import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { jobsStore } from '../../lib/jobs-store';
import { barbersStore } from '../../lib/barbers-store';
import { shopsStore } from '../../lib/shops-store';
import { useRouter } from 'expo-router';
import { userStore } from '../../lib/user-store';

export default function HomeScreen() {
  const router = useRouter();
  const [name, setName] = useState(userStore.get().name);

  useEffect(() => {
    const unsub = userStore.subscribe(() => setName(userStore.get().name));
    return unsub;
  }, []);
  return (
    <SafeAreaView style={styles.safe}> 
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Top Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greetingLabel}>Hi, {name}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Tagline */}
        <Text style={styles.tagline}>Join thousands of barbers building their future together.</Text>

        {/* Feature Cards Grid */}
        <View style={styles.grid}>
          <FeatureCard
            title="Find a Job"
            subtitle="Browse job listings for barbers"
            colors={["#2563EB", "#3B82F6"] as const}
            icon={<Ionicons name="briefcase-outline" size={20} color="#2563EB" />}
            onPress={() => router.push('/(tabs)/jobs')}
          />
          <FeatureCard
            title="Barbers"
            subtitle="Profiles of barbers looking for work"
            colors={["#059669", "#10B981"] as const}
            icon={<Ionicons name="people-outline" size={20} color="#059669" />}
            onPress={() => router.push('/(tabs)/barbers')}
          />
          <FeatureCard
            title="Shops for Sale"
            subtitle="Barber shop listings"
            colors={["#7C3AED", "#8B5CF6"] as const}
            icon={<Feather name="shopping-bag" size={20} color="#7C3AED" />}
            onPress={() => router.push('/(tabs)/shops')}
          />
          <FeatureCard
            title="Equipment"
            subtitle="Coming Soon"
            disabled
            grey
            icon={<Feather name="box" size={20} color="#6B7280" />}
          />
        </View>

        {/* Featured Listings */}
        <Text style={styles.sectionTitle}>Featured Listings</Text>
        <View style={styles.listCol}>
          <ListingCard
            title="FreshCuts, London"
            subtitle="Hiring Now"
            badgeText="Full-time"
            badgeColor="#10B981"
            onPress={() => {
              const items = jobsStore.get();
              if (items.length > 0) router.push({ pathname: '/modal-job-detail', params: { id: items[0].id } });
              else router.push('/(tabs)/jobs');
            }}
          />
          <ListingCard
            title="Barber John"
            subtitle="5 years experience"
            badgeText="Available"
            badgeColor="#10B981"
            onPress={() => {
              const items = barbersStore.get();
              if (items.length > 0) router.push((`/modal-barber-detail?id=${items[0].id}`) as any);
              else router.push('/(tabs)/barbers');
            }}
          />
          <ListingCard
            title="The Classic Cut"
            subtitle="Manchester • £85,000"
            badgeText="For Sale"
            badgeColor="#8B5CF6"
            onPress={() => {
              const items = shopsStore.get();
              if (items.length > 0) router.push((`/modal-shop-detail?id=${items[0].id}`) as any);
              else router.push('/(tabs)/shops');
            }}
          />
        </View>

        {/* Quick Stats */}
        <Text style={styles.sectionTitle}>Quick Stats</Text>
        <View style={styles.statsRow}>
          <StatBox value="247" label="Active Jobs" color="#10B981" />
          <StatBox value="1,832" label="Barbers" color="#10B981" />
          <StatBox value="94" label="Shops for Sale" color="#8B5CF6" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function FeatureCard({ title, subtitle, icon, colors, onPress, disabled, grey }: { title: string; subtitle: string; icon: React.ReactNode; colors?: readonly [string, string]; onPress?: () => void; disabled?: boolean; grey?: boolean }) {
  if (grey) {
    return (
      <View style={[styles.card, styles.cardGrey]}>
        <View style={styles.iconOuter}><View style={styles.iconInner}>{icon}</View></View>
        <Text style={[styles.cardTitle, { color: '#111827' }]}>{title}</Text>
        <Text style={[styles.cardSubtitle, { color: '#6B7280' }]}>{subtitle}</Text>
        <Feather name="arrow-right" size={18} color="#9CA3AF" style={styles.cardArrow} />
      </View>
    );
  }
  return (
    <Pressable onPress={disabled ? undefined : onPress} disabled={disabled} style={styles.card}>
      <LinearGradient colors={colors || (['#111827', '#111827'] as const)} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cardBg}>
        <View style={styles.iconOuter}><View style={styles.iconInner}>{icon}</View></View>
        <View>
          <Text style={[styles.cardTitle, { color: '#FFFFFF' }]}>{title}</Text>
          <Text style={[styles.cardSubtitle, { color: '#E5E7EB' }]}>{subtitle}</Text>
        </View>
        <Feather name="arrow-right" size={18} color="#FFFFFF" style={styles.cardArrow} />
      </LinearGradient>
    </Pressable>
  );
}

function ListingCard({ title, subtitle, badgeText, badgeColor, onPress }: { title: string; subtitle: string; badgeText: string; badgeColor: string; onPress?: () => void }) {
  return (
    <Pressable style={styles.listCard} onPress={onPress}>
      <Image source={require('../../assets/images/brandlogo.png')} style={styles.listImage} />
      <View style={styles.listContent}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Feather name="scissors" size={14} color="#10B981" />
          <Text style={styles.listTitle}>  {title}</Text>
        </View>
        <Text style={styles.listSubtitle}>{subtitle}</Text>
        <View style={[styles.badge, { backgroundColor: `${badgeColor}1A`, borderColor: badgeColor }]}> 
          <Text style={[styles.badgeText, { color: badgeColor }]}>{badgeText}</Text>
        </View>
      </View>
      <Feather name="chevron-right" size={20} color="#9CA3AF" />
    </Pressable>
  );
}

function StatBox({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  scroll: { paddingVertical: 16, paddingHorizontal: 16 },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  greetingLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  bellWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 2,
    backgroundColor: '#F3F4F6',
    marginTop: 12,
    marginBottom: 16,
    borderRadius: 1,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },

  tagline: {
    color: '#4B5563',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 14,
  },
  cardBg: {
    borderRadius: 16,
    padding: 14,
    minHeight: 118,
  },
  cardGrey: {
    backgroundColor: '#E5E7EB',
    borderRadius: 16,
    padding: 14,
    minHeight: 118,
  },
  iconOuter: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  iconInner: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  cardTitle: { marginTop: 12, fontSize: 16, fontWeight: '700', color: '#111827' },
  cardSubtitle: { marginTop: 6, fontSize: 12, color: '#6B7280' },
  cardArrow: { position: 'absolute', right: 12, bottom: 12 },
  badgeSoon: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
  },
  badgeSoonText: { fontSize: 11, color: '#6B7280', fontWeight: '600' },

  sectionTitle: { marginTop: 8, marginBottom: 10, fontSize: 16, fontWeight: '700', color: '#111827' },
  listCol: {},
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  listImage: { width: 44, height: 44, borderRadius: 10 },
  listContent: { flex: 1, marginHorizontal: 12 },
  listTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  listSubtitle: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  badge: {
    marginTop: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  badgeText: { fontSize: 11, fontWeight: '600' },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 20,
  },
  statBox: {
    width: '32%',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    alignItems: 'center',
    paddingVertical: 14,
  },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { marginTop: 4, fontSize: 11, color: '#6B7280' },
});
