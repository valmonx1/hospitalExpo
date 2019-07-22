import React, { Component } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  AsyncStorage,
  StatusBar,
  YellowBox,
  Button
} from "react-native";
import stylesDash from "../style/stylesDash";
import HandleBack from "./backApp";
import { Notifications, Permissions } from "expo";

export default class Dashboard extends Component {
  constructor(props) {
    super(props);
    YellowBox.ignoreWarnings([
      "Warning: componentWillMount is deprecated",
      "Warning: componentWillReceiveProps is deprecated"
    ]);
    this.panggilDelayData = this.panggilDelayData.bind(this);
    this.state = {
      queue_no: [],
      queue_name: [],
      pmi_no: "",
      hfc_cd: "",
      discipline_cd: "",
      queue: ""
    };
  }

  componentDidMount() {
    this._interval = setInterval(() => {
      console.log(this.state);
      this.panggilDelayData();
    }, 1000);
  }

  panggilDelayData = () => {
    this.getPatient_id().then(pmi_no => {
      this.state.pmi_no = pmi_no;
      fetch("http://192.168.1.107:8082/show_no/" + pmi_no)
        .then(response => response.json())
        .then(responseJson => {
          this.setState({
            queue_no: JSON.stringify(responseJson.result[0]["queue_no"]),
            queue_name: JSON.stringify(responseJson.result[0]["queue_name"])
          });
        });
      alert(responseJson.message).catch(error => {
        console.error(error);
      });
    });
  };

  askPermissionsAsync = async () => {
    await Permissions.askAsync(Permissions.USER_FACING_NOTIFICATIONS);
  };
  send = async () => {
    await this.askPermissionsAsync(),
      Notifications.presentLocalNotificationAsync({
        title: "Hoy",
        body: "kiss",
        android: {
          sound: true,
          vibrate: true,
          color: "#512DA8"
        },
        ios: {
          sound: true
        }
      });
  };

  componentWillUnmount() {
    clearInterval(this._interval);
  }

  // get patient id from asynchronous storage
  getPatient_id = async () => {
    let pmi_no = await AsyncStorage.getItem("pmi_no");
    return pmi_no;
  };

  getHFC_cd = async () => {
    let hfc_cd = await AsyncStorage.getItem("hfc_cd");
    return hfc_cd;
  };

  getDisc_cd = async () => {
    let discipline_cd = await AsyncStorage.getItem("discipline_cd");
    return discipline_cd;
  };

  render() {
    if (this.state.isLoading) {
      return (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" />
        </View>
      );
    }

    return (
      <HandleBack>
        <StatusBar backgroundColor="#3700B3" barStyle="light-content" />
        <View style={stylesDash.statusBar} />
        <Text style={stylesDash.con}>Queue</Text>
        <View style={stylesDash.contena}>
          <TouchableOpacity style={stylesDash.card}>
            <View style={stylesDash.container1}>
              <Text style={stylesDash.nore}>Your number is:</Text>
              <Text style={stylesDash.resit}>{this.state.queue_no}</Text>
              <Text style={stylesDash.nore1}>
                Service : {this.state.queue_name}
              </Text>
              {/* <Text style={stylesDash.nore1}>Hospital :</Text> */}

              <Text style={stylesDash.border}>
                ________________________________________________________
              </Text>
              <Button title="Send" onPress={this.send} />
              <Text style={stylesDash.nore2}>
                Please be patient and wait while we serving others. We will be
                serving you soon. Thank you
              </Text>
              <Text style={stylesDash.nore2}>{this.state.queue.queue_no}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </HandleBack>
    );
  }
}
