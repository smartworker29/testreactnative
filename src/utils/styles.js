import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    backIcon: {marginLeft: 10, height: 21},
    headerLeft: {width: 50, height: 44, justifyContent: "center"},
    headerRight: {width: 50, height: 44, flexDirection: "row", justifyContent: "center", alignItems: "center"},
    headerStyle: {backgroundColor: "#F9F9F9"},
    headerTitleStyle: {
        fontSize: 17,
        fontWeight: "600",
        fontStyle: "normal",
        lineHeight: 22,
        letterSpacing: -0.41,
        color: "#000000"
    },
    navBarIconArea: {width: 48, height: 48, justifyContent: "center", alignItems: "center"},
    navBarIconAreaLeft: {
        width: 100,
        height: 48,
        paddingLeft: 14,
        justifyContent: "center",
        alignItems: "flex-start"
    },
    navBarIconAreaRight: {
        width: 100,
        height: 48,
        paddingRight: 14,
        justifyContent: "center",
        alignItems: "flex-end"

    },

    pd16: {
        paddingHorizontal: 16
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
    }
});

export default styles;