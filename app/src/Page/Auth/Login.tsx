import { trpc } from '../../utils/trpc';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { renderInput, showError } from '../../utils/formHelpers';
import { useInputsReducer } from '../../hooks/inputsReducer';
import z from "zod";
import { FText } from '../../Components/FText';
import { ScrollView } from 'react-native-gesture-handler';
import { Container, Form, Button } from '../css/auth.css';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { setLogin } from '../../store/slices/loginSlice';
import { set } from '../../store/slices/meSlice';
import TitleSubAuth from '../../Components/TitleSubAuth';

export default function Login() {
  const dispatch = useAppDispatch()
  const [inputs, setInputs] = useInputsReducer([
    "email",
    "password",
  ])
  const me = useAppSelector(state => state.me)
  
  const login = trpc.user.login.useMutation({
    async onSuccess(data) {
      await AsyncStorage.setItem("token", data)

      dispatch(setLogin(true))
      
      if (!me) return
      
      dispatch(set({
        ...me,
        token: data
      }))
    },
    onError(err) {
      if (err.message === "INVALID_CREDENTIALS") {
        setInputs({
          key: "password",
          input: inputs.password.input,
          parser: z.string()
            .refine(() => false, {
              message: "L'email ou le mot de passe est incorrect"
            }) as unknown as z.ZodString
        })
      }
    }
  })

  const sendLoginData = () => {
    login.mutate({
      email: inputs.email.input,
      password: inputs.password.input,
    })
  }

  return <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}>  
      <TitleSubAuth title="Ravis de vour revoir !" sub="Entrez vos informations, pour poursuivre" />
      <Container>
        <Form>
          {renderInput({
            setInputs,
            inputs,
            parser: z.string()
              .email({ message: "L'email est incorrect" }),
            state: "email",
            label: "Adresse email",
            inputMode: "email",
            maxLength: 200,
          })}
          {showError(inputs.email)}

          {renderInput({
            setInputs,
            inputs,
            label: "Mot de passe",
            parser: z.string()
              .min(8, { message: "Le mot de passe doit faire minimum 8 caractère" }),
            state: "password",
            maxLength: 64,
            secureTextEntry: true,
          })}
          {showError(inputs.password)}

          <Button
            disabled={!Object.values(inputs).every(x => x.error === undefined) || Object.values(inputs).length <= 0}
            onPress={sendLoginData}
            $background='#333541'
            >
            <FText $color='white'>Se connecter</FText>
          </Button>
        </Form>
      </Container>
    </KeyboardAvoidingView>
  </ScrollView>
}
