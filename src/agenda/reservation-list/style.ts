import {StyleSheet} from 'react-native';
import * as defaultStyle from '../../style';
import {Theme} from '../../types';

export default function styleConstructor(theme: Theme = {}) {
  const appStyle = {...defaultStyle, ...theme};
  return StyleSheet.create({
    container: {
      flex: 1
    },
    innerContainer: {
      flex: 1
    },
    dayNum: {
      fontSize: 28,
      fontWeight: '200',
      fontFamily: appStyle.textDayFontFamily,
      color: appStyle.agendaDayNumColor
    },
    dayText: {
      fontSize: 14,
      fontWeight: appStyle.textDayFontWeight,
      fontFamily: appStyle.textDayFontFamily,
      color: appStyle.agendaDayTextColor,
      backgroundColor: 'rgba(0,0,0,0)',
      marginTop: -5
    },
    day: {
      width: 70,
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 10,
      paddingBottom: 10,
      borderTopWidth: 1,
      borderRightWidth: 1,
      borderTopRightRadius: 10, // Rounded corner on top right
      borderBottomRightRadius: 10, // Rounded corner on bottom right
      borderColor: '#CCCCCC' // Border color
    },
    today: {
      color: appStyle.agendaTodayColor
    },
    indicator: {
      marginTop: 20,
      marginBottom: 20
    },
    scrollToTopButton: {
      position: 'absolute',
      bottom: 20,
      right: 20,
      backgroundColor: '#ffffff',
      borderRadius: 50,
      padding: 15,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5
    },
    ...(theme['stylesheet.agenda.list'] || {})
  });
}
