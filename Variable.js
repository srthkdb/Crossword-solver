const ACROSS = 1
const DOWN = 2
//revise domains definition

export class Variable {
  constructor(i, j, direction, length, ind){
    this.ind = ind
    this.i = i
    this.j = j
    this.direction = direction
    this.length = length
    this.cells = []
    for(let k = 0; k < this.length; k++) {
      if(this.direction == ACROSS) {
        this.cells.push({
          i: this.i,
          j: this.j + k
        })
      }else {
        this.cells.push({
          i: this.i + k,
          j: this.j,
        })
      }
    }
  }

  printVar = (i) => {
    console.log('ind in array: ' + i + ' ind: ' + this.ind + ', i: ' + this.i + ' j: ' + this.j +' len: '+this.length+' dir: '+this.direction)
  }

  
}

function isEqual(other, this1){
  return (
  this1.i === other.i && this1.j === other.j && this1.direction === other.direction && this1.length === other.length
)}

export class Crossword {
  constructor(height, width, data) {
    this.height = height
    this.width = width
    this.structure = new Array(this.height)
    for(let i = 0; i < this.height; i++) {
      this.structure[i] = new Array(this.width)
    }

    for(let i = 0; i < this.height; i++) {
      for(let j = 0; j < this.width; j++) {
        this.structure[i][j] = data[this.width * i + j]
      }
    }

    this.words = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten']

    // fs.readFile('Input.txt', 'utf-8', (err, data) => { 
    //   if (err) throw err; 
    //   // console.log(data); 
    //   this.words.add(data);
    // }) 

    this.variables = [];

    for(let i = 0; i < this.height; i++) {
      for(let j = 0; j < this.width; j++) {
        // vertical words
        let starts_word = (this.structure[i][j] && (i == 0 || !this.structure[i-1][j]))
        if(starts_word) {
          let len = 1
          for(let k = i + 1; k < this.height; k++){
            if(this.structure[k][j]) len++;
            else break;
          }

          if(len > 1) {
            this.variables.push(new Variable(i, j, DOWN, len, this.variables.length))
          }
        }

        // horizontal words
        starts_word = (this.structure[i][j] && (j == 0 || !this.structure[i][j - 1]))
        if(starts_word) {
          let len = 1
          for(let k = j + 1; k < this.width; k++){
            if(this.structure[i][k]) len++;
            else break;
          }

          if(len > 1) {
            this.variables.push(new Variable(i, j, ACROSS, len, this.variables.length))
          }
        }

      }
    }

    this.overlaps = new Array(this.variables.length)

    for(let i = 0; i < this.overlaps.length; i++)
      this.overlaps[i] = new Array(this.variables.length)

    for(let v1 = 0; v1 < this.variables.length; v1++){
      for(let v2 = 0; v2 < this.variables.length; v2++){
        if(v1 === v2){
          this.overlaps[v1][v2] = false
          continue
        }
        let cells1 = this.variables[v1].cells
        let cells2 = this.variables[v2].cells
        let intersect = intersection(cells1, cells2)
        if(intersect === null) {
          this.overlaps[v1][v2] = false
          // console.log('overlap['+v1+', '+v2+' ] = (null)')
        }else {
          this.overlaps[v1][v2] = {i: intersect.i, j: intersect.j}
          // console.log('overlap['+v1+', '+v2+' ] = ('+ this.overlaps[{v1: v1, v2: v2}].i + ', '+ this.overlaps[{v1: v1, v2: v2}].j+')')
        }
      }
    }


  }

  neighbours = (va) => {
    let s = []

    for(let i = 0; i < this.variables.length; i++) {
      if(i == va) continue;
      if(this.overlaps[va][i]) {
        s.push(this.variables[i])
      }
    }

    return s
  }

  printVaribles = () => {
    console.log('this.variables.length: ' + this.variables.length)
    for(let i = 0; i < this.variables.length; i++) {
      this.variables[i].printVar(i)
    }
  }

  printStr = () => {
    console.log('structure')
    for(let i = 0; i<this.height; i++){
      for(let j = 0; j < this.width; j++){
        console.log('i: '+i+' j: '+j+' val: '+this.structure[i][j] + ' ')
      }
    }
  }

  printOverlaps = () => {
    console.log('printing Overlaps')
    for(let i = 0 ; i < this.variables.length; i++) {
      for(let j = 0 ; j < this.variables.length; j++) {
        let intersect = this.overlaps[i][j]
        if(intersect === false) {
          console.log('overlap['+i+', '+j+'] = (false)')
        }else{
          console.log('overlap['+i+', '+j+'] = ('+ intersect.i + ', '+ intersect.j+')')
        }
      }
    }
  }
}

function intersection(cellA, cellB) {
  for(let i1 = 0; i1 < cellA.length; i1++){
    for(let i2 = 0; i2 < cellB.length; i2++){
      if(cellA[i1].i === cellB[i2].i && cellA[i1].j === cellB[i2].j){
        return {i: i1, j: i2}
      }
    }
  }
  return null
}

