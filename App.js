import React from 'react';
import { StyleSheet, Text, View, FlatList, Dimensions, TouchableWithoutFeedback, Button, ScrollView } from 'react-native';

import {Crossword} from './Variable';
import CrosswordCreator from './Generate';
const ACROSS = 1
const DOWN = 2
const cols = 6, rows = 10;

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
  let arr = new Array(rows);

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
    data[i] = {key: i, value: 0};
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
      if(data[this.state.index].value === 0)
        data[this.state.index] = {key: this.state.index, value: 1};
      else
      data[this.state.index] = {key: this.state.index, value: 0};
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

  show = () => {
    if(data[this.state.index].value !== 0 && data[this.state.index].value !== 1){
      return data[this.state.index].value
    }
    return ""
  }
  
  render() {
    if (this.state.item.empty === true) {
      return <View style={[styles.item, styles.itemInvisible]} />;
    }
    return (
      <TouchableWithoutFeedback onPress = {this.tooglePressed}>
        <View style={this.getStyle()}>
          <Text style={styles.itemText}>{this.show()}</Text>
        </View>
      </TouchableWithoutFeedback>
    )
  }
}

function printData() {
  for(let i = 0; i < rows * cols; i++) {
      console.log('data(i, val): '+i+' '+data[i].value)
  }
}

export default class App extends React.Component {
  constructor() {
    super()
    this.state = {
      items: initialize_data(rows, cols)
    }
  }

  renderItem = ({ item, index }) => {
    return (
      <Cell item = {item} index = {index} /> 
    )
  };

  addWords = (letters) => {
    let lettersFlat = new Array(rows * cols)
    for(let i = 0; i < rows; i++) {
      for(let j = 0; j < cols; j++) {
        lettersFlat[i*cols + j] = {key: i*cols + j, value: letters[i][j]}
      }
    }
    data = [...lettersFlat]
    this.forceUpdate()
  }

  clickSolve = () => {
    let dataTemp = new Array(rows, cols)

    for(let i = 0; i < data.length; i++) {
      dataTemp[i] = data[i].value
    }

    let crossword = new Crossword(rows, cols, dataTemp)
    let creator = new CrosswordCreator(crossword)
    let assignment = creator.solve()

    if(assignment === null){
      console.warn("no solution")
    }else {
      creator.print_assignment(assignment)
      let letters = creator.letter_grid(assignment)
      this.addWords(letters)
      // printData()
    }
  }

  render() {
    return (
      <ScrollView style={{marginVertical: 35, flex: 1}}>
        <Button  title="Solve" onPress={this.clickSolve}/>
        <FlatList
          data={formatData(data, cols)}
          style={styles.container}
          renderItem={this.renderItem}
          numColumns={cols}
        />
        
      </ScrollView>
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
