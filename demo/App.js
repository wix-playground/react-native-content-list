/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {StyleSheet, View, Text, Button, FlatList, ScrollView} from 'react-native';
import ContentList from 'react-native-content-list';

class ItemContent extends React.PureComponent {
  render() {
    return <Text style={styles.item}>{this.props.item.text}</Text>;
  }
}

function renderItem({item}) {
  return <ItemContent item={item}/>;
}

class ContentListDemo extends Component {
  render() {
    return (
      <ContentList
        ref={this.props.listRef}
        data={sampleData}
        renderItem={renderItem}
        defaultItemSize={80}
      />
    );
  }
}

class FlatListDemo extends Component {
  render() {
    return (
      <FlatList
        ref={this.props.listRef}
        data={sampleData}
        renderItem={renderItem}
      />
    );
  }
}

class ScrollViewDemo extends Component {
  render() {
    return (
      <ScrollView ref={this.props.listRef}>
        {sampleData.map((item) => <ItemContent key={item.key} item={item}/>)}
      </ScrollView>
    );
  }
}

export default class App extends Component {
  state = {listType: 'ContentList'}
  demoList = React.createRef();

  render() {
    const DemoList = this.state.listType === 'ContentList' ? ContentListDemo :
      this.state.listType === 'FlatList' ? FlatListDemo : ScrollViewDemo;
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Button title="ContentList" color={this.state.listType === 'ContentList' ? '#4444FF' : '#777777'} onPress={() => this.setState({listType: 'ContentList'})}/>
          <Button title="FlatList" color={this.state.listType === 'FlatList' ? '#4444FF' : '#777777'} onPress={() => this.setState({listType: 'FlatList'})}/>
          <Button title="ScrollView" color={this.state.listType === 'ScrollView' ? '#4444FF' : '#777777'} onPress={() => this.setState({listType: 'ScrollView'})}/>
        </View>
        <Button title="Scroll to end" color="#4444FF" onPress={() => this.demoList.current.scrollToEnd()}/>
        <View style={styles.demo}>
          <DemoList listRef={this.demoList}/>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 100,
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  header: {
    flexDirection: 'row'
  },
  demo: {
    flex: 1,
    alignSelf: 'stretch',
    backgroundColor: 'white',
  },
  item: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
});

function generateText(index) {
  const count = 1 + (index * 27 + 555) % 19 % 18 % 14 % 13 % 12 % 5;
  return Array(count).fill('---').join('\n') + `\nitem #${index + 1}`;
}

const sampleData = Array.from(new Array(3000)).map((v, i) => ({
  ...v,
  key: String(i),
  text: generateText(i),
}));
