import isFunction from 'lodash/isFunction';
import PropTypes from 'prop-types';
import XDate from 'xdate';
import React, {Component} from 'react';
import {ActivityIndicator, View, FlatList, TouchableOpacity, Text} from 'react-native';
import {extractReservationProps} from '../../componentUpdater';
import {sameDate} from '../../dateutils';
import {toMarkingFormat} from '../../interface';
import styleConstructor from './style';
import Reservation from './reservation';
import GoToTop from './UpArrawIcon';

class ReservationList extends Component {
  static displayName = 'ReservationList';
  static propTypes = {
    ...Reservation.propTypes,
    items: PropTypes.object,
    selectedDay: PropTypes.instanceOf(XDate),
    topDay: PropTypes.instanceOf(XDate),
    onDayChange: PropTypes.func,
    showOnlySelectedDayItems: PropTypes.bool,
    renderEmptyData: PropTypes.func,
    onScroll: PropTypes.func,
    onScrollBeginDrag: PropTypes.func,
    onScrollEndDrag: PropTypes.func,
    onMomentumScrollBegin: PropTypes.func,
    onMomentumScrollEnd: PropTypes.func,
    refreshControl: PropTypes.element,
    refreshing: PropTypes.bool,
    onRefresh: PropTypes.func,
    reservationsKeyExtractor: PropTypes.string,
    onEndReached: PropTypes.func,
    onEndReachedThreshold: PropTypes.number
  };
  static defaultProps = {
    refreshing: false,
    selectedDay: new XDate(true)
  };
  style;
  heights;
  selectedDay;
  scrollOver;
  list = React.createRef();
  constructor(props) {
    super(props);
    this.style = styleConstructor(props.theme);
    this.state = {
      reservations: [],
      heights: [],
      showScrollToTop: false // New state variable
    };
    this.heights = [];
    this.selectedDay = props.selectedDay;
    this.scrollOver = true;
  }
  componentDidMount() {
    //this.updateDataSource(this.getReservations(this.props).reservations);
    this.updateReservationsFromTopDay(this.props.topDay);
  }
  // componentDidUpdate(prevProps: ReservationListProps) {
  //   if (this.props.topDay && prevProps.topDay && prevProps !== this.props) {
  //     if (!sameDate(prevProps.topDay, this.props.topDay)) {
  //       this.setState({reservations: []}, () => this.updateReservations(this.props));
  //     } else {
  //       this.updateReservations(this.props);
  //     }
  //   }
  // }
  componentDidUpdate(prevProps) {
    //todo: check here any type
    if (
      this.props.topDay &&
      prevProps.topDay &&
      Object.values(prevProps.items).length !== Object.values(this.props.items).length
    ) {
      this.updateReservationsFromTopDay(this.props.topDay);
    }
    // Check if extraData has changed
    if (prevProps.extraData !== this.props.extraData) {
      //  console.log('extraData changed:', this.props.extraData);
      this.updateReservationsFromTopDay(this.props.topDay);
    }
  }
  // updateDataSource(reservations: DayAgenda[]) {
  //   this.setState({reservations});
  // }
  // updateReservations(props: ReservationListProps) {
  //   const {selectedDay, showOnlySelectedDayItems} = props;
  //   const reservations = this.getReservations(props);
  //   if (!showOnlySelectedDayItems && this.list && !sameDate(selectedDay, this.selectedDay)) {
  //     let scrollPosition = 0;
  //     for (let i = 0; i < reservations.scrollPosition; i++) {
  //       scrollPosition += this.heights[i] || 0;
  //     }
  //     this.scrollOver = false;
  //     this.list?.current?.scrollToOffset({offset: scrollPosition, animated: true});
  //   }
  //   this.selectedDay = selectedDay;
  //   this.updateDataSource(reservations.reservations);
  // }
  updateReservationsFromTopDay(topDay) {
    const {reservations} = this.getReservationsFromDay(topDay, this.props);
    if (reservations.length > 0) {
      this.setState({reservations: reservations});
    }
  }
  getReservationsFromDay(topDay, props) {
    const iterator = new XDate(topDay);
    let reservations = [];
    const itemKeys = Object.keys(props.items);
    for (let i = 0; i < itemKeys.length; i++) {
      const res = this.getReservationsForDay(iterator, props);
      if (res) {
        //todo: check here any type
        reservations = reservations.concat(res);
      }
      iterator.addDays(1);
    }
    return {reservations: reservations.reverse()};
  }
  getReservationsForDay(iterator, props) {
    const day = iterator.clone();
    const res = props.items?.[toMarkingFormat(day)];
    if (res && res.length) {
      return res.map((reservation, i) => {
        return {
          reservation,
          date: i ? undefined : day
        };
      });
    } else if (res) {
      return [
        {
          date: iterator.clone()
        }
      ];
    } else {
      return false;
    }
  }
  getReservations(props) {
    const {selectedDay, showOnlySelectedDayItems} = props;
    if (!props.items || !selectedDay) {
      return {reservations: [], scrollPosition: 0};
    }
    let reservations = [];
    if (this.state.reservations && this.state.reservations.length) {
      const iterator = this.state.reservations[0].date?.clone();
      if (iterator) {
        while (iterator.getTime() < selectedDay.getTime()) {
          const res = this.getReservationsForDay(iterator, props);
          if (!res) {
            reservations = [];
            break;
          } else {
            reservations = reservations.concat(res);
          }
          iterator.addDays(1);
        }
      }
    }
    const scrollPosition = reservations.length;
    const iterator = selectedDay.clone();
    if (showOnlySelectedDayItems) {
      const res = this.getReservationsForDay(iterator, props);
      if (res) {
        reservations = res;
      }
      iterator.addDays(1);
    } else {
      for (let i = 0; i < 31; i++) {
        const res = this.getReservationsForDay(iterator, props);
        if (res) {
          reservations = reservations.concat(res);
        }
        iterator.addDays(1);
      }
    }
    return {reservations, scrollPosition};
  }
  onScroll = event => {
    const yOffset = event.nativeEvent.contentOffset.y;
    this.props.onScroll?.(yOffset);
    let topRowOffset = 0;
    let topRow;
    for (topRow = 0; topRow < this.heights.length; topRow++) {
      if (topRowOffset + this.heights[topRow] / 2 >= yOffset) {
        break;
      }
      topRowOffset += this.heights[topRow];
    }
    const row = this.state.reservations[topRow];
    if (!row) return;
    const day = row.date;
    if (day) {
      if (!sameDate(day, this.selectedDay) && this.scrollOver) {
        this.selectedDay = day.clone();
        this.props.onDayChange?.(day.clone());
      }
    }

    // Show or hide the scroll to top button
    if (yOffset > 250) {
      this.setState({showScrollToTop: true});
    } else {
      this.setState({showScrollToTop: false});
    }
  };
  onListTouch() {
    this.scrollOver = true;
  }
  onRowLayoutChange(index, event) {
    this.heights[index] = event.nativeEvent.layout.height;
  }
  onMoveShouldSetResponderCapture = () => {
    this.onListTouch();
    return false;
  };
  renderRow = ({item, index}) => {
    const reservationProps = extractReservationProps(this.props);
    return (
      <View onLayout={this.onRowLayoutChange.bind(this, index)}>
        <Reservation {...reservationProps} item={item.reservation} date={item.date} />
      </View>
    );
  };
  keyExtractor = (item, index) => {
    return `${this.props.keyExtractor}${index}` || `${item?.reservation?.day}${index}`;
  };
  // Step 2: Add the "Scroll to Top" Button
  renderScrollToTopButton = () => {
    if (!this.state.showScrollToTop) {
      return null;
    }
    return (
      <TouchableOpacity style={this.style.scrollToTopButton} onPress={this.scrollToTop}>
        <GoToTop />
      </TouchableOpacity>
    );
  };

