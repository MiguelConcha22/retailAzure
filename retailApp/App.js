import React, { Component } from 'react';
import {
  ActivityIndicator,
  Button,
  Clipboard,
  Image,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';
import { Constants, ImagePicker, Permissions } from 'expo';

import { Camera } from 'expo-camera';

export default class App extends Component {
  state = {
    image: null,
    uploading: false,
    cameraType: 'front',
    mirror: true,
  };

  render() {
    let {
      image
    } = this.state;

    return (


      <View style={styles.container}>
      <Camera ref={ref => { this.camera = ref; display: 'none'; }} type={this.state.cameraType}
mirrorImage={this.state.mirrorMode}>
      </Camera>
        <StatusBar barStyle="default" />

        {/*}
        <Text
          style={styles.exampleText}>
          Example: Upload ImagePicker result
        </Text>
        {*/}

        <Button
          onPress={this._pickImage}
          title="Pick an image from camera roll"
        />

        <Button onPress={this._takePhoto} title="Take a photo" />

        <Button onPress={this._pinera} title="piñera" />
        <Button onPress={this._snap} title="instantanea" />

        {this._maybeRenderImage()}
        {this._maybeRenderUploadingOverlay()}

      </View>
    );
  }

  _maybeRenderUploadingOverlay = () => {
    if (this.state.uploading) {
      return (
        <View
          style={[StyleSheet.absoluteFill, styles.maybeRenderUploading]}>
          <ActivityIndicator color="#fff" size="large" />
        </View>
      );
    }
  };

  _maybeRenderImage = () => {
    let {
      image
    } = this.state;

    if (!image) {
      return;
    }

    return (
      <View
        style={styles.maybeRenderContainer}>
        <View
          style={styles.maybeRenderImageContainer}>
          <Image source={{ uri: image }} style={styles.maybeRenderImage} />
        </View>

        <Text
          onPress={this._copyToClipboard}
          onLongPress={this._share}
          style={styles.maybeRenderImageText}
          style={{display: 'none'}}>
          {image}
        </Text>
      </View>
    );
  };

  _share = () => {
    Share.share({
      message: this.state.image,
      title: 'Check out this photo',
      url: this.state.image,
    });
  };

  _copyToClipboard = () => {
    Clipboard.setString(this.state.image);
    alert('Copied image URL to clipboard');
  };

  _takePhoto = async () => {
    const {
      status: cameraPerm
    } = await Permissions.askAsync(Permissions.CAMERA);

    const {
      status: cameraRollPerm
    } = await Permissions.askAsync(Permissions.CAMERA_ROLL);

    // only if user allows permission to camera AND camera roll
    if (cameraPerm === 'granted' && cameraRollPerm === 'granted') {
      let pickerResult = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
      });

      this._handleImagePicked(pickerResult);
    }
  };

  _pickImage = async () => {
    const {
      status: cameraRollPerm
    } = await Permissions.askAsync(Permissions.CAMERA_ROLL);

    // only if user allows permission to camera roll
    if (cameraRollPerm === 'granted') {
      let pickerResult = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3],
      });

      this._handleImagePicked(pickerResult);
    }
  };

  _handleImagePicked = async pickerResult => {
    let uploadResponse, uploadResult, azureResponse, azureResult, atributos;

    try {
      this.setState({
        uploading: true
      });

      if (!pickerResult.cancelled) {
        uploadResponse = await uploadImageAsync(pickerResult.uri);
        uploadResult = await uploadResponse.json();
        //console.log(uploadResult);
        azureResponse = await uploadAzure(uploadResult.location);
        azureResult = await azureResponse.json();
        atributos = azureResult[0].faceAttributes;
        //console.log(azureResult)
        this._publicidad(atributos);
        //console.log(azureResult[0].faceAttributes.age);

        /*this.setState({
          image: uploadResult.location
        });*/
      }
    } catch (e) {
      console.log({ uploadResponse });
      console.log({ uploadResult });
      console.log({ e });
      alert('Upload failed, sorry :(');
    } finally {
      this.setState({
        uploading: false
      });
    }
  };

  _snap = async () => {          //BORRAR
    if (this.camera) {
      let photo = await this.camera.takePictureAsync();
      //console.log(photo);
      this._handleImagePicked(photo);
    }
  };

  _pinera = async () => {                                    //BORRAR
    let respuesta, resultado;
    let fotoPinera = "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Retrato_Oficial_Presidente_Pi%C3%B1era_2018.jpg/250px-Retrato_Oficial_Presidente_Pi%C3%B1era_2018.jpg";

    respuesta = await uploadAzure(fotoPinera);
    resultado = await respuesta.json();
    console.log(resultado);
    this.setState({
      image: fotoPinera
    });
  };

  //Elige la publicidad segun los atributos encontrados
  _publicidad = async atributos => {
    console.log(atributos);
    if((atributos.age < 26) && (atributos.gender == 'male')){
      this.setState({ image: 'https://pbs.twimg.com/media/DihXOLAX0AA3seH.jpg' });
    }else {
      this.setState({ image: 'https://static.mercadoshops.com/samsung-galaxy-s10-plus-8gb-ram-128gb-rom-hasta-12-cuotas-sin-intereses_iZ1057328292XvZgrandeXpZ1XfZ186957953-38217693726-6XsZ186957953xIM.jpg' });
    }
  };
}

