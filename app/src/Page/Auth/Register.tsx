import { trpc } from '../../utils/trpc';
import { Pressable, KeyboardAvoidingView, Platform, Dimensions, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import z from "zod"
import TitleSubAuth from '../../Components/TitleSubAuth';
import styled from 'styled-components/native';
import { renderInput, showError } from "../../utils/formHelpers"
import { useInputsReducer } from '../../hooks/inputsReducer';
import { FText } from '../../Components/FText';
import { NavigationProp } from '@react-navigation/native';
import { Container, Form, InputGroup, BottomContainer, Button } from "../css/auth.css"
import { useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { setLogin } from '../../store/slices/loginSlice';
import { ScrollView } from 'react-native-gesture-handler';
import DropdownCountry from '../../Components/DropdownCountry';
import { langData, replace } from '../../data/lang/lang';
import DropdownGender from '../../Components/DropdownGender';
import { isKeyboard } from '../../hooks/isKeyboard';
import { NextButton } from './LangSelect';
import { FontAwesome } from '@expo/vector-icons';

interface Props {
  navigation: NavigationProp<any>;
}

const inputWidth = Dimensions.get("window").width * 0.4 - 8 + "px"

const ButtonBottomContainer = styled.View`
  display:flex;
  flex-direction:row;
  justify-content:space-between;
  position:relative;
  bottom:0;
`;

export default function Register({ navigation }: Props) {
  const dispatch = useAppDispatch()
  const lang = useAppSelector(state => {
    return {
      ...langData[state.language].auth,
      originCountryPlaceholder: langData[state.language].dropdown.originCountryPlaceholder,
      next: langData[state.language].langSelect.next,
    }
  })
  const isKeyboardOpen = isKeyboard()
  const [phase, setPhase] = useState<1 | 2 | 3>(1)

  const createUser = trpc.user.create.useMutation({
    async onSuccess(data) {
      await AsyncStorage.setItem("token", data)
    
      dispatch(setLogin(true))
    },
    onError(err) {
      if (err.message === "EMAIL_ALREADY_USED") {
        setAlreadyUsedEmail(true)
      }
    }
  })

  const [inputs, setInputs] = useInputsReducer([
    "name",
    "surname",
    "gender",
    "country",
    "state",
    "city",
    "origin",
    "email",
    "password",
    "passwordConfirm",
  ])
  const [lastFocus, setLastFocus] = useState("")
  const [alreadyUsedEmail, setAlreadyUsedEmail] = useState(false)

  const sendRegisterData = async () => {
    createUser.mutate({
      email: inputs.email.input,
      password: inputs.password.input,
      name: inputs.name.input,
      surname: inputs.surname.input,
      gender: +inputs.gender.input as 1 | 2 | 3,
      countryOfResidence: inputs.country.input,
      state: inputs.state.input,
      city: inputs.city.input,
      originCountry: inputs.origin.input,
    })
  }

  const firstPhaseVeify = useMemo(() => {
    return [inputs.name, inputs.surname, inputs.gender, inputs.country, inputs.origin, inputs.state, inputs.city].every(x => x.error === undefined)
  }, [inputs.name, inputs.surname, inputs.gender, inputs.country, inputs.origin, inputs.state, inputs.city])

  return <View>
    <TitleSubAuth title="S’inscrire" sub="Crée votre compte afin pouvoir accéder afin d’acceder à l’application" />
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "position"}>
      <ScrollView
        automaticallyAdjustKeyboardInsets
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <Container style={{ justifyContent: "flex-start"}}>
          <Form>
            {phase === 1 && <>
              <InputGroup>
                {renderInput({
                  setInputs,
                  inputs,
                  parser:
                    z.string()
                      .trim()
                      .min(2, { message: replace(lang.error.nameSurnameMin, lang.surname.toLowerCase()) }),
                  state: "surname",
                  maxLength: 18,
                  $width: inputWidth,
                  onFocus() {
                    setLastFocus("surname")
                  },
                  label: lang.surname
                })}

                {renderInput({
                  setInputs,
                  inputs,
                  parser: 
                    z.string()
                      .trim()
                      .min(2, { message: replace(lang.error.nameSurnameMin, lang.name.toLowerCase()) }),
                  state: "name",
                  label: lang.name,
                  maxLength: 32,
                  $width: inputWidth,
                  onFocus() {
                    setLastFocus("name")
                  },
                })}
              </InputGroup>

              {showError(lastFocus === "name" ? inputs.name : inputs.surname)}

              <DropdownGender
                value={+inputs.gender?.input}
                setValue={(gender) => {
                  setInputs({
                    key: "gender",
                    input: gender.toString(),
                    parser: z.string(),
                  })
                }}
              />

              <DropdownCountry
                value={inputs.country?.input || ""}
                setValue={(country) => {
                  setInputs({
                    key: "country",
                    input: country,
                    parser: z.string()
                  })
                }}
              />

              <DropdownCountry
                placeholder={lang.originCountryPlaceholder}
                value={inputs.origin?.input || ""}
                setValue={(origin) => {
                  setInputs({
                    key: "origin",
                    input: origin,
                    parser: z.string()
                  })
                }}
              />
              
              {renderInput({
                setInputs,
                inputs,
                parser:
                  z.string()
                    .trim()
                    .min(2, { message: lang.error.stateMin }),
                state: "state",
                label: lang.state,
                maxLength: 48,
              })}
              {showError(inputs.state)}

              {renderInput({
                setInputs,
                inputs,
                parser:
                  z.string()
                    .trim()
                    .min(2, { message: lang.error.cityMin }),
                state: "city",
                label: lang.city,
                maxLength: 48,
              })}
              {showError(inputs.city)}

              <NextButton disabled={!firstPhaseVeify} onPress={() => setPhase(2)} style={{ marginTop: 0 }}>
                <FText $color="white" >{lang.next}</FText>
                <FontAwesome name="arrow-right" size={16} color={"white"} />
              </NextButton>
            </>}

            {phase === 2 && <>
              {renderInput({
                setInputs,
                inputs,
                parser: 
                  z.string()
                    .trim()
                    .email({ message: lang.error.emailInvalid }),
                state: "email",
                label: lang.email,
                inputMode: "email",
                maxLength: 200,
                onChangeText() {
                  setAlreadyUsedEmail(false)
                },
              })}
              {showError(
                inputs.email?.error
                  ? inputs.email
                  : alreadyUsedEmail
                    ? { error: lang.error.emailAlreadyExists } 
                    : undefined 
              )}

              {renderInput({
                setInputs,
                inputs,
                parser: 
                  z.string()
                    .trim()
                    .min(8, { message: lang.error.passwordMin }),
                state: "password",
                label: lang.password,
                maxLength: 64,
                secureTextEntry: true,
              })}
              {showError(inputs.password)}

              {renderInput({
                setInputs,
                inputs,
                parser: 
                  z.string()
                    .trim()
                    .refine((val) => val === inputs.password.input, { message: lang.error.passwordNotMatch }),
                state: "passwordConfirm",
                label: lang.confirmPassword,
                maxLength: 64,
                secureTextEntry: true,
              })}
              {showError(inputs.passwordConfirm)}

              <ButtonBottomContainer>
                <NextButton onPress={() => setPhase(2)} $width={inputWidth} style={{ marginTop: 0 }}>
                  <FText $color="white">{lang.back}</FText>
                  <FontAwesome name="arrow-left" size={16} color={"white"} />
                </NextButton>
                <Button
                  $background='#333541'
                  $width={inputWidth}
                  disabled={!Object.values(inputs).every(x => x.error === undefined) || Object.values(inputs).length <= 0}
                  onPress={sendRegisterData}>
                  <FText $color='white'>{lang.register}</FText>
                </Button>
              </ButtonBottomContainer>
            </>}
          </Form>
          {!isKeyboardOpen && (<>
            {/*  <BottomContainer>
              <FText $color='white' $size='18px'>
                {lang.alreadyHaveAccount}
              </FText>
              <Pressable onPress={() => navigation.navigate("login")}>
                <FText $size='18px' $color='#575BFD'>{lang.login}</FText>
              </Pressable>
            </BottomContainer> */}
          </>)}
        </Container>
      </ScrollView>
    </KeyboardAvoidingView>
  </View>
}
