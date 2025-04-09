// import React, { useState } from 'react';
// import { View, Text, StyleSheet, Image } from 'react-native';
// import { Spinner, Button, AlertDialog, NativeBaseProvider, Center } from 'native-base';
// import FontAwesome from 'react-native-vector-icons/FontAwesome';
// import useTripRatingStore from '../store/tripRatingStore';
// import { useForm } from 'react-hook-form';
// import useAuthStore from '../store/authStore';
// import Toast from './Toast';

// const ThankYouPage = ({ trip }) => {
//     const [isDialogOpen, setIsDialogOpen] = useState(false);
//     const [rating, setRating] = useState(0);
//     const [isSubmitted, setIsSubmitted] = useState(false);
//     const cancelRef = React.useRef(null);
//     const { addTripRating } = useTripRatingStore();
//     const { showToast } = Toast();
//     const { userInfo } = useAuthStore();

//     const { control, handleSubmit, formState: { errors }, reset } = useForm({
//         defaultValues: {}
//     });

//     const handleDialogClose = () => {
//         setIsDialogOpen(false);
//     };

//     const handleRatingClick = (index) => {
//         setRating(index + 1);
//     };

//     const onSubmit = async (data) => {
//         if (rating === 0) {
//             showToast("Please select a rating before submitting", "danger");
//             return;
//         }

//         setIsSubmitted(true);
//         const formData = {
//             trip_id: trip.id,
//             user_id: userInfo.id,
//             rating: rating,
//         };

//         try {
//             await addTripRating(formData);
//             setIsDialogOpen(false);
//             showToast("Thank you for your feedback!", "success");
//         } catch (error) {
//             showToast("Something went wrong. Please try again.", "danger");
//         } finally {
//             setIsSubmitted(false);
//         }
//     };

//     return (
//         <Center style={styles.container}>
//             <Text style={styles.thankYouText}>
//                 Thank you for your feedback on the trip from {trip.terminal_from.name} to {trip.terminal_to.name}!
//             </Text>

//             <Text style={styles.ratingText}>Rate this trip:</Text>

//             <View style={styles.starContainer}>
//                 {Array.from({ length: 5 }).map((_, index) => (
//                     <Button
//                         key={index}
//                         style={styles.starButton}
//                         onPress={() => handleRatingClick(index)}
//                         isDisabled={isSubmitted}
//                     >
//                         <FontAwesome
//                             name={rating > index ? "star" : "star-o"}
//                             size={40}
//                             color={rating > index ? "#FFD700" : "#ccc"}
//                         />
//                     </Button>
//                 ))}
//             </View>

//             <Text style={styles.descriptionText}>
//                 Your opinion matters to us.
//             </Text>

//             <Image source={require('../assets/img/thank-you.png')} style={styles.icon} />

//             <AlertDialog
//                 leastDestructiveRef={cancelRef}
//                 isOpen={isDialogOpen}
//                 onClose={handleDialogClose}
//             >
//                 <AlertDialog.Content>
//                     <AlertDialog.CloseButton />
//                     <AlertDialog.Header>Thank You!</AlertDialog.Header>
//                     <AlertDialog.Body>
//                         Thank you for your feedback! Your review helps us improve our services.
//                     </AlertDialog.Body>
//                     <AlertDialog.Footer>
//                         <Button.Group space={2}>
//                             <Button
//                                 variant="unstyled"
//                                 colorScheme="coolGray"
//                                 onPress={handleDialogClose}
//                                 ref={cancelRef}
//                             >
//                                 Cancel
//                             </Button>
//                             <Button
//                                 colorScheme="blue"
//                                 onPress={handleSubmit(onSubmit)}
//                                 isDisabled={rating === 0}
//                             >
//                                 {isSubmitted ? (
//                                     <Spinner color="white" size="sm" />
//                                 ) : (
//                                     "Submit"
//                                 )}
//                             </Button>
//                         </Button.Group>
//                     </AlertDialog.Footer>
//                 </AlertDialog.Content>
//             </AlertDialog>
//         </Center>
//     );
// };

// const styles = StyleSheet.create({
//     // container: {
//     //     flex: 1,
//     //     justifyContent: 'center',
//     //     alignItems: 'center',
//     //     padding: 20,
//     //     backgroundColor: '#f8f8f8',
//     // },
//     thankYouText: {
//         fontSize: 24,
//         fontWeight: 'bold',
//         marginBottom: 20,
//         textAlign: 'center',
//         color: "#D02620"
//     },
//     ratingText: {
//         fontSize: 18,
//         marginBottom: 10,
//     },
//     starContainer: {
//         flexDirection: 'row',
//         justifyContent: 'center',
//         marginBottom: 20,
//     },
//     starButton: {
//         margin: 5,
//     },
//     descriptionText: {
//         fontSize: 16,
//         textAlign: 'center',
//         marginBottom: 20,
//     },
//     icon: {
//         width: 60,
//         height: 60,
//         marginTop: 20,
//     },
// });

// export default ThankYouPage;
