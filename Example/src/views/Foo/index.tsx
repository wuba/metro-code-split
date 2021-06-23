import React, { FC } from 'react'
import { StyleSheet, SafeAreaView, View, Text } from 'react-native'
import type { StackNavigationProp } from '@react-navigation/stack'
import type { RouteProp } from '@react-navigation/native'
import { Views, RootStackParamList } from '../../types'

type FooProps = {
  navigation: StackNavigationProp<RootStackParamList, Views.Foo>
  route: RouteProp<RootStackParamList, Views.Foo>
}

const Foo: FC<FooProps> = () => {
  return (
    <SafeAreaView style={styles.SafeAreaView}>
      <View style={styles.View}>
        <Text style={styles.Text}>Foo 页面</Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  SafeAreaView: {
    flex: 1,
    borderWidth: 3,
    borderColor: 'blue',
  },
  View: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  Text: {
    color: 'blue',
    fontSize: 40,
  },
})

export default Foo
