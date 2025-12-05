import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../constants/theme';
import { Button, Card } from '../components';

export default function HomeScreen({ navigation }) {
  const features = [
    {
      icon: 'shield-checkmark',
      title: 'Anonymat garanti',
      description: 'Votre identité reste totalement anonyme lors de vos signalements.',
    },
    {
      icon: 'chatbubbles',
      title: 'Discussion sécurisée',
      description: 'Échangez avec votre établissement de manière confidentielle.',
    },
    {
      icon: 'eye',
      title: 'Suivi en temps réel',
      description: 'Suivez l\'évolution de votre signalement avec un code unique.',
    },
    {
      icon: 'lock-closed',
      title: 'Données protégées',
      description: 'Vos informations sont cryptées et sécurisées.',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.emoji}>🎓</Text>
          <Text style={styles.title}>SpeakFree</Text>
          <Text style={styles.subtitle}>
            Signale en toute sécurité les situations de harcèlement, violence ou discrimination
          </Text>
        </View>

        {/* Features */}
        <View style={styles.featuresContainer}>
          <Text style={styles.sectionTitle}>Pourquoi nous choisir ?</Text>
          
          {features.map((feature, index) => (
            <Card key={index} style={styles.featureCard}>
              <View style={styles.featureContent}>
                <View style={styles.iconContainer}>
                  <Ionicons 
                    name={feature.icon} 
                    size={24} 
                    color={COLORS.primary} 
                  />
                </View>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>
                    {feature.description}
                  </Text>
                </View>
              </View>
            </Card>
          ))}
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <Button
            title="Faire un signalement"
            onPress={() => navigation.navigate('SchoolSelection')}
            variant="primary"
            size="large"
            style={styles.primaryButton}
          />

          <Button
            title="Suivre mon signalement"
            onPress={() => navigation.navigate('TrackReport')}
            variant="secondary"
            size="large"
            style={styles.secondaryButton}
          />

          <TouchableOpacity 
            style={styles.loginLink}
            onPress={() => navigation.navigate('Login')}
          >
            <Ionicons name="log-in-outline" size={18} color={COLORS.primary} />
            <Text style={styles.loginText}>
              Espace établissement
            </Text>
          </TouchableOpacity>
        </View>

        {/* Emergency */}
        <Card variant="error" style={styles.emergencyCard}>
          <View style={styles.emergencyContent}>
            <Ionicons name="alert-circle" size={24} color={COLORS.error} />
            <View style={styles.emergencyText}>
              <Text style={styles.emergencyTitle}>Urgence ?</Text>
              <Text style={styles.emergencyDescription}>
                En cas de danger immédiat, contactez le 17 (Police) ou le 112 (Urgences)
              </Text>
            </View>
          </View>
        </Card>
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
    paddingBottom: SIZES.padding * 3,
  },
  header: {
    alignItems: 'center',
    paddingTop: SIZES.padding * 3,
    paddingBottom: SIZES.padding * 2,
  },
  emoji: {
    fontSize: 60,
    marginBottom: SIZES.padding,
  },
  title: {
    ...FONTS.h1,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginBottom: SIZES.base,
  },
  subtitle: {
    ...FONTS.body2,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresContainer: {
    marginTop: SIZES.padding * 2,
  },
  sectionTitle: {
    ...FONTS.h3,
    color: COLORS.black,
    fontWeight: '600',
    marginBottom: SIZES.padding,
  },
  featureCard: {
    marginBottom: SIZES.padding,
  },
  featureContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.padding,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    ...FONTS.h4,
    color: COLORS.black,
    fontWeight: '600',
    marginBottom: SIZES.base / 2,
  },
  featureDescription: {
    ...FONTS.body3,
    color: COLORS.gray,
    lineHeight: 20,
  },
  actionsContainer: {
    marginTop: SIZES.padding * 3,
  },
  primaryButton: {
    marginBottom: SIZES.padding,
  },
  secondaryButton: {
    marginBottom: SIZES.padding * 2,
  },
  loginLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.padding,
  },
  loginText: {
    ...FONTS.body3,
    color: COLORS.primary,
    marginLeft: SIZES.base / 2,
    fontWeight: '600',
  },
  emergencyCard: {
    marginTop: SIZES.padding * 2,
  },
  emergencyContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  emergencyText: {
    flex: 1,
    marginLeft: SIZES.padding,
  },
  emergencyTitle: {
    ...FONTS.h4,
    color: COLORS.error,
    fontWeight: '600',
    marginBottom: SIZES.base / 2,
  },
  emergencyDescription: {
    ...FONTS.body3,
    color: COLORS.error,
    lineHeight: 20,
  },
});
