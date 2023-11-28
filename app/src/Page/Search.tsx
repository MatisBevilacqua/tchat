import { NavigationProp } from "@react-navigation/native";
import { useEffect, useMemo, useState } from "react";
import debounce from "lodash.debounce";
import { FText } from "../Components/FText";
import { useAppSelector } from "../store/store";
import { Container } from "./css/search.css";
import { langData } from "../data/lang/lang";
import UserSearch from "../Components/Search/UserSearch";
import GroupSearch from "../Components/Search/GroupSearch";
import { SearchInput } from "./CreateGroup";
import styled from 'styled-components/native';
import Checkbox from 'expo-checkbox';
import InvitGroup from "../Components/Search/InvitGroup";

interface Props {
  navigation: NavigationProp<any>
}

const ButtonGroupFilter = styled.View`
  display:flex;
  align-self:center;
  width:95%;
  margin:20px 0 0 0;
  height: 48px;
  border-radius: 8px;
  border:solid 1px #D4B216;
  padding: 0 10% 0 10%;
  align-items:center;
  flex-direction:row;
  justify-content:space-between;
`

export default function Search({ navigation }: Props) {
  const lang = useAppSelector(state => langData[state.language].search)

  const [search, setSearch] = useState(["", ""])
  const isSearchEmpty = useMemo(() => search.length === 0, [search])

  const debouncedResults = useMemo(() => {
    return debounce(setSearch, 300);
  }, []);

  useEffect(() => {
    return () => {
      debouncedResults.cancel();
    };
  });

  const [filter, setFilter] = useState<"user" | "group">("user")

  const onTextChange = (text: string) => {
    if (filter === "user") setSearch(val => [text, val[1]])
    else setSearch(val => [val[0], text])
  }

  return <Container>
    <SearchInput placeholderTextColor={"white"} onChangeText={onTextChange} value={filter === "user" ? search[0] : search[1]} placeholder={`${lang.search}...`} />
    <ButtonGroupFilter>
      <FText $color="white">Utilisateurs</FText>
      <Checkbox
        value={filter === "user"}
        onValueChange={() => setFilter("user")}
        color={filter ? '#333541' : undefined}
      />

      <FText $color="white">Group</FText>
      <Checkbox
        value={filter === "group"}
        onValueChange={() => setFilter("group")}
        color={filter ? '#333541' : undefined}
      />
    </ButtonGroupFilter>

    {filter === "user" 
      ? <UserSearch isSearchEmpty={isSearchEmpty} search={search[0]}/> 
      : <GroupSearch isSearchEmpty={isSearchEmpty} search={search[1]} />}
  </Container>
}
