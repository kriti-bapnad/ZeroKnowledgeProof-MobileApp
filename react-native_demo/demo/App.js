import React, { Component } from 'react';
import { Platform, StyleSheet, View, TextInput,Button, Image, Dimensions,ImageBackground, Text, TouchableOpacity } from 'react-native';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import {Buffer} from 'buffer';
import QRCode from 'react-native-qrcode-svg';

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' + 'Cmd+D or shake for dev menu',
  android: 'Double tap R on your keyboard to reload,\n' + 'Shake or press menu button for dev menu',
});

 class App extends Component {
  constructor(){
    super();
    this.state={
      id:'',
      password:''
    }
    this.handleSubmit= this.handleSubmit.bind(this);
  }
  handleSubmit(){
    let collection={};
    collection.id=this.state.id;
    collection.password=this.state.password;

    fetch('http://192.168.136.136:3000/authenticate', 
        {method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(collection)
        }
    ).then(resp => {return resp.json()}).then(data => {
        if(data.output==true){
          console.log('ok')
          this.props.navigation.navigate('home', {
            id: collection.id,
            name:data.name,
          });
        }
    })
  }
  updateValue(text, field){
   if(field=='id'){
    this.setState({
      id:text,
    })
   }
   else if(field=='password'){
    this.setState({
      password:text,
    })
   }
  }
  render() {
    return (
      <ImageBackground style={{width: '100%', height: '100%'}} source={require('./background.png')}>
      <View style={style.loginBox}>
        <Image
        style={style.LoginImage}
        source={require('./Login.png')}
        />
        <View style={style.form}>
          <View style={{flexDirection:'row'}}>
            <Image source={require('./UserId.png')} style={{flex:1}, {marginTop:5}}/>
            <TextInput style={style.text} 
            placeholder='Enter UserId'
            style={{flex:8}}
            onChangeText={(text)=>this.updateValue(text,'id')}
            />
          </View>
          <View style={{flexDirection:'row'}}>
            <Image source={require('./password.png')} style={{flex:1}, {marginTop:5}}/>
            <TextInput style={style.text}
            secureTextEntry={true}
            placeholder='Enter Password'
            onChangeText={(text)=>this.updateValue(text,'password')}
            />
          </View>
          <View style={style.ButtonParent}>
          <Button style={style.Button}
          color="#15c872"
          title="SIGN IN"
          onPress={this.handleSubmit}
          />
          </View>
        </View>
      </View>
    </ImageBackground>
    );
  }
}
class home extends Component {
  constructor(){
    super();
    this.state={
      proof:'',
    }
  }
  generateQr(id,name){
    let collection={};
    collection.id=id;
    collection.name=name;
    console.log(id);
    fetch('http://192.168.136.136:3000/generateQr', 
        {method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(collection),
        }
    ).then(resp => {return resp.json()}).then(data => {
      console.log(data);
      this.setState({
        proof:data,
      });
      this.props.navigation.navigate('qrDisplay',{
        proof: this.state.proof,
        id: collection.id,
        name:collection.name,
      })
  })
  }
  profileGenerate(id){
    let collection={};
    collection.id=id;
    console.log(id);
    fetch('http://192.168.136.136:3000/profileGenerate', 
        {method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(collection),
        }
    ).then(resp => {return resp.json()}).then(data => {
      console.log(data);
      this.props.navigation.navigate('profile',{
        id:data.id,
        dateOfBirth: data.dateOfBirth.substring(0,10),
        address: data.address,
        validity: data.validity.substring(0,10),
        name:data.name,
      })
  });
  }
  // generateQrforValidity(id){

  // }
  // generateQrforLocation(id){

