import React from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import RoutesScreen from "../screens/RoutesScreen";
import ChooseLocation from "../screens/ChooseLocation";
import coordinates from "../api/coordinates.json";
import { store } from "../store";

const Tab = createMaterialTopTabNavigator();

export default function TopTabNavigator() {
    const { selected_routes } = store(state => state);

    return (
        <Tab.Navigator
            screenOptions={{
                swipeEnabled: false,
            }}>
            <Tab.Screen
                name="routes"
                component={RoutesScreen}
                options={{
                    tabBarLabel: `Routes (${selected_routes.length}/${coordinates.length})`,
                }}
            />
            <Tab.Screen
                name="chooseLocation"
                component={ChooseLocation}
                options={{
                    tabBarLabel: "Custom",
                }}
            />
        </Tab.Navigator>
    );
}
