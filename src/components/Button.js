import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { globalStyles } from '../styles/globalStyles';
import { colors } from '../styles/theme';

export default function Button({ 
  title, 
  onPress, 
  loading = false, 
  variant = 'primary',
  icon,
  style,
  disabled 
}) {
  const getButtonStyle = () => {
    switch(variant) {
      case 'secondary':
        return globalStyles.buttonSecondary;
      case 'outline':
        return globalStyles.buttonOutline;
      default:
        return {};
    }
  };

  const getTextStyle = () => {
    switch(variant) {
      case 'outline':
        return globalStyles.buttonOutlineText;
      default:
        return {};
    }
  };

  return (
    <TouchableOpacity
      style={[
        globalStyles.button,
        getButtonStyle(),
        (loading || disabled) && { opacity: 0.7 },
        style,
      ]}
      onPress={onPress}
      disabled={loading || disabled}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? colors.primary : colors.white} />
      ) : (
        <>
          {icon && <Text style={styles.icon}>{icon}</Text>}
          <Text style={[globalStyles.buttonText, getTextStyle()]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  icon: {
    marginRight: 8,
    fontSize: 16,
  },
});