import React, { FC } from 'react'
import { StyleSheet, SafeAreaView, View, Text } from 'react-native'
import type { StackNavigationProp } from '@react-navigation/stack'
import type { RouteProp } from '@react-navigation/native'
import { Views, RootStackParamList } from '../../types'

type BarProps = {
  navigation: StackNavigationProp<RootStackParamList, Views.Bar>
  route: RouteProp<RootStackParamList, Views.Bar>
}

const Bar: FC<BarProps> = ({ route }) => {
  console.log(route.params.userId)
  return (
    <SafeAreaView style={styles.SafeAreaView}>
      <View style={styles.View}>
        <Text style={styles.Text}>Bar 页面</Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  SafeAreaView: {
    flex: 1,
    borderWidth: 3,
    borderColor: 'red',
  },
  View: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  Text: {
    color: 'red',
    fontSize: 40,
  },
})

export default Bar
