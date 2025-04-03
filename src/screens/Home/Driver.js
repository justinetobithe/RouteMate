import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, LogBox, ScrollView } from 'react-native';
import useTripStore from '../../store/tripStore';
import useAuthStore from '../../store/authStore';
import { formatDateLocale, formatTime, getCurrentDateInTimeZone } from '../../helper/helperFunciton';
import { useNavigation } from '@react-navigation/native';
import Toast from '../../components/Toast';
import { laravelEcho } from '../../core/LaravelPush';

const Driver = () => {
    const { showToast } = Toast();
    const [refreshing, setRefreshing] = useState(false);
    const navigation = useNavigation();
    const { userInfo } = useAuthStore();
    const { trips, fetchDriverTrips, updateDriverDecision } = useTripStore();
    const eventSubscribed = useRef(false);
    const toastCooldown = useRef(false);
    const debounceToast = (message, type) => {
        if (!toastCooldown.current) {
            showToast(message, type);
            toastCooldown.current = true;
            setTimeout(() => {
                toastCooldown.current = false;
            }, 3000);
        }
    };

    const getTrips = async () => {
        setRefreshing(true);
        try {
            const today = getCurrentDateInTimeZone('Asia/Manila');
            await fetchDriverTrips(userInfo.id, today);
        } catch (error) {
            console.error("Error fetching trips:", error);
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        getTrips();
    }, [userInfo.id]);

    useEffect(() => {
        if (!eventSubscribed.current) {
            laravelEcho('App.Events')
                .private('trip.assigned')
                .listen('TripAssignEvent', (response) => {
                    const { data } = response;
                    if (data.user_id === userInfo.id) {
                        if (userInfo.role === 'driver') {
                            getTrips();
                            debounceToast('You have a new trip assigned!', 'success');
                        }
                    }
                });
            eventSubscribed.current = true;
        }

        return () => {
            laravelEcho('App.Events').leaveChannel('trip.assigned');
        };
    }, [userInfo.id]);

    useEffect(() => {
        LogBox.ignoreLogs(['Request failed with status code 403']);
    }, []);

    useEffect(() => {
        LogBox.ignoreLogs(["VirtualizedLists should never be nested"]);
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return '#FFA500'; // Light orange
            case 'completed':
                return '#28A745'; // Green
            case 'canceled':
                return '#DC3545'; // Red
            case 'in_progress':
                return '#007BFF'; // Blue
            case 'failed':
                return '#6C757D'; // Gray
            default:
                return '#343A40'; // Black
        }
    };

    const formatStatus = (status) => {
        if (status === 'in_progress') {
            return 'In Progress';
        }
        return status.replace('_', ' ').toUpperCase();
    };

    const handleApproveTrip = async (id) => {
        try {
            await updateDriverDecision(id, userInfo.id, 'approved', showToast);
            getTrips();
        } catch (error) {
            console.error("Error approving trip:", error);
        }
    };

    const handleRejectTrip = async (id) => {
        try {
            await updateDriverDecision(id, userInfo.id, 'rejected', showToast);
            getTrips();
        } catch (error) {
            console.error("Error rejecting trip:", error);
        }
    };

    const renderTripItem = ({ item }) => (
        <TouchableOpacity
            style={styles.tripItem}
            onPress={() => item.is_driver_accepted == 1 && handleTripPress(item)}
            disabled={item.is_driver_accepted == 0}
        >
            <Text style={styles.tripTitle}>{`Trip Date: ${formatDateLocale(item.trip_date)}`}</Text>
            <Text style={styles.tripText}>{`From Terminal: ${item.terminal_from?.name}`}</Text>
            <Text style={styles.tripText}>{`To Terminal: ${item.terminal_to?.name}`}</Text>
            <Text style={styles.tripText}>{`Start Time: ${formatTime(item.start_time)}`}</Text>
            <Text style={styles.tripText}>{`Passenger Capacity: ${item.total_occupancy}/${item.driver?.vehicle?.capacity}`}</Text>
            <Text style={styles.tripText}>{`Fare Amount: ₱${item.fare_amount}`}</Text>
            <Text style={styles.tripText}>
                <Text style={{ color: 'black', fontWeight: 'bold', textTransform: 'capitalize' }}>{`Status: `}</Text>
                <Text style={{ color: getStatusColor(item.status), fontWeight: 'bold', textTransform: 'capitalize' }}>
                    {formatStatus(item.status)}
                </Text>
            </Text>

            {item.is_driver_accepted == 0 && (
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.approveButton}
                        onPress={() => handleApproveTrip(item.id)}
                    >
                        <Text style={styles.approveButtonText}>Approve</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.rejectButton}
                        onPress={() => handleRejectTrip(item.id)}
                    >
                        <Text style={styles.rejectButtonText}>Reject</Text>
                    </TouchableOpacity>
                </View>
            )}
        </TouchableOpacity>
    );

    const handleTripPress = (trip) => {
        navigation.navigate('TripDetails', {
            tripId: trip.id,
        });
    };

    return (
        <View style={styles.container}>
            <ScrollView
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={getTrips} />}
            >
                <FlatList
                    data={trips}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderTripItem}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={getTrips} />}
                    ListEmptyComponent={<Text style={styles.emptyText}>No active trips available</Text>}
                    contentContainerStyle={{ padding: 10 }}
                />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
        padding: 16,
    },
    tripItem: {
        padding: 15,
        marginVertical: 10,
        backgroundColor: '#ffffff',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    tripTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333',
    },
    tripText: {
        color: '#555',
        marginBottom: 6,
    },
    emptyText: {
        color: '#777',
        textAlign: 'center',
        marginTop: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
    },
    approveButton: {
        backgroundColor: '#007BFF',
        padding: 12,
        borderRadius: 5,
        flex: 1,
        marginRight: 8,
    },
    rejectButton: {
        backgroundColor: '#DC3545',
        padding: 12,
        borderRadius: 5,
        flex: 1,
    },
    approveButtonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    rejectButtonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
    },
});

export default Driver;
