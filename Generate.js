import {Crossword, Variable} from './Variable';
import Queue from './Queue'

const ACROSS = 1
const DOWN = 2

export default class CrosswordCreator {
  constructor(crossword) {
    this.crossword = crossword
    this.domains = new Array(this.crossword.variables.length)

    //this.domains[variable.ind] = [...words in domain of variable]
    for(let i = 0; i < this.crossword.variables.length; i++) {
      this.domains[i] = [...this.crossword.words]
    }
  }

  //assignment[k] = {variable: v, word: w}

  letter_grid = (assignment) => {
    //returns a 2d array representing given assignment

    let letters = new Array(this.crossword.height)
    for(let i = 0; i < letters.length; i++) {
      letters[i] = new Array(this.crossword.width)
    }
    for(let i = 0 ; i < this.crossword.height; i++){
      for(let j = 0 ; j < this.crossword.width; j++){
        letters[i][j] = false;
      }
    }

    for(let k = 0; k < assignment.length; k++) {
      let v = assignment[k].variable
      let w = assignment[k].word 
      let direction = v.direction
      let i = v.i
      let j = v.j
      for(let x = 0; x < w.length; x++) {
        if(direction === DOWN) {
          i = v.i + x
          j = v.j
        }else {
          j = v.j + x
          i = v.i
        }
        letters[i][j] = w[x]
      }
    }

    return letters
  }

  print_assignment = (assignment) => {
    //print crossword assignment to console.log

    let letters = this.letter_grid(assignment)
    let ans = ""
    console.log("printing assignment")
    for(let i = 0; i < this.crossword.height; i++) {
      for(let j = 0; j < this.crossword.width; j++) {
        if(this.crossword.structure[i][j]) {
         if(letters[i][j]) {
           ans += letters[i][j]
         }else{
           ans += " "
         }
        }else {
          ans += "_"
        }
      }
      console.log(ans)
      ans = ""
    }
  } 

  solve = () => {
    this.enforce_node_consistency()
    this.ac3()

    assignment = new Array(this.crossword.variables.length)
    for(let i = 0; i < this.crossword.variables.length; i++) {
      assignment[i] = {variable: this.crossword.variables[i], word: false}
    }

    return this.backtrack(assignment)
  }

  enforce_node_consistency = () => {
    // Update `this.domains` such that each variable is node-consistent.
    // (Remove any values that are inconsistent with a variable's unary
    // constraints; in this case, the length of the word.)
    for(let i = 0; i < this.crossword.variables.length; i++) {
      let curr_length = this.crossword.variables[i].length
      let new_domain = []
      for(let j = 0; j < this.domains[i].length; j++) {
        if(this.domains[i][j].length === curr_length) {
          new_domain.push(this.domains[i][j])
        }
      }
      this.domains[i] = [...new_domain]
    }
  }

  revise = (x, y) => {
    // Make variable `x` arc consistent with variable `y`.
    // To do so, remove values from `self.domains[x]` for which there is no
    // possible corresponding value for `y` in `self.domains[y]`.

    // Return True if a revision was made to the domain of `x`; return
    // False if no revision was made.
    if(this.crossword.overlaps[x][y] === false) {
      return false
    }
    let overlap_x = this.crossword.overlaps[x][y].i
    let overlap_y = this.crossword.overlaps[x][y].j
    let new_domain_x = []
    let changes = false
    for(let i = 0; i < this.domains[x].length; i++) {
      let word_x = this.domains[x][i]
      let has_corresponding_value = false
      let overlap_c = word_x[overlap_x]

      for(let j = 0; j < this.domains[y].length; j++) {
        let word_y = this.domains[y][j]
        if(word_y[overlap_y] === overlap_c) {
          has_corresponding_value = true
          break
        }
      }

      if(has_corresponding_value) {
        new_domain_x.push(word_x)
        changes = true
      }
    }

    this.domains[x] = [...new_domain_x]

    return changes
  }

  ac3 = () => {
    // Update `self.domains` such that each variable is arc consistent.
    // If `arcs` is None, begin with initial list of all arcs in the problem.
    // Otherwise, use `arcs` as the initial list of arcs to make consistent.

    // Return True if arc consistency is enforced and no domains are empty;
    // return False if one or more domains end up empty.
    for(let i = 0; i < this.crossword.variables.length; i++) {
      worklist = new Queue()
      // 'worklist' contains all arcs we wish to prove consistent or not.
      for(let j = 0; j < this.crossword.variables.length; j++) {
        if(this.crossword.overlaps[i][j]) {
          worklist.enqueue({x: i, y: j})
        }
      }
      while(!worklist.isEmpty()) {
        let arc = worklist.dequeue()
        if(this.revise(arc.x, arc.y)) {
          if(this.domains[arc.x].length == 0) {
            //if no value left in x, return false
            return false
          }

          for(let j = 0; j < this.crossword.variables.length; j++) {
            //worklist := worklist + { (z, x) | z != y and there exists a relation R2(x, z) or a relation R2(z, x) }
            if(this.crossword.overlaps[arc.x][j] && j != arc.y) {
              worklist.enqueue({x: j, y: arc.x})
            }
          }
        }
      }
    }
    return true
  }

  assignment_complete = (assignment) => {
    // Return True if `assignment` is complete (i.e., assigns a value to each
    // crossword variable); return False otherwise.
    for(let i = 0; i < assignment.length; i++) {
      if(assignment[i].word === false) return false
    }

    return true
  }

  consistent = (assignment) => {
    //Return True if `assignment` is consistent (i.e., words fit in crossword
    // puzzle without conflicting characters); return False otherwise.
    if(!this.assignment_complete(assignment)) return false

    let words = new Array(assignment.length)

    for(let i = 0; i < assignment.length; i++) {
      words[i] = assignment[i].word
    }

    for(let i = 0; i < this.crossword.variables.length; i++) { 
      for(let j = 0; j < this.crossword.variables.length; j++) {
        if(this.crossword.overlaps[i][j]) {
          if(words[i][this.crossword.overlaps[i][j].i] !== words[j][this.crossword.overlaps[i][j].j]) {
            return false
          }
        } 
      }
    }   

    return true
  }

  order_domain_values = (x, assignment) => {
    // Return a list of values in the domain of `x`, in order by
    // the number of values they rule out for neighboring variables.
    // The first value in the list, for example, should be the one
    // that rules out the fewest values among the neighbors of `var`.
    return this.domains[x]
  }

  //first assign assignment as 
  
  select_unassigned_variable = (assignment) => {
    // Return an unassigned variable not already part of `assignment`.
    // Choose the variable with the minimum number of remaining values
    // in its domain. If there is a tie, choose the variable with the highest
    // degree. If there is a tie, any of the tied variables are acceptable
    // return values.
    for(let i = 0; i < assignment.length; i++) {
      if(assignment[i].word === false){
        return i
      }
    }
    return undefined
  }

  backtrack = (assignment) => {
    // Using Backtracking Search, take as input a partial assignment for the
    // crossword and return a complete assignment if possible to do so.

    // `assignment` is a mapping from variables (keys) to words (values).

    // If no assignment is possible, return null.

    let v = this.select_unassigned_variable(assignment)
    if(v === undefined) {
      if(this.assignment_complete(assignment)){
        if(this.consistent(assignment)){
          return assignment
        }
      }
      return null
    }

    let domain = this.order_domain_values(v)

    for(let i = 0; i < domain.length; i++) {
      assignment[v].word = domain[i]
      if(this.backtrack(assignment) !== null) {
        return assignment
      }
      assignment[v].word = false
    }

    return null
  }
}