  // }
  render() {
    const {navigation}= this.props;
    return ( 
      <ImageBackground  style={{width: '100%', height: '100%'}} source={require('./backgroundhome.png')}>
        <View>
        <TouchableOpacity
        style={style.profileGenerate}
         onPress={ () =>this.profileGenerate(navigation.getParam('id'))}
         >
         <Text style={{fontSize:20}}> PROFILE </Text>
       </TouchableOpacity>
        <Text style={style.id}>
          Profile ID : {navigation.getParam('id')} {"\n"}
          NAME : {navigation.getParam('name')}
        </Text>
        <TouchableOpacity
         style={style.generateQrButton}
         onPress={ () =>this.generateQr(navigation.getParam('id'), navigation.getParam('name'))}
         >
         <Text style={style.generateQrButtonText}> TAP HERE TO GENERATE YOUR LICENCE PROOF </Text>
       </TouchableOpacity>
       {/* <TouchableOpacity
         style={style.generateQrButtonValidity}
         onPress={ () =>this.generateQrforValidity(navigation.getParam('id'))}
         >
         <Text style={{fontSize:20}}> QR-CODE FOR VALIDITY OF LICENCE </Text>
       </TouchableOpacity>
       <TouchableOpacity
         style={style.generateQrButtonLocation}
         onPress={ () =>this.generateQrforLocation(navigation.getParam('id'))}
         >
         <Text style={{fontSize:20}}> QR-CODE FOR LOCATION PROOF </Text>
       </TouchableOpacity> */}
        </View>
      </ImageBackground>
    );
  }
}
class qrDisplay extends Component{
 render(){
   const {navigation}= this.props
   return(
     <ImageBackground style={{width: '100%', height: '100%'}} source={require('./backgroundhome.png')}>
      <View>
        <Text style={style.id}>
          USER ID : {navigation.getParam('id')} {"\n"}
          NAME : {navigation.getParam('name')}
        </Text>
      </View>
      <View style={style.qrcodedisplaystyle}> 
      <Text style={style.qrText}>
        Licence Proof
      </Text>
      <QRCode
      value={navigation.getParam('proof')}
      size={350}
      color="black"/>
      </View>
      </ImageBackground>
   );
 }
}
class profile extends Component{
  render(){
    const {navigation}= this.props
    return(
      <ImageBackground style={{width: '100%', height: '100%'}} source={require('./background.png')}>
      <View>
      <Text style={style.profileId}>
      Name: {navigation.getParam('name')} {"\n"} {"\n"}
      Id: {navigation.getParam('id')} {"\n"}{"\n"}
      Date Of Birth: {navigation.getParam('dateOfBirth')} {"\n"}{"\n"}
      Validity: {navigation.getParam('validity')} {"\n"}{"\n"}
      Address: {navigation.getParam('address')} {"\n"}{"\n"}
      </Text>
      </View>
      </ImageBackground>
    )
  }
}
const AppNavigator = createStackNavigator(
  {
    App: {
        screen: App,
          navigationOptions: {
            header:null,
          }
    },
    home: {
      screen:home,
      navigationOptions:{
        header:null,
      }
    },
    qrDisplay:{
      screen:qrDisplay,
      navigationOptions:{
        header:null,
      }
    },
    profile:{
      screen:profile,
      navigationOptions:{
        header:null,
      }
    }
  },
  {
    initialRouteName: 'App',
  },
);

const style= StyleSheet.create({
  generateQrButtonText:{
    color:'white',
    fontSize:20,
  },
  generateQrButtonValidity:{
    width: 235,
    height: 114,
    borderWidth:1,
    borderRadius: 24,
    color: '#ffffff',
    backgroundColor: '#15c872',
    position:'absolute',
    top: 2*Dimensions.get('window').height/4+ 80,
    alignSelf:'center',
    padding:20,
  },
  generateQrButtonLocation:{
    width: 235,
    height: 114,
    borderWidth:1,
    borderRadius: 24,
    color: '#ffffff',
    backgroundColor: '#15c872',
    position:'absolute',
    top: 2*Dimensions.get('window').height/4 +210,
    alignSelf:'center',
    padding:20,
  },
  profileId:{
    position:'absolute',
    top:Dimensions.get('window').height/4,
    alignSelf:'center',
    fontSize: 30,
    color: '#ffffff',
  },
  profileGenerate:{
    width: 100,
    height: 30,
    borderWidth:1,
    borderRadius: 24,
    color: '#ffffff',
    backgroundColor: '#15c872',
  },
  qrcodedisplaystyle:{
    position:"absolute",
    top: Dimensions.get('window').height/2-60,
    alignSelf:'center'
  },
  ButtonParent:{
    marginTop:20,
    alignSelf:"center",
    width: 128,
    height: 48,
  },
  qrText:{
    color:'gold',
    alignSelf:"center",
    padding:10,
    paddingBottom:10,
    fontSize:20
  },
  generateQrButton:{
    width: 235,
    height: 114,
    borderWidth:1,
    borderRadius: 24,
    color: '#ffffff',
    backgroundColor: '#15c872',
    position:'absolute',
    top: 2*Dimensions.get('window').height/4-50,
    alignSelf:'center',
    padding:20,
  },
  id:{
    position:'absolute',
    top:110,
    alignSelf:'center',
    fontSize: 18,
    color: '#ffffff',
  },
  loginBox:{
    padding:10,
    backgroundColor:"white",
    marginLeft:10,
    marginRight:10,
    borderWidth:1,
    borderRadius: 24,
    position: "relative",
    top:Dimensions.get('window').height/3
  },
  form: {
    backgroundColor:"white",
    position: "relative",
  },
  Button: {
    borderWidth:1,
    borderRadius: 24,
    backgroundColor: '#15c872'
  },
  LoginImage:{
    alignSelf:"center",
    marginBottom: 50
  },
  text:{
    height:50,
    flex:8,
  }
});

export default createAppContainer(AppNavigator);