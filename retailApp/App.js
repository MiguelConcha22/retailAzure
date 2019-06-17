//global.Buffer = global.Buffer || require('buffer').Buffer
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
import * as SMS from 'expo-sms';

export default class App extends Component {
  state = {
    image: null,
    uploading: false,
    cameraType: 'front',
    mirror: true,
    intervalID: null,
    cajaID: 1,
    producto: null,
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

        <Button onPress={this._pinera} title="piñera" />
        <Button onPress={this._snap} title="instantanea" />
        */}
        <Button
          onPress={this._pickImage}
          title="Pick an image from galery"
        />

        <Button onPress={this._takePhoto} title="Take a photo" />
        <Button onPress={this._startLoop} title="start loop" />
        <Button onPress={this._stopLoop} title="stop loop" />

        {this._maybeRenderImage()}
        {this._maybeRenderUploadingOverlay()}

        <Button onPress={this._sendSMS} title="Comprar en Caja" />

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

  _sendSMS = async () => {
    const { result } = await SMS.sendSMSAsync('+56991792302', 'Dejar el producto: ' + this.state.producto + ' en la caja: ' + this.state.cajaID);
    console.log('+56991792302', 'Dejar el producto: ' + this.state.producto + ' en la caja: ' + this.state.cajaID);
    /*
    let buff = new Buffer(sid + ':' + secret);
    let base64auth = buff.toString('base64');

    //let apiUrl = 'https://demo.twilio.com/welcome/sms/reply/';
    let apiUrl = 'https://api.twilio.com/2010-04-01/Accounts/' + accountSid + '/Messages.json';
    let options = {
      method: 'POST',
      body: '{"twilioTest"}',
      from: '+56937610088',
      to: '+56991792302',
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Basic '+base64auth,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
    };

    let resultFetch = fetch(apiUrl, options);
    console.log(resultFetch);*/
  };

  _startLoop = async () => {
    this.state.intervalID = setInterval(this._snap, 10000);
  };

  _stopLoop = async () => {
    clearInterval(this.state.intervalID);
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
    if(atributos.gender == 'male'){
      if(atributos.facialHair.beard > 0.5){
        this.setState({ image: 'https://www.barberius.com/2003-large_default/promo-wood-spice-champ%C3%BA-balsamo-y-peine-para-el-cuidado-de-la-barba-de-reuzel.jpg' });
        this.state.producto = 'Cepillo + Cera para Barba';
      }else if(atributos.glasses == 'Sunglasses'){
        this.setState({ image: 'https://m.media-amazon.com/images/S/aplus-seller-content-images-us-east-1/ATVPDKIKX0DER/A2BMZ85P2RYPDV/e9cb0557-c3f8-4838-97f3-55f056d35104._CR0,0,970,600_PT0_SX970__.jpg' });
        this.state.producto = 'Lentes de Sol Aviador Feidu';
      }else if(atributos.glasses == 'ReadingGlasses'){
        this.setState({ image: 'http://www.masteropticos.cl/upload/paginas/archivos/31-03-2017-22-39-16_web2.2.jpg' });
        this.state.producto = 'Promo Anteojos Marco + Cristales';
      }else if(atributos.age < 26){
        this.setState({ image: 'https://pbs.twimg.com/media/DihXOLAX0AA3seH.jpg' });
        this.state.producto = 'Nintendo Switch Neon';
      }else if(atributos.age < 50){
        this.setState({ image: 'https://static.mercadoshops.com/samsung-galaxy-s10-plus-8gb-ram-128gb-rom-hasta-12-cuotas-sin-intereses_iZ1057328292XvZgrandeXpZ1XfZ186957953-38217693726-6XsZ186957953xIM.jpg' });
        this.state.producto = 'Galaxy S10 plus Verde Prisma 128GB';
      }else{
        this.setState({ image: 'https://www.perfumehombre.es/wp-content/uploads/Dior-Sauvage.jpg'});
        this.state.producto = 'Perfume Dior Sauvage';
      }

    }else {
      if(atributos.glasses == 'Sunglasses'){
        this.setState({ image: 'https://http2.mlstatic.com/lentes-de-sol-para-mujer-espejo-cat-eye-incluye-envio-gratis-D_NQ_NP_751751-MLM27065657333_032018-F.jpg' });
        this.state.producto = 'Lentes de Sol Mujer Eyewear + Estuche';
      }else if(atributos.makeup.lipMekup == true){
        this.setState({ image: 'http://www.cosmeticadestellos.es/39-large_default/oferta-golden-rose-velvet-matte-lipstick-nuevo.jpg' });
        this.state.producto = 'Lipstick Velvet Matte';
      }else if(atributos.makeup.eyeMakeup == true){
        this.setState({ image: 'https://estilosdemaquillaje.com/wp-content/uploads/2019/01/como-pintar-ojos-ahumados-7.jpg' });
        this.state.producto = 'Delineador de ojos vSoya';
      }else if(atributos.age < 30){
        this.setState({ image: 'https://www.inmoreeststore.com/10549/la-bolsa-y-la-cartera-de-liu-jo-es-que-me-azul-de-la-publicidad-de-2018.jpg' });
        this.state.producto = 'Cartera + Billetera Azul Mujer';
      }else{
        this.setState({ image: 'https://www.chifchif.com/sites/default/files/styles/300x300/public/chanel-gabrielle.jpg' });
        this.state.producto = 'Perfume Gabrielle Chanel';
      }
    }
  };
}

async function uploadAzure(direccion) {                     //BORRAR
  let apiUrl = 'https://southcentralus.api.cognitive.microsoft.com/face/v1.0/detect?returnFaceId=true&returnFaceLandmarks=false&returnFaceAttributes=age,gender,facialHair,glasses,makeup&recognitionModel=recognition_01&returnRecognitionModel=false&detectionModel=detection_01';
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
