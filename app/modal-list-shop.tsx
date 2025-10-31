import React, { useMemo, useState, useEffect } from 'react';
import { SafeAreaView, View, Text, StyleSheet, ScrollView, Pressable, Image, TextInput, Alert, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { shopsStore } from '../lib/../lib/shops-store';
import * as ImagePicker from 'expo-image-picker';
import { userStore } from '../lib/../lib/user-store';

interface ShopListing {
  id: string;
  name: string;
  priceGBP: number;
  location: string; // City, Area free text
  description: string;
  phone: string;
  photos: { uri: string }[];
}

interface FormState {
  name: string;
  price: string; // digits with commas
  location: string;
  description: string;
  phone: string;
  photos: { uri: string }[];
}

function formatGBP(n: number) {
  try { return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(n); } catch { return `£${n.toLocaleString('en-GB')}`; }
}
function formatPriceInput(v: string) {
  const digits = v.replace(/[^\d]/g, '');
  if (!digits) return '';
  return Number(digits).toLocaleString('en-GB');
}

export default function ModalListShop() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [form, setForm] = useState<FormState>({ name: '', price: '', location: '', description: '', phone: '', photos: [] });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [focusField, setFocusField] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const existing = shopsStore.get().find(s => s.id === String(id));
    if (existing) {
      setForm({
        name: existing.name,
        price: existing.priceGBP ? Number(existing.priceGBP).toLocaleString('en-GB') : '',
        location: existing.location || '',
        description: existing.description || '',
        phone: existing.phone || '',
        photos: existing.photos || (existing.image?.uri ? [{ uri: existing.image.uri }] : []),
      });
    }
  }, [id]);

  const isValid = useMemo(() => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Shop name is required';
    if (!form.price || isNaN(Number(form.price.replace(/,/g, '')))) e.price = 'Enter a valid price';
    if (!form.location.trim()) e.location = 'Location is required';
    if (!form.description.trim() || form.description.trim().length < 10) e.description = 'Description is required';
    if (!/^\+?\d[\d\s]{7,}$/.test(form.phone)) e.phone = 'Enter a valid phone number';
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [form]);

  const chooseImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission', 'Please allow photo library access.'); return; }
    const res = await ImagePicker.launchImageLibraryAsync({ allowsMultipleSelection: true, mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.85 });
    if (!res.canceled) {
      const space = Math.max(0, 4 - form.photos.length);
      const assets = res.assets?.slice(0, space) || [];
      setForm(p => ({ ...p, photos: [...p.photos, ...assets.map(a => ({ uri: a.uri }))] }));
    }
  };
  const removePhoto = (idx: number) => setForm(p => ({ ...p, photos: p.photos.filter((_, i) => i !== idx) }));

  const submit = async () => {
    if (!isValid || loading) return;
    setLoading(true);
    try {
      const priceNum = Number(form.price.replace(/,/g, ''));
      const payload: ShopListing = { id: id ? String(id) : String(Date.now()), name: form.name.trim(), priceGBP: priceNum, location: form.location.trim(), description: form.description.trim(), phone: form.phone.trim(), photos: form.photos };
      await new Promise(r => setTimeout(r, 600));
      const [cityPart, areaPart] = payload.location.split(',');
      if (id) {
        shopsStore.update(String(id), {
          name: payload.name,
          priceGBP: payload.priceGBP,
          location: payload.location,
          city: (cityPart || '').trim(),
          area: (areaPart || '').trim(),
          description: payload.description,
          phone: payload.phone,
          photos: payload.photos,
          image: payload.photos?.[0] ? { uri: payload.photos[0].uri } : undefined,
        });
        Alert.alert('Shop Updated', `${payload.name} • ${formatGBP(payload.priceGBP)}`);
      } else {
        const owner = userStore.get();
        shopsStore.add({
          id: payload.id,
          name: payload.name,
          priceGBP: payload.priceGBP,
          location: payload.location,
          city: (cityPart || '').trim(),
          area: (areaPart || '').trim(),
          description: payload.description,
          phone: payload.phone,
          photos: payload.photos,
          image: payload.photos?.[0] ? { uri: payload.photos[0].uri } : undefined,
          ownerId: owner.email,
          ownerEmail: owner.email,
        } as any);
        Alert.alert('Shop Listed', `${payload.name} • ${formatGBP(payload.priceGBP)}`);
      }
      router.back();
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.headerRow}>
            <Pressable onPress={() => router.back()} accessibilityLabel="Go back" style={styles.backBtn}>
              <Feather name="arrow-left" size={18} color="#111827" />
            </Pressable>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{id ? 'Edit Your Shop' : 'List Your Shop'}</Text>
              <Text style={styles.subtitle}>Fill in the details below to list your shop for sale</Text>
            </View>
          </View>

          {/* Shop Name */}
          <Text style={styles.label}>Shop Name <Text style={{ color: '#DC2626' }}>*</Text></Text>
          <TextInput
            placeholder="Enter your shop name"
            placeholderTextColor="#9CA3AF"
            value={form.name}
            onChangeText={v => setForm(p => ({ ...p, name: v }))}
            onFocus={() => setFocusField('name')}
            onBlur={() => setFocusField(null)}
            style={[styles.input, focusField === 'name' && styles.inputFocus, errors.name && styles.inputError]}
          />
          {errors.name ? <Text style={styles.err}>{errors.name}</Text> : null}

          {/* Contact Phone */}
          <Text style={styles.label}>Contact Phone <Text style={{ color: '#DC2626' }}>*</Text></Text>
          <View style={[styles.inputRow, focusField === 'phone' && styles.inputFocus, errors.phone && styles.inputError]}>
            <Feather name="phone" size={16} color="#6B7280" />
            <TextInput
              placeholder="+44 7123 456789"
              placeholderTextColor="#9CA3AF"
              keyboardType={Platform.select({ ios: 'number-pad', android: 'phone-pad', default: 'phone-pad' }) as any}
              style={styles.inputInner}
              value={form.phone}
              onChangeText={v => setForm(p => ({ ...p, phone: v }))}
              onFocus={() => setFocusField('phone')}
              onBlur={() => setFocusField(null)}
            />
          </View>
          {errors.phone ? <Text style={styles.err}>{errors.phone}</Text> : null}

          {/* Price */}
          <Text style={styles.label}>Asking Price <Text style={{ color: '#DC2626' }}>*</Text></Text>
          <View style={[styles.inputRow, focusField === 'price' && styles.inputFocus, errors.price && styles.inputError]}>
            <Text style={{ color: '#6B7280', fontWeight: '700' }}>£</Text>
            <TextInput
              placeholder="85,000"
              placeholderTextColor="#9CA3AF"
              keyboardType={Platform.select({ ios: 'number-pad', android: 'numeric', default: 'numeric' }) as any}
              style={styles.inputInner}
              value={form.price}
              onChangeText={v => setForm(p => ({ ...p, price: formatPriceInput(v) }))}
              onFocus={() => setFocusField('price')}
              onBlur={() => setFocusField(null)}
            />
          </View>
          {errors.price ? <Text style={styles.err}>{errors.price}</Text> : null}

          {/* Location */}
          <Text style={styles.label}>Location <Text style={{ color: '#DC2626' }}>*</Text></Text>
          <View style={[styles.inputRow, focusField === 'location' && styles.inputFocus, errors.location && styles.inputError]}>
            <Ionicons name="location-outline" size={16} color="#6B7280" />
            <TextInput
              placeholder="London, Camden"
              placeholderTextColor="#9CA3AF"
              style={styles.inputInner}
              value={form.location}
              onChangeText={v => setForm(p => ({ ...p, location: v }))}
              onFocus={() => setFocusField('location')}
              onBlur={() => setFocusField(null)}
            />
          </View>
          {errors.location ? <Text style={styles.err}>{errors.location}</Text> : null}

          {/* Description */}
          <Text style={styles.label}>Information about the shop <Text style={{ color: '#DC2626' }}>*</Text></Text>
          <TextInput
            placeholder="Tell potential buyers about your shop - what makes it special, equipment, footfall, etc."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={5}
            value={form.description}
            onChangeText={v => setForm(p => ({ ...p, description: v }))}
            onFocus={() => setFocusField('description')}
            onBlur={() => setFocusField(null)}
            style={[styles.textarea, focusField === 'description' && styles.inputFocus, errors.description && styles.inputError]}
          />
          {errors.description ? <Text style={styles.err}>{errors.description}</Text> : null}

          {/* Images */}
          <Text style={styles.label}>Shop Images</Text>
          <Text style={styles.helper}>Add 1–4 photos of your shop to attract buyers (interior, exterior, equipment, etc.)</Text>
          <View style={styles.uploadBox}>
            <View style={styles.uploadInner}>
              <Feather name="image" size={28} color="#9CA3AF" />
              <Text style={{ color: '#6B7280', marginTop: 8 }}>Add shop photos</Text>
              <Text style={{ color: '#9CA3AF', marginTop: 2, fontSize: 12 }}>Upload 1–4 images to showcase your shop</Text>
              <Pressable style={styles.chooseBtn} onPress={chooseImages} accessibilityLabel="Choose images">
                <Feather name="upload" size={16} color="#FFFFFF" />
                <Text style={styles.chooseBtnText}>{form.photos.length ? 'Add More' : 'Choose Images'}</Text>
              </Pressable>
              <Text style={{ color: '#6B7280', marginTop: 6, fontSize: 12 }}>{form.photos.length}/4</Text>
            </View>
            {form.photos.length ? (
              <View style={styles.grid2}>
                {form.photos.map((ph, i) => (
                  <View key={ph.uri + i} style={styles.gridItem}>
                    <Image source={{ uri: ph.uri }} style={styles.gridImage} />
                    <Pressable style={styles.removeBtn} onPress={() => removePhoto(i)} accessibilityLabel={`Remove image ${i + 1}`}>
                      <Feather name="x" size={14} color="#FFFFFF" />
                    </Pressable>
                  </View>
                ))}
              </View>
            ) : null}
          </View>

          {/* Photo Tips */}
          <View style={styles.tipsBox}>
            <Text style={styles.tipsTitle}>Photo Tips:</Text>
            <View style={{ marginTop: 6 }}>
              <Text style={styles.tip}>• Include interior shots showing chairs and equipment</Text>
              <Text style={styles.tip}>• Add exterior/storefront photos if applicable</Text>
              <Text style={styles.tip}>• Show any special features or recent renovations</Text>
              <Text style={styles.tip}>• Use good lighting for the best impression</Text>
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        <View style={styles.footer}>
          <Pressable onPress={submit} disabled={!isValid || loading} style={[styles.ctaBtn, (!isValid || loading) && styles.ctaBtnDisabled]} accessibilityLabel="List My Shop">
            <Text style={styles.ctaText}>List My Shop</Text>
          </Pressable>
          <Text style={styles.footerHelp}>Your listing will be visible to potential buyers immediately</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  scroll: { padding: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  title: { fontSize: 20, fontWeight: '700', color: '#111827' },
  subtitle: { color: '#6B7280', marginTop: 2 },

  label: { marginTop: 10, marginBottom: 6, color: '#111827', fontWeight: '600' },
  input: { height: 48, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 12, backgroundColor: '#FFFFFF', color: '#111827', marginBottom: 8 },
  inputRow: { height: 48, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#FFFFFF', paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  inputInner: { flex: 1, marginLeft: 8, color: '#111827' },
  textarea: { minHeight: 120, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#FFFFFF', paddingHorizontal: 12, paddingVertical: 10, color: '#111827', marginBottom: 8 },
  inputError: { borderColor: '#FCA5A5' },
  inputFocus: { borderColor: '#10B981' },
  err: { color: '#B91C1C', fontSize: 12, marginBottom: 6 },
  helper: { color: '#6B7280', fontSize: 12, marginBottom: 6 },

  uploadBox: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 12, backgroundColor: '#FFFFFF', marginBottom: 8 },
  uploadInner: { alignItems: 'center', justifyContent: 'center', paddingVertical: 16 },
  chooseBtn: { marginTop: 10, height: 40, borderRadius: 10, backgroundColor: '#10B981', paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  chooseBtnText: { color: '#FFFFFF', fontWeight: '700', marginLeft: 6 },
  grid2: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 },
  gridItem: { width: '48%', marginRight: '4%', marginBottom: 10, position: 'relative' },
  gridImage: { width: '100%', aspectRatio: 1, borderRadius: 12 },
  removeBtn: { position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: 11, backgroundColor: '#111827AA', alignItems: 'center', justifyContent: 'center' },

  tipsBox: { borderRadius: 12, borderWidth: 1, borderColor: '#93C5FD', backgroundColor: '#EFF6FF', padding: 12, marginTop: 8 },
  tipsTitle: { color: '#1D4ED8', fontWeight: '700' },
  tip: { color: '#1D4ED8', fontSize: 12, marginTop: 4 },

  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 12, paddingBottom: 20, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  ctaBtn: { height: 48, borderRadius: 12, backgroundColor: '#10B981', alignItems: 'center', justifyContent: 'center' },
  ctaBtnDisabled: { backgroundColor: '#10B98199' },
  ctaText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
  footerHelp: { textAlign: 'center', color: '#6B7280', fontSize: 12, marginTop: 6 },
});
