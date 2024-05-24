import * as React from 'react';
import Svg, {G, Path, Circle} from 'react-native-svg';
import {memo} from 'react';
const SvgComponent = props => (
  <Svg xmlns="http://www.w3.org/2000/svg" xmlSpace="preserve" viewBox="0 0 48 48" width={36} height={36} {...props}>
    <G
      fill="none"
      stroke="#c77fc1"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit={10}
      strokeWidth={3}
      className="stroke-010101"
    >
      <Path d="M33.8 23.9 24 14.2l-9.8 9.7m19.6 9.9L24 24.1l-9.8 9.7" />
      <Circle cx={24} cy={24} r={21} />
    </G>
  </Svg>
);
const GoToTopIcon = memo(SvgComponent);
export default GoToTopIcon;
