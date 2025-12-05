import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../constants/theme';
import { Button, Input, Card, Loading } from '../components';
import { authService } from '../services';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email invalide';
    }

    if (!password) {
      newErrors.password = 'Le mot de passe est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const result = await authService.loginSchool(email.trim(), password);

      if (result.success) {
        // Navigate to school dashboard
        navigation.replace('SchoolDashboard');
      } else {
        Alert.alert('Erreur de connexion', result.message);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Mot de passe oublié',
      'Veuillez contacter l\'administrateur pour réinitialiser votre mot de passe.',
      [{ text: 'OK' }]
    );
  };

  if (loading) {
    return <Loading message="Connexion en cours..." fullScreen />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.black} />
        </TouchableOpacity>

        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>🎓</Text>
          <Text style={styles.title}>Espace Établissement</Text>
          <Text style={styles.subtitle}>
            Connectez-vous pour gérer les signalements
          </Text>
        </View>

        {/* Login form */}
        <View style={styles.formContainer}>
          <Input
            label="Email"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setErrors((prev) => ({ ...prev, email: '' }));
            }}
            placeholder="votre@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon="mail-outline"
            error={errors.email}
          />

          <Input
            label="Mot de passe"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setErrors((prev) => ({ ...prev, password: '' }));
            }}
            placeholder="••••••••"
            secureTextEntry
            leftIcon="lock-closed-outline"
            error={errors.password}
          />

          <TouchableOpacity
            onPress={handleForgotPassword}
            style={styles.forgotPassword}
          >
            <Text style={styles.forgotPasswordText}>
              Mot de passe oublié ?
            </Text>
          </TouchableOpacity>

          <Button
            title="Se connecter"
            onPress={handleLogin}
            variant="primary"
            size="large"
            style={styles.loginButton}
          />
        </View>

        {/* Register link */}
        <Card style={styles.registerCard}>
          <View style={styles.registerContent}>
            <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} />
            <Text style={styles.registerText}>
              Vous n'avez pas encore de compte ?
            </Text>
          </View>
          <Button
            title="Créer un compte"
            onPress={() => navigation.navigate('Register')}
            variant="outline"
            size="medium"
            style={styles.registerButton}
          />
        </Card>

        {/* Student link */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Home')}
          style={styles.studentLink}
        >
          <Ionicons name="person-outline" size={18} color={COLORS.gray} />
          <Text style={styles.studentLinkText}>
            Accès élève
          </Text>
        </TouchableOpacity>
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
  backButton: {
    alignSelf: 'flex-start',
    padding: SIZES.base / 2,
    marginTop: SIZES.padding,
  },
  logoContainer: {
    alignItems: 'center',
    paddingVertical: SIZES.padding * 3,
  },
  logo: {
    fontSize: 60,
    marginBottom: SIZES.padding,
  },
  title: {
    ...FONTS.h1,
    color: COLORS.black,
    fontWeight: 'bold',
    marginBottom: SIZES.base,
  },
  subtitle: {
    ...FONTS.body2,
    color: COLORS.gray,
    textAlign: 'center',
  },
  formContainer: {
    marginTop: SIZES.padding * 2,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -SIZES.padding / 2,
    marginBottom: SIZES.padding * 2,
  },
  forgotPasswordText: {
    ...FONTS.body3,
    color: COLORS.primary,
    fontWeight: '600',
  },
  loginButton: {
    marginBottom: SIZES.padding * 2,
  },
  registerCard: {
    marginTop: SIZES.padding,
  },
  registerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.padding,
  },
  registerText: {
    ...FONTS.body3,
    color: COLORS.gray,
    marginLeft: SIZES.base,
  },
  registerButton: {
    width: '100%',
  },
  studentLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SIZES.padding * 3,
  },
  studentLinkText: {
    ...FONTS.body3,
    color: COLORS.gray,
    marginLeft: SIZES.base / 2,
  },
});
