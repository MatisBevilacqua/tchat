import { NavigationProp } from "@react-navigation/native"
import styled from "styled-components/native"
import { trpc } from "../utils/trpc"
import { useState } from "react"
import { FlatList, TouchableOpacity } from "react-native-gesture-handler"
import { Platform } from "react-native"
import { FText } from "../Components/FText"
import UserItem from "../Components/UserItem"
import { FontAwesome } from "@expo/vector-icons";
import { useAppSelector } from "../store/store"
import { langData } from "../data/lang/lang"


interface Props {
  navigation: NavigationProp<any>
}

const Wrapper = styled.View`
  height: 100%;
  background-color: #24252D;
`

export const SearchInput = styled.TextInput<{
  $width?: string
  $margin?: string
}>`
  width: ${({ $width }) => $width ?? "95%"};
  height: 48px;
  padding: 0 0 0 20px;
  margin: ${({ $margin }) => $margin ?? "20px 0 0 0"};
  border-radius: 9999px;
  background-color: #333541;
  color: white;
  align-self: center;
  align-self: center;
  border-radius: 10px;
`

const ValidateGroup = styled(TouchableOpacity)`
  width:70px;
  height:70px;
  background-color:#333541;
  border-radius: 30px;
  position:fixed;
  margin: 0 10px 40px 0;
  align-self: flex-end;
  display: flex;
  align-items: center;
  justify-content: center;
  color:white;
`;

export default function CreateGroup ({ navigation }: Props) {
  const lang = useAppSelector(state => langData[state.language].search)
  const [search, setSearch] = useState("")
  const [addedUsers, setAddedUsers] = useState<Record<number, boolean>>({})

  const searchedUsers = trpc.user.search.useQuery({
    input: search
  }, {
    enabled: search.length > 1
  })
  
  const createGroup = trpc.channel.create.useMutation({
    onSuccess(data) {
      navigation.navigate("chat", {
        screen: "channel",
        params: {
          id: data.id
        }
      })
    },
  })

  const onUserPress = (id: number) => {
    setAddedUsers(val => ({
      ...val,
      [id]: !val[id]
    }))
  }

  const onValidateGroupPress = () => {
    createGroup.mutate(Object.entries(addedUsers).filter(([_, val]) => val).map(([id]) => +id))
  }

  return <Wrapper>
    <SearchInput placeholderTextColor={"white"} onChangeText={setSearch} value={search} placeholder={`${lang.search}...`} />
    
    <FlatList
      style={{ marginTop: 20 }}
      contentInsetAdjustmentBehavior="automatic"
      data={search === "" && Platform.OS === "android" ? [] : searchedUsers.data}
      renderItem={({ item }) => <UserItem theme="dark" addedUsers={addedUsers} groupMode={true} userPress={onUserPress} item={item} />}
      keyExtractor={item => item.id.toString()}
    />
    <ValidateGroup onPress={onValidateGroupPress}>
      <FontAwesome name="angle-right" size={40} color="white" />
    </ValidateGroup> 
  </Wrapper>
}
