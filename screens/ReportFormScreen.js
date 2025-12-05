import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS, SIZES, FONTS } from '../constants/theme';
import { Button, Input, Card, Loading } from '../components';
import { reportService } from '../services';

export default function ReportFormScreen({ navigation, route }) {
  const { school } = route.params;

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form data
  const [reportType, setReportType] = useState('');
  const [incidentDate, setIncidentDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [place, setPlace] = useState('');
  const [description, setDescription] = useState('');
  const [witnesses, setWitnesses] = useState('');
  const [photos, setPhotos] = useState([]);

  // Errors
  const [errors, setErrors] = useState({});

  const reportTypes = [
    { id: 'HARASSMENT', label: 'Harcèlement', icon: 'sad-outline', color: COLORS.warning },
    { id: 'VIOLENCE', label: 'Violence', icon: 'flash-outline', color: COLORS.error },
    { id: 'DISCRIMINATION', label: 'Discrimination', icon: 'people-outline', color: COLORS.primary },
    { id: 'OTHER', label: 'Autre', icon: 'ellipsis-horizontal-outline', color: COLORS.gray },
  ];

  const validateStep = () => {
    const newErrors = {};

    if (step === 1) {
      if (!reportType) {
        newErrors.reportType = 'Veuillez sélectionner un type de signalement';
      }
    }

    if (step === 3) {
      if (!description.trim()) {
        newErrors.description = 'La description est requise';
      } else if (description.trim().length < 20) {
        newErrors.description = 'La description doit contenir au moins 20 caractères';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Permission refusée',
        'Nous avons besoin de la permission pour accéder à vos photos.'
      );
      return;
    }

    const result = await ImagePicker.launchImagePickerAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      maxWidth: 1920,
      maxHeight: 1920,
    });

    if (!result.canceled) {
      setPhotos([...photos, ...result.assets.slice(0, 5 - photos.length)]);
    }
  };

  const removePhoto = (index) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const submitReport = async () => {
    if (!validateStep()) return;

    setLoading(true);

    try {
      const reportData = {
        schoolId: school.id,
        type: reportType,
        incidentDate: incidentDate.toISOString(),
        place: place.trim() || null,
        description: description.trim(),
        witnesses: witnesses.trim() || null,
      };

      const result = await reportService.createReport(reportData, photos);

      if (result.success) {
        // Save codes locally
        await reportService.saveReportLocally(
          result.reportCode,
          result.discussionCode
        );

        // Navigate to confirmation
        navigation.replace('ReportConfirmation', {
          reportCode: result.reportCode,
          discussionCode: result.discussionCode,
          school: school,
        });
      } else {
        Alert.alert('Erreur', result.message);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue lors de l\'envoi du signalement');
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3, 4].map((s) => (
        <View
          key={s}
          style={[
            styles.stepDot,
            s === step && styles.stepDotActive,
            s < step && styles.stepDotComplete,
          ]}
        />
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Type de signalement</Text>
      <Text style={styles.stepDescription}>
        Sélectionnez le type de situation que vous souhaitez signaler
      </Text>

      <View style={styles.typesContainer}>
        {reportTypes.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.typeCard,
              reportType === type.id && styles.typeCardActive,
            ]}
            onPress={() => setReportType(type.id)}
          >
            <Ionicons
              name={type.icon}
              size={32}
              color={reportType === type.id ? COLORS.white : type.color}
            />
            <Text
              style={[
                styles.typeLabel,
                reportType === type.id && styles.typeLabelActive,
              ]}
            >
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {errors.reportType && (
        <Text style={styles.errorText}>{errors.reportType}</Text>
      )}
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Quand et où ?</Text>
      <Text style={styles.stepDescription}>
        Ces informations sont optionnelles mais peuvent aider l'établissement
      </Text>

      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowDatePicker(true)}
      >
        <Ionicons name="calendar-outline" size={20} color={COLORS.gray} />
        <Text style={styles.dateText}>
          {incidentDate.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={incidentDate}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) setIncidentDate(date);
          }}
          maximumDate={new Date()}
        />
      )}

      <Input
        label="Lieu (optionnel)"
        value={place}
        onChangeText={setPlace}
        placeholder="Ex: Cour de récréation, couloir du 2ème étage..."
        leftIcon="location-outline"
      />
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Description</Text>
      <Text style={styles.stepDescription}>
        Décrivez la situation le plus précisément possible
      </Text>

      <Input
        label="Description détaillée *"
        value={description}
        onChangeText={setDescription}
        placeholder="Décrivez ce qui s'est passé..."
        multiline
        numberOfLines={8}
        error={errors.description}
      />

      <Text style={styles.charCount}>
        {description.length} caractères (minimum 20)
      </Text>

      <Input
        label="Témoins (optionnel)"
        value={witnesses}
        onChangeText={setWitnesses}
        placeholder="Noms ou descriptions des témoins..."
        multiline
        numberOfLines={3}
      />
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Photos (optionnel)</Text>
      <Text style={styles.stepDescription}>
        Vous pouvez ajouter jusqu'à 5 photos (captures d'écran, photos...)
      </Text>

      <View style={styles.photosGrid}>
        {photos.map((photo, index) => (
          <View key={index} style={styles.photoContainer}>
            <View style={styles.photoPlaceholder}>
              <Ionicons name="image" size={32} color={COLORS.gray} />
            </View>
            <TouchableOpacity
              style={styles.removePhotoButton}
              onPress={() => removePhoto(index)}
            >
              <Ionicons name="close-circle" size={24} color={COLORS.error} />
            </TouchableOpacity>
          </View>
        ))}

        {photos.length < 5 && (
          <TouchableOpacity style={styles.addPhotoButton} onPress={pickImage}>
            <Ionicons name="add-circle-outline" size={32} color={COLORS.primary} />
            <Text style={styles.addPhotoText}>Ajouter</Text>
          </TouchableOpacity>
        )}
      </View>

      <Card variant="warning" style={styles.infoCard}>
        <View style={styles.infoContent}>
          <Ionicons name="information-circle" size={20} color={COLORS.warning} />
          <Text style={styles.infoText}>
            Assurez-vous que vos photos ne contiennent pas d'informations personnelles
          </Text>
        </View>
      </Card>
    </View>
  );

  if (loading) {
    return <Loading message="Envoi du signalement..." fullScreen />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.black} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Nouveau signalement</Text>
          <Text style={styles.headerSubtitle}>{school.name}</Text>
        </View>
      </View>

      {renderStepIndicator()}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </ScrollView>

      {/* Navigation buttons */}
      <View style={styles.navigationButtons}>
        {step > 1 && (
          <Button
            title="Précédent"
            onPress={prevStep}
            variant="outline"
            style={styles.navButton}
          />
        )}

        {step < 4 ? (
          <Button
            title="Suivant"
            onPress={nextStep}
            variant="primary"
            style={[styles.navButton, step === 1 && styles.navButtonFull]}
          />
        ) : (
          <Button
            title="Envoyer le signalement"
            onPress={submitReport}
            variant="primary"
            style={[styles.navButton, step === 1 && styles.navButtonFull]}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  backButton: {
    padding: SIZES.base / 2,
    marginRight: SIZES.padding,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    ...FONTS.h3,
    color: COLORS.black,
    fontWeight: '600',
  },
  headerSubtitle: {
    ...FONTS.body4,
    color: COLORS.gray,
    marginTop: 2,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SIZES.padding * 1.5,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.lightGray,
    marginHorizontal: 4,
  },
  stepDotActive: {
    backgroundColor: COLORS.primary,
    width: 30,
  },
  stepDotComplete: {
    backgroundColor: COLORS.success,
  },
  scrollContent: {
    paddingHorizontal: SIZES.padding * 2,
    paddingBottom: SIZES.padding * 2,
  },
  stepContent: {
    marginTop: SIZES.padding,
  },
  stepTitle: {
    ...FONTS.h2,
    color: COLORS.black,
    fontWeight: 'bold',
    marginBottom: SIZES.base,
  },
  stepDescription: {
    ...FONTS.body3,
    color: COLORS.gray,
    lineHeight: 22,
    marginBottom: SIZES.padding * 2,
  },
  typesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SIZES.base / 2,
  },
  typeCard: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    justifyContent: 'center',
    alignItems: 'center',
    margin: SIZES.base / 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeCardActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  typeLabel: {
    ...FONTS.body3,
    color: COLORS.black,
    marginTop: SIZES.base,
    fontWeight: '600',
  },
  typeLabelActive: {
    color: COLORS.white,
  },
  errorText: {
    ...FONTS.body4,
    color: COLORS.error,
    marginTop: SIZES.base,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding,
    marginBottom: SIZES.padding,
  },
  dateText: {
    ...FONTS.body3,
    color: COLORS.black,
    marginLeft: SIZES.base,
  },
  charCount: {
    ...FONTS.body4,
    color: COLORS.gray,
    textAlign: 'right',
    marginTop: -SIZES.padding / 2,
    marginBottom: SIZES.padding,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SIZES.base / 2,
    marginBottom: SIZES.padding,
  },
  photoContainer: {
    width: '31%',
    aspectRatio: 1,
    margin: SIZES.base / 2,
    position: 'relative',
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.white,
    borderRadius: 12,
  },
  addPhotoButton: {
    width: '31%',
    aspectRatio: 1,
    margin: SIZES.base / 2,
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoText: {
    ...FONTS.body4,
    color: COLORS.primary,
    marginTop: SIZES.base / 2,
  },
  infoCard: {
    marginTop: SIZES.padding,
  },
  infoContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoText: {
    ...FONTS.body4,
    color: COLORS.warning,
    marginLeft: SIZES.base,
    flex: 1,
    lineHeight: 18,
  },
  navigationButtons: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.padding * 2,
    paddingVertical: SIZES.padding,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
  },
  navButton: {
    flex: 1,
    marginHorizontal: SIZES.base / 2,
  },
  navButtonFull: {
    marginHorizontal: 0,
  },
});
