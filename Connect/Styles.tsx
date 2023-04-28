import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  safeArea: {
    height: '100%',
    flexDirection: 'column',
    flex: 1,
  },
  section: {
    paddingBottom: 12,
    borderRadius: 12,
    margin: 12,
  },
  sectionTitle: {
    paddingLeft: 12,
    paddingBottom: 12,
  },
  sectionContent: {
    paddingHorizontal: 12,
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
  lottieLoading: {
    height: 150,
    justifyContent: "center",
    alignItems: "center",
  },
})

export default styles