import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View,ImageBackground,Image,TextInput,Button,Dimensions,TouchableOpacity,Vibration } from 'react-native';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import QRCodeScanner from 'react-native-qrcode-scanner';


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

    fetch('http://192.168.136.136:3000/authenticate/verifier', 
        {method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(collection)
        }
    ).then(resp => {return resp.json()}).then(data => {
        if(data==true){
          console.log('ok')
          this.props.navigation.navigate('scanner')
        }
        else{
          console.log("Wrong password");
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
class scanner extends Component{
  constructor(){
    super();
    this.state={
      camera:true,
    }
  }

  onSuccess = (e) =>{
    Vibration.vibrate(1000);
    let collection={};
    collection.proof=e.data;
    //console.log(e.data);
    fetch('http://192.168.136.136:3000/verifyQr', 
        {method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(collection)
        }
    ).then(resp => {return resp.json()}).then(data=>{
      console.log(data);
      if(data.verified){
        if(data.valid){
          this.props.navigation.navigate('verifiedAndValid');
        }
        else{
          this.props.navigation.navigate('verifiedNotValid');
        }
      }
      else{
        this.props.navigation.navigate('notVerified');
      }
    })
  }

  render(){
    return(
      <View>
      <View style={style.qrpostion}>
      <QRCodeScanner
        reactivate={true}
        fadeIn={false}
        onRead={this.onSuccess}  
        cameraStyle={{height: 200, marginTop: 20, width: 200, alignSelf: 'center', justifyContent: 'center' }} 
        cameraProps={{ ratio:'1:1' }}
        topContent={
          <Text>
          </Text>
        }
        bottomContent={
          <Text>
            Place Qr-Code in frame
          </Text>
        }
      />
      </View>
      <View>
       <Text style={style.relauchwarn}>
       CAN'T SCAN THE CODE? EXIT AND RELAUNCH THE APP
      </Text> 
      </View>
      </View>
    )
  }
}
class verifiedAndValid extends Component{
  goBack(){
    this.props.navigation.navigate('scanner');
  }
  render(){
    return(
      <ImageBackground style={{width: '100%', height: '100%'}} source={require('./approved.png')}>
        <Text style={style.approvedtext}>SCANNING SUCCESSFULL</Text>
        <View style={style.approvedButton}>
        <Button 
        title="NICE !"
        onPress={()=>this.goBack()}
        />
        </View>
      </ImageBackground>
    )
  }
}
class verifiedNotValid extends Component{
  goBack(){
    this.props.navigation.navigate('scanner');
  }
  render(){
    return(
      <ImageBackground style={{width: '100%', height: '100%'}} source={require('./notapproved.png')}>
        <Text style={style.error}>LICENCE PROOF DECLINED</Text>
        <View style={style.approvedButton}>
        <Button 
        title="OH NO!"
        onPress={()=>this.goBack()}
        />
        </View>
      </ImageBackground>
    )
  }
}
class notVerified extends Component{
  goBack(){
    this.props.navigation.navigate('scanner');
  }
  render(){
    return(
      <ImageBackground style={{width: '100%', height: '100%'}} source={require('./notapproved.png')}>
        <Text style={style.error}>An Error occured</Text>
        <View style={style.approvedButton}>
        <Button 
        title="OK"
        onPress={()=>this.goBack()}
        />
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
    scanner: {
      screen:scanner,
      navigationOptions:{
        header:null,
      }
    },
    verifiedAndValid:{
      screen:verifiedAndValid,
      navigationOptions:{
        header:null,
      }
    },
    verifiedNotValid:{
      screen:verifiedNotValid,
      navigationOptions:{
        header:null,
      }
    },
    notVerified:{
      screen:notVerified,
      navigationOptions:{
        header:null,
      }
    },
  },
  {
    initialRouteName: 'App',
  },
);
const style = StyleSheet.create({
  qrpostion:{
    position:'absolute',
    top:Dimensions.get('window').height/3,
  },
  relauchwarn:{
    alignSelf:'center',
    position:'absolute',
    top:5*Dimensions.get('window').height/6,
  },
  approvedtext:{
    color:'green',
    fontSize:30,
    position:'absolute',
    top:2*Dimensions.get('window').height/3,
    alignSelf:'center',
  },
  error:{
    color:'red',
    fontSize:30,
    position:'absolute',
    top:2*Dimensions.get('window').height/3,
    alignSelf:'center',
  },
  approvedButton:{
    color:'white',
    width:128,
    height:48,
    position:'absolute',
    top:3*Dimensions.get('window').height/4,
    alignSelf:'center',
  },
  ButtonParent:{
    alignSelf:"center",
    width: 128,
    height: 48,
  },
  approved:{
    backgroundColor:null,
    position:'absolute',
    top:Dimensions.get('window').height/3,
    alignSelf:'center',
  },
  id:{
    position:'absolute',
    top:130,
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
    flex:8
  }
});

export default createAppContainer(AppNavigator);