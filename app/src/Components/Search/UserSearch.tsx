import { FlatList } from "react-native-gesture-handler"
import { trpc } from "../../utils/trpc"
import { Platform } from "react-native"
import UserItem from "../UserItem"
import { useAppDispatch, useAppSelector } from "../../store/store"
import { NavigationProp, useNavigation } from "@react-navigation/native"
import { addUsers } from "../../store/slices/usersSlice"
import { addChannel } from "../../store/slices/channelsSlice"
import { addPosition } from "../../store/slices/notificationSlice"
import { initMessages } from "../../store/slices/messagesSlice"

interface Props {
  search: string
  isSearchEmpty: boolean
}

export default function UserSearch({ search, isSearchEmpty }: Props) {
  const navigation = useNavigation<any>()

  const usersSearch = trpc.user.search.useQuery({
    input: search
  }, {
    enabled: search.length > 1,
    staleTime: 0,
  })

  const retrieveMessages = trpc.channel.message.retrieveMessages.useMutation()
  const retrieveUsers = trpc.user.retrieve.useMutation()

  const dispatch = useAppDispatch()
  const usersId = useAppSelector(state => Object.keys(state.users))
  const channels = useAppSelector(state => state.channels)

  const createChannel = trpc.channel.create.useMutation({
    async onSuccess(data) {
      if (channels[data.id]) {
        navigation.goBack()
        return navigation.navigate("channel", {
          id: data.id
        })
      }

      let toFetch = []

      for (const id of data.users) {
        if (usersId.includes(id.toString())) continue

        toFetch.push(+id)
      }

      if (toFetch.length > 0) {
        let fetchedUsers = await retrieveUsers.mutateAsync(toFetch)

        dispatch(addUsers(fetchedUsers))
      }

      if (data.type === "group") {
        dispatch(addChannel({
          id: data.id,
          type: data.type,
          users: data.users,
          title: data.title,
          description: data.description,
          authorId: data.authorId,
          visibility: data.visibility,
          admins: data.admins,
        }))
      } else {
        dispatch(addChannel({
          id: data.id,
          type: data.type,
          users: data.users,
        }))
      }

      dispatch(addPosition(data.id))

      const messages = (await retrieveMessages.mutateAsync({
        channelId: +data.id
      })).map(message => ({
        ...message,
        createdAt: message.createdAt.toString(),
        updatedAt: message.updatedAt.toString(),
      }))

      dispatch(initMessages({
        channelId: data.id,
        messages: messages,
      }))

      navigation.goBack()
      navigation.navigate("channel", {
        id: data.id
      })
    },
  })

  const onUserPress = (id: number) => {
    createChannel.mutate(id)
  }

  return <>
    <FlatList
      style={{
        paddingTop: 20,
        backgroundColor: '#24252D'
      }}
      contentInsetAdjustmentBehavior="automatic"
      data={isSearchEmpty && Platform.OS === "android" ? [] : usersSearch.data}
      renderItem={({ item }) => <UserItem addedUsers={undefined} groupMode={false} theme="dark" userPress={onUserPress} item={item} />}
      keyExtractor={item => item.id.toString()}
    />
  </>
}
