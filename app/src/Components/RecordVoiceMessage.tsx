import React, { useState } from 'react';
import { Audio } from 'expo-av';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import styled from 'styled-components/native';
import { MaterialIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { host } from '../utils/host';
import { useAppSelector } from '../store/store';
import ky from 'ky';

const ContainerButtonRecord = styled(TouchableWithoutFeedback)`
  height: 40px;
  width: 40px;
  background-color:#333541;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50px;
`;

interface Props {
  channelId: string;
}

export default function RecordVoiceMessage({ channelId }: Props): JSX.Element {
  const token = useAppSelector((state) => state.me?.token);

  const [recording, setRecording] = useState<Audio.Recording | undefined>();

  async function startRecording() {
    try {
      console.log('Requesting permissions..');
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Starting recording..');
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
      console.log('Recording started');

    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  async function stopRecording() {
    console.log('Stopping recording..');
    if (recording) {    
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
      const uri = recording.getURI();

      if (!uri) return

      const formData = new FormData()
      formData.append('audio', {
        uri,
        type: 'audio/m4a',
        name: 'audio.m4a',
      } as any);
      
      await ky.post(`http://${host}:3000/create/audioMessage/${channelId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      console.log('Recording stopped and stored at', uri);
      setRecording(undefined);
    } else {
      console.log('No recording to stop.');
    }
  }


  return (
    <ContainerButtonRecord onPress={recording ? stopRecording : startRecording}>
      <MaterialIcons name="keyboard-voice" size={24} color="#707179" />
    </ContainerButtonRecord>
  );
}
