import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../constants/theme';
import { Button, Input, Card, Badge, Loading } from '../components';
import { reportService } from '../services';

export default function TrackReportScreen({ navigation }) {
  const [reportCode, setReportCode] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const trackReport = async () => {
    if (!reportCode.trim()) {
      setError('Veuillez entrer un code de signalement');
      return;
    }

    setLoading(true);
    setError('');

    const result = await reportService.trackReport(reportCode.trim());

    if (result.success) {
      setReport(result.report);
    } else {
      setError(result.message);
      setReport(null);
    }

    setLoading(false);
  };

  const openDiscussion = () => {
    if (report?.discussionCode) {
      navigation.navigate('Discussion', {
        discussionCode: report.discussionCode,
        reportCode: report.reportCode,
      });
    }
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      PENDING: {
        label: 'En attente',
        variant: 'pending',
        icon: 'time-outline',
        description: 'Votre signalement a été reçu et est en attente de traitement',
      },
      IN_PROGRESS: {
        label: 'En cours',
        variant: 'in_progress',
        icon: 'hourglass-outline',
        description: 'Votre signalement est actuellement traité par l\'établissement',
      },
      RESOLVED: {
        label: 'Résolu',
        variant: 'resolved',
        icon: 'checkmark-circle-outline',
        description: 'Le signalement a été résolu par l\'établissement',
      },
      CLOSED: {
        label: 'Fermé',
        variant: 'closed',
        icon: 'close-circle-outline',
        description: 'Le signalement a été fermé',
      },
    };

    return statusMap[status] || statusMap.PENDING;
  };

  const getTypeLabel = (type) => {
    const typeMap = {
      HARASSMENT: 'Harcèlement',
      VIOLENCE: 'Violence',
      DISCRIMINATION: 'Discrimination',
      OTHER: 'Autre',
    };
    return typeMap[type] || type;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <Loading message="Recherche du signalement..." fullScreen />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.title}>Suivre un signalement</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {/* Search section */}
        <View style={styles.searchSection}>
          <Text style={styles.sectionTitle}>Code de signalement</Text>
          <Text style={styles.sectionDescription}>
            Entrez le code RPT-XXXXX que vous avez reçu lors de votre signalement
          </Text>

          <Input
            value={reportCode}
            onChangeText={(text) => {
              setReportCode(text.toUpperCase());
              setError('');
            }}
            placeholder="RPT-XXXXX"
            autoCapitalize="characters"
            maxLength={9}
            leftIcon="document-text-outline"
            error={error}
          />

          <Button
            title="Rechercher"
            onPress={trackReport}
            variant="primary"
            size="large"
            style={styles.searchButton}
          />
        </View>

        {/* Report details */}
        {report && (
          <View style={styles.reportSection}>
            <Card style={styles.statusCard}>
              <View style={styles.statusHeader}>
                <View style={styles.statusIconContainer}>
                  <Ionicons
                    name={getStatusInfo(report.status).icon}
                    size={32}
                    color={COLORS.primary}
                  />
                </View>
                <View style={styles.statusContent}>
                  <Badge
                    label={getStatusInfo(report.status).label}
                    variant={getStatusInfo(report.status).variant}
                    size="medium"
                  />
                  <Text style={styles.statusDescription}>
                    {getStatusInfo(report.status).description}
                  </Text>
                </View>
              </View>
            </Card>

            <Card>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Type</Text>
                <Text style={styles.infoValue}>{getTypeLabel(report.type)}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Établissement</Text>
                <Text style={styles.infoValue}>{report.school?.name}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Date de signalement</Text>
                <Text style={styles.infoValue}>{formatDate(report.createdAt)}</Text>
              </View>

              {report.incidentDate && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Date de l'incident</Text>
                  <Text style={styles.infoValue}>
                    {new Date(report.incidentDate).toLocaleDateString('fr-FR')}
                  </Text>
                </View>
              )}

              {report.place && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Lieu</Text>
                  <Text style={styles.infoValue}>{report.place}</Text>
                </View>
              )}

              {report.updatedAt !== report.createdAt && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Dernière mise à jour</Text>
                  <Text style={styles.infoValue}>{formatDate(report.updatedAt)}</Text>
                </View>
              )}
            </Card>

            <Button
              title="Ouvrir la discussion"
              onPress={openDiscussion}
              variant="primary"
              size="large"
              leftIcon="chatbubbles-outline"
              style={styles.discussionButton}
            />

            <Card variant="warning" style={styles.reminderCard}>
              <View style={styles.reminderContent}>
                <Ionicons name="bookmark-outline" size={20} color={COLORS.warning} />
                <Text style={styles.reminderText}>
                  Conservez précieusement vos codes RPT et DSC pour suivre votre signalement
                </Text>
              </View>
            </Card>
          </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  backButton: {
    padding: SIZES.base / 2,
  },
  title: {
    ...FONTS.h3,
    color: COLORS.black,
    fontWeight: '600',
  },
  placeholder: {
    width: 24,
  },
  content: {
    flex: 1,
    paddingHorizontal: SIZES.padding * 2,
    paddingTop: SIZES.padding * 2,
  },
  searchSection: {
    marginBottom: SIZES.padding * 2,
  },
  sectionTitle: {
    ...FONTS.h3,
    color: COLORS.black,
    fontWeight: '600',
    marginBottom: SIZES.base,
  },
  sectionDescription: {
    ...FONTS.body3,
    color: COLORS.gray,
    lineHeight: 22,
    marginBottom: SIZES.padding * 2,
  },
  searchButton: {
    marginTop: SIZES.padding,
  },
  reportSection: {
    flex: 1,
  },
  statusCard: {
    marginBottom: SIZES.padding,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.padding,
  },
  statusContent: {
    flex: 1,
  },
  statusDescription: {
    ...FONTS.body3,
    color: COLORS.gray,
    marginTop: SIZES.base,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: SIZES.padding / 2,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  infoLabel: {
    ...FONTS.body3,
    color: COLORS.gray,
    flex: 1,
  },
  infoValue: {
    ...FONTS.body3,
    color: COLORS.black,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  discussionButton: {
    marginVertical: SIZES.padding * 2,
  },
  reminderCard: {
    marginBottom: SIZES.padding,
  },
  reminderContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  reminderText: {
    ...FONTS.body4,
    color: COLORS.warning,
    marginLeft: SIZES.base,
    flex: 1,
    lineHeight: 18,
  },
});
