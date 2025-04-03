import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, LogBox } from 'react-native';
import { SectionList, Text, Spinner, Center, Heading } from 'native-base';
import useBookingStore from '../../store/bookingStore';
import { formatDateLocale, formatTime } from '../../helper/helperFunciton';
import useAuthStore from '../../store/authStore';

export default function BookingList() {
    const { userInfo } = useAuthStore();
    const { listBookingsByUser, bookings } = useBookingStore();
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            setLoading(true);
            try {
                if (userInfo?.id) {
                    await listBookingsByUser(userInfo.id);
                }
            } catch (error) {
                console.error('Error fetching bookings:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, [userInfo]);

    useEffect(() => {
        LogBox.ignoreLogs(["VirtualizedLists should never be nested"]);
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            if (userInfo?.id) {
                await listBookingsByUser(userInfo.id);
            }
        } catch (error) {
            console.error('Error refreshing bookings:', error);
        } finally {
            setRefreshing(false);
        }
    };

    const sectionedBookings = bookings.map((booking) => ({
        // title: formatTime(booking.trip?.start_time),
        title: `${formatDateLocale(booking.trip?.trip_date)} - ${formatTime(booking.trip?.start_time)}`,
        data: [booking],
    }));

    console.log('bookings', bookings);

    return (
        <View style={styles.container}>
            <Text style={styles.welcomeText}>My Bookings</Text>
            {loading ? (
                <Center style={{ marginTop: 20 }}>
                    <Spinner color="#080E2C" size="lg" />
                </Center>
            ) : bookings.length === 0 ? (
                <Text style={{ textAlign: 'center', marginTop: 20 }}>No bookings found</Text>
            ) : (
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                >
                    <SectionList
                        sections={sectionedBookings}
                        keyExtractor={(item, index) => item.id || index.toString()}
                        renderItem={({ item }) => (
                            <View style={styles.bookingItem}>
                                <Text style={styles.bookingTitle}>
                                    {`${item.trip?.terminal_from?.name} to ${item.trip?.terminal_to?.name}`}
                                </Text>
                                <Text style={styles.bookingInfo}>
                                    Driver: {`${item.trip?.driver?.first_name} ${item.trip?.driver?.last_name}`}
                                </Text>
                                <Text style={styles.bookingInfo}>
                                    Vehicle: {`${item.trip?.driver?.vehicle?.brand} ${item.trip?.driver?.vehicle?.model}`}
                                </Text>
                                <Text style={styles.bookingInfo}>
                                    Plate No.: {item.trip?.driver?.vehicle?.license_plate}
                                </Text>
                            </View>
                        )}
                        renderSectionHeader={({ section }) => (
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionHeaderText}>{section.title}</Text>
                            </View>
                        )}
                    />
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#ffffff',
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#080E2C',
        textAlign: 'center',
        marginBottom: 20,
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
    bookingItem: {
        backgroundColor: '#fff',
        marginVertical: 8,
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
    bookingTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    bookingInfo: {
        fontSize: 14,
        color: '#555',
        marginBottom: 4,
    },
    bookingDetails: {
        fontSize: 12,
        color: '#777',
    },
});
