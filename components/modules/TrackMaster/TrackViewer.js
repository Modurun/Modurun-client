/* eslint-disable react/jsx-props-no-spreading */
import { connect } from 'react-redux';
import React, { useState, useRef } from 'react';
import * as Location from 'expo-location';
import MapView, { Polyline, Marker, Callout } from 'react-native-maps';
import { Text, View } from 'react-native';
import styles from './style';
import Track from './Track';
import utils from './utils';

const { paleColor } = utils;

const TrackViewer = ({ curPosCamera, onRegionChange, onTrackSelected, tracks, initialCamera }) => {
  const [mapWidth, setMapWidth] = useState('99%');
  const [selectedTrack, setSelectedTrack] = useState(null);

  const mapView = useRef();

  const updateMapStyle = () => {
    setMapWidth('100%');
  };

  const syntheticInitialCamera = utils.makeCamera(initialCamera);

  const mapViewProps = {
    rotateEnabled: false,
    style: [styles.mapStyle, {
      width: mapWidth,
    }],
    showsUserLocation: true,
    onMapReady: () => {
      updateMapStyle();
    },
    onRegionChange: (region) => {
      // onRegionChange(region)
      // onTouchEnd로 콜백 위치가 바뀜.
    },
    onTouchEnd: () => {
      // eslint-disable-next-line no-underscore-dangle
      const lastRegion = mapView.current.__lastRegion;
      onRegionChange(lastRegion);
    },
    initialCamera: initialCamera ? syntheticInitialCamera : curPosCamera,
  };

  const onMarkerPress = (track) => {
    const {
      trackTitle,
      origin,
      destination,
      trackLength,
    } = track;
    setSelectedTrack(track);
    onTrackSelected({
      trackTitle,
      origin,
      destination,
      trackLength,
    });
  };

  if (!curPosCamera) return <></>; // spinner should be here;

  const renderCalloutProps = (calloutProps) => {
    const decideMarginBottom = (index) => (index < calloutProps.length - 1 ? 10 : 0);
    return calloutProps.map(([key, value, keyBackgroundColor, keyColor, valueBackgroundColor, valueColor], i) => (
      <View style={[styles.callloutPropRow, { marginBottom: decideMarginBottom(i) }]}>
        <Text style={styles.callloutPropKey(keyBackgroundColor, keyColor)}>{key}</Text>
        <Text style={styles.calloutPropValue(valueBackgroundColor, valueColor)}>{value}</Text>
      </View>
    ));
  };

  const colors = {
    from: 'rgba(148, 87, 255, 1)',
    span: 'rgba(74, 167, 255, 1)',
    trackTitle: 'rgba(42, 176, 82, 1)',
    trackLength: 'rgba(147, 176, 42, 1)',
    participants: 'rgba(247, 149, 57, 1)',
    maleSpan: 'rgba(169, 39, 179, 1)',
    femaleSpan: 'rgba(41, 201, 255, 1)',
  };

  const callOut = (track) => {
    const {
      trackTitle,
      trackLength,
      origin,
      destination,
    } = track;

    const calloutProps = [
      ['길이', `${trackLength}m`, colors.trackLength, 'white', paleColor(colors.trackLength)],
      ['시간(남)', '계산해야 됨', colors.maleSpan, 'white', paleColor(colors.maleSpan)],
      ['시간(여)', '계산해야 됨', colors.femaleSpan, 'white', paleColor(colors.femaleSpan)],
    ];

    return (
      <Callout tooltip>
        <View style={styles.calloutView}>
          <Text style={styles.calloutTitle}>{trackTitle}</Text>
          <View style={styles.calloutSeperator} />
          <View style={{ alignContent: 'space-between' }}>
            {renderCalloutProps(calloutProps)}
          </View>
        </View>
      </Callout>
    );
  };

  return (
    <MapView ref={mapView} {...mapViewProps}>
      {tracks.map((track) => (
        <Track
          key={track.trackTitle}
          visible={initialCamera ? true : track === selectedTrack}
          callOut={callOut(track)}
          onMarkerPress={onMarkerPress}
          track={track}
          data={track}
        />
      ))}
    </MapView>
  );
};

const mapStateToProps = (state) => ({
  curPosCamera: state.trackMaster.userLocation.curPosCamera,
});

export default connect(mapStateToProps, null)(TrackViewer);
