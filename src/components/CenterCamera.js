import React from "react";
import imagePath from "../constants/imagePath";
import { TouchableOpacity, Image } from "react-native";

export default function CenterCamera({ camera, coordinate }) {
    const onCenter = () => {
        camera.current?.setCamera({
            centerCoordinate: coordinate,
        });
    };

    return (
        <TouchableOpacity
            style={{
                position: "absolute",
                bottom: 0,
                right: 0,
            }}
            onPress={onCenter}>
            <Image source={imagePath.greenIndicator} />
        </TouchableOpacity>
    );
}
