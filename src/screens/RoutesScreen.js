import React, { useEffect, useRef, useState } from "react";
import {
    StyleSheet,
    View,
    SafeAreaView,
    VirtualizedList,
    Text,
    PermissionsAndroid,
    Platform
} from "react-native";
import Mapbox from "@rnmapbox/maps";
import coordinates from "../api/coordinates.json";
import { store } from "../store";
import CheckBox from "@react-native-community/checkbox";
// import { mapboxToken } from "../constants/mapbox-token";
import CenterCamera from "../components/CenterCamera";
import { MAPBOX_TOKEN } from '@env';

Mapbox.setAccessToken(MAPBOX_TOKEN);

const getItem = (data, index) => data[index];

const getItemCount = _data => coordinates.length;

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
        <View style={styles.checkboxContainer}>
            <Text style={styles.label}>{title}</Text>
            <CheckBox
                value={isSelected}
                onValueChange={setSelection}
                tintColors={{ true: color, false: color }}
            />
        </View>
    );
};


export default function RoutesScreen() {
    const { selected_routes } = store(state => state);
    const camera = useRef(null);
    const [centerCoordinate, setCenterCoordinate] = useState([
        125.54745258460646, 7.128743829681128,
    ]);

    useEffect(() => {
        Mapbox.setTelemetryEnabled(false);
    }, []);

    useEffect(() => {
        Mapbox.setTelemetryEnabled(false);

        async function requestLocationPermission() {
            if (Platform.OS === 'android') {
                try {
                    const granted = await PermissionsAndroid.requestMultiple([
                        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
                    ]);

                    if (
                        granted['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED ||
                        granted['android.permission.ACCESS_COARSE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED
                    ) {
                        console.log("✅ Location permission granted");
                    } else {
                        console.warn("❌ Location permission denied");
                    }
                } catch (err) {
                    console.warn("Permission error:", err);
                }
            }
        }

        requestLocationPermission();
    }, []);

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.topCard}>
                <VirtualizedList
                    data={coordinates}
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
            </SafeAreaView>
            <View style={{ flex: 1 }}>
                <Mapbox.MapView
                    style={styles.map}
                    scaleBarEnabled={false}
                    styleURL="mapbox://styles/mapbox/streets-v11"
                    attributionEnabled={false}>
                    <Mapbox.Camera
                        zoomLevel={10}
                        centerCoordinate={centerCoordinate}
                        ref={camera}
                    />
                    {coordinates.length
                        ? coordinates.map((item, index) => (
                            <Mapbox.ShapeSource
                                id={`line${item.id}`}
                                shape={item}
                                key={index}>
                                <Mapbox.LineLayer
                                    id={`lineLayer${item.id}`}
                                    style={{
                                        lineColor: selected_routes.includes(item.id)
                                            ? item.properties.color
                                            : "transparent",
                                        lineWidth: 2,
                                    }}
                                />
                            </Mapbox.ShapeSource>
                        ))
                        : null}
                </Mapbox.MapView>
            </View>
            <CenterCamera camera={camera} coordinate={centerCoordinate} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: "relative",
    },
    topCard: {
        backgroundColor: "white",
        width: "50%",
        padding: 20,
        position: "absolute",
        top: 10,
        right: 10,
        zIndex: 1,
        maxHeight: 270,
    },
    map: {
        flex: 1,
    },
    checkboxContainer: {
        flexDirection: "row",
        marginBottom: 5,
    },
    label: {
        alignSelf: "center",
        flex: 1,
        color: "#000",
    },
});