  scrollToIndex = index => {
    if (this.list.current) {
      this.list.current.scrollToIndex({index, animated: true});
    }
  };
  scrollToTop = () => {
    if (this.list.current) {
      this.list.current.scrollToOffset({offset: 0, animated: true});
    }
  };
  render() {
    // const {items, selectedDay, theme, style} = this.props;
    const {items, selectedDay, theme, style, extraData, onEndReached, onEndReachedThreshold} = this.props;
    if (!this.state.reservations.length || !items || (selectedDay && !items[toMarkingFormat(selectedDay)])) {
      if (isFunction(this.props.renderEmptyData)) {
        return this.props.renderEmptyData?.();
      }
      return <ActivityIndicator style={this.style.indicator} color={theme?.indicatorColor} />;
    }
    return (
      <View style={{flex: 1}}>
        <FlatList
          ref={this.list}
          style={style}
          contentContainerStyle={this.style.content}
          data={this.state.reservations}
          extraData={extraData}
          renderItem={this.renderRow}
          keyExtractor={this.keyExtractor}
          initialNumToRender={30} // Adjusted for better performance with large lists
          onEndReached={onEndReached}
          onEndReachedThreshold={onEndReachedThreshold}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={200}
          onMoveShouldSetResponderCapture={this.onMoveShouldSetResponderCapture}
          onScroll={this.onScroll}
          refreshControl={this.props.refreshControl}
          refreshing={this.props.refreshing}
          onRefresh={this.props.onRefresh}
          onScrollBeginDrag={this.props.onScrollBeginDrag}
          onScrollEndDrag={this.props.onScrollEndDrag}
          onMomentumScrollBegin={this.props.onMomentumScrollBegin}
          onMomentumScrollEnd={this.props.onMomentumScrollEnd}
          ListFooterComponent={() => {
            return this.props.isLoading ? (
              <ActivityIndicator style={this.style.indicator} color={theme?.indicatorColor} />
            ) : null;
          }}
        />
        {this.renderScrollToTopButton()}
      </View>
    );
  }
}
export default ReservationList;
