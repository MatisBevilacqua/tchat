import { FText } from "./FText";
import styled from "styled-components/native";
import {
  MaterialIndicator
} from 'react-native-indicators';

const LoadingContainer = styled.View`
  width: 100%;
  height: 100%;
  background-color:white;
  display: flex;
  align-items: center;
  justify-content: center;
`

export default function Loading() {

  return (
    <LoadingContainer>
      <MaterialIndicator color='#334055' size={40} />
    </LoadingContainer>
  )
}
