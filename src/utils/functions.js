import { PermissionsAndroid } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { showMessage } from "react-native-flash-message";

/* export const locationPermission = () =>
  new Promise(async (resolve, reject) => {
    return PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    )
      .then(granted => {
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          resolve("granted");
        }
        return reject("Location Permission denied");
      })
      .catch(error => {
        console.log("Ask Location permission error: ", error);
        return reject(error);
      });
  }); */
export const locationPermission = async () => {
    try {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
                title: "MapuWhere Location Permission",
                message: "MapuWhere needs to access location",
                buttonNeutral: "Ask Me Later",
                buttonNegative: "Cancel",
                buttonPositive: "OK",
            },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            // console.log("You can use the location");
        } else {
            showMessage({
                message: "Location Permission denied",
                type: "danger",
            });
        }
    } catch (err) {
        showMessage({
            message: err,
            type: "danger",
        });
    }
};

export const storeLocalStorageData = async (key, value) => {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
};

export const removeLocalStorageData = async key => {
    try {
        await AsyncStorage.removeItem(key);
    } catch (e) { }
};

export const isset = value => typeof value !== "undefined";
