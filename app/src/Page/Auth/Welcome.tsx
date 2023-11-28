import { trpc } from '../../utils/trpc';
import { Pressable, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import z from "zod"
import { useInputsReducer } from '../../hooks/inputsReducer';
import { FText } from '../../Components/FText';
import { NavigationProp } from '@react-navigation/native';
import { Container, Form, InputGroup, BottomContainer } from "../css/auth.css"
import { useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { setLogin } from '../../store/slices/loginSlice';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import DropdownCountry from '../../Components/DropdownCountry';
import { langData, replace } from '../../data/lang/lang';
import DropdownGender from '../../Components/DropdownGender';
import { isKeyboard } from '../../hooks/isKeyboard';
import { NextButton } from './LangSelect';
import { FontAwesome } from '@expo/vector-icons';
import TitleSubAuth from '../../Components/TitleSubAuth';
import styled from "styled-components/native";
import { Image } from 'expo-image';
import { useAssets } from 'expo-asset';
import { Montserrat_700Bold } from '@expo-google-fonts/montserrat';


interface Props {
  navigation: NavigationProp<any>;
}

const Button = styled(TouchableOpacity)`
  width:350px;
  align-self: center;
  border-radius:8px;
  height:45px;
  margin:10px;
  display:flex;
  align-items: center;
  justify-content: center;
  background-color:#333541;
`

const ContainerButton = styled.View`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  margin:0 0 70px 0;
  margin:${Platform.OS === 'android' ? '0 0 20px 0' : '0 0 70px 0' };
`;

export default function Welcome({ navigation }: Props) {
  const dispatch = useAppDispatch()
  const lang = useAppSelector(state => {
    return {
      ...langData[state.language].auth,
      originCountryPlaceholder: langData[state.language].dropdown.originCountryPlaceholder,
      next: langData[state.language].langSelect.next,
    }
  })
  const [assets, error] = useAssets([require('./avatar.png')]);

  return <>
    <TitleSubAuth title="Laissez Tantine vous guidez !" sub="Tantine est notre assistante vocal" />
    {assets ? 
      <Image
        style={{
          alignSelf: 'center',
          height: 450,
          width: 450,
          marginTop:20,
          // backgroundColor: '#0553',
        }}
        source={assets[0] as any}
      />
    : null}

    <ContainerButton>
      <Button onPress={() => navigation.navigate("login")}>
        <FText $color='white' font={[Montserrat_700Bold, "Montserrat_700Bold"]}>Login</FText>
      </Button>

      <Button onPress={() => navigation.navigate("register")}>
        <FText $color='white' font={[Montserrat_700Bold, "Montserrat_700Bold"]}>Register</FText>
      </Button>
    </ContainerButton>
    </>
}
