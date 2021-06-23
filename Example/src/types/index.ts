export enum Views {
  Main = 'Main',
  Foo = 'Foo',
  Bar = 'Bar',
}

export type RootStackParamList = {
  [Views.Main]: undefined;
  [Views.Foo]: undefined;
  [Views.Bar]: { userId: string };
}
