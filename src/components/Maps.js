import React, { useState, useEffect, useRef } from 'react'
import { View, StyleSheet, PermissionsAndroid, TouchableOpacity, Image } from 'react-native';
import { Spinner } from 'native-base';
import useTerminalStore from '../store/terminalStore';
import Mapbox from '@rnmapbox/maps';
import Geolocation from 'react-native-geolocation-service';
import coordinatesData from '../coordinates.json';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import vehicleImage from '../assets/img/vehicle.png';
import icCurrentLocation from '../assets/img/Oval.png';

const haversine = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 1000;
};

export default function Maps({ fromTerminal, toTerminal, currentBooking }) {

    const [polylineCoordinates, setPolylineCoordinates] = useState([]);
    const [currentLocation, setCurrentLocation] = useState(null);
    const { terminals, fetchTerminals } = useTerminalStore();
    const [isRotated, setIsRotated] = useState(false);
    const [locationEnabled, setLocationEnabled] = useState(false);
    const [midCoordinates, setMidCoordinates] = useState([0, 0]);
    const [showVehicleImage, setShowVehicleImage] = useState(false);
    const [loading, setLoading] = useState(false);

    const cameraRef = useRef(null);

    useEffect(() => {
        Mapbox.setTelemetryEnabled(false);
        checkLocationPermission();
    }, []);

    console.log("midcoordinates", midCoordinates);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                await new Promise((resolve) => setTimeout(resolve, 1000));
                console.log('Data loaded');
            } catch (error) {
                console.error('Error loading data', error);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    useEffect(() => {
        fetchTerminals();
    }, [fetchTerminals]);

    const handleRegionDidChange = (region) => {
        const bearing = region.properties.bearing;
        setIsRotated(bearing !== 0);
    };

    useEffect(() => {
        if (cameraRef.current) {
            cameraRef.current.setCamera({
                centerCoordinate: currentLocation,
                zoomLevel: 9,
                animationMode: 'flyTo',
                animationDuration: 1000,
                bearing: 0,
            });
        }
    }, [currentLocation]);

    useEffect(() => {
        setLoading(true);

        if (currentLocation && fromTerminal) {
            const distance = haversine(
                currentLocation[1], currentLocation[0],
                parseFloat(fromTerminal.latitude), parseFloat(fromTerminal.longitude)
            );
            setShowVehicleImage(distance < 100);
        }

        setLoading(false);
    }, [currentLocation, fromTerminal]);


    const checkLocationPermission = async () => {
        if (Platform.OS === 'android') {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                    title: "Location Access Required",
                    message: "This app needs to access your location to show your current position.",
                    buttonPositive: "OK"
                }
            );

            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                getLocation();
            } else {
                Alert.alert("Permission Denied", "Location access is required to show your current location.");
            }
        }
    };

    const getLocation = () => {
        Geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setCurrentLocation([longitude, latitude]);
                setLocationEnabled(true);
            },
            (error) => {
                Alert.alert("Error", "Unable to retrieve your location. Please enable location services.");
                console.log(error);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
    };

    useEffect(() => {
        if (fromTerminal && toTerminal) {
            const selectedTrip = coordinatesData.features.find(feature =>
                feature.properties.from === fromTerminal.id &&
                feature.properties.to === toTerminal.id
            );

            if (selectedTrip) {
                setPolylineCoordinates(selectedTrip.geometry.coordinates);
            }
        }
    }, [fromTerminal, toTerminal]);

    const handleRecenter = () => {
        if (currentLocation && cameraRef.current) {
            cameraRef.current.setCamera({
                centerCoordinate: currentLocation,
                zoomLevel: 12,
                animationMode: 'flyTo',
                animationDuration: 1000,
                bearing: 0,
            });

            setIsRotated(false);
        } else {
            Alert.alert("Location not available", "Your current location is not available yet.");
        }
    };

    return (
        <>
            {loading ? (
                <View style={styles.loadingContainer}>
                    <Spinner size="large" color="#0000ff" />
                </View>
            ) : (
                <Mapbox.MapView
                    style={styles.map}
                    centerCoordinate={currentLocation}
                    accessToken={'sk.eyJ1IjoianVzdGluZXRvYml0aGUiLCJhIjoiY20zeXQ4NGhmMXBpdzJsc2NmdzM5b2h3ayJ9.Qwk8VK_o0gLtVrXcpOl9aw'}
                    onMapIdle={handleRegionDidChange}
                >
                    <Mapbox.Camera
                        ref={cameraRef}
                        zoomLevel={12}
                        animationMode="move"
                        animationDuration={1000}
                    />

                    {polylineCoordinates.length > 0 && (
                        <Mapbox.ShapeSource
                            id="routeSource"
                            shape={{
                                type: 'Feature',
                                geometry: {
                                    type: 'LineString',
                                    coordinates: polylineCoordinates,
                                },
                            }}
                        >
                            <Mapbox.LineLayer
                                id="routeLine"
                                style={{
                                    lineColor: '#ff0000',
                                    lineWidth: 5,
                                }}
                            />
                        </Mapbox.ShapeSource>
                    )}

                    {terminals.map((terminal) => (
                        <Mapbox.PointAnnotation
                            key={terminal.id}
                            id={`terminal-${terminal.id}`}
                            coordinate={[parseFloat(terminal.longitude), parseFloat(terminal.latitude)]}
                        >
                            <View style={styles.markerContainer}>
                                <View style={styles.marker} />
                            </View>
                            <Mapbox.Callout title={terminal.name} />
                        </Mapbox.PointAnnotation>
                    ))}

                    {currentLocation && (
                        <Mapbox.PointAnnotation id="currentLocation" coordinate={currentLocation}>
                            <View style={styles.userMarkerContainer}>
                                <Image source={icCurrentLocation} style={styles.markerImage} />
                                {showVehicleImage && currentBooking && (
                                    <Image source={vehicleImage} style={styles.markerImage} />
                                )}
                            </View>

                            <Mapbox.Callout title="You are here" />
                        </Mapbox.PointAnnotation>
                    )}

                </Mapbox.MapView>
            )}
            {isRotated && (
                <TouchableOpacity style={styles.recenterButton} onPress={handleRecenter}>
                    <FontAwesome name="location-arrow" size={22} color={"#000"} />
                </TouchableOpacity>
            )}

        </>
    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
    enableLocationText: {
        position: 'absolute',
        top: 50,
        left: 20,
        right: 20,
        color: 'red',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        padding: 10,
        borderRadius: 5,
    },
    recenterButton: {
        position: 'absolute',
        top: 20,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 5,
        elevation: 5,
        borderRadius: 45,
    },
    recenterButtonText: {
        color: '#000',
        fontSize: 14,
        fontWeight: 'bold',
        marginLeft: 5,
    },
    markerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    marker: {
        width: 20,
        height: 20,
        backgroundColor: '#ff0000',
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2,
    },
    userMarkerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    userMarker: {
        width: 15,
        height: 15,
        backgroundColor: '#0000ff',
        borderRadius: 7.5,
        borderColor: '#fff',
        borderWidth: 2,
    },
    markerImage: {
        width: 30,
        height: 30,
    },
    loadingContainer: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -50 }, { translateY: -50 }],
        zIndex: 999,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        padding: 20,
        borderRadius: 10,
    },
});
