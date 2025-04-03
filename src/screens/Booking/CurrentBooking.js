import React, { useState, useEffect, useRef } from 'react';
import { Text, View, StyleSheet, Image, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { Spinner, AlertDialog, Button } from 'native-base';
import { getCurrentLocation } from '../../helper/helperFunciton';
import useBookingStore from '../../store/bookingStore';
import useAuthStore from '../../store/authStore';
import Maps from '../../components/Maps';
import StepIndicator from 'react-native-step-indicator';
import Toast from '../../components/Toast';
import { Rating } from 'react-native-ratings';
import useTripRatingStore from '../../store/tripRatingStore';

const customStyles = {
    stepIndicatorSize: 25,
    currentStepIndicatorSize: 40,
    separatorStrokeWidth: 2,
    currentStepStrokeWidth: 3,
    stepStrokeCurrentColor: '#D02620',
    stepStrokeWidth: 3,
    stepStrokeFinishedColor: '#D02620',
    stepStrokeUnFinishedColor: '#aaaaaa',
    separatorFinishedColor: '#D02620',
    separatorUnFinishedColor: '#aaaaaa',
    stepIndicatorFinishedColor: '#D02620',
    stepIndicatorUnFinishedColor: '#ffffff',
    stepIndicatorCurrentColor: '#ffffff',
    stepIndicatorLabelFontSize: 13,
    currentStepIndicatorLabelFontSize: 13,
    stepIndicatorLabelCurrentColor: '#D02620',
    stepIndicatorLabelFinishedColor: '#ffffff',
    stepIndicatorLabelUnFinishedColor: '#aaaaaa',
    labelColor: '#999999',
    labelSize: 13,
    currentStepLabelColor: '#D02620'
}

export default function CurrentBooking() {
    const { userInfo } = useAuthStore();
    const { currentBooking, dropOffPassenger, fetchCurrentBookingForUser } = useBookingStore();
    const [refreshing, setRefreshing] = useState(false);
    const { showToast } = Toast();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const stepCount = 2;
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [ratingDialog, setRatingDialog] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [rating, setRating] = useState(0);
    const { addTripRating } = useTripRatingStore();
    const [trip, setTrip] = useState(null)

    const cancelRef = useRef(null);

    const getCurrentBookingUser = async () => {
        setRefreshing(true);
        setLoading(true);
        try {
            await fetchCurrentBookingForUser(userInfo.id);
        } catch (error) {
            console.error("Error fetching current booking:", error);
        } finally {
            setRefreshing(false);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!currentBooking) {
            getCurrentBookingUser();
        }
    }, [userInfo.id]);

    const handleDropOff = async () => {
        try {
            const location = await getCurrentLocation();
            const bookingId = currentBooking.id;

            const formData = {
                drop_at: [location.longitude, location.latitude],
            };

            console.log('Drop Off:', { formData });

            setTrip(currentBooking.trip)

            const dropOffSuccess = await dropOffPassenger(bookingId, formData, showToast);

            if (dropOffSuccess) {
                fetchCurrentBookingForUser(userInfo.id);

                setIsModalVisible(true);
                setRatingDialog(true);
                setIsDialogOpen(true);

                return true;
            } else {
                return false;
            }

        } catch (error) {
            showToast(error, 'error');
            return false;
        }
    };


    const handleRatingSubmit = async () => {
        if (rating === 0) {
            showToast("Please select a rating before submitting.", 'error');
            return;
        }

        try {
            console.log("Rating submitted:", rating);

            const formData = {
                trip_id: trip.id,
                user_id: userInfo.id,
                rating: rating
            }

            await addTripRating(formData, showToast);

            setRating(0)
            setTrip(null)

            setIsDialogOpen(false);
        } catch (error) {
            console.error("Error submitting rating:", error);
        }
    };


    return (
        <>
            {loading ? (
                <View style={styles.loadingContainer}>
                    <Spinner color="#D02620" size="lg" />
                </View>
            ) : (
                <View style={styles.container}>
                    {!currentBooking ? (
                        <ScrollView
                            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={getCurrentBookingUser} />}
                        >
                            {ratingDialog && (
                                <AlertDialog leastDestructiveRef={cancelRef} isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
                                    <AlertDialog.Content>
                                        <AlertDialog.Header>Rate Us</AlertDialog.Header>
                                        <AlertDialog.Body>
                                            <Text style={styles.thankYouText}>Thank you for your feedback on the trip from {trip?.terminal_from?.name} to {trip?.terminal_to?.name}!</Text>

                                            <Rating
                                                type='star'
                                                ratingCount={5}
                                                imageSize={30}
                                                startingValue={rating}
                                                onFinishRating={setRating}
                                            />
                                        </AlertDialog.Body>
                                        <AlertDialog.Footer>
                                            <Button.Group space={2}>
                                                <Button variant="unstyled" colorScheme="coolGray" onPress={() => setIsDialogOpen(false)} ref={cancelRef}>
                                                    Cancel
                                                </Button>
                                                <Button colorScheme="blue" onPress={handleRatingSubmit}>
                                                    Submit
                                                </Button>
                                            </Button.Group>
                                        </AlertDialog.Footer>
                                    </AlertDialog.Content>
                                </AlertDialog>
                            )}


                            <View style={styles.noBookingContainer}>
                                <Image source={require('../../assets/img/no-booking-found.png')} style={styles.noBookingImage} />
                                <Text style={styles.noBookingText}>No current booking found</Text>
                            </View>


                        </ScrollView>
                    ) : (
                        <ScrollView
                            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={getCurrentBookingUser} />}
                        >
                            <View style={styles.mapContainer}>
                                <Maps fromTerminal={currentBooking.trip?.terminal_from} toTerminal={currentBooking.trip?.terminal_to} currentBooking={true} />
                            </View>

                            <View style={styles.container}>
                                <View style={[styles.container, { marginTop: 20, marginBottom: 35 }]}>
                                    <StepIndicator
                                        customStyles={customStyles}
                                        currentPosition={currentStep}
                                        labels={[currentBooking.trip?.terminal_from?.name, currentBooking.trip?.terminal_to?.name]}
                                        stepCount={stepCount}
                                    />
                                </View>
                                <View style={styles.dropOffButton}>


                                    <TouchableOpacity style={styles.touchableOpacity} onPress={handleDropOff}>
                                        <Text style={styles.dropOffButtonText}>Drop Off</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </ScrollView>


                    )}


                </View>
            )}
        </>

    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    noBookingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        marginTop: 150
    },
    noBookingImage: {
        width: 150,
        height: 150,
        marginBottom: 20,
    },
    noBookingText: {
        fontSize: 18,
        color: '#555',
    },
    mapContainer: {
        height: 400,
        width: '100%',
        backgroundColor: '#f0f0f0',
    },
    stepIndicatorContainer: {
        marginVertical: 20,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dropOffButton: {
        marginTop: 20,
        width: '80%',
        alignSelf: 'center',
    },
    touchableOpacity: {
        backgroundColor: '#D02620',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dropOffButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    loadingContainer: {
        position: 'absolute',
        top: '50%',
        left: '50%',
    },
    thankYouText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: "#D02620"
    },
});
