import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, LogBox, Image, TouchableOpacity, RefreshControl } from 'react-native';
import { Button, Center, Box, VStack, FormControl, Input, SectionList, Heading, HStack, Text } from 'native-base';
import useTripStore from '../../store/tripStore';
import { formatTime, getCurrentDateInTimeZone } from '../../helper/helperFunciton';
import Ionicons from "react-native-vector-icons/Ionicons";
import Toast from '../../components/Toast';
import { useForm, Controller } from 'react-hook-form';
import useAuthStore from '../../store/authStore';
import useBookingStore from '../../store/bookingStore';
import Maps from '../../components/Maps';

export default function Booking({ route, navigation }) {
    const { showToast } = Toast();
    const { userInfo } = useAuthStore();
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(false);
    const { trip } = route.params; 
    const { addBooking, isLoading } = useBookingStore();
    const [paymentMethod, setPaymentMethod] = useState('');

    const { control, handleSubmit, formState: { errors }, reset } = useForm({
        defaultValues: {
            user_id: '',
            trip_id: '',
            booked_at: '',
            status: 'pending',

        }
    });

    const cameraRef = useRef(null);

    const handlePaymentMethod = (method) => {
        setPaymentMethod(method);
    };

    const onSubmit = async (data) => {
        if (!paymentMethod) {
            showToast("Please select a payment method", "error");
            return;
        }

        const totalPayment = parseFloat(calculateTotalPayment(trip?.fare_amount));

        const today = getCurrentDateInTimeZone();

        const formData = {
            user_id: userInfo.id,
            trip_id: trip?.id,
            booked_at: today,
            status: 'pending',
            paid: false,
            payment_method: paymentMethod,
            total_amount: totalPayment,
        };

        console.log("formData", formData);


        if (paymentMethod == 'cash') {
            await addBooking(formData, showToast, navigation);
        } else {
            const paymentScreen = paymentMethod == 'paymaya' ? 'PaymayaScreen' : 'GCashScreen';
            navigation.navigate(paymentScreen, {
                paymentMethod,
                formData,
                totalPayment,
                fromTerminalName: trip.terminal_from.name,
                toTerminalName: trip.terminal_to.name,
            });
        }
    };

    const calculateTotalPayment = (fareAmount) => {
        if (!userInfo.classification == "null") {
            return fareAmount.toFixed(2);
        }

        const isDiscountEligible = ['student', 'PWD', 'senior citizen'].includes(userInfo.classification);
        const discountRate = isDiscountEligible ? 0.20 : 0;
        const discountedAmount = fareAmount - (fareAmount * discountRate);
        return discountedAmount.toFixed(2);
    };

    return (
        <>
            {trip && (
                <View style={styles.mapContainer}>
                    <Maps fromTerminal={trip.terminal_from} toTerminal={trip.terminal_to} />
                </View>
            )}

            <View style={styles.container}>

                <Center flex={1} px={4}>
                    <Box w="100%">
                        <VStack space={4}>
                            <VStack space={2} mt="4">
                                <View style={{ marginBottom: 20 }}>
                                    <Text fontSize="lg" fontWeight="bold">
                                        Trip Fare: ₱ {trip.fare_amount}
                                    </Text>
                                    <Text fontSize="lg" color={userInfo.classification ? 'green.600' : 'black'} fontWeight="bold">
                                        Total Payment: ₱ {calculateTotalPayment(trip?.fare_amount)}
                                    </Text>
                                    {userInfo.classification ? (
                                        <Text color="green.600">
                                            A 20% discount has been applied for {userInfo.classification}.
                                        </Text>
                                    ) : (
                                        <Text>No discount available.</Text>
                                    )}
                                </View>

                                <Heading fontSize="lg" mt="2" pb="4">Select Payment Method</Heading>

                                <TouchableOpacity
                                    style={[
                                        styles.paymentButton,
                                        paymentMethod == 'cash' ? styles.activeButton : null,
                                    ]}
                                    onPress={() => handlePaymentMethod('cash')}
                                >
                                    <Text style={styles.paymentText}>Cash</Text>
                                </TouchableOpacity>

                                <View style={styles.divider}>
                                    <View style={styles.line} />
                                    <Text style={styles.orText}>or</Text>
                                    <View style={styles.line} />
                                </View>

                                <TouchableOpacity
                                    style={[
                                        styles.paymentButton,
                                        paymentMethod == 'gcash' ? styles.activeButton : null,
                                    ]}
                                    onPress={() => handlePaymentMethod('gcash')}
                                >
                                    <Image source={require('../../assets/img/gcash.png')} style={styles.paymentImage} />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.paymentButton,
                                        paymentMethod == 'paymaya' ? styles.activeButton : null,
                                    ]}
                                    onPress={() => handlePaymentMethod('paymaya')}
                                >
                                    <Image source={require('../../assets/img/paymaya.png')} style={styles.paymentImage} />
                                </TouchableOpacity>

                            </VStack>

                            <Button
                                isLoading={isLoading}
                                onPress={handleSubmit(onSubmit)}
                                variant="solid"
                                backgroundColor="#080E2C"
                                style={styles.confirmButton}
                            >
                                Confirm Booking
                            </Button>

                        </VStack>
                    </Box>
                </Center>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    mapContainer: {
        height: 200,
        backgroundColor: '#f0f0f0',
    },
    confirmButton: {
        marginTop: 20,
        height: 50,
        marginBottom: 20,
    },
    paymentButton: {
        width: '100%',
        alignItems: 'center',
        padding: 10,
        borderWidth: 2,
        borderColor: 'gray',
        borderRadius: 5,
        justifyContent: 'center',
    },
    activeButton: {
        borderColor: 'blue',
    },
    paymentImage: {
        width: 200,
        height: 25,
        resizeMode: 'contain',
    },
    paymentText: {
        fontSize: 20,
        fontWeight: 'bold',
    },

    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 1,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: '#ccc',
    },
});
