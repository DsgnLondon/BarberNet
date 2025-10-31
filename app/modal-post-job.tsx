import React, { useMemo, useState, useEffect } from 'react';
import { SafeAreaView, View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert, Image, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { jobsStore } from '../lib/../lib/jobs-store';
import { Feather, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { userStore } from '../lib/../lib/user-store';

type JobType = 'full time' | 'part time' | 'rent a chair' | 'temporary' | 'contract';

export interface JobListing {
  id: string;
  shopName: string;
  location: string; // City, Area
  type: JobType;
  salaryText: string;
  description: string;
  phone: string;
  images: { uri: string }[];
}

interface FormState {
  shopName: string;
  location: string;
  type?: JobType;
  salaryText: string;
  description: string;
  phone: string;
  images: { uri: string }[];
}

const JOB_TYPES: JobType[] = ['full time', 'part time', 'rent a chair', 'temporary', 'contract'];

export default function ModalPostJob() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [form, setForm] = useState<FormState>({ shopName: '', location: '', type: undefined, salaryText: '', description: '', phone: '', images: [] });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [openType, setOpenType] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusField, setFocusField] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const existing = jobsStore.get().find(j => j.id === String(id));
    if (existing) {
      setForm({
        shopName: existing.company || existing.shopName || '',
        location: existing.location || '',
        type: existing.type as JobType,
        salaryText: existing.salaryText || '',
        description: existing.description || '',
        phone: existing.phone || '',
        images: existing.images || (existing.image ? [{ uri: existing.image?.uri }] : []),
      });
    }
  }, [id]);

  const isValid = useMemo(() => {
    const e: Record<string, string> = {};
    if (!form.shopName.trim() || form.shopName.trim().length < 3) e.shopName = 'Shop name is required (min 3 chars).';
    if (!form.location.trim()) e.location = 'Location is required.';
    // Job type optional
    if (!form.salaryText.trim()) e.salaryText = 'Salary/Pay is required.';
    // Description optional
    if (!/^\+?\d[\d\s]{7,}$/.test(form.phone)) e.phone = 'Enter a valid phone number.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [form.shopName, form.location, form.salaryText, form.phone]);

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission', 'Please allow photo library access.'); return; }
    const res = await ImagePicker.launchImageLibraryAsync({ allowsMultipleSelection: true, mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (!res.canceled) {
      const assets = res.assets?.slice(0, 3 - form.images.length) || [];
      setForm(p => ({ ...p, images: [...p.images, ...assets.map(a => ({ uri: a.uri }))].slice(0, 3) }));
    }
  };

  const removeImage = (idx: number) => setForm(p => ({ ...p, images: p.images.filter((_, i) => i !== idx) }));

  const submit = async () => {
    if (!isValid || loading) return;
    setLoading(true);
    try {
      const payload: JobListing = {
        id: id ? String(id) : String(Date.now()),
        shopName: form.shopName.trim(),
        location: form.location.trim(),
        type: form.type || 'full time',
        salaryText: form.salaryText.trim(),
        description: form.description.trim(),
        phone: form.phone.trim(),
        images: form.images,
      };
      // Mock async post
      await new Promise(r => setTimeout(r, 800));
      const [cityPart, areaPart] = payload.location.split(',');
      if (id) {
        jobsStore.update(String(id), {
          company: payload.shopName,
          title: 'Barber',
          city: (cityPart || '').trim(),
          area: (areaPart || '').trim(),
          salaryText: payload.salaryText,
          type: payload.type,
          location: payload.location,
          image: payload.images?.[0] ? { uri: payload.images[0].uri } : undefined,
          description: payload.description,
          phone: payload.phone,
          images: payload.images,
        });
      } else {
        const owner = userStore.get();
        jobsStore.add({
          id: payload.id,
          company: payload.shopName,
          title: 'Barber',
          city: (cityPart || '').trim(),
          area: (areaPart || '').trim(),
          salaryText: payload.salaryText,
          type: payload.type,
          location: payload.location,
          image: payload.images?.[0] ? { uri: payload.images[0].uri } : undefined,
          description: payload.description,
          phone: payload.phone,
          images: payload.images,
          ownerId: owner.email,
          ownerEmail: owner.email,
        } as any);
      }
      Alert.alert('Posted', `${payload.shopName} • ${payload.type}`);
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to post job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.headerRow}>
            <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={() => router.back()} style={styles.backBtn}>
              <Feather name="arrow-left" size={18} color="#111827" />
            </Pressable>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{id ? 'Edit Job' : 'Post a Job'}</Text>
              <Text style={styles.subtitle}>Fill in the details below to post your job listing</Text>
            </View>
          </View>

          {/* Shop Name */}
          <Text style={styles.label}>Shop Name <Text style={{ color: '#DC2626' }}>*</Text></Text>
          <View style={[styles.inputRow, focusField === 'shopName' && styles.inputFocus, errors.shopName && styles.inputError]}>
            <Feather name="briefcase" size={16} color="#6B7280" />
            <TextInput
              accessibilityLabel="Shop Name"
              placeholder="The Gentleman's Cut, Modern Barber"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
              value={form.shopName}
              onFocus={() => setFocusField('shopName')}
              onBlur={() => setFocusField(null)}
              onChangeText={v => setForm(p => ({ ...p, shopName: v }))}
            />
          </View>
          {errors.shopName ? <Text style={styles.err}>{errors.shopName}</Text> : null}

          {/* Phone */}
          <Text style={styles.label}>Contact Phone <Text style={{ color: '#DC2626' }}>*</Text></Text>
          <View style={[styles.inputRow, focusField === 'phone' && styles.inputFocus, errors.phone && styles.inputError]}>
            <Feather name="phone" size={16} color="#6B7280" />
            <TextInput
              accessibilityLabel="Contact phone"
              placeholder="+44 7123 456789"
              placeholderTextColor="#9CA3AF"
              keyboardType={Platform.select({ ios: 'number-pad', android: 'phone-pad', default: 'phone-pad' }) as any}
              style={styles.input}
              value={form.phone}
              onFocus={() => setFocusField('phone')}
              onBlur={() => setFocusField(null)}
              onChangeText={v => setForm(p => ({ ...p, phone: v }))}
            />
          </View>
          {errors.phone ? <Text style={styles.err}>{errors.phone}</Text> : null}

          {/* Location */}
          <Text style={styles.label}>Location <Text style={{ color: '#DC2626' }}>*</Text></Text>
          <View style={[styles.inputRow, focusField === 'location' && styles.inputFocus, errors.location && styles.inputError]}>
            <Ionicons name="location-outline" size={16} color="#6B7280" />
            <TextInput
              accessibilityLabel="Location"
              placeholder="London, Camden"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
              value={form.location}
              onFocus={() => setFocusField('location')}
              onBlur={() => setFocusField(null)}
              onChangeText={v => setForm(p => ({ ...p, location: v }))}
            />
          </View>
          {errors.location ? <Text style={styles.err}>{errors.location}</Text> : null}

          {/* Job Type */}
          <Text style={styles.label}>Job Type <Text style={{ color: '#DC2626' }}>*</Text></Text>
          <View>
            <Pressable accessibilityRole="button" accessibilityLabel="Select job type" style={[styles.select, errors.type && styles.inputError]} onPress={() => setOpenType(v => !v)}>
              <Text style={styles.selectLabel}>{form.type || 'Select job type'}</Text>
              <Feather name={openType ? 'chevron-up' : 'chevron-down'} size={18} color="#6B7280" />
            </Pressable>
            {openType && (
              <View style={styles.dropdownMenu}>
                {JOB_TYPES.map(t => (
                  <Pressable key={t} style={styles.dropdownItem} onPress={() => { setForm(p => ({ ...p, type: t })); setOpenType(false); }}>
                    <Text style={styles.dropdownText}>{t}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
          {errors.type ? <Text style={styles.err}>{errors.type}</Text> : null}

          {/* Salary */}
          <Text style={styles.label}>Salary/Pay <Text style={{ color: '#DC2626' }}>*</Text></Text>
          <View style={[styles.inputRow, focusField === 'salary' && styles.inputFocus, errors.salaryText && styles.inputError]}>
            <Text style={{ color: '#6B7280', fontWeight: '700' }}>£</Text>
            <TextInput
              accessibilityLabel="Salary or pay"
              placeholder="25,000/year or 15/hour"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
              value={form.salaryText}
              onFocus={() => setFocusField('salary')}
              onBlur={() => setFocusField(null)}
              onChangeText={v => setForm(p => ({ ...p, salaryText: v }))}
            />
          </View>
          {errors.salaryText ? <Text style={styles.err}>{errors.salaryText}</Text> : null}

          {/* Description */}
          <Text style={styles.label}>Job Description <Text style={{ color: '#DC2626' }}>*</Text></Text>
          <TextInput
            accessibilityLabel="Job Description"
            placeholder="Describe the position, requirements, experience, hours, etc."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={5}
            style={[styles.textarea, focusField === 'desc' && styles.inputFocus, errors.description && styles.inputError]}
            value={form.description}
            onFocus={() => setFocusField('desc')}
            onBlur={() => setFocusField(null)}
            onChangeText={v => setForm(p => ({ ...p, description: v.slice(0, 800) }))}
          />
          {errors.description ? <Text style={styles.err}>{errors.description}</Text> : null}

          {/* Images */}
          <Text style={styles.label}>Shop Images (Optional)</Text>
          <Text style={styles.helper}>Add up to 3 photos of your shop to attract more applicants</Text>
          <View style={styles.imageBox}>
            <Pressable style={styles.imageAdd} onPress={pickImages} accessibilityRole="button" accessibilityLabel="Add photos">
              <Feather name="camera" size={20} color="#6B7280" />
              <Text style={{ color: '#6B7280', marginTop: 6 }}>Click to add photos ({form.images.length}/3)</Text>
              <Text style={{ color: '#9CA3AF', marginTop: 2, fontSize: 12 }}>JPG, PNG up to 5MB each</Text>
            </Pressable>
            <View style={{ flexDirection: 'row', marginTop: 12 }}>
              {form.images.map((img, i) => (
                <View key={img.uri + i} style={{ marginRight: 10 }}>
                  <Image source={{ uri: img.uri }} style={styles.thumb} />
                  <Pressable style={styles.remove} onPress={() => removeImage(i)} accessibilityLabel={`Remove photo ${i + 1}`}>
                    <Feather name="x" size={14} color="#FFFFFF" />
                  </Pressable>
                </View>
              ))}
            </View>
          </View>
          <View style={{ height: 96 }} />
        </ScrollView>

        {/* Sticky Footer CTA */}
        <View style={styles.footer}>
          <Pressable accessibilityRole="button" accessibilityLabel="Post Job" onPress={submit} disabled={!isValid || loading} style={[styles.postBtn, (!isValid || loading) && styles.postBtnDisabled]}>
            {loading ? <Feather name="loader" size={18} color="#FFFFFF" /> : <Text style={styles.postBtnText}>Post Job</Text>}
          </Pressable>
          <Text style={styles.footerHelp}>Your job listing will be visible to barbers immediately</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  scroll: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 16 },

  headerRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  title: { fontSize: 20, fontWeight: '700', color: '#111827' },
  subtitle: { marginTop: 2, color: '#6B7280' },

  label: { marginTop: 10, marginBottom: 6, color: '#111827', fontWeight: '600' },
  inputRow: { height: 48, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#FFFFFF', paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center' },
  input: { flex: 1, marginLeft: 8, color: '#111827' },
  textarea: { minHeight: 120, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#FFFFFF', paddingHorizontal: 12, paddingVertical: 10, color: '#111827' },
  inputError: { borderColor: '#FCA5A5' },
  inputFocus: { borderColor: '#10B981' },
  err: { color: '#B91C1C', fontSize: 12, marginTop: 4 },
  helper: { color: '#6B7280', fontSize: 12, marginBottom: 6 },

  select: { height: 48, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#FFFFFF', paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectLabel: { color: '#111827' },
  dropdownMenu: { marginTop: 6, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#FFFFFF', overflow: 'hidden' },
  dropdownItem: { paddingVertical: 10, paddingHorizontal: 12 },
  dropdownText: { color: '#111827' },

  imageBox: { borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', padding: 12, backgroundColor: '#FFFFFF' },
  imageAdd: { height: 120, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#F9FAFB', alignItems: 'center', justifyContent: 'center' },
  thumb: { width: 72, height: 72, borderRadius: 12 },
  remove: { position: 'absolute', top: -6, right: -6, width: 22, height: 22, borderRadius: 11, backgroundColor: '#111827AA', alignItems: 'center', justifyContent: 'center' },

  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 12, paddingBottom: 20, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  postBtn: { height: 48, borderRadius: 12, backgroundColor: '#10B981', alignItems: 'center', justifyContent: 'center' },
  postBtnDisabled: { backgroundColor: '#10B98199' },
  postBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  footerHelp: { textAlign: 'center', color: '#6B7280', fontSize: 12, marginTop: 6 },
});
