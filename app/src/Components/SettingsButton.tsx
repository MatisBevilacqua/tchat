import styled from "styled-components/native";
import { FText } from "./FText";
import { FontAwesome } from "@expo/vector-icons";

const Button = styled.TouchableOpacity`
  width: 100%;
  height: 36px;
  padding: 0 12px;
  border: 1px solid #ccc;
  border-left-width: 0px;
  border-right-width: 0px;
  background-color: #202E44;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`

interface Props {
  text: string;
  onPress: () => void;
}

export default function SettingsButton({ text, onPress }: Props) {
  return <Button onPress={onPress}>
    <FText $color="white">{text}</FText>
    <FontAwesome color="white" name="arrow-right"/>
  </Button>
}
