import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  safeArea: {
    height: '100%',
    flexDirection: 'column',
    flex: 1,
  },
  sectionContainer: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    margin: 12,
  },
  sectionTitle: {
    paddingBottom: 12,
  },
  sectionContent: {
  },
  button: {
  },
  buttonLabel: {
    fontSize: 16,
  },
  anchorButtonLabel: {
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  text: {
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
  },
  profileImageContainer: {
    width: 118,
    height: 118,
    marginRight: 12,
    marginTop: 6,
    borderRadius: 4,
    overflow: 'hidden',
  },
  profileImage: {
    width: 118,
    height: 118,
  },
  lottieContainer: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  lottieLoading: {
    marginTop: 40,
    width: 200,
  },
})

export default styles