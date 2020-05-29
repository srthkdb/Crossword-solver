export default class Queue {
  constructor() {
    this.items = []
  }

  enqueue = (val) => {
    this.items.push(val)
  }

  dequeue = () => {
    if(this.items.length == 0)
      return undefined
    let a = this.items[0]
    this.items.shift()
    return a
  }

  peek = () => {
    return this.items.length > 0 ? this.items[0] : undefined 
  }

  length = () => (
    this.items.length
  )

  isEmpty = () => (
    this.items.length == 0
  )
}

