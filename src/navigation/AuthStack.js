import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import DrawerStack from './DrawerStack';
import useAuthStore from '../store/authStore';

const Stack = createStackNavigator();

export default function AuthStack() {

    const { userInfo } = useAuthStore();

    return (
        <Stack.Navigator>
            <Stack.Screen
                name="HomeScreen"
                component={DrawerStack}
                options={{ headerShown: false }}
            />

        </Stack.Navigator>
    )
}
