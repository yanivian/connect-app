import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    safeArea: {
        height: '100%',
        padding: 12,
        flexDirection: 'column',
        flex: 1,
    },
    sectionContainer: {
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 12,
        borderWidth: 2,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: '600',
        letterSpacing: 1,
        paddingBottom: 12,
    },
    sectionContent: {
    },
    button: {
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 4,
        height: 48,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 1,
        lineHeight: 21,
    },
    text: {
        fontSize: 16,
        letterSpacing: 1,
        lineHeight: 21,
        marginBottom: 12,
    },
    errorText: {
        fontFamily: 'Courier',
        fontSize: 14,
        letterSpacing: 1,
        lineHeight: 21,
        marginTop: 12,
    },
    textInput: {
        fontSize: 16,
        letterSpacing: 1,
        lineHeight: 21,
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 4,
        height: 48,
    },
    profileImage: {
        width: 108,
        height: 108,
        marginRight: 12,
        borderRadius: 12,
    },
});

export default styles;