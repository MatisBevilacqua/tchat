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

const ContainerTitle = styled.View`
  padding: 10px 0 20px 15px;
`;

const Container = styled.View`
  height: 100%;
  background-color: #333541;
  border-top-right-radius: 50px;
  border-top-left-radius: 50px;
  position: fixed;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  bottom: 0;
  padding: 20px 10px 0 10px;
`

export default function Settings ({ navigation }: Props) {
  const dispatch = useAppDispatch()
  const me = useAppSelector(state => state.me)
  const lang = useAppSelector(state => langData[state.language].settings)

  if (!me) return null

  return <View>
    <Container>
      <ProfilePictureContainer $size="100px">
        <FontAwesome name="user" size={50} color="black" />
      </ProfilePictureContainer>
      <Group>
        <FText $size="24px" $color="white">{me.surname} {me.name}</FText>
        <FText $size="16px" $color="white">{me.email}</FText>
      </Group>
    <Button color={"red"} title="Déconnexion" onPress={() => {
      dispatch({ type: "RESET" })
      AsyncStorage.removeItem("token")
    }} />
    </Container>

    <SettingsButton text={lang.language} onPress={() => navigation.navigate("chooseLanguage")} />

  </View>
}
