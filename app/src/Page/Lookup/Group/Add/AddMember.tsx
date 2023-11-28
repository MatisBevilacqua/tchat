import { View } from "react-native";
import { trpc } from "../../../../utils/trpc";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import debounce from "lodash.debounce";
import { FlatList, TouchableOpacity, TextInput } from "react-native-gesture-handler";
import UserItem from "../../../../Components/UserItem";
import { addUsers } from "../../../../store/slices/usersSlice";
import { useAppDispatch, useAppSelector } from "../../../../store/store";
import { NavigationProp, useRoute } from "@react-navigation/native";
import { FText } from "../../../../Components/FText";
import { langData } from "../../../../data/lang/lang";
import { Montserrat_700Bold } from "@expo-google-fonts/montserrat";
import styled from "styled-components/native";

interface Props {
  navigation: NavigationProp<any>
}

export const SearchInput = styled.TextInput`
  width:95%;
  height:48px;
  padding:0 0 0 20px;
  margin: 20px 0 0 0;
  border-radius:9999px;
  background-color: white;
  color: black;
  align-self: center;
`

export function AddMember({ navigation }: Props) {
  const route = useRoute<{ params: { id: string }, key: string, name: string }>()
  const dispatch = useAppDispatch()
  const [search, setSearch] = useState("")
  const [addedUsers, setAddedUsers] = useState<Record<number, boolean>>({})
  const users = useAppSelector(state => state.users)
  const members = useAppSelector(state => state.channels[+route.params.id].users)
  const lang = useAppSelector(state => langData[state.language].addMember)

  const debouncedResults = useMemo(() => {
    return debounce(setSearch, 300);
  }, []);

  useEffect(() => {
    return () => {
      debouncedResults.cancel();
    };
  });

  const onNextPress = () => {
    const usersToAdd = Object.entries(addedUsers)
      .filter(([_, val]) => val)

    if (usersToAdd.length === 0) return

    navigation.navigate("addMemberConfirm", {
      id: route.params.id,
      addedUsers,
    })
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return <TouchableOpacity onPress={onNextPress}>
          <FText font={[Montserrat_700Bold, "Montserrat_700Bold"]} $color="#007aff">{lang.next}</FText>
        </TouchableOpacity> 
      }
    })
  })

  const usersSearch = trpc.user.search.useQuery({
    input: search,
    not: members,
  }, {
    enabled: search.length > 1,
    staleTime: 0,
  })

  const userPress = (id: number) => {
    setAddedUsers(val => ({
      ...val,
      [id]: !val[id]
    }))

    if (users[id]) return

    const user = usersSearch.data?.find((user: { id: number; }) => user.id === id)

    if (!user) return

    return dispatch(addUsers([user]))
  }

  return <View>
    <SearchInput
      placeholder={lang.search}
      onChangeText={(text: string) => {
        debouncedResults(text)
      }}
    />
    <FlatList
      style={{
        marginTop: 20
      }}
      contentInsetAdjustmentBehavior="automatic"
      data={usersSearch.data ?? []}
      renderItem={({ item }) => <UserItem theme="dark" addedUsers={addedUsers} groupMode={true} userPress={userPress} item={item} />}
      keyExtractor={item => item.id.toString()}
    />
  </View>;
}
