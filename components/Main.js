import React, { useState, useContext, useEffect } from 'react';
import {
  StyleSheet, View, Text, TouchableOpacity, Image, TextInput, Keyboard, Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { DrawerNavigator } from 'react-navigation';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Scheduler from './modules/Scheduler/Scheduler';
import TrackManager from './modules/TrackManagerTab';
import MyPage from './modules/MyPage';
import TrackMaster from './modules/TrackMaster/TrackMaster';
import FilterModal from './modules/Modal';
import getEnvVars from '../environment';
import { getUserLocation } from './modules/utils';
import { getUserSchedules } from './modules/API/schedule';
import dummySchedules from './modules/TrackMaster/dummyData/dummySchedules.json';
import { setUserLocation } from '../redux/action/TrackMaster/creators';
import userContext from './userContext';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 5,
  },
  header: {
    // flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f15c5c',
    alignItems: 'center',
    padding: 5,
  },
  main: {
    flex: 10,
    // backgroundColor: 'yellow',
    // alignItems: 'center',
    // justifyContent: 'center',
    padding: 5,
  },
  search: {
    backgroundColor: 'white',
    marginLeft: 10,
    width: 320,
    padding: 5,
  },
  filterButton: {
    position: 'absolute',
    right: 60,
    top: 19,
  },
  suggestion: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 0.5,
    padding: 5,
  },
});

export const Main = ({ route, info }) => {
  const navigation = useNavigation();
  const user = useContext(userContext);
  const [typing, setTyping] = useState(false);
  const [destination, setDestination] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [searching, setSearching] = useState(false); 
  const [userSchedules, setUserSchedules] = useState([]);
  const [location, setLocation] = useState({
    longitude: 0,
    latitude: 0,
  });
  // const { userInfo } = route.params;
  const { apiKey } = getEnvVars('dev');
  useEffect(() => {
    console.log('route ', route);
    console.log('info ', info);
  }, []);
  
  useEffect(() => {
    Keyboard.addListener('keyboardDidShow', () => setTyping(false));
    Keyboard.addListener('keyboardDidShow', () => setTyping(true));
    return () => {
      Keyboard.removeListener('keyboardDidShow', () => setTyping(false));
      Keyboard.removeListener('keyboardDidShow', () => setTyping(true));
    };
  }, [typing]);

  useEffect(() => {
    async function initializeLocation() {
      const { latitude, longitude } = await getUserLocation();
      setLocation({
        ...location,
        latitude,
        longitude,
      });
    }
    initializeLocation();
  }, []);

  // useEffect(() => {
  // 위치가 바뀌면 스케줄도 바뀌어야 한다.
  // }, [location]);

  const searched = () => {
    Keyboard.dismiss();
    setSearching(false);
    setDestination('');
  };

  const onSearch = () => {
    setSearching(true);
  };

  const pickedSearchedLocation = ({ lat, lng }) => {
    Keyboard.dismiss();
    setLocation({
      ...location,
      latitude: lat,
      longitude: lng,
    });
  };

  const toggleSideBar = () => {
    navigation.openDrawer();
  };

  const onChangeDestination = async (text) => {
    setDestination(text);
    const apiUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?key=${apiKey}&language=ko&input=${text}`;
    try {
      const result = await fetch(apiUrl);
      const json = await result.json();
      setPredictions(json.predictions);
    } catch (e) {
      console.error(e);
    }
  };

  const predictionsList = predictions.map((prediction) => (
    <TouchableOpacity
      key={prediction.id}
      style={styles.suggestion}
      onPress={async () => {
        const apiUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${prediction.place_id}&key=${apiKey}`;
        const result = await fetch(apiUrl);
        const json = await result.json();
        pickedSearchedLocation(json.result.geometry.location);
        searched();
      }}
    >
      <Text>{prediction.description}</Text>
    </TouchableOpacity>
  ));

  const renderRecommendation = () => {
    if (searching) {
      return (
        <View style={styles.main}>
          {predictionsList}
        </View>
      );
    }
  };

  const renderMainView = () => {
    if (!searching) {
      return (
        <TrackMaster mode="scheduleViewer" schedules={dummySchedules} initialCamera={location} />
      );
    }
  };

  const addSchedule = () => {
    console.log(user.user);
    navigation.navigate('Scheduler');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          toggleSideBar({ navigation });
        }}
        >
          <Image
            source={{ uri: 'https://reactnativecode.com/wp-content/uploads/2018/04/hamburger_icon.png' }}
            style={{ width: 25, height: 25, marginLeft: 15 }}
          />
        </TouchableOpacity>
        <TextInput
          style={styles.search}
          placeholder="검색"
          value={destination}
          onTouchStart={onSearch}
          onChangeText={onChangeDestination}
          onSubmitEditing={searched}
        />
      </View>
      <View style={styles.main}>
        {renderRecommendation()}
        {renderMainView()}
        <View style={styles.filterButton}>
          <FilterModal style={styles.main} />
        </View>
        <View style={{ alignSelf: 'center', alignItems: 'center' }}>
          <Icon.Button name="add-circle" color="black" size={30} backgroundColor="rgba(52, 52, 52, 0.0)" onPress={addSchedule} />
        </View>
      </View>
    </View>
  );
};

// const SideBar = DrawerNavigator({
//   Main: { screen: Main },
//   TrackManager: { screen: TrackManager },
//   MyPage: { screen: MyPage },
// });

const Drawer = createDrawerNavigator();

function SideBar({ route }) {
  console.log('test : ', route);
  return (
    <Drawer.Navigator initialRouteName="Main" screenOptions={route}>
      <Drawer.Screen name="Main" component={Main} options={({ route }) => {
        console.log('hh ', route);
      }} />
      <Drawer.Screen name="TrackManager" component={TrackManager} />
      <Drawer.Screen name="MyPage" component={MyPage} />
    </Drawer.Navigator>
  );
}

export default SideBar;
