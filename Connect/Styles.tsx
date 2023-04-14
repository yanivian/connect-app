import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    sectionContainer: {
        paddingVertical: 12,
        paddingHorizontal: 32,
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
    highlight: {
        fontWeight: '600',
    },
    code: {
        fontFamily: 'monospaced',
    },
    textInput: {
        fontSize: 16,
        letterSpacing: 1,
        lineHeight: 21,
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 4,
        height: 48,
        marginBottom: 12,
    },
});

export default styles;