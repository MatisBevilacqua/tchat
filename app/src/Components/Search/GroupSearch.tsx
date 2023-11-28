import { useNavigation } from "@react-navigation/native";
import { trpc } from "../../utils/trpc";
import { FlatList, TouchableOpacity } from "react-native-gesture-handler";
import { Platform } from "react-native";
import GroupItem from "../GroupItem";
import InvitGroup from "./InvitGroup";
import { useState } from "react";
import { useAppSelector } from "../../store/store";

interface Props {
  search: string;
  isSearchEmpty: boolean;
}

export default function GroupSearch({ search, isSearchEmpty }: Props) {
  const navigation = useNavigation<any>()
  const searchedGroups = trpc.channel.group.search.useQuery({
    query: search
  }, {
    enabled: search.length > 1
  })
  const joinGroup = trpc.channel.group.join.useMutation()

  const [close, setClose] = useState(true)

  const onGroupPress = async (index: number) => {
    const group = searchedGroups.data?.[index]

    if (!group) return
    if (group.visibility === 1) {
      setClose(false)
      return
    }

    await joinGroup.mutateAsync(group.id)

    navigation.navigate("channel", {
      id: group.id.toString()
    })
  }

  const onJoinPress = () => {

  }

  return <>
    <FlatList
      style={{
        backgroundColor: '#24252D'
      }}
      contentInsetAdjustmentBehavior="automatic"
      data={isSearchEmpty && Platform.OS === "android" ? [] : searchedGroups.data}
      renderItem={({ item, index }) => 
        <GroupItem onPress={onGroupPress} index={index} item={item} />
      }
      keyExtractor={item => item.id.toString()}
    />
    {!close && <InvitGroup onJoinPress={onJoinPress} onClose={() => setClose(true)}/>}
  </>;
}
