import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../constants/theme';
import { Card, Loading, EmptyState, Badge } from '../components';
import { schoolService } from '../services';

export default function SchoolSelectionScreen({ navigation }) {
  const [schools, setSchools] = useState([]);
  const [filteredSchools, setFilteredSchools] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    loadSchools();
    loadFavorites();
  }, []);

  useEffect(() => {
    filterSchools();
  }, [searchQuery, schools]);

  const loadSchools = async () => {
    setLoading(true);
    const result = await schoolService.getAllSchools('ACTIVE');
    
    if (result.success) {
      setSchools(result.schools);
      setFilteredSchools(result.schools);
    }
    setLoading(false);
  };

  const loadFavorites = async () => {
    const result = await schoolService.getFavorites();
    if (result.success) {
      setFavorites(result.favorites);
    }
  };

  const filterSchools = () => {
    if (!searchQuery.trim()) {
      setFilteredSchools(schools);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = schools.filter(school => 
      school.name.toLowerCase().includes(query) ||
      school.city?.toLowerCase().includes(query) ||
      school.type?.toLowerCase().includes(query)
    );
    
    setFilteredSchools(filtered);
  };

  const toggleFavorite = async (schoolId) => {
    const result = await schoolService.toggleFavorite(schoolId);
    if (result.success) {
      setFavorites(result.favorites);
    }
  };

  const selectSchool = (school) => {
    navigation.navigate('ReportForm', { school });
  };

  const renderSchoolItem = ({ item }) => {
    const isFavorite = favorites.includes(item.id);

    return (
      <Card onPress={() => selectSchool(item)} style={styles.schoolCard}>
        <View style={styles.schoolHeader}>
          <View style={styles.schoolInfo}>
            <Text style={styles.schoolName}>{item.name}</Text>
            <View style={styles.schoolMeta}>
              {item.type && (
                <Badge 
                  label={item.type} 
                  variant="default" 
                  size="small"
                  style={styles.typeBadge}
                />
              )}
              {item.city && (
                <View style={styles.locationContainer}>
                  <Ionicons name="location-outline" size={14} color={COLORS.gray} />
                  <Text style={styles.location}>{item.city}</Text>
                </View>
              )}
            </View>
          </View>
          <TouchableOpacity
            onPress={() => toggleFavorite(item.id)}
            style={styles.favoriteButton}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={24}
              color={isFavorite ? COLORS.error : COLORS.gray}
            />
          </TouchableOpacity>
        </View>

        {item.contactEmail && (
          <View style={styles.contactInfo}>
            <Ionicons name="mail-outline" size={14} color={COLORS.gray} />
            <Text style={styles.contactText}>{item.contactEmail}</Text>
          </View>
        )}
      </Card>
    );
  };

  if (loading) {
    return <Loading message="Chargement des établissements..." fullScreen />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.title}>Sélectionner un établissement</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={COLORS.gray} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un établissement..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={COLORS.gray}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={COLORS.gray} />
          </TouchableOpacity>
        )}
      </View>

      {/* Results count */}
      <Text style={styles.resultsCount}>
        {filteredSchools.length} établissement{filteredSchools.length > 1 ? 's' : ''} trouvé{filteredSchools.length > 1 ? 's' : ''}
      </Text>

      {/* Schools list */}
      {filteredSchools.length === 0 ? (
        <EmptyState
          icon="school-outline"
          title="Aucun établissement trouvé"
          message="Essayez de modifier votre recherche"
          actionLabel="Réinitialiser"
          onAction={() => setSearchQuery('')}
        />
      ) : (
        <FlatList
          data={filteredSchools}
          renderItem={renderSchoolItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    marginHorizontal: SIZES.padding * 2,
    marginBottom: SIZES.padding,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
  },
  searchIcon: {
    marginRight: SIZES.base,
  },
  searchInput: {
    flex: 1,
    ...FONTS.body3,
    color: COLORS.black,
  },
  resultsCount: {
    ...FONTS.body4,
    color: COLORS.gray,
    marginHorizontal: SIZES.padding * 2,
    marginBottom: SIZES.padding,
  },
  listContent: {
    paddingHorizontal: SIZES.padding * 2,
    paddingBottom: SIZES.padding * 2,
  },
  schoolCard: {
    marginBottom: SIZES.padding,
  },
  schoolHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  schoolInfo: {
    flex: 1,
  },
  schoolName: {
    ...FONTS.h4,
    color: COLORS.black,
    fontWeight: '600',
    marginBottom: SIZES.base,
  },
  schoolMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  typeBadge: {
    marginRight: SIZES.base,
    marginBottom: SIZES.base / 2,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    ...FONTS.body4,
    color: COLORS.gray,
    marginLeft: 4,
  },
  favoriteButton: {
    padding: SIZES.base / 2,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SIZES.base,
    paddingTop: SIZES.base,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  contactText: {
    ...FONTS.body4,
    color: COLORS.gray,
    marginLeft: SIZES.base,
  },
});
