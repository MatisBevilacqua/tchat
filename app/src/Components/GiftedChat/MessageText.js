import PropTypes from 'prop-types';
import { Linking, StyleSheet, Text, View, } from 'react-native';
// @ts-ignore
import ParsedText from 'react-native-parsed-text';
import { StylePropType } from 'react-native-gifted-chat/lib/utils';
import { useChatContext } from 'react-native-gifted-chat/lib/GiftedChatContext';
import { error } from 'react-native-gifted-chat/lib/logging';
import { FText } from '../FText';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import { useAppSelector } from '../../store/store';
import { langData } from '../../data/lang/lang';
import { useEffect, useId, useState } from 'react';
import { trpc } from '../../utils/trpc';
import { host } from "../../utils/host";
import ShowRecordVoiceMessage from "../ShowRecordVoiceMessage";
import ky from 'ky';

const WWW_URL_PATTERN = /^www\./i;
const { textStyle } = StyleSheet.create({
    textStyle: {
        fontSize: 16,
        lineHeight: 20,
        marginTop: 5,
        marginBottom: 5,
        marginLeft: 10,
        marginRight: 10,
    },
});
const styles = {
    left: StyleSheet.create({
        container: {},
        text: {
            color: 'black',
            ...textStyle,
        },
        link: {
            color: 'black',
            textDecorationLine: 'underline',
        },
    }),
    right: StyleSheet.create({
        container: {},
        text: {
            color: 'white',
            ...textStyle,
        },
        link: {
            color: 'white',
            textDecorationLine: 'underline',
        },
    }),
};
const DEFAULT_OPTION_TITLES = ['Call', 'Text', 'Cancel'];
export function MessageText({ currentMessage = {}, optionTitles = DEFAULT_OPTION_TITLES, position = 'left', containerStyle, textStyle, linkStyle: linkStyleProp, customTextStyle, parsePatterns = () => [], textProps, onJoinPress = () => null }) {
    const { actionSheet } = useChatContext();

    const [voiceMessage, setVoiceMessage] = useState();
    // TODO: React.memo
    // const shouldComponentUpdate = (nextProps: MessageTextProps<TMessage>) => {
    //   return (
    //     !!currentMessage &&
    //     !!nextProps.currentMessage &&
    //     currentMessage.text !== nextProps.currentMessage.text
    //   )
    // }
    const onUrlPress = (url) => {
        // When someone sends a message that includes a website address beginning with "www." (omitting the scheme),
        // react-native-parsed-text recognizes it as a valid url, but Linking fails to open due to the missing scheme.
        if (WWW_URL_PATTERN.test(url)) {
            onUrlPress(`https://${url}`);
        }
        else {
            Linking.openURL(url).catch(e => {
                error(e, 'No handler for URL:', url);
            });
        }
    };
    const onPhonePress = (phone) => {
        const options = optionTitles && optionTitles.length > 0
            ? optionTitles.slice(0, 3)
            : DEFAULT_OPTION_TITLES;
        const cancelButtonIndex = options.length - 1;
        actionSheet().showActionSheetWithOptions({
            options,
            cancelButtonIndex,
        }, (buttonIndex) => {
            switch (buttonIndex) {
                case 0:
                    Linking.openURL(`tel:${phone}`).catch(e => {
                        error(e, 'No handler for telephone');
                    });
                    break;
                case 1:
                    Linking.openURL(`sms:${phone}`).catch(e => {
                        error(e, 'No handler for text');
                    });
                    break;
                default:
                    break;
            }
        });
    };
    const onEmailPress = (email) => Linking.openURL(`mailto:${email}`).catch(e => error(e, 'No handler for mailto'));
    const linkStyle = [
        styles[position].link,
        linkStyleProp && linkStyleProp[position],
    ];
    const lang = useAppSelector(state => langData[state.language].messageText)
    const groupInfo = trpc.channel.group.getInfo.useQuery(currentMessage.invite, {
      enabled: !!currentMessage.invite
    })
    const randomId = useId()
  
    const channelId = currentMessage.channelId;
    const audioFile = currentMessage.audioFile;

    const token = useAppSelector(state => state.me?.token)
  
    return (<View style={[
            styles[position].container,
            containerStyle && containerStyle[position],
        ]}>

      {currentMessage.audioFile !== undefined && (
        <ShowRecordVoiceMessage
          token={token}
          channelId={channelId}
          audioFile={audioFile}
        />
      )}

      <ParsedText style={[
            styles[position].text,
            textStyle && textStyle[position],
            customTextStyle,
        ]} parse={[
            // ...parsePatterns(linkStyle),
            { type: 'url', style: linkStyle, onPress: onUrlPress },
            { type: 'phone', style: linkStyle, onPress: onPhonePress },
            { type: 'email', style: linkStyle, onPress: onEmailPress },
            {
              pattern: /(:[a-zA-Z0-9]*:)/g,
              style: linkStyle,
              onPress: (match) => {
                if (match !== randomId) return

                onJoinPress(groupInfo.data)
              },
              renderText: () => {
                return `${lang.joinInvite} ${groupInfo.data.title}`
              }
            }
        ]} childrenProps={{ ...textProps }}>
          {[
            currentMessage.text === " " ? "" : currentMessage.text,
            currentMessage.invite && `${currentMessage.text !== " " ? "\n" : ""}${randomId}`
          ].join("")}
      </ParsedText>
    </View>);
}
MessageText.propTypes = {
    position: PropTypes.oneOf(['left', 'right']),
    optionTitles: PropTypes.arrayOf(PropTypes.string),
    currentMessage: PropTypes.object,
    containerStyle: PropTypes.shape({
        left: StylePropType,
        right: StylePropType,
    }),
    textStyle: PropTypes.shape({
        left: StylePropType,
        right: StylePropType,
    }),
    linkStyle: PropTypes.shape({
        left: StylePropType,
        right: StylePropType,
    }),
    parsePatterns: PropTypes.func,
    textProps: PropTypes.object,
    customTextStyle: StylePropType,
};
//# sourceMappingURL=MessageText.js.map
