import React from 'react';
import {StyleSheet, View} from 'react-native';

export default class Cell extends React.PureComponent {
  reportSize = (event) => {
    this.props.onSizeCalculated(this.props.index, event.nativeEvent.layout.height);
  }

  render() {
    const {height, item, index, isMeasured, renderContent} = this.props;
    return (
      <View style={{height, overflow: 'hidden'}}>
        <View style={isMeasured ? styles.measuredCell : styles.unmeasuredCell} onLayout={this.reportSize}>
          {renderContent({item, index, height})}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  measuredCell: {position: 'absolute', top: 0, left: 0, right: 0},
  unmeasuredCell: {position: 'absolute', top: 0, left: 0, right: 0, opacity: 0}
});
