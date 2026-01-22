import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';

const Profil = () => {
  return (
    <View>
      <Text>Profil</Text>
      <TouchableOpacity
        onPress={() => console.log("hi")}
        style={{backgroundColor:"red", padding:10}}
      >
        <Text>
          btn
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default Profil;
