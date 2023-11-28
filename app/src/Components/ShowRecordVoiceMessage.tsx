import React, { useEffect, useState } from 'react';
import { Audio } from 'expo-av';
import styled from 'styled-components/native';
import { host } from '../utils/host';
import { TouchableOpacity } from 'react-native';
import { FText } from './FText';
import * as FileSystem from 'expo-file-system';

const Container = styled.View`
  width: 100%;
  align-items: center;
  margin-top: 20px;
`;

const ButtonPlay = styled(TouchableOpacity)`
  width: 100px;
  height: 50px;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
`;

const ProgressBarContainer = styled.View`
  width: 200px;
  height: 10px;
  background-color: #ddd;
  margin-top: 20px;
`;

const ProgressBar = styled.View`
  height: 100%;
  width: 500px;
  background-color: #3498db;
`;

interface ShowRecordVoiceMessageProps {
  token: string;
  currentMessage: {
    audioFile?: string;
  };
  channelId: string;
  audioFile: string;
}

const ShowRecordVoiceMessage: React.FC<ShowRecordVoiceMessageProps> = ({
  token,
  channelId,
  audioFile,
}) => {
  const [voiceMessage, setVoiceMessage] = useState<Audio.Sound | null>(null);
  const [playbackStatus, setPlaybackStatus] = useState<Audio.PlaybackStatus | null>(null);

  const handlePlay = async () => {
    const soundObject = new Audio.Sound();
    const audioFileUrl = `http://${host}:3000/audioMessage/${channelId}/${audioFile}`;

    try {
      const fileExtension = '.m4a';
      const fileUri = FileSystem.documentDirectory + 'audiofile' + fileExtension;

      const { uri } = await FileSystem.downloadAsync(audioFileUrl, fileUri);
      console.log('File downloaded to:', uri);

      await soundObject.loadAsync({ uri, mimeType: 'audio/x-m4a' });

      soundObject.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setPlaybackStatus(status); // Mise à jour du statut de lecture
        }
      });

      await soundObject.playAsync();
      setVoiceMessage(soundObject);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getProgressBarWidth = () => {
    if (playbackStatus) {
      const progress = (playbackStatus.positionMillis / playbackStatus.durationMillis) * 100;
      return `${progress}%`;
    }
    return '0%';
  };

  return (
    <Container>
      <ButtonPlay onPress={handlePlay}>
        <FText>Play</FText>
      </ButtonPlay>
      <ProgressBarContainer>
        <ProgressBar style={{ width: getProgressBarWidth() }} />
      </ProgressBarContainer>
    </Container>
  );
};

export default ShowRecordVoiceMessage;
