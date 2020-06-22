import * as Location from 'expo-location';
import moment from 'moment';

const customizingDateAndTime = (date, time) => {
  let arr;
  let result;
  if (date && !time) {
    const d = moment(date).format('M-D');
    arr = d.split('-');
    result = `${arr[0]}월 ${arr[1]}일`;
  } else {
    const d = moment(time).format('HH:mm:ss');
    arr = d.split(':');
    result = `${arr[0]}시 ${arr[1]}분`;
  }
  return result;
};

const meterToKilo = (meter) => (meter / 1000).toFixed(2);

const getUserLocation = async () => {
  const { status } = await Location.requestPermissionsAsync();
  if (status !== 'granted') {
    return 'Permission to access location was denied';
  }
  const { coords } = await Location.getCurrentPositionAsync();
  return coords;
};

const getScheduleData = (createdScheduleInfo) => {
  const {
    title, date, startTime, estimateTime, estimateMin, selectedTrack,
  } = createdScheduleInfo;
  const time = moment(startTime);
  const from = moment(date).set({ hour: time.get('hour'), minute: time.get('minute') });
  const to = moment(from).add(estimateTime, 'hours').add(estimateMin, 'minutes');
  const res = {
    trackId: selectedTrack.trackId,
    scheduleTitle: title,
    from,
    to,
  };
  return res;
};

module.exports = {
  customizingDateAndTime,
  meterToKilo,
  getUserLocation,
  getScheduleData,
};