async function uploadAzure(direccion) {                     //BORRAR
  let apiUrl = 'https://southcentralus.api.cognitive.microsoft.com/face/v1.0/detect?returnFaceId=true&returnFaceLandmarks=false&returnFaceAttributes=age,gender,facialHair,glasses,makeup,emotion&recognitionModel=recognition_01&returnRecognitionModel=false&detectionModel=detection_01';
  //console.log(direccion);
  let options = {
    method: 'POST',
    //body: '{"url": "}',
    body: '{"url": ' + '"' + direccion + '"}',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Ocp-Apim-Subscription-Key': '4efcce9c4bc94272897bc3fd0b72ddeb'
    },
  };

  return fetch(apiUrl, options);
}

async function uploadImageAsync(uri) {
  //let apiUrl = 'https://southcentralus.api.cognitive.microsoft.com/face/v1.0/detect?returnFaceId=true&returnFaceLandmarks=false&recognitionModel=recognition_01&returnRecognitionModel=false&detectionModel=detection_01';
  let apiUrl = 'https://file-upload-example-backend-dkhqoilqqn.now.sh/upload';

  // Note:
  // Uncomment this if you want to experiment with local server
  //
  // if (Constants.isDevice) {
  //   apiUrl = `https://your-ngrok-subdomain.ngrok.io/upload`;
  // } else {
  //   apiUrl = `http://localhost:3000/upload`
  // }

  let uriParts = uri.split('.');
  let fileType = uriParts[uriParts.length - 1];

  let formData = new FormData();
  formData.append('photo', {
    uri,
    name: `photo.${fileType}`,
    type: `image/${fileType}`,
  });

  let options = {
    method: 'POST',
    body: formData,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'multipart/form-data',
      'Ocp-Apim-Subscription-Key': '4efcce9c4bc94272897bc3fd0b72ddeb'
    },
  };

  return fetch(apiUrl, options);
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 4,
    justifyContent: 'center',
  },
  exampleText: {
    fontSize: 20,
    marginBottom: 20,
    marginHorizontal: 15,
    textAlign: 'center',
  },
  maybeRenderUploading: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
  },
  maybeRenderContainer: {
    borderRadius: 3,
    elevation: 2,
    marginTop: 30,
    shadowColor: 'rgba(0,0,0,1)',
    shadowOpacity: 0.2,
    shadowOffset: {
      height: 4,
      width: 4,
    },
    shadowRadius: 5,
    width: Dimensions.get('screen').width,
  },
  maybeRenderImageContainer: {
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    overflow: 'hidden',
  },
  maybeRenderImage: {
    height: Dimensions.get('screen').height/2,
    width: Dimensions.get('screen').width,
  },
  maybeRenderImageText: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  }
});
