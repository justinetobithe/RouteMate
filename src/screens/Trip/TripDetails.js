import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, LogBox } from 'react-native';
import useTripStore from '../../store/tripStore';
import { AlertDialog, Button } from 'native-base';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import usePassengerStore from '../../store/passengerStore';
import Toast from '../../components/Toast';
import { capitalizeWords, formatDateLocale, formatTime } from '../../helper/helperFunciton';

const TripDetails = ({ navigation, route }) => {
    const { showToast } = Toast();
    const [refreshing, setRefreshing] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const cancelRef = React.useRef(null);
    const { tripId } = route.params;
    const { updateTripStatus, currentTrip, showTrip } = useTripStore();

    const fetchTripDetails = async () => {
        setRefreshing(true);
        try {
            await showTrip(tripId);
        } catch (error) {
            console.error("Error fetching trip:", error);
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchTripDetails();
    }, [tripId, showTrip]);

    const joinData = () => {
        const combinedData = [];

        if (currentTrip?.bookings) {
            currentTrip.bookings.forEach(booking => {
                if (booking.paid == 1) {
                    combinedData.push({
                        type: 'Booking',
                        name: `${booking.user.first_name} ${booking.user.last_name}`,
                        booking,
                    });
                }
            });
        }

        if (currentTrip?.kiosks) {
            currentTrip.kiosks.forEach(kiosk => {
                if (kiosk.paid == 1) {
                    combinedData.push({
                        type: 'Walk in',
                        name: kiosk.name,
                        kiosk,
                    });
                }
            });
        }

        return combinedData.sort((a, b) => a.name.localeCompare(b.name));
    };


    const renderPassengerItem = ({ item }) => {
        return (
            <View style={styles.passengerItem}>
                <Text style={styles.passengerText}>Name: {item.name}</Text>
                <Text style={styles.passengerText}>
                    Type: <Text style={styles.typeText}>{item.type}</Text>
                </Text>
            </View>
        );
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed':
                return 'blue';
            case 'canceled':
                return 'red';
            case 'not_attended':
                return 'gray';
            default:
                return 'orange';
        }
    };

    const handleEndTrip = async () => {
        console.log("End trip button pressed");
        try {
            await updateTripStatus(tripId, 'completed', showToast);
            fetchTripDetails();
        } catch (error) {
            console.error("Error ending trip:", error);
        }
    };

    const handleStartButtonPress = async () => {
        console.log("Start button pressed");
        try {
            await updateTripStatus(tripId, 'in_progress', showToast);
            fetchTripDetails();
        } catch (error) {
            console.error("Error starting trip:", error);
        }
    };

    useEffect(() => {
        LogBox.ignoreLogs(["VirtualizedLists should never be nested"]);
    }, []);

    return (
        <View style={styles.container}>
            <ScrollView
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchTripDetails} />}
            >
                <View style={{ flex: 1 }}>
                    <Text style={styles.title}>Trip Details</Text>
                    {currentTrip ? (
                        <>
                            <Text style={styles.tripTitle}>{`Trip Date: ${formatDateLocale(currentTrip.trip_date)}`}</Text>
                            <Text style={styles.tripTitle}>Vehicle: {currentTrip.driver?.vehicle?.brand} - {currentTrip.driver?.vehicle?.model},  Plate No.:{currentTrip.driver?.vehicle?.license_plate}</Text>
                            <Text style={styles.tripTitle}>From: {currentTrip.terminal_from?.name}</Text>
                            <Text style={styles.tripTitle}>To: {currentTrip.terminal_to?.name}</Text>

                            <Text style={styles.infoText}>
                                Start Time: {formatTime(currentTrip.start_time)} | Passengers: {currentTrip.total_occupancy}/{currentTrip.driver?.vehicle?.capacity}
                            </Text>

                            <Text style={styles.passengerTitle}>Passengers</Text>

                            <View style={{ paddingBottom: 70 }}>
                                <FlatList
                                    data={joinData()}
                                    keyExtractor={(item, index) => `${item.booking_id || item.kiosk_id || index}`}
                                    renderItem={renderPassengerItem}
                                    ListEmptyComponent={
                                        <View style={styles.emptyContainer}>
                                            <Text style={styles.emptyText}>No passengers available</Text>
                                        </View>
                                    }
                                />

                            </View>
                        </>
                    ) : (
                        <Text>No trip details found.</Text>
                    )}
                </View>
            </ScrollView >

            {currentTrip?.status == 'in_progress' && (
                <>
                    <TouchableOpacity
                        style={styles.endButton}
                        onPress={() => setIsDialogOpen(true)}
                    >
                        <Text style={styles.endButtonText}>End Trip</Text>
                    </TouchableOpacity>

                    <AlertDialog
                        leastDestructiveRef={cancelRef}
                        isOpen={isDialogOpen}
                        onClose={() => setIsDialogOpen(false)}
                    >
                        <AlertDialog.Content>
                            <AlertDialog.Header>Confirm End Trip</AlertDialog.Header>
                            <AlertDialog.Body>
                                Are you sure you want to end this trip? This action cannot be undone.
                            </AlertDialog.Body>
                            <AlertDialog.Footer>
                                <Button.Group space={2}>
                                    <Button
                                        variant="unstyled"
                                        colorScheme="coolGray"
                                        onPress={() => setIsDialogOpen(false)}
                                        ref={cancelRef}
                                    >
                                        Cancel
                                    </Button>
                                    <Button colorScheme="red" onPress={handleEndTrip}>
                                        End Trip
                                    </Button>
                                </Button.Group>
                            </AlertDialog.Footer>
                        </AlertDialog.Content>
                    </AlertDialog>
                </>
            )}
            {currentTrip?.status == 'pending' && (
                <TouchableOpacity style={styles.startButton} onPress={handleStartButtonPress}>
                    <Text style={styles.startButtonText}>Start Trip</Text>
                </TouchableOpacity>
            )}
        </View >
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F6F9FC', padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#003366', textAlign: 'center', marginVertical: 20 },
    tripTitle: { fontSize: 16, fontWeight: '600', color: '#333333', marginVertical: 8 },
    infoText: { fontSize: 14, color: '#666666', marginVertical: 5 },
    passengerTitle: { fontSize: 18, fontWeight: 'bold', color: '#003366', marginTop: 20 },
    passengerItem: { backgroundColor: '#FFFFFF', padding: 15, marginVertical: 8, borderRadius: 10, elevation: 2 },
    passengerText: { fontSize: 14, color: '#333333', marginVertical: 2 },
    startButton: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        backgroundColor: '#D02620',
        paddingVertical: 15,
        borderRadius: 25,
        alignItems: 'center',
    },
    startButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    endButton: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        backgroundColor: 'red',
        paddingVertical: 15,
        borderRadius: 25,
        alignItems: 'center',
    },
    endButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    emptyContainer: { alignItems: 'center', marginTop: 50 },
    emptyText: { fontSize: 16, color: '#999999' },
});

export default TripDetails;