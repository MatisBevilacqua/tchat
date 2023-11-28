import { Radio, VerticalGroup } from "../Page/css/search.css";
import { Group, InfoContainer, ProfilePictureContainer, UserContainer } from "../Page/css/user.css";
import { FontAwesome } from '@expo/vector-icons'
import { FText } from "./FText";
import { Montserrat_700Bold } from "@expo-google-fonts/montserrat";

interface IUser {
  id: number,
  name: string,
  surname: string,
  email: string,
}

interface BasicProps {
  item: IUser,
  userPress: (id: number) => void,
  theme?: "light" | "dark",
  strong?: boolean,
}

interface NormalProps extends BasicProps {
  groupMode: false,
  addedUsers: undefined,
}

interface GroupModeProps extends BasicProps {
  groupMode: true,
  addedUsers: Record<number, boolean>,
}

type Props = NormalProps | GroupModeProps

export default function UserItem({ item, addedUsers, groupMode, userPress, theme, strong }: Props) {
  return <UserContainer style={{ justifyContent: "space-between" }} onPress={() => userPress(item.id)}>
    <VerticalGroup>
      <ProfilePictureContainer>
        <FontAwesome name="user" size={24} />
      </ProfilePictureContainer>
      <InfoContainer>
        <Group>
          <FText font={strong ? [Montserrat_700Bold, "Montserrat_700Bold"] : undefined} $color={theme === "dark" ? "white" : "black"}>{item.surname} {item.name}</FText>
        </Group>
        <FText $color={theme === "dark" ? "white" : "black"}>{item.email}</FText>
      </InfoContainer>
    </VerticalGroup>
    {groupMode && <VerticalGroup>
      <Radio style={{
        backgroundColor: addedUsers[item.id] ? "#333541" : undefined,
      }}>
        {addedUsers[item.id] && <FontAwesome name="check" color={theme === "dark" ? "white" : "white"} size={16} />}
      </Radio>
    </VerticalGroup>}
  </UserContainer>
}
