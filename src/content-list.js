import React from 'react';
import PropTypes from 'prop-types';
import {FlatList} from 'react-native';
import Cell from './cell';
import {isEquivalent, fixed, partition, createLayoutCalculator, calculateLength, fitListItems, buildPatchFor, getCurrentPosition} from './utils';

export default class ContentList extends React.PureComponent {
  static propTypes = {
    data: PropTypes.array,
    keyExtractor: PropTypes.func,
    sizes: PropTypes.object,
    defaultItemSize: PropTypes.number.isRequired,
    windowSize: PropTypes.number,
  }

  static defaultProps = {
    windowSize: FlatList.defaultProps.windowSize,
  }

  scrollToEnd(options) {
    return this.list.current.scrollToEnd(options);
  }

  scrollToOffset(options) {
    return this.list.current.scrollToOffset(options);
  }

  list = React.createRef();
  state = this.getInitialState();
  sizeUpdates = [];
  delayedSizeUpdates = [];
  canChangeState = false;
  isScrolling = false;
  componentHeight = 0;
  contentLength = 0;
  scrollOffset = 0;

  requestItemUpdate = (index, height) => {
    this.sizeUpdates.push({index, height});
    if (this.sizeUpdates.length === 1) {
      requestAnimationFrame(this.updateItemSizes);
    }
  }

  performDelayedSizeUpdates = () => {
    this.sizeUpdates = this.sizeUpdates.concat(this.delayedSizeUpdates);
    this.delayedSizeUpdates = [];
    this.updateItemSizes();
  }

  updateItemSizes = () => {
    if (this.canChangeState) {
      if (this.isScrolling) {
        // When scrolling, ignore size changes to items that are far from currently displayed items.
        // Sizes for those items will get updated when scrolling stops.
        const cutOffPoint = this.scrollOffset - (this.props.windowSize * 0.2 * this.componentHeight);
        const {count: threshold} = fitListItems(cutOffPoint, this.state.getSize);
        const [immediate, delayed] = partition(this.sizeUpdates, (item) => item.index > threshold);
        this.sizeUpdates = immediate;
        if (delayed.length > 0) {
          this.delayedSizeUpdates = this.delayedSizeUpdates.concat(delayed);
        }
        if (immediate.length === 0) {
          return;
        }
      }

      const updates = this.sizeUpdates;
      this.sizeUpdates = [];

      this.setState((state, props) => {
        const patch = updates.reduce(buildPatchFor(state.sizes), {});
        if (Object.keys(patch).length !== 0) {
          const sizes = {...state.sizes, ...patch};
          const getSize = (index) => sizes[index] || props.defaultItemSize;
          if (!this.isScrolling) {
            // Change list scroll offset when not scrolling, attempting to keep the same items visible as before.
            // When scrolling, changes to item sizes are less noticeable because list is animating anyway.
            const position = getCurrentPosition(this.scrollOffset, this.contentLength - this.componentHeight);
            const stableOffset = this.scrollOffset + position * this.componentHeight;
            const old = fitListItems(stableOffset, state.getSize);
            const newLength = calculateLength(old.count, getSize);
            if (!isEquivalent(old.length, newLength)) {
              this.scrollOffset += newLength - old.length;
              this.list.current.scrollToOffset({offset: this.scrollOffset, animated: false});
            }
          }
          return {sizes, getSize, calculator: createLayoutCalculator(getSize)};
        }
      });
    }
  }

  setComponentHeight = (event) => {
    this.componentHeight = event.nativeEvent.layout.height;
  }

  setContentLength = (width, height) => {
    this.contentLength = height;
  }

  setScrollOffset = (event) => {
    this.scrollOffset = event.nativeEvent.contentOffset.y;
  }

  beginScrolling = () => {
    this.isScrolling = true;
  }

  endScrolling = () => {
    this.isScrolling = false;
    requestAnimationFrame(this.performDelayedSizeUpdates);
  }

  renderItem = ({item, index}) => {
    return (
      <Cell
        height={this.state.getSize(index)}
        item={item}
        index={index}
        isMeasured={this.state.sizes[index] !== undefined}
        renderContent={this.props.renderItem}
        onSizeCalculated={this.requestItemUpdate}
      />
    );
  }

  getInitialState() {
    const getSize = fixed(this.props.defaultItemSize);
    return {sizes: [], getSize, calculator: createLayoutCalculator(getSize)};
  }

  componentDidMount() {
    this.canChangeState = true;
  }

  componentWillUnmount() {
    this.canChangeState = false;
  }

  componentDidUpdate(prevProps) {
    if (prevProps.data !== this.props.data || prevProps.defaultItemSize !== this.props.defaultItemSize) {
      this.setState(this.getInitialState());
    }
  }

  render() {
    return (
      <FlatList
        ref={this.list}
        data={this.props.data}
        keyExtractor={this.props.keyExtractor}
        extraData={this.state.sizes}
        renderItem={this.renderItem}
        getItemLayout={this.state.calculator}
        style={this.props.style}
        contentContainerStyle={this.props.contentContainerStyle}
        contentInset={this.props.contentInset}
        keyboardDismissMode={this.props.keyboardDismissMode}
        windowSize={this.props.windowSize}
        onLayout={this.setComponentHeight}
        onContentSizeChange={this.setContentLength}
        onScroll={this.setScrollOffset}
        onScrollBeginDrag={this.beginScrolling}
        onScrollEndDrag={this.endScrolling}
        onMomentumScrollBegin={this.beginScrolling}
        onMomentumScrollEnd={this.endScrolling}
      />
    );
  }
}
