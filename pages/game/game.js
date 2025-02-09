Page({
  data: {
    board: [
      [{value: 0}, {value: 0}, {value: 0}, {value: 0}],
      [{value: 0}, {value: 0}, {value: 0}, {value: 0}],
      [{value: 0}, {value: 0}, {value: 0}, {value: 0}],
      [{value: 0}, {value: 0}, {value: 0}, {value: 0}]
    ],
    score: 0,
    isAuto: false,
    autoInterval: null,
    touchStartX: 0,
    touchStartY: 0,
    isTouching: false,
    showHistory: false,
    moveHistory: [],
    boardHistory: []
  },

  onLoad() {
    this.initGame()
    this.initTouchEvent()
  },

  initGame() {
    // 初始化游戏板并添加两个数字
    this.setData({
      moveHistory: [],
      boardHistory: []
    })
    this.addRandomNumber()
    this.addRandomNumber()
  },

  addRandomNumber() {
    let board = this.data.board
    let empty = []
    
    for(let i = 0; i < 4; i++) {
      for(let j = 0; j < 4; j++) {
        if(board[i][j].value === 0) {
          empty.push({x: i, y: j})
        }
      }
    }
    
    if(empty.length > 0) {
      let randomCell = empty[Math.floor(Math.random() * empty.length)]
      let value = Math.random() < 0.9 ? 2 : 4
      board[randomCell.x][randomCell.y] = {
        value: value,
        isNew: true  // 标记新生成的数字
      }
      
      // 清除之前的新tile标记
      setTimeout(() => {
        board[randomCell.x][randomCell.y].isNew = false
        this.setData({ board })
      }, 300)
      
      this.setData({ board })
    }
  },

  initTouchEvent() {
    // 不再需要全局触摸事件监听
  },

  // 添加格子的触摸事件处理
  onTileTouch(e) {
    if (e.type === 'tap') {
      // 处理点击事件
      this.selectTile(e)
      return
    }

    switch(e.type) {
      case 'touchstart':
        this.setData({
          touchStartX: e.touches[0].clientX,
          touchStartY: e.touches[0].clientY,
          isTouching: true
        })
        break

      case 'touchend':
        if (!this.data.isTouching) return

        const deltaX = e.changedTouches[0].clientX - this.data.touchStartX
        const deltaY = e.changedTouches[0].clientY - this.data.touchStartY
        
        // 将滑动阈值从20像素降低到10像素
        if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
          if (Math.abs(deltaX) > Math.abs(deltaY)) {
            if (deltaX > 0) {
              this.moveRight()
            } else {
              this.moveLeft()
            }
          } else {
            if (deltaY > 0) {
              this.moveDown()
            } else {
              this.moveUp()
            }
          }
        }
        
        this.setData({ isTouching: false })
        break

      case 'touchcancel':
        this.setData({ isTouching: false })
        break
    }
  },

  // 向左移动
  moveLeft() {
    this.clearSelection()
    let board = this.data.board
    let score = this.data.score
    let changed = false
    
    for(let i = 0; i < 4; i++) {
      let row = board[i].map(cell => ({...cell}))  // 创建深拷贝
      let newRow = this.merge(row)
      if(newRow.score > 0) {
        changed = true
        score += newRow.score
        board[i] = newRow.row
      }
    }
    
    if(changed) {
      this.setData({board, score})
      setTimeout(() => {
        this.addRandomNumber()
      }, 150)  // 等待移动动画完成后再添加新数字
    }
  },

  // 合并数字
  merge(row) {
    let newRow = row.filter(cell => cell.value !== 0)
    let score = 0
    
    for(let i = 0; i < newRow.length - 1; i++) {
      if(newRow[i].value === newRow[i + 1].value) {
        newRow[i].value *= 2
        newRow[i].merged = true  // 标记合并的数字
        score += newRow[i].value
        newRow.splice(i + 1, 1)
        
        // 清除合并标记
        setTimeout(() => {
          newRow[i].merged = false
          this.setData({ board: this.data.board })
        }, 300)
      }
    }
    
    while(newRow.length < 4) {
      newRow.push({value: 0})
    }
    
    return {row: newRow, score}
  },

  // 向右移动
  moveRight() {
    this.clearSelection()
    let board = this.data.board
    let score = this.data.score
    let changed = false
    
    for(let i = 0; i < 4; i++) {
      // 反转行，使用左移逻辑，再反转回来
      let row = board[i].map(cell => ({...cell})).reverse()
      let newRow = this.merge(row)
      if(newRow.score > 0) {
        changed = true
        score += newRow.score
        board[i] = newRow.row.reverse()
      }
    }
    
    if(changed) {
      this.setData({board, score})
      setTimeout(() => {
        this.addRandomNumber()
      }, 150)
    }
  },

  // 向上移动
  moveUp() {
    this.clearSelection()
    let board = this.data.board
    let score = this.data.score
    let changed = false
    
    for(let j = 0; j < 4; j++) {
      // 获取列
      let column = board.map(row => ({...row[j]}))
      let newColumn = this.merge(column)
      if(newColumn.score > 0) {
        changed = true
        score += newColumn.score
        // 更新列
        newColumn.row.forEach((cell, i) => {
          board[i][j] = cell
        })
      }
    }
    
    if(changed) {
      this.setData({board, score})
      setTimeout(() => {
        this.addRandomNumber()
      }, 150)
    }
  },

  // 向下移动
  moveDown() {
    this.clearSelection()
    let board = this.data.board
    let score = this.data.score
    let changed = false
    
    for(let j = 0; j < 4; j++) {
      // 获取列并反转
      let column = board.map(row => ({...row[j]})).reverse()
      let newColumn = this.merge(column)
      if(newColumn.score > 0) {
        changed = true
        score += newColumn.score
        // 更新列
        newColumn.row.reverse().forEach((cell, i) => {
          board[i][j] = cell
        })
      }
    }
    
    if(changed) {
      this.setData({board, score})
      setTimeout(() => {
        this.addRandomNumber()
      }, 150)
    }
  },

  restartGame() {
    this.setData({
      board: [
        [{value: 0}, {value: 0}, {value: 0}, {value: 0}],
        [{value: 0}, {value: 0}, {value: 0}, {value: 0}],
        [{value: 0}, {value: 0}, {value: 0}, {value: 0}],
        [{value: 0}, {value: 0}, {value: 0}, {value: 0}]
      ],
      score: 0,
      moveHistory: [],
      boardHistory: []
    })
    this.initGame()
  },

  toggleAuto() {
    const isAuto = !this.data.isAuto
    this.setData({ isAuto })
    
    if (isAuto) {
      this.startAutoPlay()
    } else {
      this.stopAutoPlay()
    }
  },

  startAutoPlay() {
    const moves = ['moveLeft', 'moveRight', 'moveUp', 'moveDown']
    let lastFailedMove = null  // 记录上一次失败的移动

    this.data.autoInterval = setInterval(() => {
      // 找出所有可以移动的方向
      const validMoves = moves.filter(move => {
        const board = JSON.parse(JSON.stringify(this.data.board))
        return this.canMove(move, board)
      })
      
      if (validMoves.length > 0) {
        // 从有效移动中随机选择一个，但避开上次失败的移动
        let availableMoves = lastFailedMove ? 
          validMoves.filter(move => move !== lastFailedMove) : 
          validMoves
        
        // 如果所有方向都尝试过了，重置失败记录
        if (availableMoves.length === 0) {
          availableMoves = validMoves
          lastFailedMove = null
        }

        const randomMove = availableMoves[Math.floor(Math.random() * availableMoves.length)]
        
        // 记录移动前的状态
        const scoreBefore = this.data.score
        const boardBefore = JSON.parse(JSON.stringify(this.data.board))
        
        // 执行移动
        this[randomMove]()
        
        // 检查是否真的发生了移动
        const boardChanged = JSON.stringify(boardBefore) !== JSON.stringify(this.data.board)
        
        if (!boardChanged) {
          // 记录这次失败的移动
          lastFailedMove = randomMove
          
          // 如果还有其他方向可以尝试，继续尝试
          if (validMoves.length > 1) {
            return  // 继续下一次尝试
          }
          
          // 如果没有其他方向可以尝试，停止并提示
          const moveText = this.getLastMoveText()
          this.stopAutoPlay()
          wx.showToast({
            title: `自动停止：${moveText} 后所有方向都无效`,
            icon: 'none',
            duration: 2000
          })
          return
        }
        
        // 重置失败记录
        lastFailedMove = null
        
        // 记录有效移动
        const direction = randomMove.replace('move', '').toLowerCase()
        const scoreGain = this.data.score - scoreBefore
        
        // 找到实际移动的数字位置
        let movedFrom = null
        for(let i = 0; i < 4; i++) {
          for(let j = 0; j < 4; j++) {
            if(boardBefore[i][j].value !== 0 && 
               (boardBefore[i][j].value !== this.data.board[i][j].value)) {
              movedFrom = {row: i, col: j}
              break
            }
          }
          if(movedFrom) break
        }
        
        if(movedFrom) {
          this.recordMove(direction, scoreGain, movedFrom)
        }
        
      } else {
        // 如果没有有效移动，检查具体原因
        this.stopAutoPlay()
        const moveText = this.getLastMoveText()
        
        // 检查是否还有空格
        const hasEmpty = this.getEmptyCount() > 0
        
        if (this.isGameOver()) {
          wx.showToast({
            title: `自动停止：${moveText} 后游戏结束`,
            icon: 'none',
            duration: 2000
          })
        } else if (!hasEmpty) {
          wx.showToast({
            title: `自动停止：${moveText} 后棋盘已满`,
            icon: 'none',
            duration: 2000
          })
        } else {
          wx.showToast({
            title: `自动停止：${moveText} 后无法移动`,
            icon: 'none',
            duration: 2000
          })
        }
      }
    }, 200)
  },

  stopAutoPlay() {
    if (this.data.autoInterval) {
      clearInterval(this.data.autoInterval)
      this.data.autoInterval = null
      this.setData({ isAuto: false })
    }
  },

  isGameOver() {
    // 检查是否有空格
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (this.data.board[i][j].value === 0) {
          return false
        }
      }
    }
    
    // 检查是否可以合并
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 3; j++) {
        if (this.data.board[i][j].value === this.data.board[i][j + 1].value) {
          return false
        }
      }
    }
    
    for (let j = 0; j < 4; j++) {
      for (let i = 0; i < 3; i++) {
        if (this.data.board[i][j].value === this.data.board[i + 1][j].value) {
          return false
        }
      }
    }
    
    return true
  },

  selectTile(e) {
    const row = e.currentTarget.dataset.row
    const col = e.currentTarget.dataset.col
    const board = this.data.board

    // 只有非空格子才能被选中
    if (board[row][col].value === 0) return

    // 如果点击的是已选中的格子，则取消选中
    if (board[row][col].selected) {
      board[row][col].selected = false
      this.setData({ board })
      return
    }

    // 清除其他格子的选中状态
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (board[i][j].selected) {
          board[i][j].selected = false
        }
      }
    }

    // 设置当前格子的选中状态
    board[row][col].selected = true
    this.setData({ board })
  },

  clearSelection() {
    const board = this.data.board
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (board[i][j].selected) {
          board[i][j].selected = false
        }
      }
    }
    this.setData({ board })
  },

  // 获取空格子数量的辅助方法
  getEmptyCount() {
    let count = 0
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (this.data.board[i][j].value === 0) {
          count++
        }
      }
    }
    return count
  },

  // 在组件销毁时清除定时器
  onUnload() {
    this.stopAutoPlay()
  },

  // 添加方向键处理方法
  handleDirection(e) {
    const direction = e.currentTarget.dataset.direction
    
    // 检查是否有选中的格子
    let selectedTile = null
    let selectedPos = null
    
    for(let i = 0; i < 4; i++) {
      for(let j = 0; j < 4; j++) {
        if(this.data.board[i][j].selected) {
          selectedTile = this.data.board[i][j]
          selectedPos = {row: i, col: j}
          break
        }
      }
      if(selectedTile) break
    }
    
    // 如果没有选中的格子，不执行移动
    if(!selectedTile) {
      wx.showToast({
        title: '请先选择一个数字',
        icon: 'none'
      })
      return
    }
    
    // 根据方向移动选中的格子
    this.moveTile(selectedPos, direction)
  },

  // 移动单个格子
  moveTile(pos, direction) {
    const scoreBefore = this.data.score
    const board = this.data.board
    let {row, col} = pos
    let moved = false
    let merged = false
    
    switch(direction) {
      case 'up':
        for(let i = row - 1; i >= 0; i--) {
          if(board[i][col].value === 0) {
            board[i][col] = {...board[row][col], selected: false}
            board[row][col] = {value: 0}
            row = i
            moved = true
          } else if(board[i][col].value === board[row][col].value && !merged) {
            board[i][col].value *= 2
            board[i][col].merged = true
            board[row][col] = {value: 0}
            moved = true
            merged = true
            this.setData({score: this.data.score + board[i][col].value})
            break
          } else {
            break
          }
        }
        break
        
      case 'down':
        for(let i = row + 1; i < 4; i++) {
          if(board[i][col].value === 0) {
            board[i][col] = {...board[row][col], selected: false}
            board[row][col] = {value: 0}
            row = i
            moved = true
          } else if(board[i][col].value === board[row][col].value && !merged) {
            board[i][col].value *= 2
            board[i][col].merged = true
            board[row][col] = {value: 0}
            moved = true
            merged = true
            this.setData({score: this.data.score + board[i][col].value})
            break
          } else {
            break
          }
        }
        break
        
      case 'left':
        for(let j = col - 1; j >= 0; j--) {
          if(board[row][j].value === 0) {
            board[row][j] = {...board[row][col], selected: false}
            board[row][col] = {value: 0}
            col = j
            moved = true
          } else if(board[row][j].value === board[row][col].value && !merged) {
            board[row][j].value *= 2
            board[row][j].merged = true
            board[row][col] = {value: 0}
            moved = true
            merged = true
            this.setData({score: this.data.score + board[row][j].value})
            break
          } else {
            break
          }
        }
        break
        
      case 'right':
        for(let j = col + 1; j < 4; j++) {
          if(board[row][j].value === 0) {
            board[row][j] = {...board[row][col], selected: false}
            board[row][col] = {value: 0}
            col = j
            moved = true
          } else if(board[row][j].value === board[row][col].value && !merged) {
            board[row][j].value *= 2
            board[row][j].merged = true
            board[row][col] = {value: 0}
            moved = true
            merged = true
            this.setData({score: this.data.score + board[row][j].value})
            break
          } else {
            break
          }
        }
        break
    }
    
    if(moved) {
      // 记录这次移动
      const scoreGain = this.data.score - scoreBefore
      this.recordMove(direction, scoreGain, pos)
      
      // 立即更新视图，不等待动画
      this.setData({board})
      
      // 延迟添加新数字，但缩短延迟时间
      setTimeout(() => {
        // 清除合并状态
        board.forEach(row => {
          row.forEach(cell => {
            if(cell.merged) cell.merged = false
          })
        })
        this.addRandomNumber()
        this.setData({board})
      }, 100) // 从150ms减少到100ms
    }
  },

  // 添加检查是否可以移动的方法
  canMove(direction, board) {
    switch(direction) {
      case 'moveLeft':
        for(let i = 0; i < 4; i++) {
          for(let j = 1; j < 4; j++) {
            if(board[i][j].value !== 0) {
              // 左边有空格或者可以合并
              if(board[i][j-1].value === 0 || board[i][j-1].value === board[i][j].value) {
                return true
              }
            }
          }
        }
        break
        
      case 'moveRight':
        for(let i = 0; i < 4; i++) {
          for(let j = 0; j < 3; j++) {
            if(board[i][j].value !== 0) {
              // 右边有空格或者可以合并
              if(board[i][j+1].value === 0 || board[i][j+1].value === board[i][j].value) {
                return true
              }
            }
          }
        }
        break
        
      case 'moveUp':
        for(let j = 0; j < 4; j++) {
          for(let i = 1; i < 4; i++) {
            if(board[i][j].value !== 0) {
              // 上面有空格或者可以合并
              if(board[i-1][j].value === 0 || board[i-1][j].value === board[i][j].value) {
                return true
              }
            }
          }
        }
        break
        
      case 'moveDown':
        for(let j = 0; j < 4; j++) {
          for(let i = 0; i < 3; i++) {
            if(board[i][j].value !== 0) {
              // 下面有空格或者可以合并
              if(board[i+1][j].value === 0 || board[i+1][j].value === board[i][j].value) {
                return true
              }
            }
          }
        }
        break
    }
    return false
  },

  // 切换历史记录显示
  toggleHistoryView() {
    this.setData({
      showHistory: !this.data.showHistory
    })
  },

  // 记录移动
  recordMove(direction, scoreGain, fromPos) {
    const positions = ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'B4', 
                      'C1', 'C2', 'C3', 'C4', 'D1', 'D2', 'D3', 'D4']
    const directionText = {
      'up': '上',
      'down': '下',
      'left': '左',
      'right': '右'
    }

    const pos = positions[fromPos.row * 4 + fromPos.col]
    const moveHistory = this.data.moveHistory
    const boardHistory = this.data.boardHistory
    
    // 保存当前棋盘状态
    boardHistory.push({
      board: JSON.parse(JSON.stringify(this.data.board)),
      score: this.data.score
    })

    // 检查是否发生合并
    let moveText = ''
    if (scoreGain > 0) {
      // 如果有得分，说明发生了合并
      const mergedValue = scoreGain
      const originalValue = mergedValue / 2
      moveText = `${pos}(${originalValue}) → ${directionText[direction]} = ${mergedValue}`
    } else {
      // 如果没有得分，只是移动
      moveText = `${pos} → ${directionText[direction]}`
    }

    moveHistory.push({
      text: moveText,
      scoreGain: scoreGain,
      direction: direction,
      fromPos: fromPos
    })

    this.setData({ moveHistory, boardHistory })
  },

  // 撤回移动
  undoMove() {
    if (!this.data.moveHistory.length) return

    const boardHistory = this.data.boardHistory
    const lastState = boardHistory.pop()
    const moveHistory = this.data.moveHistory
    moveHistory.pop()

    this.setData({
      board: lastState.board,
      score: lastState.score,
      moveHistory,
      boardHistory
    })
  },

  // 获取最后一步移动的文本描述
  getLastMoveText() {
    const history = this.data.moveHistory
    if (history.length > 0) {
      return history[history.length - 1].text
    }
    return '开始'
  }
}) 