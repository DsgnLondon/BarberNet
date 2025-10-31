import React, { useMemo, useState, useEffect } from 'react';
import { SafeAreaView, View, Text, StyleSheet, ScrollView, Pressable, Image, TextInput, Platform, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { barbersStore, type Region } from '../lib/barbers-store';
import { userStore } from '../lib/user-store';

const CITIES = ['London', 'Manchester', 'Birmingham', 'Edinburgh'] as const;
const SKILLS = ['Classic Cuts', 'Beard Styling', 'Fade Cuts', 'Creative Cuts', 'Color Work', 'Undercuts', 'Straight Razor', 'Mustache Grooming', 'Hot Towel Shave', 'Clipper Work', 'Head Shaving', 'Texture Cutting'] as const;
const SPECIALTIES = ['Traditional Barbering', 'Modern Styles', 'Wedding/Events', 'Corporate Cuts', 'Afro-Caribbean Hair', 'Curly Hair', 'Men\'s Grooming', 'Vintage Styles', 'Creative Cuts', 'Children\'s Cuts', 'Senior Clients', 'Hair Treatments'] as const;
const EXPERIENCE_LEVELS = ['0-1 years', '2-3 years', '4-6 years', '7-10 years', '10+ years'] as const;

type City = typeof CITIES[number];

export interface BarberForm {
  name: string;
  city: City | '';
  area: string;
  years: string; // store label, convert to number on submit
  skills: string[];
  bio: string;
  contactBy: { email: boolean; phone: boolean };
  email?: string;
  phone?: string;
  available: boolean;
  photo?: any;
}

export default function ModalAddBarber() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [openCity, setOpenCity] = useState(false);
  const [openYears, setOpenYears] = useState(false);
  const [form, setForm] = useState<BarberForm>({
    name: '',
    city: '',
    area: '',
    years: '',
    skills: [],
    bio: '',
    contactBy: { email: false, phone: true },
    email: '',
    phone: '',
    available: true,
    photo: undefined,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [specs, setSpecs] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState('');
  const [customSpec, setCustomSpec] = useState('');

  const valid = useMemo(() => {
    const e: Record<string, string> = {};
    if (!form.name || form.name.trim().length < 2) e.name = 'Name is required';
    // bio is optional
    if (form.email && !/.+@.+\..+/.test(form.email)) e.email = 'Valid email required';
    if (!form.phone || !/^\+?\d{7,15}$/.test(form.phone)) e.phone = 'Valid phone required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [form]);

  const toggleSkill = (s: string) => {
    setForm(prev => ({ ...prev, skills: prev.skills.includes(s) ? prev.skills.filter(x => x !== s) : [...prev.skills, s] }));
  };

  const toggleSpec = (s: string) => {
    setSpecs(prev => (prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]));
  };

  const addCustomSkill = () => {
    const v = customSkill.trim();
    if (!v) return;
    if (!form.skills.includes(v)) setForm(p => ({ ...p, skills: [...p.skills, v] }));
    setCustomSkill('');
  };

  const addCustomSpec = () => {
    const v = customSpec.trim();
    if (!v) return;
    if (!specs.includes(v)) setSpecs(p => [...p, v]);
    setCustomSpec('');
  };

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow photo library access to upload a profile photo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setForm(p => ({ ...p, photo: { uri: result.assets[0].uri } }));
    }
  };

  useEffect(() => {
    if (!id) return;
    const existing = barbersStore.get().find(b => b.id === String(id));
    if (existing) {
      setForm({
        name: existing.name,
        city: existing.city as any,
        area: existing.area,
        years: existing.years ? `${existing.years} years` : '',
        skills: existing.skills || [],
        bio: existing.bio || '',
        contactBy: { email: !!existing.contact?.email, phone: !!existing.contact?.phone || true },
        email: existing.contact?.email || '',
        phone: existing.contact?.phone || '',
        available: existing.available,
        photo: existing.avatar,
      });
    }
  }, [id]);

  const submit = () => {
    if (!valid) return;
    const yearsNum = Number((form.years.match(/\d+/)?.[0] || '0'));
    const combinedSkills = Array.from(new Set([...(form.skills || []), ...specs]));
    if (id) {
      barbersStore.update(String(id), {
        name: form.name,
        city: form.city as Region,
        area: '',
        years: yearsNum || 0,
        skills: combinedSkills,
        bio: form.bio,
        contact: { email: form.email, phone: form.phone, viaEmail: !!form.email, viaPhone: true },
        available: form.available,
        avatar: form.photo,
      });
      Alert.alert('Success', 'Barber profile updated');
    } else {
      const created = barbersStore.add({
        name: form.name,
        city: form.city as Region,
        area: '',
        years: yearsNum || 0,
        skills: combinedSkills,
        bio: form.bio,
        contactBy: { email: !!form.email, phone: true },
        email: form.email,
        phone: form.phone,
        available: form.available,
        photo: form.photo,
      });
      const owner = userStore.get();
      barbersStore.update(created.id, { ownerId: owner.email, ownerEmail: owner.email });
      Alert.alert('Success', 'Barber profile created');
    }
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={18} color="#111827" />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>{id ? 'Edit Barber Profile' : 'Create Barber Profile'}</Text>
            <Text style={styles.headerSub}>Share your skills and connect with employers</Text>
          </View>
        </View>

        <Pressable style={styles.photo} onPress={pickPhoto} accessibilityRole="button" accessibilityLabel="Add Photo">
          {form.photo ? (
            <Image source={form.photo} style={styles.photoImg} />
          ) : (
            <View style={styles.photoInner}><Feather name="camera" size={18} color="#6B7280" /><Text style={styles.photoText}>Add Photo</Text></View>
          )}
        </Pressable>

        <TextInput
          placeholder="Full Name"
          placeholderTextColor="#9CA3AF"
          value={form.name}
          onChangeText={v => setForm(p => ({ ...p, name: v }))}
          style={[styles.input, errors.name && styles.inputError]}
        />
        {errors.name ? <Text style={styles.err}>{errors.name}</Text> : null}

        <Pressable style={[styles.dropdown]} onPress={() => setOpenCity(v => !v)}>
          <Text style={styles.dropdownLabel}>{form.city || 'Select City'}</Text>
          <Feather name={openCity ? 'chevron-up' : 'chevron-down'} size={18} color="#6B7280" />
        </Pressable>
        {openCity && (
          <View style={styles.dropdownMenu}>
            {CITIES.map(c => (
              <Pressable key={c} style={styles.dropdownItem} onPress={() => { setForm(p => ({ ...p, city: c })); setOpenCity(false); }}>
                <Text style={styles.dropdownItemText}>{c}</Text>
              </Pressable>
            ))}
          </View>
        )}
        {errors.city ? <Text style={styles.err}>{errors.city}</Text> : null}

        {/* Bio and Contact before experience/skills per request */}

        <TextInput
          placeholder="Short bio"
          placeholderTextColor="#9CA3AF"
          multiline
          numberOfLines={4}
          value={form.bio}
          onChangeText={v => setForm(p => ({ ...p, bio: v }))}
          style={[styles.textarea, errors.bio && styles.inputError]}
        />
        {errors.bio ? <Text style={styles.err}>{errors.bio}</Text> : null}

        <TextInput
          placeholder="Phone (+44...)"
          placeholderTextColor="#9CA3AF"
          keyboardType="phone-pad"
          value={form.phone}
          onChangeText={v => setForm(p => ({ ...p, phone: v }))}
          style={[styles.input, errors.phone && styles.inputError]}
        />
        {errors.phone ? <Text style={styles.err}>{errors.phone}</Text> : null}

        <TextInput
          placeholder="Email (optional)"
          placeholderTextColor="#9CA3AF"
          autoCapitalize="none"
          keyboardType="email-address"
          value={form.email}
          onChangeText={v => setForm(p => ({ ...p, email: v }))}
          style={[styles.input, errors.email && styles.inputError]}
        />
        {errors.email ? <Text style={styles.err}>{errors.email}</Text> : null}

        

        {/* Experience moved below contact and above skills; optional */}
        <View>
          <Pressable style={[styles.dropdown]} onPress={() => setOpenYears(v => !v)}>
            <Text style={styles.dropdownLabel}>{form.years || 'Select experience level (optional)'} </Text>
            <Feather name={openYears ? 'chevron-up' : 'chevron-down'} size={18} color="#6B7280" />
          </Pressable>
          {openYears && (
            <View style={styles.dropdownMenu}>
              {EXPERIENCE_LEVELS.map(l => (
                <Pressable key={l} style={styles.dropdownItem} onPress={() => { setForm(p => ({ ...p, years: l })); setOpenYears(false); }}>
                  <Text style={styles.dropdownItemText}>{l}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Skills</Text>
        <Text style={styles.sectionHelp}>Select or add your barbering skills</Text>
        <View style={styles.pillsGrid}>
          {SKILLS.map(s => (
            <Pressable key={s} onPress={() => toggleSkill(s)} accessibilityRole="button" accessibilityLabel={`Skill ${s}`} style={[styles.pill, form.skills.includes(s) ? styles.pillOn : null]}>
              <Text style={[styles.pillText, form.skills.includes(s) ? styles.pillTextOn : null]}>{form.skills.includes(s) ? '− ' : '+ '}{s}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.addRow}>
          <TextInput placeholder="Add custom skill..." placeholderTextColor="#9CA3AF" value={customSkill} onChangeText={setCustomSkill} style={styles.input} />
          <Pressable style={styles.addBtn} onPress={addCustomSkill}><Text style={styles.addBtnText}>Add</Text></Pressable>
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Specialties</Text>
        <Text style={styles.sectionHelp}>What areas do you specialize in?</Text>
        <View style={styles.pillsGrid}>
          {SPECIALTIES.map(s => (
            <Pressable key={s} onPress={() => toggleSpec(s)} accessibilityRole="button" accessibilityLabel={`Specialty ${s}`} style={[styles.pill, specs.includes(s) ? styles.pillOn : null]}>
              <Text style={[styles.pillText, specs.includes(s) ? styles.pillTextOn : null]}>{specs.includes(s) ? '− ' : '+ '}{s}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.addRow}>
          <TextInput placeholder="Add custom specialty..." placeholderTextColor="#9CA3AF" value={customSpec} onChangeText={setCustomSpec} style={styles.input} />
          <Pressable style={styles.addBtn} onPress={addCustomSpec}><Text style={styles.addBtnText}>Add</Text></Pressable>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
      <View style={styles.footer}>
        <Pressable style={styles.footerBtn} onPress={submit} accessibilityLabel="Create Profile">
          <Text style={styles.footerBtnText}>Create Profile</Text>
        </Pressable>
        <Text style={styles.footerHelp}>Your profile will be visible to potential employers immediately</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  scroll: { padding: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  headerSub: { color: '#6B7280', marginTop: 2 },

  photo: { width: 88, height: 88, borderRadius: 44, backgroundColor: '#F3F4F6', alignSelf: 'center', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  photoInner: { alignItems: 'center' },
  photoText: { marginTop: 4, color: '#6B7280', fontSize: 12 },
  photoImg: { width: 88, height: 88, borderRadius: 44 },

  input: { height: 48, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 12, backgroundColor: '#FFFFFF', color: '#111827', marginBottom: 12 },
  textarea: { minHeight: 96, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#FFFFFF', color: '#111827', marginBottom: 12 },
  inputError: { borderColor: '#FCA5A5' },
  err: { color: '#B91C1C', fontSize: 12, marginBottom: 6 },

  dropdown: { height: 44, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#FFFFFF', paddingHorizontal: 12, alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row', marginBottom: 12 },
  dropdownLabel: { color: '#111827', fontSize: 14 },
  dropdownMenu: { marginTop: 6, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#FFFFFF', overflow: 'hidden', marginBottom: 8 },
  dropdownItem: { paddingVertical: 10, paddingHorizontal: 12 },
  dropdownItemText: { color: '#111827', fontSize: 14 },

  rowGap: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },

  toggle: { paddingHorizontal: 12, height: 40, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', flex: 1 },
  toggleOn: { backgroundColor: '#10B9811A', borderColor: '#10B981' },
  toggleText: { color: '#111827', fontWeight: '600' },
  toggleTextOn: { color: '#10B981' },

  sectionTitle: { fontWeight: '700', color: '#111827' },
  sectionHelp: { color: '#6B7280', fontSize: 12, marginBottom: 8 },
  pillsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  pill: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#FFFFFF' },
  pillOn: { backgroundColor: '#10B981', borderColor: '#10B981' },
  pillText: { fontSize: 12, color: '#374151', fontWeight: '600' },
  pillTextOn: { color: '#FFFFFF' },
  addRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, marginBottom: 12 },
  addBtn: { marginLeft: 8, height: 44, borderRadius: 12, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3F4F6' },
  addBtnText: { color: '#111827', fontWeight: '700' },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 12, paddingBottom: 20, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  footerBtn: { height: 48, borderRadius: 12, backgroundColor: '#10B981', alignItems: 'center', justifyContent: 'center' },
  footerBtnText: { color: '#FFFFFF', fontWeight: '700' },
  footerHelp: { textAlign: 'center', color: '#6B7280', fontSize: 12, marginTop: 6 },
});
