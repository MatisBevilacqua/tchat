import { FText } from "../../Components/FText";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { Container } from "../css/auth.css";
import { StatusBar } from 'expo-status-bar';
import { useMemo } from "react";
import styled from "styled-components/native"
import { FontAwesome } from "@expo/vector-icons"
import { View } from "react-native";
import { Language, setLanguage } from "../../store/slices/languageSlice";
import { NavigationProp } from "@react-navigation/native";
import { langData } from "../../data/lang/lang";

const green = "#22c954"

export const SpaceBetweenButton = styled.TouchableOpacity<{
  $borderColor?: boolean,
  $width?: string,
  $background?: string,
}>`
  background: ${({ $background }) => $background ?? "white"};
  width: ${({ $width }) => $width ?? "65%"};
  padding: 10px;
  border: 1px solid ${props => (props.$borderColor && green) || "#DADBDD"};
  border-radius: 8px;
  color: black;
  box-shadow: 0px 1px 1.41px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-top: 8px;
`

export const NextButton = styled.TouchableOpacity<{ $width?: string }>`
  width: ${({ $width }) => $width || "100%"};
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-direction: row;
  background: #333541;
  border-radius: 8px;
  margin-top: 8px;
  padding: 12px;
`;

interface Props {
  navigation: NavigationProp<any>;
}

export default function LangSelect ({ navigation }: Props) {
  const dispatch = useAppDispatch()
  const langCode = useAppSelector(state => state.language)
  const lang = useMemo(() => langData[langCode].langSelect, [langCode])

  const onLangChoose = (lc: Language) => {
    if (lc === langCode) return

    dispatch(setLanguage(lc))
  }

  const onContinue = () => {
    navigation.navigate("welcome")
  }

  return <Container>
    <View style={{ marginBottom: 36, display: 'flex', alignItems: 'center'}}>
      <FText $size="50px" $color="#FFF">{lang.hello}</FText>
      <FText $size="15px" $color="#FFF">{lang.sub}</FText>
    </View>
    {(Object.keys(langData) as Language[]).map((lc) => {
      return <SpaceBetweenButton key={lc} onPress={() => onLangChoose(lc)} $borderColor={lc === langCode}>
        <FText>{langData[lc].langSelect.lang}</FText>
        {lc === langCode && <FontAwesome name="check-circle" size={20} color={green} />}
      </SpaceBetweenButton>
    })}
    <NextButton onPress={onContinue} $width="65%">
      <FText $color="white" >{lang.next}</FText>
      <FontAwesome name="arrow-right" size={16} color={"white"} />
    </NextButton>
  </Container>
}
