// Import the necessary modules
import React from 'react';
import { Button, View } from 'react-native';
import { Camera } from 'expo-camera';
import * as Location from 'expo-location';
import { Input } from 'react-native-elements';
import * as FileSystem from 'expo-file-system';

// Define the main App component
export default class App extends React.Component {
  // Create a reference for the camera. This will be used to trigger camera actions.
  cameraRef = React.createRef();

  // Initialize the state. The state will hold an array of photo-notes (photoNotes) and the note that is currently being written (currentNote).
  state = {
    photoNotes: [],
    currentNote: '',
    hasCameraPermission: null,
  };

  async componentDidMount() {
    // request camera permissions, then update state with those permissions
    const { status } = await Camera.requestPermissionsAsync();
  }

  // Define a function to save a photo-note. This function will be triggered when the "Save Picture and Note" button is pressed.
  savePhotoNote = async () => {
    // Deconstruct values from the state
    const { currentNote, photoNotes } = this.state;

    // Take a picture and get the result. The result will be an object that includes the URI of the image file.
    const photo = await this.cameraRef.current.takePictureAsync();

    // Request location permissions. If permissions are not granted, show an alert and return from the function.
    let { status } = await Location.requestPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to access location was denied');
      return;
    }

    // Get the current location. The result will be an object that includes the coordinates and other information about the location.
    let location = await Location.getCurrentPositionAsync({});

    // Create a new photo-note. This will be an object that includes the URI of the photo, the text of the note, and the location.
    const newPhotoNote = { photoUri: photo.uri, note: currentNote, location };

    // Add the new photo-note to the array of photo-notes in the state. Also, reset the current note to an empty string.
    this.setState({ photoNotes: [...photoNotes, newPhotoNote], currentNote: '' });

    // Save the photoNotes array to a file. This will allow the photo-notes to persist even after the app is closed.
    await FileSystem.writeAsStringAsync(FileSystem.documentDirectory + 'photoNotes.json', JSON.stringify([...photoNotes, newPhotoNote]));
  };

  // Define the render method that returns the UI of the component.
  render() {
    return (
      <View style={{ flex: 1 }}>
        {/* The camera component that takes up the full screen. */}
        <Camera style={{ flex: 1 }} ref={this.cameraRef} />
        {/* An input field for writing the note. The value of the field is bound to the currentNote in the state, and when the text changes, currentNote is updated. */}
        <Input
          placeholder='Write a note'
          value={this.state.currentNote}
          onChangeText={currentNote => this.setState({ currentNote })}
        />
        {/* A button for saving the picture and note. When pressed, it triggers the savePhotoNote function. */}
        <Button title="Save Picture and Note" onPress={this.savePhotoNote} />
      </View>
    );
  }
}
