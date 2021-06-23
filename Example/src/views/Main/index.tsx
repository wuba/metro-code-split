import React, { FC } from 'react'
import { StyleSheet, ScrollView, View, Button } from 'react-native'
import type { StackNavigationProp } from '@react-navigation/stack'
import type { RouteProp } from '@react-navigation/native'
import { Views, RootStackParamList } from '../../types'

type MainProps = {
  navigation: StackNavigationProp<RootStackParamList, Views.Main>
  route: RouteProp<RootStackParamList, Views.Main>
}

const Main: FC<MainProps> = ({ navigation }) => {
  const handleFoo = () => navigation.navigate(Views.Foo)

  const handleBar = () => navigation.navigate(Views.Bar, { userId: '123' })

  return (
    <ScrollView>
      <View style={styles.View}>
        <Button onPress={handleFoo} title="跳转到 Foo" color="green" />
        <Button onPress={handleBar} title="跳转到 Bar" color="green" />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  View: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginTop: 30,
  },
})

export default Main
