import React from 'react';
import { StyleSheet, Text, View, FlatList, Dimensions, TouchableWithoutFeedback } from 'react-native';

const cols = 6, rows = 11;

let data = initialize_data(rows, cols);

const formatData = (data, numColumns) => {
  const numberOfFullRows = Math.floor(data.length / numColumns);

  let numberOfElementsLastRow = data.length - numberOfFullRows * numColumns;
  while (
    numberOfElementsLastRow !== numColumns &&
    numberOfElementsLastRow !== 0
  ) {
    data.push({ key: `blank-${numberOfElementsLastRow}`, empty: true });
    numberOfElementsLastRow++;
  }

  return data;
};


function make2Darray(rows, cols){
  arr = new Array(rows);

  for(let i = 0; i < arr.length; i++) {
    arr[i] = new Array(cols);
  }

  for(let i = 0; i < rows; i++){
    for(let j = 0; j < cols; j++){
      arr[i][j] = 0;
    }
  }

  return arr;
}

function initialize_data(rows, cols){
  data = new Array(rows * cols);
  
  for(let i = 0; i < data.length; i++) {
    data[i] = {key: i};
  }

  return data;
}

class Cell extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      item: this.props.item,
      index: this.props.index,
      pressed: false,
    }
  }

  styles = StyleSheet.create({
    item: {
      backgroundColor: 'black',
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      margin: 1,
      borderColor: 'black',
      borderWidth: 1,
      height: Dimensions.get('window').width / cols, // approximate a square
    },

    itemPressed: {
      backgroundColor: 'white',
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      margin: 1,
      borderColor: 'black',
      borderWidth: 1,
      height: Dimensions.get('window').width / cols, // approximate a square
    },
  })

  tooglePressed = () =>  (
    this.setState(prevState => {
      data[this.state.index] = 1;
      // console.warn(this.state.index)
      return({
        item: prevState.item,
        index: prevState.index,
        pressed: !prevState.pressed
      })
    })
  )

  getStyle = () => {
    if(this.state.pressed){
      return this.styles.itemPressed
    }else{
      return this.styles.item;
    }
  }

  render() {
    if (this.state.item.empty === true) {
      return <View style={[styles.item, styles.itemInvisible]} />;
    }
    return (
      <TouchableWithoutFeedback onPress = {this.tooglePressed}>
        <View style={this.getStyle()}>
          <Text style={styles.itemText}></Text>
        </View>
      </TouchableWithoutFeedback>
    )
  }
}

export default class App extends React.Component {
  renderItem = ({ item, index }) => {
    return (
      <Cell item = {item} index = {index} /> 
    )
  };

  render() {
    return (
      <FlatList
        data={formatData(data, cols)}
        style={styles.container}
        renderItem={this.renderItem}
        numColumns={cols}
      />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginVertical: 35,
  },
  item: {
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    margin: 1,
    borderColor: 'black',
    borderWidth: 1,
    height: Dimensions.get('window').width / cols, // approximate a square
  },
  itemInvisible: {
    backgroundColor: 'transparent',
  },
  itemText: {
    color: 'black',
  },
});
