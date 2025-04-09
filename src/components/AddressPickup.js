import React, { useState } from "react";
import {
    StyleSheet,
    SafeAreaView,
    Text,
    View,
} from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Input } from "native-base";
import { GOOGLE_MAP_KEY } from "@env";

const AddressPickup = ({
    placheholderText,
    label,
    fetchAddress,
    setCurrentIcon = false,
    onSetCurrentLocation,
    onChangeText,
}) => {
    const onPressAddress = (data, details) => {
        let resLength = details.address_components;
        let zipCode = "";

        let filtersResCity = details.address_components.filter(val => {
            if (val.types.includes("locality") || val.types.includes("sublocality")) {
                return val;
            }
            if (val.types.includes("postal_code")) {
                let postalCode = val.long_name;
                zipCode = postalCode;
            }
            return false;
        });

        let dataTextCityObj =
            filtersResCity.length > 0
                ? filtersResCity[0]
                : details.address_components[
                resLength > 1 ? resLength - 2 : resLength - 1
                ];

        let cityText =
            dataTextCityObj.long_name && dataTextCityObj.long_name.length > 17
                ? dataTextCityObj.short_name
                : dataTextCityObj.long_name;

        const lat = details.geometry.location.lat;
        const lng = details.geometry.location.lng;
        fetchAddress(lat, lng, zipCode, cityText);
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text
                style={{
                    fontSize: 16,
                    marginBottom: 5,
                    paddingHorizontal: 10,
                    borderBottomColor: "black",
                    color: 'black',
                }}>
                {label}
            </Text>
            <GooglePlacesAutocomplete
                placeholder={placheholderText}
                onPress={onPressAddress}
                fetchDetails={true}
                query={{
                    key: GOOGLE_MAP_KEY,
                    language: "en",
                    components: "country:ph",
                }}
                styles={{
                    textInputContainer: styles.containerStyle,
                    textInput: {
                        fontSize: 18,
                        width: "100%",
                        flex: 1,
                        paddingRight: setCurrentIcon ? "80%" : 0,
                        borderWidth: 1,
                        borderColor: "#ccc",
                        borderRadius: 8,
                        paddingVertical: 10,
                        paddingHorizontal: 15,
                        backgroundColor: "#fff",
                        color: "#000",
                    },
                    poweredContainer: {
                        display: "none",
                    },
                }}
                textInputProps={{
                    InputComp: Input,
                    onChangeText: onChangeText,
                    variant: "unstyled",
                    size: "lg",
                }}
            />
            {setCurrentIcon ? (
                <View
                    style={{
                        position: "absolute",
                        top: 40,
                        right: 10,
                        color: "#000",
                    }}>
                    <Icon.Button
                        name="map-marker-radius"
                        backgroundColor="#ccc"
                        onPress={onSetCurrentLocation}
                        borderRadius={50}
                        size={20}
                        iconStyle={{
                            marginRight: 0,
                        }}
                    />
                </View>
            ) : null}
        </SafeAreaView>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
        paddingVertical: 10,
        position: "relative",
    },
    containerStyle: {
        width: '100%',
    },
    textInputWrapper: {
        width: '100%',
        paddingHorizontal: 10,
    },
});

export default AddressPickup;
