
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import useAuthStore from '../store/authStore';
import Driver from './Home/Driver';
import DashboardScreen from './DashboardScreen';

const HomeScreen = () => {
    const { userInfo } = useAuthStore();

    return (
        <View style={styles.container}>
            {userInfo?.role === 'driver' ? (
                <Driver />
            ) : (
                <DashboardScreen />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default HomeScreen;
