import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { Select, Button, Center, Box, VStack, HStack, Text, Spinner } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import useTerminalStore from '../store/terminalStore';
import useTripStore from '../store/tripStore';
import { formatTime } from '../helper/helperFunction';

export default function DashboardScreen() {
    const navigation = useNavigation();
    const [refreshing, setRefreshing] = useState(false);
    const [fromTerminal, setFromTerminal] = useState(null);
    const [toTerminal, setToTerminal] = useState(null);
    const [loading, setLoading] = useState(false);



    return (
        <View style={styles.container}>
            <Text style={styles.title}>RouteMate Student Dashboard</Text>

            <Box style={styles.selectBox}>
                <HStack justifyContent="space-between" alignItems="center">
                    <Text style={styles.label}>From:</Text>
                    {fromTerminal && (
                        <TouchableOpacity onPress={() => setFromTerminal(null)}>
                            <Text style={styles.clearText}>Clear</Text>
                        </TouchableOpacity>
                    )}
                </HStack>
                <Select
                    placeholder="Select Departure"
                >

                </Select>
            </Box>

            <Box style={styles.selectBox}>
                <HStack justifyContent="space-between" alignItems="center">
                    <Text style={styles.label}>To:</Text>
                </HStack>
                <Select
                    placeholder="Select Destination"
                >

                </Select>
            </Box>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        marginTop: 20,
        fontSize: 26,
        fontWeight: 'bold',
        color: '#D02620',
        textAlign: 'center',
        marginBottom: 20,
    },
    selectBox: {
        backgroundColor: '#F7F7F7',
        padding: 12,
        borderRadius: 10,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        elevation: 4,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    clearText: {
        color: 'blue',
        fontSize: 14,
    },
    noTrips: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: '#555',
    },
    tripCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 10,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        elevation: 4,
    },
    tripTime: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    tripInfo: {
        fontSize: 14,
        color: '#666',
        marginBottom: 6,
    },
    tripPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#D02620',
    },
});
