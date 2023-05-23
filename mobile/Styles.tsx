import { Dimensions, StyleSheet } from "react-native";

const window = Dimensions.get('window')

const styles = StyleSheet.create({
  fab: {
    bottom: 0,
    margin: 12,
    position: 'absolute',
    right: 0,
  },
  fullscreen: {
    alignItems: undefined,
    height: window.height,
    justifyContent: undefined,
    left: 0,
    margin: 0,
    position: 'absolute',
    top: 0,
    width: window.width,
  },
  safeArea: {
    height: '100%',
    flexDirection: 'column',
    flex: 1,
  },
  section: {
    flexDirection: 'column',
    paddingBottom: 12,
    borderRadius: 12,
    margin: 12,
  },
  sectionTitle: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 60,
    paddingBottom: 12,
    paddingLeft: 12,
  },
  sectionContent: {
    flexDirection: 'column',
    paddingHorizontal: 12,
  },
  button: {
    paddingHorizontal: 12
  },
  buttonLabel: {
    fontSize: 16,
  },
  text: {
    marginBottom: 12,
  },
  textInput: {
    fontSize: 16,
    height: 48,
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