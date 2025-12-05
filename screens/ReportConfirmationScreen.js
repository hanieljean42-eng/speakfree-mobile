import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Clipboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../constants/theme';
import { Button, Card } from '../components';

export default function ReportConfirmationScreen({ navigation, route }) {
  const { reportCode, discussionCode, school } = route.params;

  const [codesCopied, setCodesCopied] = useState({
    report: false,
    discussion: false,
  });

  const copyToClipboard = async (text, type) => {
    await Clipboard.setString(text);
    setCodesCopied((prev) => ({ ...prev, [type]: true }));
    
    setTimeout(() => {
      setCodesCopied((prev) => ({ ...prev, [type]: false }));
    }, 2000);
  };

  const openDiscussion = () => {
    navigation.navigate('Discussion', {
      discussionCode,
      reportCode,
    });
  };

  const goHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Success icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="checkmark-circle" size={80} color={COLORS.success} />
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Signalement envoyé !</Text>
        <Text style={styles.subtitle}>
          Votre signalement a été transmis à {school.name}
        </Text>

        {/* Codes section */}
        <Card variant="success" style={styles.codesCard}>
          <View style={styles.codeSection}>
            <Text style={styles.codeLabel}>Code de suivi</Text>
            <View style={styles.codeRow}>
              <Text style={styles.codeValue}>{reportCode}</Text>
              <TouchableOpacity
                onPress={() => copyToClipboard(reportCode, 'report')}
                style={styles.copyButton}
              >
                <Ionicons
                  name={codesCopied.report ? 'checkmark' : 'copy-outline'}
                  size={20}
                  color={COLORS.success}
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.codeDescription}>
              Utilisez ce code pour suivre l'évolution de votre signalement
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.codeSection}>
            <Text style={styles.codeLabel}>Code de discussion</Text>
            <View style={styles.codeRow}>
              <Text style={styles.codeValue}>{discussionCode}</Text>
              <TouchableOpacity
                onPress={() => copyToClipboard(discussionCode, 'discussion')}
                style={styles.copyButton}
              >
                <Ionicons
                  name={codesCopied.discussion ? 'checkmark' : 'copy-outline'}
                  size={20}
                  color={COLORS.success}
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.codeDescription}>
              Utilisez ce code pour discuter anonymement avec l'établissement
            </Text>
          </View>
        </Card>

        {/* Important notice */}
        <Card variant="warning" style={styles.noticeCard}>
          <View style={styles.noticeContent}>
            <Ionicons name="alert-circle" size={24} color={COLORS.warning} />
            <View style={styles.noticeText}>
              <Text style={styles.noticeTitle}>Important</Text>
              <Text style={styles.noticeDescription}>
                Conservez précieusement ces codes. Ils sont nécessaires pour suivre votre signalement et discuter avec l'établissement.
              </Text>
            </View>
          </View>
        </Card>

        {/* Next steps */}
        <View style={styles.nextSteps}>
          <Text style={styles.nextStepsTitle}>Prochaines étapes</Text>
          
          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Notification</Text>
              <Text style={styles.stepDescription}>
                L'établissement sera notifié de votre signalement dans les plus brefs délais
              </Text>
            </View>
          </View>

          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Traitement</Text>
              <Text style={styles.stepDescription}>
                L'établissement va étudier votre signalement et prendre les mesures nécessaires
              </Text>
            </View>
          </View>

          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Communication</Text>
              <Text style={styles.stepDescription}>
                Vous serez informé de l'évolution via la discussion anonyme
              </Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Ouvrir la discussion"
            onPress={openDiscussion}
            variant="primary"
            size="large"
            style={styles.primaryButton}
          />

          <Button
            title="Retour à l'accueil"
            onPress={goHome}
            variant="outline"
            size="large"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    paddingHorizontal: SIZES.padding * 2,
    paddingVertical: SIZES.padding * 3,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: SIZES.padding * 2,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.success + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...FONTS.h1,
    color: COLORS.black,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SIZES.base,
  },
  subtitle: {
    ...FONTS.body2,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: SIZES.padding * 3,
    lineHeight: 24,
  },
  codesCard: {
    marginBottom: SIZES.padding * 2,
  },
  codeSection: {
    paddingVertical: SIZES.padding / 2,
  },
  codeLabel: {
    ...FONTS.body3,
    color: COLORS.success,
    fontWeight: '600',
    marginBottom: SIZES.base,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius / 2,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
    marginBottom: SIZES.base,
  },
  codeValue: {
    ...FONTS.h3,
    color: COLORS.black,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  copyButton: {
    padding: SIZES.base / 2,
  },
  codeDescription: {
    ...FONTS.body4,
    color: COLORS.success,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.success + '40',
    marginVertical: SIZES.padding,
  },
  noticeCard: {
    marginBottom: SIZES.padding * 2,
  },
  noticeContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  noticeText: {
    flex: 1,
    marginLeft: SIZES.padding,
  },
  noticeTitle: {
    ...FONTS.h4,
    color: COLORS.warning,
    fontWeight: '600',
    marginBottom: SIZES.base / 2,
  },
  noticeDescription: {
    ...FONTS.body4,
    color: COLORS.warning,
    lineHeight: 18,
  },
  nextSteps: {
    marginBottom: SIZES.padding * 3,
  },
  nextStepsTitle: {
    ...FONTS.h3,
    color: COLORS.black,
    fontWeight: '600',
    marginBottom: SIZES.padding * 1.5,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: SIZES.padding * 1.5,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.padding,
  },
  stepNumberText: {
    ...FONTS.h4,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    ...FONTS.h4,
    color: COLORS.black,
    fontWeight: '600',
    marginBottom: SIZES.base / 2,
  },
  stepDescription: {
    ...FONTS.body3,
    color: COLORS.gray,
    lineHeight: 20,
  },
  actions: {
    marginTop: SIZES.padding,
  },
  primaryButton: {
    marginBottom: SIZES.padding,
  },
});
