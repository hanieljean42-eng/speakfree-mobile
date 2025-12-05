import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../constants/theme';
import { Card, Badge, Loading, EmptyState } from '../components';
import { reportService, authService } from '../services';

export default function SchoolDashboardScreen({ navigation }) {
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [school, setSchool] = useState(null);

  useEffect(() => {
    loadUserData();
    loadData();
  }, [filter]);

  const loadUserData = async () => {
    const userData = await authService.getCurrentUser();
    if (userData) {
      setSchool(userData.user);
    }
  };

  const loadData = async () => {
    if (!school) return;

    setLoading(true);

    try {
      const filters = filter !== 'ALL' ? { status: filter } : {};
      const result = await reportService.getSchoolReports(school.id, filters);

      if (result.success) {
        setReports(result.reports);
      }
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    await authService.logout();
    navigation.replace('Home');
  };

  const openReport = (report) => {
    navigation.navigate('ReportDetail', { report });
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

  const getStatusVariant = (status) => {
    const variantMap = {
      PENDING: 'pending',
      IN_PROGRESS: 'in_progress',
      RESOLVED: 'resolved',
      CLOSED: 'closed',
    };
    return variantMap[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const labelMap = {
      PENDING: 'En attente',
      IN_PROGRESS: 'En cours',
      RESOLVED: 'Résolu',
      CLOSED: 'Fermé',
    };
    return labelMap[status] || status;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const filters = [
    { id: 'ALL', label: 'Tous' },
    { id: 'PENDING', label: 'En attente' },
    { id: 'IN_PROGRESS', label: 'En cours' },
    { id: 'RESOLVED', label: 'Résolus' },
  ];

  const renderReportItem = ({ item }) => (
    <Card onPress={() => openReport(item)} style={styles.reportCard}>
      <View style={styles.reportHeader}>
        <View style={styles.reportHeaderLeft}>
          <Text style={styles.reportCode}>{item.reportCode}</Text>
          <Badge
            label={getStatusLabel(item.status)}
            variant={getStatusVariant(item.status)}
            size="small"
            style={styles.statusBadge}
          />
        </View>
        <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
      </View>

      <View style={styles.reportContent}>
        <View style={styles.reportRow}>
          <Ionicons name="alert-circle-outline" size={16} color={COLORS.gray} />
          <Text style={styles.reportType}>{getTypeLabel(item.type)}</Text>
        </View>

        <View style={styles.reportRow}>
          <Ionicons name="calendar-outline" size={16} color={COLORS.gray} />
          <Text style={styles.reportDate}>{formatDate(item.createdAt)}</Text>
        </View>

        {item.place && (
          <View style={styles.reportRow}>
            <Ionicons name="location-outline" size={16} color={COLORS.gray} />
            <Text style={styles.reportPlace} numberOfLines={1}>
              {item.place}
            </Text>
          </View>
        )}
      </View>

      <Text style={styles.reportDescription} numberOfLines={2}>
        {item.description}
      </Text>
    </Card>
  );

  if (loading) {
    return <Loading message="Chargement du tableau de bord..." fullScreen />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Tableau de bord</Text>
          <Text style={styles.headerSubtitle}>{school?.name}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color={COLORS.error} />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{reports.length}</Text>
          <Text style={styles.statLabel}>Signalements</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>
            {reports.filter((r) => r.status === 'PENDING').length}
          </Text>
          <Text style={styles.statLabel}>En attente</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>
            {reports.filter((r) => r.status === 'IN_PROGRESS').length}
          </Text>
          <Text style={styles.statLabel}>En cours</Text>
        </Card>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        {filters.map((f) => (
          <TouchableOpacity
            key={f.id}
            onPress={() => setFilter(f.id)}
            style={[
              styles.filterButton,
              filter === f.id && styles.filterButtonActive,
            ]}
          >
            <Text
              style={[
                styles.filterText,
                filter === f.id && styles.filterTextActive,
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Reports list */}
      {reports.length === 0 ? (
        <EmptyState
          icon="document-text-outline"
          title="Aucun signalement"
          message={
            filter !== 'ALL'
              ? 'Aucun signalement avec ce statut'
              : 'Vous n\'avez pas encore reçu de signalement'
          }
        />
      ) : (
        <FlatList
          data={reports}
          renderItem={renderReportItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding * 2,
    paddingVertical: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    ...FONTS.h2,
    color: COLORS.black,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    ...FONTS.body3,
    color: COLORS.gray,
    marginTop: 2,
  },
  logoutButton: {
    padding: SIZES.base / 2,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.padding * 2,
    paddingVertical: SIZES.padding,
  },
  statCard: {
    flex: 1,
    marginHorizontal: SIZES.base / 2,
    alignItems: 'center',
    paddingVertical: SIZES.padding * 1.5,
  },
  statValue: {
    ...FONTS.h1,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginBottom: SIZES.base / 2,
  },
  statLabel: {
    ...FONTS.body4,
    color: COLORS.gray,
    textAlign: 'center',
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.padding * 2,
    paddingVertical: SIZES.padding,
  },
  filterButton: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
    borderRadius: SIZES.radius / 2,
    backgroundColor: COLORS.lightGray,
    marginRight: SIZES.base,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    ...FONTS.body3,
    color: COLORS.gray,
    fontWeight: '600',
  },
  filterTextActive: {
    color: COLORS.white,
  },
  listContent: {
    paddingHorizontal: SIZES.padding * 2,
    paddingBottom: SIZES.padding * 2,
  },
  reportCard: {
    marginBottom: SIZES.padding,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.padding,
  },
  reportHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  reportCode: {
    ...FONTS.h4,
    color: COLORS.black,
    fontWeight: 'bold',
    marginRight: SIZES.base,
  },
  statusBadge: {
    marginLeft: SIZES.base,
  },
  reportContent: {
    marginBottom: SIZES.base,
  },
  reportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.base / 2,
  },
  reportType: {
    ...FONTS.body3,
    color: COLORS.gray,
    marginLeft: SIZES.base,
  },
  reportDate: {
    ...FONTS.body3,
    color: COLORS.gray,
    marginLeft: SIZES.base,
  },
  reportPlace: {
    ...FONTS.body3,
    color: COLORS.gray,
    marginLeft: SIZES.base,
    flex: 1,
  },
  reportDescription: {
    ...FONTS.body3,
    color: COLORS.black,
    lineHeight: 20,
  },
});
