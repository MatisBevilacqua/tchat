import {
  NavigationProp,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { trpc } from "../utils/trpc";
import { useAppDispatch, useAppSelector } from "../store/store";
import { FlatList, TouchableOpacity } from "react-native-gesture-handler";
import { addChannel } from "../store/slices/channelsSlice";
import { set } from "../store/slices/meSlice";
import { useEffect, useState } from "react";
import { addUsers } from "../store/slices/usersSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import jwtDecode from "jwt-decode";
import styled from "styled-components/native";
import { setPositions } from "../store/slices/notificationSlice";
import ChannelItem from "../Components/ChannelItem";
import Loading from "../Components/Loading";
import { FText } from "../Components/FText";
import { langData } from "../data/lang/lang";

const Stack = createNativeStackNavigator();

interface Props {
  navigation: NavigationProp<any>;
}

const ContainerTitle = styled.View`
  padding: 10px 0 20px 15px;
`;

const Container = styled.View`
  height: 100%;
  background-color: #333541;
  border-top-right-radius: 50px;
  border-top-left-radius: 50px;
  position: fixed;
  bottom: 0;
  padding: 20px 10px 0 10px;
`


export default function ChannelList({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const route = useRoute<{
    params: { id: string } | undefined;
    key: string;
    name: string;
  }>();
  const channels = trpc.channel.retrieveRecentChannels.useQuery(undefined, {
    staleTime: Infinity,
  });
  const meQuery = trpc.user.me.useQuery(undefined, {
    staleTime: Infinity,
  })
  const me = useAppSelector((state) => state.me);
  const users = useAppSelector((state) => state.users);
  const [isLoading, setIsLoading] = useState(true);
  const fetchUsers = trpc.user.retrieve.useMutation({
    onSuccess(data) {
      dispatch(addUsers(data));
      setIsLoading(false);
    },
  });

  useEffect(() => {
    if (!isLoading || !channels.data) return;

    dispatch(setPositions(channels.data.map((channel) => channel.id)));

    const toFetch: number[] = [];

    channels.data.forEach((channel) => {
      dispatch(addChannel(channel));

      // fetch users
      for (const id of channel.users) {
        if (users[id]) continue;

        toFetch.push(id);
      }
    });

    fetchUsers.mutate(toFetch);
  }, [channels]);

  useEffect(() => {
    if (!route.params?.id) return;

    navigation.navigate("channel", {
      id: route.params.id,
    });
  });

  useEffect(() => {
    if (meQuery.isError && meQuery.error?.data?.code === "UNAUTHORIZED") {
      AsyncStorage.removeItem("token");
      dispatch({ type: "RESET" })
    }

    if (me !== null) return;

    AsyncStorage.getItem("token").then((token) => {
      if (token) {
        dispatch(
          set({
            ...jwtDecode(token),
            token,
            ...(meQuery.data ?? {})
          })
        );
      }
    });
  }, [meQuery]);

  if (isLoading) return <Loading />;

  return <Stack.Navigator initialRouteName="channelList">
    <Stack.Screen
      name="channelList"
      component={List}
      options={{
        headerShown: false,
      }}
    />
  </Stack.Navigator>
}
function List() {
  const lang = useAppSelector((state) => langData[state.language].channelList);
  const channels = useAppSelector((state) => {
    return state.notification.positions.map(id => state.channels[id])
  });
  const me = useAppSelector((state) => state.me);
  const navigation = useNavigation<any>();

  const onChannelPress = (id: number) => {
    navigation.navigate("channel", {
      id: id,
    });
  };

  return <Container>
    <ContainerTitle>
      <FText $color="white" $size="18px">{lang.recentMessage}</FText>
    </ContainerTitle>
    <FlatList
      data={channels}
      renderItem={({ item }) => {
        if (item?.id === undefined) return null;
        
        return (
          <TouchableOpacity onPress={() => onChannelPress(item.id)}>
            <ChannelItem item={item} me={me} />
          </TouchableOpacity>
        );
      }}
      keyExtractor={(item) => item.id.toString()}
    />
  </Container>
}
