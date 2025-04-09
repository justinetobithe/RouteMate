import React, { useState, useEffect, useRef } from "react";
import {
    View,
    StyleSheet,
    SafeAreaView,
    Image,
    VirtualizedList,
    Text,
} from "react-native";
// import { mapboxToken } from "../constants/mapbox-token";
import { locationPermission } from "../utils/functions";
import { showMessage } from "react-native-flash-message";
import Mapbox from "@rnmapbox/maps";
import coordinates from "../api/coordinates.json";
import AddressPickup from "../components/AddressPickup";
import imagePath from "../constants/imagePath";
import CenterCamera from "../components/CenterCamera";
import { isset } from "../utils/functions";
import * as turf from "@turf/turf";
import { store } from "../store";
import { MAPBOX_TOKEN } from '@env';

Mapbox.setAccessToken(MAPBOX_TOKEN);

const getItem = (data, index) => data[index];

const getItemCount = _data => _data.length;

const Item = ({ id, title, color }) => {
    const [isSelected, setSelection] = useState(false);
    const { addSelectedRoute, removeSelectedRoute } = store(state => state);

    useEffect(() => {
        if (isSelected) {
            addSelectedRoute(id);
        } else {
            removeSelectedRoute(id);
        }
    }, [isSelected]);

    return (
        <View style={styles.suggestedContainer}>
            <Text style={styles.label}>{title}</Text>
            <View style={{ backgroundColor: color, width: 15, height: 15 }} />
        </View>
    );
};

