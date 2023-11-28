import { NavigationProp, useRoute } from "@react-navigation/native"
import { FlatList, TouchableOpacity } from "react-native-gesture-handler";
import { useAppSelector } from "../../../../store/store";
import UserItem from "../../../../Components/UserItem";
import { useLayoutEffect, useState } from "react";
import { langData } from "../../../../data/lang/lang";
import { Montserrat_700Bold } from "@expo-google-fonts/montserrat";
import { FText } from "../../../../Components/FText";
import { trpc } from "../../../../utils/trpc";

interface Props {
  navigation: NavigationProp<any>
}

export default function AddMemberConfirm({ navigation }: Props) {
  const route = useRoute<{ params: { id: string, addedUsers: Record<number, boolean> }, key: string, name: string }>()
  const [addedUsers, setAddedUsers] = useState<Record<number, boolean>>(route.params.addedUsers)
  const users = useAppSelector(state => {
    const usersToAdd = Object.entries(addedUsers)
      .filter(([_, val]) => val)
      .map(([key, _]) => +key)

    return usersToAdd.map(id => state.users[id])
  })
  const lang = useAppSelector(state => langData[state.language].addMember)
  const addMembers = trpc.channel.group.addMembers.useMutation()

  const onConfirmPress = async () => {
    const usersToAdd = Object.entries(addedUsers)
      .filter(([_, val]) => val)
      .map(([key, _]) => +key)

    await addMembers.mutateAsync({
      channelId: +route.params.id,
      membersIds: usersToAdd,
    })

    navigation.goBack()
    navigation.goBack()
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return <TouchableOpacity onPress={onConfirmPress}>
          <FText font={[Montserrat_700Bold, "Montserrat_700Bold"]} $color="#007aff">{lang.confirm}</FText>
        </TouchableOpacity> 
      }
    })
  })

  const userPress = (id: number) => {
    setAddedUsers({
      ...addedUsers,
      [id]: !addedUsers[id],
    })
  }

  return <FlatList  
    style={{
      marginTop: 20
    }}
    contentInsetAdjustmentBehavior="automatic"
    data={users}
    renderItem={({ item }) => <UserItem theme="dark" addedUsers={addedUsers} groupMode={true} userPress={userPress} item={item} />}
    keyExtractor={item => item.id.toString()}
  />
}
