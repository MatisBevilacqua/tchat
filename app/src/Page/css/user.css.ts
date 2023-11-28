import { TouchableOpacity } from "react-native-gesture-handler";
import styled from "styled-components/native"

export const UserContainer = styled(TouchableOpacity)`
  display: flex;
  flex-direction: row;
  padding: 10px;
  border-top-width: 0;
  border-left-width: 0;
  border-right-width: 0;
`;

export const InfoContainer = styled.View`
  display: flex;
  flex-direction: column;
`;

export const ProfilePictureContainer = styled.View<{ $size?: string, $margin?: string }>`
  margin-right: ${({ $margin }) => $margin ?? "10px"};
  width: ${({ $size }) => $size ?? "50px"};
  height: ${({ $size }) => $size ?? "50px"};
  border-radius: 200px;
  background-color: #ccc;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const Group = styled.View`
  flex-direction: row;
  align-items: center;
`;
