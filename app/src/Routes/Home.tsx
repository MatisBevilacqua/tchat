import { View } from "react-native";
import { FText } from "../Components/FText";
import { Montserrat_700Bold } from "@expo-google-fonts/montserrat";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useAppSelector } from "../store/store";
import { langData } from "../data/lang/lang";
import { FontAwesome, Feather } from "@expo/vector-icons";
import { MaterialIcons } from '@expo/vector-icons'; 
import { useNavigation } from "@react-navigation/native";
import { TouchableOpacity } from "react-native-gesture-handler";
import ChannelList from "../Page/ChannelList";
import Settings from "../Page/Settings";
import styled from "styled-components/native";
import Community from "../Page/Community";

const Tab = createBottomTabNavigator();

const ButtonSearch = styled(TouchableOpacity)`
  width: 50px;
  height: 50px;
  border-radius: 10px;
  background-color: #333541;
  display: flex;
  align-items: center;
  justify-content:center;
`

export function Home() {
  const lang = useAppSelector(state => langData[state.language].tab)

  return ( 
  
  <View style={{ flex: 1, backgroundColor: '#333541'}}>
  <Tab.Navigator screenOptions={{
    headerShadowVisible: false,
    tabBarStyle: {
      height: '10%',
      width: '90%',
      alignSelf: 'center',
      marginTop: 20,
      paddingBottom: 16,
      backgroundColor: '#24252D',
      borderTopWidth: 0,
      borderRadius: 99990,
      // borderWidth: 1,
      // borderTopWidth: 1,
      // borderTopColor: "#D4B216",
      // borderColor: "#D4B216",
    },
    headerStyle: {
      backgroundColor: "#24252D",
      height: 150
    },
  }}>
    <Tab.Screen
      name="chat"
      key={"chat"}
      component={ChannelList}
      options={{
        
        tabBarActiveTintColor: '#D4B216',

        tabBarIcon(props) {
          return <FontAwesome name="comments" size={30} color={props.color} />
        },
        tabBarLabel() {
          return <FText $color='#FFFF' $size='12px'>{lang.chat}</FText>
        },
        headerTitleAlign: "center",
        headerTitle() {
          return <View>
            <FText
              font={[Montserrat_700Bold, "Montserrat_700Bold"]}
              $size={"25px"}
              $color='#FFF'
            >
              {lang.chat}
            </FText>
          </View>
        },
        headerRight() {
          const navigation = useNavigation()

          return <View style={{ flex: 1, alignItems: "center", justifyContent: "center", marginRight: 16 }}>
            <ButtonSearch onPress={() => navigation.navigate("search" as never)}>
              <Feather name="search" size={25} color={"#fff"} />
            </ButtonSearch>
          </View>
        },

        headerLeft(){
          const navigation = useNavigation()

          return <View style={{ flex: 1, alignItems: "center", justifyContent: "center", marginLeft: 16 }}>
            <ButtonSearch onPress={() => navigation.navigate("createGroup" as never)}>
              <Feather name="plus" size={25} color={"#fff"} />
            </ButtonSearch>
          </View>
        }
      }}
    />


    <Tab.Screen
      name='community'
      key={"community"}
      component={Community}
      options={{

        tabBarActiveTintColor: '#D4B216',

        tabBarIcon(props) {
          return <MaterialIcons name="groups" size={30} color={props.color} />
        },
        tabBarLabel(props) {
          return <FText $color='#FFFF' $size='12px'>Communauté</FText>
        },
        
        headerTitle() {
          return <View>
            <FText
              font={[Montserrat_700Bold, "Montserrat_700Bold"]}
              $size={"25px"}
              $color='#FFF'
            >
              Communauté
            </FText>
          </View>
        },
      }}
    />

    <Tab.Screen
      name='settings'
      key={"settings"}
      component={Settings}
      options={{

        tabBarActiveTintColor: '#D4B216',

        tabBarIcon(props) {
          return <FontAwesome name="gear" size={30} color={props.color} />
        },
        tabBarLabel(props) {
          return <FText $color='#FFFF' $size='12px'>{lang.settings}</FText>
        },
        
        headerTitle() {
          return <View>
            <FText
              font={[Montserrat_700Bold, "Montserrat_700Bold"]}
              $size={"25px"}
              $color='#FFF'
            >
              {lang.settings}
            </FText>
          </View>
        },
      }}
    />
  </Tab.Navigator>
  <View style={{ height: 40 }} /> 
  </View>
);}
