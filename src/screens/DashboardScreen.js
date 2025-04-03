import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, LogBox } from 'react-native';
import { Select, Button, Center, Box, VStack, FormControl, Input, SectionList, Heading, HStack, Text, Spinner } from 'native-base';
import useTerminalStore from '../store/terminalStore';
import useTripStore from '../store/tripStore';
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { formatTime } from '../helper/helperFunciton';
import Toast from '../components/Toast';
import { useNavigation } from '@react-navigation/native';

export default function DashboardScreen() {
    const { showToast } = Toast();
    const [refreshing, setRefreshing] = useState(false);
    const navigation = useNavigation();
    const [fromTerminal, setFromTerminal] = useState(null);
    const [toTerminal, setToTerminal] = useState(null);
    const [selectedTripId, setSelectedTripId] = useState(null);
    const [loading, setLoading] = useState(false);
    const { getTripsToday, getTripsWithTerminals, trips } = useTripStore();
    const { terminals, fetchTerminals } = useTerminalStore();

    useEffect(() => {
        fetchTerminals();
    }, [fetchTerminals]);

    const fetchTrips = async () => {
        setLoading(true);
        try {
            if (fromTerminal && toTerminal) {
                await getTripsWithTerminals(fromTerminal.id, toTerminal.id);
            } else {
                await getTripsToday();
            }
        } catch (error) {
            console.error('Error fetching trips:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrips();
    }, [fromTerminal, toTerminal]);

    console.log("trips", trips);

    const handleTripSelection = (tripId) => {
        setSelectedTripId(tripId);
        console.log('Selected trip ID:', tripId);
    };

    const sectionedTrips =
        trips?.map((trip) => ({
            title: `${formatTime(trip.start_time)} - Capacity: ${trip.driver?.vehicle?.capacity} - Price: ₱${trip.fare_amount}`,
            data: [trip],
        })) || [];

    const handleClear = (type) => {
        if (type === 'from') {
            setFromTerminal(null);
        } else {
            setToTerminal(null);
        }
    };

    useEffect(() => {
        LogBox.ignoreLogs(["VirtualizedLists should never be nested"]);
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.welcomeText}>Welcome to CT Express</Text>

            <Box width="90%">
                <HStack justifyContent="space-between" alignItems="center">
                    <Text style={{ color: "#000", marginBottom: 5 }}>Select From:</Text>
                    {fromTerminal && (
                        <TouchableOpacity onPress={() => handleClear('from')}>
                            <Text style={styles.clearText}>Clear</Text>
                        </TouchableOpacity>
                    )}
                </HStack>
                <Select
                    selectedValue={fromTerminal?.id || ''}
                    placeholder="Select From Terminal"
                    onValueChange={(itemValue) => {
                        const selectedTerminal = terminals.find(terminal => terminal.id === itemValue);
                        setFromTerminal(selectedTerminal);
                    }}
                >
                    {terminals.map((terminal) => (
                        <Select.Item key={terminal.id} label={terminal.name} value={terminal.id} />
                    ))}
                </Select>
            </Box>

            <Box width="90%" style={{ marginTop: 10 }}>
                <View style={styles.selectContainer}>
                    <HStack justifyContent="space-between" alignItems="center">
                        <Text style={{ color: "#000", marginBottom: 5 }}>Select To:</Text>
                        {toTerminal && (
                            <TouchableOpacity onPress={() => handleClear('to')}>
                                <Text style={styles.clearText}>Clear</Text>
                            </TouchableOpacity>
                        )}
                    </HStack>
                    <Select
                        selectedValue={toTerminal?.id || ''}
                        placeholder="Select To Terminal"
                        onValueChange={(itemValue) => {
                            const selectedTerminal = terminals.find(terminal => terminal.id === itemValue);
                            setToTerminal(selectedTerminal);
                        }}
                        isDisabled={!fromTerminal}
                    >
                        {terminals
                            .filter(terminal => terminal.id !== fromTerminal?.id)
                            .map((terminal) => (
                                <Select.Item key={terminal.id} label={terminal.name} value={terminal.id} />
                            ))}
                    </Select>
                </View>
            </Box>



            {loading ? (
                <Center style={{ marginTop: 20 }}>
                    <Spinner color="#D02620" size="lg" />
                </Center>
            ) : sectionedTrips.length == 0 ? (
                <Text style={{ textAlign: 'center', marginTop: 20 }}>No trips found</Text>
            ) : (
                <>
                    <Heading fontSize="lg" mt="4" pb="0">
                        {fromTerminal && toTerminal
                            ? 'Available Trips Between Selected Terminals'
                            : 'Available Trips Today'}
                    </Heading>

                    <ScrollView contentContainerStyle={{ flexGrow: 1 }}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchTrips} />}>
                        <SectionList
                            sections={sectionedTrips}
                            keyExtractor={(item, index) => item.id || index.toString()}
                            renderItem={({ item }) => (
                                <View
                                    style={[styles.tripItem, selectedTripId === item.id && styles.tripItemSelected]}
                                    onTouchEnd={() => handleTripSelection(item.id)}
                                >
                                    <Text style={styles.tripTitle}>
                                        {`${item.terminal_from?.name} - ${item.terminal_to?.name})`}
                                    </Text>
                                    <Text style={styles.tripTitle}>
                                        {`${item.driver?.first_name} ${item.driver?.last_name} - ${item.driver?.vehicle?.brand} ${item.driver?.vehicle?.model} (${item.driver?.vehicle?.year})`}
                                    </Text>
                                    <Text style={styles.tripInfoText}>
                                        {`Plate No.: ${item.driver?.vehicle?.license_plate}`}
                                    </Text>
                                    <View style={styles.tripDetails}>
                                        <Text style={styles.tripDetailsText}>{formatTime(item.start_time)}</Text>
                                        <Text style={styles.tripDetailsText}>Capacity: {item.total_occupancy}/{item.driver?.vehicle?.capacity}</Text>
                                    </View>
                                    <View style={styles.tripFooter}>
                                        <Text style={styles.tripFooterText}>{`Price: ₱${item.fare_amount}`}</Text>
                                        <TouchableOpacity onPress={() => {
                                            navigation.navigate('Booking', {
                                                trip: item
                                            });
                                        }}>
                                            <MaterialCommunityIcons
                                                name="arrow-right"
                                                size={22}
                                                color={selectedTripId === item.id ? '#00796b' : '#cccccc'}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                            renderSectionHeader={({ section }) => (
                                <View style={styles.sectionHeader}>
                                    <Text style={styles.sectionHeaderText}>{section.title}</Text>
                                </View>
                            )}
                        />
                    </ScrollView>
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: '#ffffff',
    },
    welcomeText: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#D02620',
        textAlign: 'center',
        marginBottom: 20,
        textShadowColor: '#aaa',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 4,
        fontFamily: 'Arial',
    },
    clearText: {
        color: 'blue',
        fontSize: 14,
    },
    sectionHeader: {
        backgroundColor: '#f8f8f8',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginBottom: 8,
    },
    sectionHeaderText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    tripItem: {
        backgroundColor: '#fff',
        marginVertical: 8,
        marginHorizontal: 16,
        padding: 16,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
        elevation: 4,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    tripItemSelected: {
        backgroundColor: '#e0f7fa',
        borderColor: '#00796b',
        borderWidth: 2,
    },
    tripInfoText: {
        fontSize: 14,
        color: '#555',
        marginBottom: 8,
    },
    tripDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    tripDetailsText: {
        fontSize: 12,
        color: '#777',
    },
    tripTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    tripFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    tripFooterText: {
        fontSize: 12,
        color: '#00796b',
    },
});
