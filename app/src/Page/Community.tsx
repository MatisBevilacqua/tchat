import AsyncStorage from "@react-native-async-storage/async-storage";
import { Button, View } from "react-native";
import { useAppDispatch, useAppSelector } from "../store/store";
import { FText } from "../Components/FText";
import { Group } from "./css/lookup.css";
import { ProfilePictureContainer } from "./css/user.css";
import { FontAwesome } from "@expo/vector-icons"
import SettingsButton from "../Components/SettingsButton";
import { langData } from "../data/lang/lang";
import { NavigationProp } from "@react-navigation/native";
import styled from 'styled-components/native';

interface Props {
  navigation: NavigationProp<any>
}


export default function Community ({ navigation }: Props) {
  return <View>
  </View>
}
