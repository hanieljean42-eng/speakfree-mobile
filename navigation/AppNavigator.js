import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import {
  SplashScreen,
  HomeScreen,
  SchoolSelectionScreen,
  ReportFormScreen,
  ReportConfirmationScreen,
  TrackReportScreen,
  DiscussionScreen,
  LoginScreen,
  SchoolDashboardScreen,
} from '../screens';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          gestureDirection: 'horizontal',
        }}
      >
        {/* Splash */}
        <Stack.Screen name="Splash" component={SplashScreen} />

        {/* Main screens */}
        <Stack.Screen name="Home" component={HomeScreen} />

        {/* Report flow */}
        <Stack.Screen 
          name="SchoolSelection" 
          component={SchoolSelectionScreen}
          options={{
            gestureEnabled: true,
          }}
        />
        <Stack.Screen 
          name="ReportForm" 
          component={ReportFormScreen}
          options={{
            gestureEnabled: false,
          }}
        />
        <Stack.Screen 
          name="ReportConfirmation" 
          component={ReportConfirmationScreen}
          options={{
            gestureEnabled: false,
          }}
        />

        {/* Track & Discussion */}
        <Stack.Screen name="TrackReport" component={TrackReportScreen} />
        <Stack.Screen name="Discussion" component={DiscussionScreen} />

        {/* Authentication */}
        <Stack.Screen name="Login" component={LoginScreen} />

        {/* School Dashboard */}
        <Stack.Screen 
          name="SchoolDashboard" 
          component={SchoolDashboardScreen}
          options={{
            gestureEnabled: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
