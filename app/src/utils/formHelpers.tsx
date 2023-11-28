import { InputModeOptions } from "react-native"
import { Action, InputsReducerState } from "../hooks/inputsReducer"
import { FText } from "../Components/FText"
import { styled } from "styled-components/native"
import { TextInput as DefaultTextInput } from "react-native-gesture-handler"

export const showError = (error: { error?: string | null } | undefined) => {
  return error?.error
  ? <FText $color="white">{error.error}</FText>
  : <></>
}

export const TextInput = styled(DefaultTextInput)<{
  $width?: string,
  $height?: string,
  $borderColor?: string }>`
  background: white;
  width: ${props => props.$width || "100%"};
  height: ${props => props.$height || "auto"};
  padding: 12px;
  /* border: 1px solid ${props => props.$borderColor || "#DADBDD"}; */
  border-radius: 10px;
  color: white;
  background-color:transparent;
  border: solid 2px ${props => props.$borderColor || "#D4B216"};
  box-shadow: 0px 1px 1.41px rgba(0, 0, 0, 0.2);
`

const TextInputLabel = styled.View<{$length: number}>`
  left: 10px;
  width: ${props => props.$length ? `${35 + props.$length * 8}px` : 'auto'};
  height: 18px;
  transform: translate(0, 10px);
  padding: 0 0 0 15px;
  display:flex;
  align-items: flex-start;
  justify-content: center;
  background-color:#24252D;
  position: relative;
  z-index: 1;
`;

const Container = styled.View`
  display:flex;
`;

type set = (action: Action) => void;

interface Props {
  setInputs: set,
  inputs: InputsReducerState,
  state: string,
  maxLength: number,
  secureTextEntry?: boolean,
  inputMode?: InputModeOptions,
  parser: any,
  label: string,
}

export const renderInput = ({
  setInputs,
  inputs,
  state,
  maxLength,
  secureTextEntry,
  inputMode,
  parser,
  onFocus,
  onChangeText,
  $width,
  label
}: Props & typeof TextInput.defaultProps) => {
  return <Container>
    <TextInputLabel $length={label.length}>
      <FText $color="white" $size="16px">{label}</FText>
    </TextInputLabel>
    <TextInput
      onChangeText={(e) => {
        if (onChangeText) onChangeText(e)
        
        setInputs({
          key: state,
          input: e,
          parser
        })
      }}
      value={inputs[state]?.input || ""}
      maxLength={maxLength}
      secureTextEntry={secureTextEntry}
      inputMode={inputMode}
      onFocus={onFocus}
      {...{
        $width,
        $borderColor: inputs[state]?.error ? "red" : undefined
      }}
    />
  </Container>
}
