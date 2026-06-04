import {StyleSheet} from "react-native";

export default function styleTracker() {

    // Ne retourne rien
    return null;
}

export const getStyles = () => StyleSheet.create({
    container: {
        borderRadius: 12,
        padding: 16,
        paddingBottom:2,
        paddingTop:8,
        marginVertical: 0,

        borderWidth: 1,
    }

});