const ChooseLocation = props => {
    const [origin, setOrigin] = useState(null);
    const [inputOrigin, setInputOrigin] = useState(null);
    const [destination, setDestination] = useState(null);
    const [locationChanged, setLocationChanged] = useState(false);

    const [centerCoordinate, setCenterCoordinate] = useState([
        125.54745258460646, 7.128743829681128,
    ]);
    const [closestCoordinates, setClosestCoordinates] = useState([]);

    // ON ORIGIN CHANGES
    useEffect(() => {
        if (origin && isset(origin.latitude) && isset(origin.longitude)) {
            setCenterCoordinate([origin.longitude, origin.latitude]);
        }
    }, [origin]);

    useEffect(() => {
        if (
            (!closestCoordinates.length || locationChanged) &&
            origin &&
            isset(origin.longitude) &&
            isset(origin.latitude) &&
            destination &&
            isset(destination.longitude) &&
            isset(destination.latitude)
        ) {
            console.log("CHANGED...");
            let turfLines = [];
            let ptOrigin = turf.point([origin.longitude, origin.latitude]);
            let ptDestination = turf.point([
                destination.longitude,
                destination.latitude,
            ]);
            let originDistances = [];
            let destinationDistances = [];
            coordinates.forEach(v => {
                turfLines.push(...v.geometry.coordinates);

                let line = turf.lineString(v.geometry.coordinates);
                let originDistance = turf.pointToLineDistance(ptOrigin, line);
                let destinationDistance = turf.pointToLineDistance(ptDestination, line);
                originDistances.push({ id: v.id, distance: originDistance });
                destinationDistances.push({ id: v.id, distance: destinationDistance });
            });
            let closestRoutes = [];
            originDistances = originDistances
                .sort((a, b) => {
                    if (a.distance > b.distance) {
                        return 1;
                    }
                    if (a.distance < b.distance) {
                        return -1;
                    }
                    return 0; // a must be equal to b
                })
                .filter((_, index) => index < 6);
            destinationDistances = destinationDistances
                .sort((a, b) => {
                    if (a.distance > b.distance) {
                        return 1;
                    }
                    if (a.distance < b.distance) {
                        return -1;
                    }
                    return 0; // a must be equal to b
                })
                .filter((_, index) => index < 6);
            originDistances.forEach(v => {
                if (destinationDistances.some(item => item.id == v.id)) {
                    closestRoutes.push(v.id);
                }
            });

            if (!closestRoutes.length) {
                closestRoutes = originDistances.map(item => item.id);
            }

            // SET CLOSEST ROUTE
            setClosestCoordinates(closestRoutes);
            setLocationChanged(false);
        }
    }, [origin, destination]);

    useEffect(() => {
        console.log("CLOSEST COORDINATES: ", closestCoordinates);
    }, [closestCoordinates]);

    const camera = useRef(null);
    const userLocationRef = useRef(null);

    const getLiveLocation = async () => {
        const locPermissionDenied = await locationPermission();
        if (locPermissionDenied) {
            showMessage({
                message: "Permission denied",
                type: "danger",
            });
        }
    };

    useEffect(() => {
        const interval = setInterval(() => {
            getLiveLocation();
        }, 6000);

        return () => clearInterval(interval);
    }, []);

    const getOriginCoordinate = (lat, lng, zipCode, cityText) => {
        console.log("lat==>>>", lat);
        console.log("lng==>>>", lng);
        console.log("zip code==>>>", zipCode);
        console.log("city texts", cityText);
        setOrigin({
            longitude: lng,
            latitude: lat,
        });
        setInputOrigin({
            longitude: lng,
            latitude: lat,
        });
        setLocationChanged(true);
    };

    const getDestinationCoordinate = (lat, lng, zipCode, cityText) => {
        console.log("lat==>>>", lat);
        console.log("lng==>>>", lng);
        console.log("zip code==>>>", zipCode);
        console.log("city texts", cityText);
        setDestination({
            longitude: lng,
            latitude: lat,
        });
        setLocationChanged(true);
    };

    const onSetCurrentLocation = () => {
        setInputOrigin(null);
    };

    return (
        <View style={styles.container}>
            <SafeAreaView
                style={{
                    zIndex: 1,
                    position: "absolute",
                    width: "100%",
                }}>
                <AddressPickup
                    placheholderText="Enter Location..."
                    label="Current Location"
                    fetchAddress={getOriginCoordinate}
                    setCurrentIcon={true}
                    onSetCurrentLocation={onSetCurrentLocation}
                    onChangeText={value => {
                        if (!value.length) {
                            setInputOrigin(null);
                            setClosestCoordinates([]);
                        }
                    }}
                />
                <AddressPickup
                    placheholderText="Enter Destination..."
                    label="Destination"
                    fetchAddress={getDestinationCoordinate}
                    onChangeText={value => {
                        if (!value.length) {
                            setDestination(null);
                            setClosestCoordinates([]);
                        }
                    }}
                />

                {closestCoordinates.length ? (
                    <View
                        style={{
                            position: "relative",
                            flex: 1,
                            backgroundColor: "white",
                        }}>
                        <Text style={{ textAlign: "center", marginBottom: 15, fontSize: 18, color: "#000" }}>
                            Resulting Routes
                        </Text>
                        <VirtualizedList
                            data={coordinates.filter(item =>
                                closestCoordinates.includes(item.id),
                            )}
                            renderItem={({ item }) => (
                                <Item
                                    id={item.id}
                                    title={item.properties.name}
                                    color={item.properties.color}
                                />
                            )}
                            keyExtractor={item => item.id}
                            getItemCount={getItemCount}
                            getItem={getItem}
                        />
                    </View>
                ) : null}
            </SafeAreaView>

            <SafeAreaView
                style={{
                    flex: 1,
                    position: "absolute",
                    top: 0,
                    height: "100%",
                    width: "100%",
                }}>
                <Mapbox.MapView
                    style={{ flex: 1 }}
                    scaleBarEnabled={false}
                    styleURL="mapbox://styles/mapbox/streets-v11">
                    {!destination ? (
                        <Mapbox.Camera
                            zoomLevel={10}
                            centerCoordinate={centerCoordinate}
                            ref={camera}
                        />
                    ) : null}
                    {inputOrigin && origin ? (
                        <Mapbox.MarkerView
                            coordinate={[inputOrigin.longitude, inputOrigin.latitude]}
                            id="origin">
                            <Image
                                source={imagePath.icCurLoc}
                                style={{
                                    flex: 1,
                                    resizeMode: "contain",
                                    width: 25,
                                    height: 25,
                                }}
                            />
                        </Mapbox.MarkerView>
                    ) : (
                        <Mapbox.UserLocation
                            ref={userLocationRef}
                            onUpdate={location =>
                                setOrigin({
                                    longitude: inputOrigin
                                        ? inputOrigin.longitude
                                        : location.coords.longitude,
                                    latitude: inputOrigin
                                        ? inputOrigin.latitude
                                        : location.coords.latitude,
                                })
                            }
                        />
                    )}
                    {destination ? (
                        <Mapbox.MarkerView
                            coordinate={[destination.longitude, destination.latitude]}
                            id="destination">
                            <Image
                                source={imagePath.greenMarker}
                                style={{
                                    flex: 1,
                                    resizeMode: "contain",
                                    width: 25,
                                    height: 25,
                                }}
                            />
                        </Mapbox.MarkerView>
                    ) : null}
                    {coordinates.length && closestCoordinates.length
                        ? coordinates
                            .filter(item => closestCoordinates.includes(item.id))
                            .map((item, index) => (
                                <Mapbox.ShapeSource
                                    id={`line${item.id}`}
                                    shape={item}
                                    key={index}>
                                    <Mapbox.LineLayer
                                        id={`lineLayer${item.id}`}
                                        style={{
                                            lineColor: closestCoordinates.includes(item.id)
                                                ? item.properties.color
                                                : "transparent",
                                            lineWidth: 2,
                                        }}
                                    />
                                </Mapbox.ShapeSource>
                            ))
                        : null}
                </Mapbox.MapView>
            </SafeAreaView>
            <CenterCamera camera={camera} coordinate={centerCoordinate} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: "relative",
    },
    suggestedContainer: {
        flexDirection: "row",
        marginBottom: 5,
        paddingVertical: 5,
        paddingHorizontal: 15,
    },
    label: {
        alignSelf: "center",
        flex: 1,
    },
});

export default ChooseLocation;
