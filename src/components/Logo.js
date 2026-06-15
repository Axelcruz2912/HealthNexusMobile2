import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

export default function Logo({ size = 'medium', style }) {
  const getSize = () => {
    switch(size) {
      case 'small':
        return { width: 100, height: 50 };
      case 'large':
        return { width: 200, height: 100 };
      default:
        return { width: 150, height: 75 };
    }
  };

  const logoUrl = 'https://z-cdn-media.chatglm.cn/files/e422f718-2f1b-43b1-8d33-abab22ae033a.png?auth_key=1880130553-c96ef22a7ec1475a8024ee420ae894cb-0-01473062212a4e246495206bff72dde3';
  
  return (
    <View style={[styles.container, style]}>
      <Image 
        source={{ uri: logoUrl }}
        style={[getSize(), styles.logo]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    marginBottom: 10,
  },
});