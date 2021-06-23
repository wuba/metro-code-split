import React, { Suspense, lazy } from 'react'
import { Text } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import Main from './views/Main'
import { Views, RootStackParamList } from './types'

const Stack = createStackNavigator<RootStackParamList>()
const Foo = lazy(() => import('./views/Foo'))
const Bar = lazy(() => import('./views/Bar'))

const App = () => (
  <Suspense fallback={<Text>Loading...</Text>}>
    <NavigationContainer>
      <Stack.Navigator initialRouteName={Views.Main}>
        <Stack.Screen name={Views.Main} component={Main} />
        <Stack.Screen name={Views.Foo} component={Foo} />
        <Stack.Screen name={Views.Bar} component={Bar} />
      </Stack.Navigator>
    </NavigationContainer>
  </Suspense>
)

export default App
