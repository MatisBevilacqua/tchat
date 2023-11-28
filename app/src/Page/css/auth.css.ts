import { TouchableOpacity } from "react-native-gesture-handler";
import styled from "styled-components/native"

export const BottomContainer = styled.View`
  position: absolute;
  bottom: 0;
  padding-bottom: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const Button = styled(TouchableOpacity)<{
  $width?: string;
  $background?: string;
}>`
  width: ${({ $width }) => $width || "100%"};
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $background }) => $background || "#2A2F3E"};
  border-radius: 8px;
  padding: 12px 0;
`;

export const InputGroup = styled.View`
  width: 100%;
  display: flex;
  flex-direction: row;
  gap: 16px;
  justify-content: space-between;
  align-items: center;
`;

export const Container = styled.View`
  width: 100%;
  height: 70%;
  margin-top: 40px;
  border-top-right-radius: 20px;
  border-top-left-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const Form = styled.View`
  gap: 16px;
  width: 90%;
  display: flex;
  justify-content: flex-start;
`;
