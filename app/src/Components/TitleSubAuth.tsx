import { FText } from './FText';
import { Platform } from 'react-native';
import styled from "styled-components/native";
import { Montserrat_700Bold } from "@expo-google-fonts/montserrat";
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

interface TitleSubAuthProps {
  title: string;
  sub: string;
}

const Container = styled.View`
  margin: ${Platform.OS === 'android' ? '30px 0 0 0' : '50px 0 0 0'};
  padding: 0 10px 0 20px;
  display: flex;
  gap: 10px;
  top: 0;
`

const TitleSubAuth: React.FC<TitleSubAuthProps> = ({ title, sub }) => {
  const navigation = useNavigation()
  
  const onGoBackPress = () => {
    navigation.goBack()
  }
  
  return <Container>
    <FontAwesome onPress={onGoBackPress} size={20} color={"#8E8E8F"} name='arrow-left' />
    <FText $size={Platform.OS === 'android' ? '21px' : '23px'} $color="white" font={[Montserrat_700Bold, "Montserrat_700Bold"]}>{title}</FText>
    <FText $size={Platform.OS === 'android' ? '15px' : '18px'} $color="white">{sub}</FText>
  </Container>
}

export default TitleSubAuth;
