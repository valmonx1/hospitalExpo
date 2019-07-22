import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  AsyncStorage
} from "react-native";
import {
  createBottomTabNavigator,
  createSwitchNavigator,
  createAppContainer,
  TabBarBottom
} from "react-navigation";
import Login from "./src/screen/Login";
import signup from "./src/screen/signup";
import Dashboard from "./src/screen/Dashboard";
import Patient from "./src/screen/Patient";
import Doctor from "./src/screen/Doctor";
import Location from "./src/screen/Location";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const TabNavigator = createBottomTabNavigator(
  {
    Hospital: { screen: Location },
    Home: { screen: Patient },
    Queue: { screen: Dashboard },
    Doctor: { screen: Doctor }
  },
  {
    defaultNavigationOptions: ({ navigation }) => ({
      tabBarIcon: ({ tintColor }) => {
        const { routeName } = navigation.state;
        let iconName;
        switch (routeName) {
          case "Hospital":
            iconName = "map-search";
            break;
          case "Home":
            iconName = "hospital-building";
            break;
          case "Queue":
            iconName = "format-list-numbered";
            break;
          case "Doctor":
            iconName = "doctor";
            break;
          default:
            iconName = "hospital-building";
        }

        // You can return any component that you like here!
        return (
          <MaterialCommunityIcons name={iconName} size={25} color={tintColor} />
        );
      }
    }),
    tabBarOptions: {
      showIcon: true,
      activeTintColor: "white",
      inactiveTintColor: "#b794f6",
      style: {
        backgroundColor: "#6200EE"
      }
    },
    tabBarComponent: TabBarBottom,
    tabBarPosition: "bottom",
    animationEnabled: false,
    swipeEnabled: false
  }
);

const AuthStack = createSwitchNavigator({ Login: Login });

class AuthLoadingScreen extends Component {
  constructor(props) {
    super(props);
    this._loadData();
  }

  render() {
    return (
      <View style={stylesa.container}>
        <ActivityIndicator />
      </View>
    );
  }

  _loadData = () => {
    const isLoggedIn = AsyncStorage.getItem("isLoggedIn");
    this.props.navigation.navigate(isLoggedIn !== "1" ? "Auth" : "App");
  };
}

const stylesa = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }
});

export default createAppContainer(
  createSwitchNavigator(
    {
      AuthLoading: AuthLoadingScreen,
      App: TabNavigator,
      Auth: AuthStack,
      signup: signup
    },
    {
      initialRouteName: "AuthLoading"
    }
  )
);
