import styled from 'styled-components/native';
import { FText } from '../FText';
import { Button } from '../../Page/css/auth.css';
import { ProfilePictureContainer } from '../../Page/css/user.css';
import { FontAwesome } from "@expo/vector-icons";

interface Props {
  onClose: () => void;
  onJoinPress: () => void;
}

const Container = styled.View`
  width:100%;
  height:300px;
  border-top-left-radius:30px;
  border-top-right-radius:30px;
  display:flex;
  align-items:center;
  background-color:#333541;
  position:fixed;
  bottom:0;
  flex-direction:column;
  justify-content:center;
  //border:solid 2px #D4B216;
  border-bottom-width:0;
  gap:30px;
`;

const CloseContainer = styled.View`

`

export default function Invite({ onClose, onJoinPress }: Props) {
  return(
    <Container>
      <FontAwesome color={"white"} name='close' onPress={onClose} />
      <ProfilePictureContainer>
        <FontAwesome name="group" size={30} />
      </ProfilePictureContainer>
      <FText $color='white'>Groupe de bernard</FText>
      <Button
        $background='#24252D'
        $width='300px'
        onPress={onJoinPress}
      >
        <FText $color='white'>Demander à rejoindre</FText>
      </Button>
    </Container>
  );
}
