import styled from "styled-components/native"
import { Button } from "./auth.css";
import { Platform } from "react-native";

export const AndroidSearchBar = styled.TextInput`
  font-size: 18px;
  max-width: 70%;
  width: 70%;
  border-bottom-color: #ccc;
  border-bottom-width: 1px;
`;

export const AndroidSearchBarContainer = styled.View`
  display: flex;
  flex-direction: row;
  align-items: start;
  width: 100%;
`;

export const Container = styled.View<{ $pad?: string }>`
  flex: 1;
  justify-content: center;
  background-color:#24252D;
  padding-top: ${({ $pad }) => Platform.OS === "android" ? 0 : $pad};
`;

export const VerticalGroup = styled.View`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

export const Radio = styled.View`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50px;
  border-width: 1px;
  border-color: #ccc;
  width: 36px;
  height: 36px;
  margin-right: 8px;
`;

export const ButtonGroup = styled.View`
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  width: 100%;
  gap: 4px;
  padding: 12px;
`;

export const GroupedButton = styled(Button).attrs<{ $size: number }>(props => ({
  containerStyle: {
    flexBasis: `${props.$size}%`,
  }
}))`
  flex-shrink: 1;
  flex-grow: 1;
`
