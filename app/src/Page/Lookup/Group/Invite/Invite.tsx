import { Montserrat_700Bold } from "@expo-google-fonts/montserrat"
import { NavigationProp, useRoute } from "@react-navigation/native"
import { useEffect, useLayoutEffect, useMemo, useState } from "react"
import { FlatList, TouchableOpacity } from "react-native-gesture-handler"
import { FText } from "../../../../Components/FText"
import { useAppSelector } from "../../../../store/store"
import { langData } from "../../../../data/lang/lang"
import { View } from "react-native"
import { SearchInput } from "../Add/AddMember"
import { Channel } from "../../../../store/slices/channelsSlice"
import UserItem from "../../../../Components/UserItem"
import { InfoContainer, ProfilePictureContainer, UserContainer } from "../../../css/user.css"
import { Group } from "../../../css/lookup.css"
import { FontAwesome } from "@expo/vector-icons"
import { Radio, VerticalGroup } from "../../../css/search.css"
import { trpc } from "../../../../utils/trpc"
import debounce from "lodash.debounce"
import { useDispatch } from "react-redux"
import { addUsers } from "../../../../store/slices/usersSlice"

interface Props {
  navigation: NavigationProp<any>
}

export default function Invite({ navigation }: Props) {
  const dispatch = useDispatch()
  const route = useRoute<{ params: { id: string }, key: string, name: string }>()
  const [addedChannels, setAddedChannels] = useState<Record<number, boolean>>({})
  const [addedUsers, setAddedUsers] = useState<Record<number, boolean>>({})
  const lang = useAppSelector(state => langData[state.language].addMember)
  const [search, setSearch] = useState("")
  const channelsToUsers = useAppSelector(state => {
    const users = []

    for (const id in addedChannels) {
      if (!addedChannels[id]) continue

      const channel = state.channels[id]

      if (!channel) continue

      users.push(...channel.users)
    }

    return users
  })
  const users = useAppSelector(state => state.users)

  const debouncedResults = useMemo(() => {
    return debounce(setSearch, 300);
  }, []);

  useEffect(() => {
    return () => {
      debouncedResults.cancel();
    };
  });

  const channels = useAppSelector((state) => {
    if (state.me === null) return []

    return state.notification.positions
      .map(id => state.channels[id])
      .filter(channel => channel.id !== +route.params.id)
  });
  const usersSearch = trpc.user.search.useQuery({
    input: search,
    not: channelsToUsers,
  }, {
    enabled: search.trimStart().length > 1
  })

  const onNextPress = () => {
    const channelsToAdd = Object.entries(addedChannels)
      .filter(([_, val]) => val)

    const usersToAdd = Object.entries(addedUsers)

    if (channelsToAdd.length === 0 && usersToAdd.length === 0) return

    navigation.navigate("inviteConfirm", {
      id: route.params.id,
      addedChannels,
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

  const onUserPress = (id: number) => {
    if (!users[id]) {
      if (!usersSearch.data) return

      const user = usersSearch.data.find(user => user.id === id)

      if (!user) return

      dispatch(addUsers([user]))
    }

    setAddedUsers(val => ({
      ...val,
      [id]: !val[id]
    }))
  }

  return <View>
    <SearchInput
      placeholder={lang.search}
      onChangeText={setSearch}
      value={search}
    />
    {search.trimStart().length > 1 ? (
      <FlatList
        style={{
          marginTop: 20
        }}
        contentInsetAdjustmentBehavior="automatic"
        data={usersSearch.data}
        renderItem={({ item }) => <UserItem strong theme="dark" addedUsers={addedUsers} groupMode={true} userPress={onUserPress} item={item} />}
        keyExtractor={item => item.id.toString()}
      />
    ) : (
      <FlatList
        style={{
          marginTop: 20
        }}
        contentInsetAdjustmentBehavior="automatic"
        data={channels}
        renderItem={({ item }) => <ChannelItem
          groupMode={true}
          item={item}
          addedChannels={addedChannels}
          setAddedChannels={setAddedChannels}
        />}
        keyExtractor={item => item.id.toString()}
      />
    )}
  </View>;
}

interface ViewModeItemProps {
  viewMode: true
  groupMode?: boolean
  item: Channel
  addedChannels: Record<number, boolean>
  setAddedChannels: undefined
}

interface NoViewModeItemProps {
  viewMode?: false
  groupMode?: boolean
  item: Channel
  addedChannels: Record<number, boolean>
  setAddedChannels: React.Dispatch<React.SetStateAction<Record<number, boolean>>>
}

type ItemProps = ViewModeItemProps | NoViewModeItemProps

export function ChannelItem ({ viewMode, item, addedChannels, setAddedChannels, groupMode }: ItemProps) {
  const lang = useAppSelector(state => langData[state.language].groupLookup)

  const onAdd = () => {
    if (viewMode) return
    
    setAddedChannels(val => ({
      ...val,
      [item.id]: !val[item.id]
    }))
  }

  if (item.type === "group") {
    return <UserContainer onPress={onAdd} style={{ flex: 1 }}>
      <InfoContainer style={{ flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
        <VerticalGroup>
          <ProfilePictureContainer>
            <FontAwesome name="group" size={24} />
          </ProfilePictureContainer>
          <Group style={{ height: "100%", flexDirection: "column", alignItems: "flex-start" }}>
            <FText $size="18px" $color="white" font={[Montserrat_700Bold, "Montserrat_700Bold"]}>
              {item.title}
            </FText>
            <FText $size="15px" $color="white">
              {`${item.users.length} ${item.users.length <= 1 ? lang.member : `${lang.member}s`}`}
            </FText>
          </Group>
        </VerticalGroup>
        {groupMode && (
          <VerticalGroup>
            <Radio style={{
              backgroundColor: addedChannels[item.id] ? "#202E44" : undefined,
            }}>
              {addedChannels[item.id] && <FontAwesome name="check" color={"white"} size={16} />}
            </Radio>
          </VerticalGroup>
        )}
      </InfoContainer>
    </UserContainer>
  }

  const user = useAppSelector(state => {
    const meId = state.me?.id

    if (!meId) return undefined

    const user = item.users.find(id => id !== meId)

    if (!user) return undefined

    return state.users[user]
  })

  if (user === undefined) return null

  return <UserItem
    strong
    groupMode
    theme="dark"
    addedUsers={{
      [user.id]: addedChannels[item.id]
    }}
    userPress={onAdd}
    item={user}
  />
}
