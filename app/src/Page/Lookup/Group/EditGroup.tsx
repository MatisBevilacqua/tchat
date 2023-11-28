import { useRoute } from "@react-navigation/native"
import { useAppDispatch, useAppSelector } from "../../../store/store"
import { Container } from "../../css/lookup.css"
import { FText } from "../../../Components/FText"
import { ScrollView } from "react-native-gesture-handler"
import { Dimensions } from "react-native"
import z from "zod"
import { useState } from "react"
import { TextInput } from "../../../utils/formHelpers"
import { Button } from "../../css/auth.css"
import { trpc } from "../../../utils/trpc"
import { ButtonGroup } from "../../css/search.css"
import { SpaceBetweenButton } from "../../Auth/LangSelect"
import { FontAwesome } from "@expo/vector-icons"
import { langData } from "../../../data/lang/lang"

const { width } = Dimensions.get("window")

const nameInput = z
  .string()
  .trim()
  .min(2, {
    message: "Le nom du groupe doit faire au moins 2 caractères",
  })
  .max(50, {
    message: "Le nom du groupe doit faire maximum 50 caractères",
  })

export default function EditGroup () {
  const lang = useAppSelector(state => langData[state.language].groupLookup.edit)
  const route = useRoute<{ params: { id: string }, key: string, name: string }>()
  const group = useAppSelector(state => state.channels[route.params.id])
  const [error, setError] = useState<string>("")
  const [input, setInput] = useState<string>("")
  
  const editName = trpc.channel.group.editTitle.useMutation()
  const changeVisibility = trpc.channel.group.changeVisibility.useMutation()

  if (group && group.type !== "group") return null

  const onInputChange = (text: string) => {
    const result = nameInput.safeParse(text)

    setInput(text)

    if (!result.success) {
      setError(result.error.errors[0].message)
      return
    }

    setError("")
  }

  const onTitleSubmit = () => {
    editName.mutate({
      channelId: group.id,
      title: input
    })
  }

  const onChangeVisibility = (visibility: 0 | 1) => {
    if (changeVisibility.status === "loading") return
    if (visibility === group.visibility) return

    changeVisibility.mutate({
      channelId: group.id,
      visibility
    })
  }

  return <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
    <Container $marginTop={50}>
      <TextInput $height="43.7px" $width="90%" $borderColor={error ? "red" : undefined} onChangeText={onInputChange} placeholder="Title" defaultValue={group.title} />
      {error && <FText $size="12px" $color="red">{error}</FText>}
      {/* {editName.status === "success" && <FText $size="12px" $color="green">Le nom du groupe a bien étais changé</FText>} */}
      <Button
        $width={`${width * 0.9}px`}
        disabled={!!error}
        onPress={onTitleSubmit}
      >
        <FText $color='white'>{lang.changeName}</FText>
      </Button>
      <FText $color="white">{lang.visibility}</FText>
      <ButtonGroup>
        <SpaceBetweenButton onPress={() => onChangeVisibility(0)} $width={`${width * 0.45}px`}  $background="#2A2F3E">
          <FText $color="white">{lang.public}</FText>
          {group.visibility === 0 && (
            <FontAwesome name="check" size={16} color={"green"} />
          )}
        </SpaceBetweenButton>
        <SpaceBetweenButton onPress={() => onChangeVisibility(1)} $width={`${width * 0.45}px`} $background="#2A2F3E">
          <FText $color="white">{lang.private}</FText>
          {group.visibility === 1 && (
            <FontAwesome name="check" size={16} color={"green"} />
          )}
        </SpaceBetweenButton>
      </ButtonGroup>
    </Container>
  </ScrollView> 
}
