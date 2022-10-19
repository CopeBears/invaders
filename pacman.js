
const canvasPac = document.querySelector('canvas')
const c_pac = canvasPac.getContext('2d')

// const scoreElPac = document.querySelector('#scoreElPac')

canvasPac.width = innerWidth
canvasPac.height = innerHeight
const pacmanSpeed = 2
let pacmanFrames = 0


class Boundary {
  static width = 40
  static height = 40
  constructor({ position, image }) {
    this.position = position
    this.width = 40
    this.height = 40
    this.image = image
  }

  draw() {
    // c_pac.fillStyle = 'blue'
    // c_pac.fillRect(this.position.x, this.position.y, this.width, this.height)

    c_pac.drawImage(this.image, this.position.x, this.position.y)
  }
}

class PlayerPac {
  constructor({ position, velocity }) {
    this.position = position
    this.velocity = velocity
    this.radius = 15
    this.radians = 0.75
    this.openRate = 0.12
    this.rotation = 0
  }

  draw() {
    c_pac.save()
    c_pac.translate(this.position.x, this.position.y)
    c_pac.rotate(this.rotation)
    c_pac.translate(-this.position.x, -this.position.y)
    c_pac.beginPath()
    c_pac.arc(
      this.position.x,
      this.position.y,
      this.radius,
      this.radians,
      Math.PI * 2 - this.radians
    )
    c_pac.lineTo(this.position.x, this.position.y)
    c_pac.fillStyle = 'yellow'
    c_pac.fill()
    c_pac.closePath()
    c_pac.restore()
  }

  update() {
    this.draw()
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y

    if (this.radians < 0 || this.radians > 0.75) this.openRate = -this.openRate

    this.radians += this.openRate
  }
}

class Ghost {
  static speed = 2
  constructor({ position, velocity, color = 'red' }) {
    this.position = position
    this.velocity = velocity
    this.radius = 15
    this.color = color
    this.prevCollisions = []
    this.speed = 2
    this.scared = false
  }

  draw() {
    c_pac.beginPath()
    c_pac.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
    c_pac.fillStyle = this.scared ? 'blue' : this.color
    c_pac.fill()
    c_pac.closePath()
  }

  update() {
    this.draw()
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y
  }
}

class Pellet {
  constructor({ position }) {
    this.position = position
    this.radius = 3
  }

  draw() {
    c_pac.beginPath()
    c_pac.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
    c_pac.fillStyle = 'white'
    c_pac.fill()
    c_pac.closePath()
  }
}

class PowerUp {
  constructor({ position }) {
    this.position = position
    this.radius = 8
  }

  draw() {
    c_pac.beginPath()
    c_pac.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
    c_pac.fillStyle = 'white'
    c_pac.fill()
    c_pac.closePath()
  }
}

const pellets = []
const boundaries = []
const powerUps = []


const ghosts = [
  new Ghost({
    position: {
      x: Boundary.width * 6 + Boundary.width / 2,
      y: Boundary.height + Boundary.height / 2
    },
    velocity: {
      x: Ghost.speed,
      y: 0
    }
  }),
  new Ghost({
    position: {
      x: Boundary.width * 6 + Boundary.width / 2,
      y: Boundary.height * 3 + Boundary.height / 2
    },
    velocity: {
      x: Ghost.speed,
      y: 0
    },
    color: 'pink'
  })
]

const playerPac = new PlayerPac({
  position: {
    x: Boundary.width + Boundary.width / 2,
    y: Boundary.height + Boundary.height / 2
  },
  velocity: {
    x: 0,
    y: 0
  }
})
const keysPac = {
  w: {
    pressed: false
  },
  a: {
    pressed: false
  },
  s: {
    pressed: false
  },
  d: {
    pressed: false
  }
}

let lastKey = ''
let scoreElPac = 0

// const map = [
//   ['1', '-', '-', '-', '-', '-', '-', '-', '-', '-', '2'],
//   ['|', '.', '.', '.', '.', '.', '.', '.', '.', '.', '|'],
//   ['|', '.', 'b', '.', '[', ' ', ']', '.', 'b', '.', '|'],
//   ['|', '.', '.', '.', '.', '_', '.', '.', '.', '.', '|'],
//   ['|', '.', '[', ']', '.', '.', '.', '[', ']', '.', '|'],
//   ['|', '.', '|', '.', '.', '^', '.', '.', '.', '.', '|'],
//   ['|', '.', '|', '.', '[', '+', ']', '.', '|', '.', '|'],
//   ['|', '.', '|', '.', '.', '_', '.', '.', '.', '.', '|'],
//   ['|', '.', '[', ']', '.', '.', '.', '[', ']', '.', '|'],
//   ['|', '.', '.', '.', '.', '^', '.', '.', '.', '.', '|'],
//   ['|', '.', 'b', '.', '[', '5', ']', '.', 'b', '.', '|'],
//   ['|', '.', '.', '.', '.', '.', '.', '.', '.', 'p', '|'],
//   ['4', '-', '-', '-', '-', '-', '-', '-', '-', '-', '3']
// ]

// 26 x 32 full original pacman size
const map = [
  ['1', '-', '-', '-', '-', '-', '-', '-', '-', '-',  '-', '-', '-', '-', '-', '-', '-',   '2'],
  ['|', '.', '.', '.', '.', '.', '.', '.', '.', '.',  '.', '.', '.', '.', '.', '.', '.',   '|'],
  ['|', '.', '[', '-', ']', '.', '^', '.', '^', '.',  '^', '.', '.', '[', '-', ']', '.',   '|'],
  ['|', 'p', '.', '.', '.', '.', '_', '.', '|', '.',  '_', '.', '.', '.', '.', '.', '.',   '|'],
  ['|', '.', '^', '.', '.', '.', '.', '.', '|', '.',  '.', '.', '.', '.', '.', '^', '.',   '|'],
  ['|', '.', '|', '.', 'b', '.', '[', '-', '-', '-',  ']', '.', 'b', '.', '.', '|', '.',   '|'],
  ['|', '.', '_', '', '.', '.', '.', '.', '.', '.',  '.', '.', '.', '.', '.',  '_' , '.',   '|'],
  ['|', '.', '.', '.', '.', '.', '.', '.', '.', '.',  '.', '.', '.', '.', '.', '.', '.',   '|'],
  ['|', '[', '-', ']', '.', '.', '.', '.', '.', '.',  '.', '.', '.', '.', '[', '-', ']',   '|'],
  ['|', '.', '.', '.', '.', '.', '.', '.', '.', '.',  '.', '.', '.', '.', '.', '.', '.',   '|'],
  ['|', '.', '.', '.', '.', '.', '.', '.', '.', '.',  '.', '.', '.', '.', '.', '.', '.',   '|'],
  ['|', '.', '.', '.', '.', '.', '.', '.', '.', '.',  '.', '.', '.', '.', '.', '.', '.',   '|'],
  ['|', '.', '.', '.', '.', '.', '.', '.', '.', '.',  '.', '.', '.', '.', '.', '.', '.',   '|'],
  ['|', '.', '.', '.', '.', '.', '.', '.', '.', '.',  '.', '.', '.', '.', '.', '.', '.',   '|'],
  ['4', '-', '-', '-', '-', '-', '-', '-', '-', '-',  '-', '-', '-', '-', '-', '-', '-',   '3']
]


function createImage(src) {
  const image = new Image()
  image.src = src
  return image
}

map.forEach((row, i) => {
  row.forEach((symbol, j) => {
    switch (symbol) {
      case '-':
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i
            },
            image: createImage('./img/pipeHorizontal.png')
          })
        )
        break
      case '|':
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i
            },
            image: createImage('./img/pipeVertical.png')
          })
        )
        break
      case '1':
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i
            },
            image: createImage('./img/pipeCorner1.png')
          })
        )
        break
      case '2':
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i
            },
            image: createImage('./img/pipeCorner2.png')
          })
        )
        break
      case '3':
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i
            },
            image: createImage('./img/pipeCorner3.png')
          })
        )
        break
      case '4':
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i
            },
            image: createImage('./img/pipeCorner4.png')
          })
        )
        break
      case 'b':
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i
            },
            image: createImage('./img/block.png')
          })
        )
        break
      case '[':
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height
            },
            image: createImage('./img/capLeft.png')
          })
        )
        break
      case ']':
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height
            },
            image: createImage('./img/capRight.png')
          })
        )
        break
      case '_':
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height
            },
            image: createImage('./img/capBottom.png')
          })
        )
        break
      case '^':
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height
            },
            image: createImage('./img/capTop.png')
          })
        )
        break
      case '+':
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height
            },
            image: createImage('./img/pipeCross.png')
          })
        )
        break
      case '5':
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height
            },
            color: 'blue',
            image: createImage('./img/pipeConnectorTop.png')
          })
        )
        break
      case '6':
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height
            },
            color: 'blue',
            image: createImage('./img/pipeConnectorRight.png')
          })
        )
        break
      case '7':
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height
            },
            color: 'blue',
            image: createImage('./img/pipeConnectorBottom.png')
          })
        )
        break
      case '8':
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height
            },
            image: createImage('./img/pipeConnectorLeft.png')
          })
        )
        break
      case '.':
        pellets.push(
          new Pellet({
            position: {
              x: j * Boundary.width + Boundary.width / 2,
              y: i * Boundary.height + Boundary.height / 2
            }
          })
        )
        break

      case 'p':
        powerUps.push(
          new PowerUp({
            position: {
              x: j * Boundary.width + Boundary.width / 2,
              y: i * Boundary.height + Boundary.height / 2
            }
          })
        )
        break
    }
  })
})














//     switch (symbol) {
//       case '-':
//         boundaries.push(
//           new Boundary({
//             position: {
//               x: Boundary.width * j,
//               y: Boundary.height * i
//             },
//             image: createImage('./img/maze/tunnel_large.png')
//           })
//         )
//         break
//       case '|':
//         boundaries.push(
//           new Boundary({
//             position: {
//               x: Boundary.width * j,
//               y: Boundary.height * i
//             },
//             image: createImage('./img/maze/tunnel_large_vertical.png')
//           })
//         )
//         break
//       case '1':
//         boundaries.push(
//           new Boundary({
//             position: {
//               x: Boundary.width * j,
//               y: Boundary.height * i
//             },
//             image: createImage('./img/maze/topleft_corner.png')
//           })
//         )
//         break
//       case '2':
//         boundaries.push(
//           new Boundary({
//             position: {
//               x: Boundary.width * j,
//               y: Boundary.height * i
//             },
//             image: createImage('./img/maze/topright_corner.png')
//           })
//         )
//         break
//       case '3':
//         boundaries.push(
//           new Boundary({
//             position: {
//               x: Boundary.width * j,
//               y: Boundary.height * i
//             },
//             image: createImage('./img/maze/bottomright_corner.png')
//           })
//         )
//         break
//       case '4':
//         boundaries.push(
//           new Boundary({
//             position: {
//               x: Boundary.width * j,
//               y: Boundary.height * i
//             },
//             image: createImage('./img/maze/bottomleft_corner.png')
//           })
//         )
//         break
//       case 'B':
//         boundaries.push(
//           new Boundary({
//             position: {
//               x: Boundary.width * j,
//               y: Boundary.height * i
//             },
//             image: createImage('./img/maze/block.png')
//           })
//         )
//         break
//       case '[':
//         boundaries.push(
//           new Boundary({
//             position: {
//               x: j * Boundary.width,
//               y: i * Boundary.height
//             },
//             image: createImage('./img/maze/cap_left.png')
//           })
//         )
//         break
//       case ']':
//         boundaries.push(
//           new Boundary({
//             position: {
//               x: j * Boundary.width,
//               y: i * Boundary.height
//             },
//             image: createImage('./img/maze/cap_right.png')
//           })
//         )
//         break
//       case '_':
//         boundaries.push(
//           new Boundary({
//             position: {
//               x: j * Boundary.width,
//               y: i * Boundary.height
//             },
//             image: createImage('./img/maze/cap_bottom.png')
//           })
//         )
//         break
//       case '^':
//         boundaries.push(
//           new Boundary({
//             position: {
//               x: j * Boundary.width,
//               y: i * Boundary.height
//             },
//             image: createImage('./img/maze/cap_top.png')
//           })
//         )
//         break
//       case '+':
//         boundaries.push(
//           new Boundary({
//             position: {
//               x: j * Boundary.width,
//               y: i * Boundary.height
//             },
//             image: createImage('./img/pipeCross.png')
//           })
//         )
//         break
//       case '=':
//         boundaries.push(
//           new Boundary({
//             position: {
//               x: j * Boundary.width,
//               y: i * Boundary.height
//             },
//             color: 'blue',
//             image: createImage('./img/maze/small_tunnel.png')
//           })
//         )
//         break
//       case '!':
//         boundaries.push(
//           new Boundary({
//             position: {
//               x: j * Boundary.width,
//               y: i * Boundary.height
//             },
//             color: 'blue',
//             image: createImage('./img/maze/small_tunnel_vertical.png')
//           })
//         )
//         break
//       case 'b':
//         boundaries.push(
//           new Boundary({
//             position: {
//               x: j * Boundary.width,
//               y: i * Boundary.height
//             },
//             color: 'blue',
//             image: createImage('./img/maze/bottom_line.png')
//           })
//         )
//         break
//       case 't':
//         boundaries.push(
//           new Boundary({
//             position: {
//               x: j * Boundary.width,
//               y: i * Boundary.height
//             },
//             image: createImage('./img/maze/top_line.png')
//           })
//         )
//         break
//       case 'l':
//         boundaries.push(
//           new Boundary({
//             position: {
//               x: j * Boundary.width,
//               y: i * Boundary.height
//             },
//             image: createImage('./img/maze/left_line.png')
//           })
//         )
//         break
//       case 'r':
//         boundaries.push(
//           new Boundary({
//             position: {
//               x: j * Boundary.width,
//               y: i * Boundary.height
//             },
//             image: createImage('./img/maze/right_line.png')
//           })
//         )
//         break
//       case '.':
//         pellets.push(
//           new Pellet({
//             position: {
//               x: j * Boundary.width + Boundary.width / 2,
//               y: i * Boundary.height + Boundary.height / 2
//             }
//           })
//         )
//         break

//       case 'p':
//         powerUps.push(
//           new PowerUp({
//             position: {
//               x: j * Boundary.width + Boundary.width / 2,
//               y: i * Boundary.height + Boundary.height / 2
//             }
//           })
//         )
//         break
//     }
//   })
// })

function circleCollidesWithRectangle({ circle, rectangle }) {
  const padding = Boundary.width / 2 - circle.radius - 1
  return (
    circle.position.y - circle.radius + circle.velocity.y <=
      rectangle.position.y + rectangle.height + padding &&
    circle.position.x + circle.radius + circle.velocity.x >=
      rectangle.position.x - padding &&
    circle.position.y + circle.radius + circle.velocity.y >=
      rectangle.position.y - padding &&
    circle.position.x - circle.radius + circle.velocity.x <=
      rectangle.position.x + rectangle.width + padding
  )
}

let animationId
function animatePac() {
  animationId = requestAnimationFrame(animatePac)
  c_pac.clearRect(0, 0, canvasPac.width, canvasPac.height)



  //  5 seconds before player can move


if (keysPac.w.pressed && lastKey === 'w') {
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i]
      if (
        circleCollidesWithRectangle({
          circle: {
            ...playerPac,
            velocity: {
              x: 0,
              y: -pacmanSpeed
            }
          },
          rectangle: boundary
        })
      ) {
        playerPac.velocity.y = 0
        break
      } else {
        playerPac.velocity.y = -pacmanSpeed
      }
    }
  } else if (keysPac.a.pressed && lastKey === 'a') {
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i]
      if (
        circleCollidesWithRectangle({
          circle: {
            ...playerPac,
            velocity: {
              x: -pacmanSpeed,
              y: 0
            }
          },
          rectangle: boundary
        })
      ) {
        playerPac.velocity.x = 0
        break
      } else {
        playerPac.velocity.x = -pacmanSpeed
      }
    }
  } else if (keysPac.s.pressed && lastKey === 's') {
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i]
      if (
        circleCollidesWithRectangle({
          circle: {
            ...playerPac,
            velocity: {
              x: 0,
              y: pacmanSpeed
            }
          },
          rectangle: boundary
        })
      ) {
        playerPac.velocity.y = 0
        break
      } else {
        playerPac.velocity.y = pacmanSpeed
      }
    }
  } else if (keysPac.d.pressed && lastKey === 'd') {
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i]
      if (
        circleCollidesWithRectangle({
          circle: {
            ...playerPac,
            velocity: {
              x: pacmanSpeed,
              y: 0
            }
          },
          rectangle: boundary
        })
      ) {
        playerPac.velocity.x = 0
        break
      } else {
        playerPac.velocity.x = pacmanSpeed
      }
    }
  }


  // detect collision between ghosts and playerPac
  for (let i = ghosts.length - 1; 0 <= i; i--) {
    const ghost = ghosts[i]
    // ghost touches playerPac
    if (
      Math.hypot(
        ghost.position.x - playerPac.position.x,
        ghost.position.y - playerPac.position.y
      ) <
      ghost.radius + playerPac.radius
    ) {
      if (ghost.scared) {
        ghosts.splice(i, 1)
      } else {
        cancelAnimationFrame(animationId)
        console.log('you lose')
      }
    }
  }

  // win condition goes here
  if (pellets.length === 0) {
    console.log('you win')
    cancelAnimationFrame(animationId)
  }

  // power ups go
  for (let i = powerUps.length - 1; 0 <= i; i--) {
    const powerUp = powerUps[i]
    powerUp.draw()

    // playerPac collides with powerup
    if (
      Math.hypot(
        powerUp.position.x - playerPac.position.x,
        powerUp.position.y - playerPac.position.y
      ) <
      powerUp.radius + playerPac.radius
    ) {
      powerUps.splice(i, 1)

      // make ghosts scared
      ghosts.forEach((ghost) => {
        ghost.scared = true

        setTimeout(() => {
          ghost.scared = false
        }, 5000)
      })
    }
  }

  // touch pellets here
  for (let i = pellets.length - 1; 0 <= i; i--) {
    const pellet = pellets[i]
    pellet.draw()

    if (
      Math.hypot(
        pellet.position.x - playerPac.position.x,
        pellet.position.y - playerPac.position.y
      ) <
      pellet.radius + playerPac.radius
    ) {
      pellets.splice(i, 1)
      scoreElPac += 10
      scoreElPac.innerHTML = scoreElPac
      // audio.dot_1.play()
    }
  }

  boundaries.forEach((boundary) => {
    boundary.draw()

    if (
      circleCollidesWithRectangle({
        circle: playerPac,
        rectangle: boundary
      })
    ) {
      playerPac.velocity.x = 0
      playerPac.velocity.y = 0
    }
  })
  playerPac.update()

 
  ghosts.forEach((ghost) => {
      ghost.update()


    const collisions = []
    boundaries.forEach((boundary) => {
      if (
        !collisions.includes('right') &&
        circleCollidesWithRectangle({
          circle: {
            ...ghost,
            velocity: {
              x: ghost.speed,
              y: 0
            }
          },
          rectangle: boundary
        })
      ) {
        collisions.push('right')
      }

      if (
        !collisions.includes('left') &&
        circleCollidesWithRectangle({
          circle: {
            ...ghost,
            velocity: {
              x: -ghost.speed,
              y: 0
            }
          },
          rectangle: boundary
        })
      ) {
        collisions.push('left')
      }

      if (
        !collisions.includes('up') &&
        circleCollidesWithRectangle({
          circle: {
            ...ghost,
            velocity: {
              x: 0,
              y: -ghost.speed
            }
          },
          rectangle: boundary
        })
      ) {
        collisions.push('up')
      }

      if (
        !collisions.includes('down') &&
        circleCollidesWithRectangle({
          circle: {
            ...ghost,
            velocity: {
              x: 0,
              y: ghost.speed
            }
          },
          rectangle: boundary
        })
      ) {
        collisions.push('down')
      }
    })

    if (collisions.length > ghost.prevCollisions.length)
      ghost.prevCollisions = collisions

    if (JSON.stringify(collisions) !== JSON.stringify(ghost.prevCollisions)) {
      // console.log('gogo')

      if (ghost.velocity.x > 0) ghost.prevCollisions.push('right')
      else if (ghost.velocity.x < 0) ghost.prevCollisions.push('left')
      else if (ghost.velocity.y < 0) ghost.prevCollisions.push('up')
      else if (ghost.velocity.y > 0) ghost.prevCollisions.push('down')

      console.log(collisions)
      console.log(ghost.prevCollisions)

      const pathways = ghost.prevCollisions.filter((collision) => {
        return !collisions.includes(collision)
      })
      console.log({ pathways })

      const direction = pathways[Math.floor(Math.random() * pathways.length)]

      console.log({ direction })

      switch (direction) {
        case 'down':
          ghost.velocity.y = ghost.speed
          ghost.velocity.x = 0
          break

        case 'up':
          ghost.velocity.y = -ghost.speed
          ghost.velocity.x = 0
          break

        case 'right':
          ghost.velocity.y = 0
          ghost.velocity.x = ghost.speed
          break

        case 'left':
          ghost.velocity.y = 0
          ghost.velocity.x = -ghost.speed
          break
      }

      ghost.prevCollisions = []
    }
    // console.log(collisions)
  })

  if (playerPac.velocity.x > 0) playerPac.rotation = 0
  else if (playerPac.velocity.x < 0) playerPac.rotation = Math.PI
  else if (playerPac.velocity.y > 0) playerPac.rotation = Math.PI / 2
  else if (playerPac.velocity.y < 0) playerPac.rotation = Math.PI * 1.5

  pacmanFrames += 1
  console.log(pacmanFrames)
} // end of animatePac()


addEventListener('keydown', ({ key }) => {
  switch (key) {
    case 'w':
      keysPac.w.pressed = true
      lastKey = 'w'
      break
    case 'a':
      keysPac.a.pressed = true
      lastKey = 'a'
      break
    case 's':
      keysPac.s.pressed = true
      lastKey = 's'
      break
    case 'd':
      keysPac.d.pressed = true
      lastKey = 'd'
      break
  }
})

addEventListener('keyup', ({ key }) => {
  switch (key) {
    case 'w':
      keysPac.w.pressed = false

      break
    case 'a':
      keysPac.a.pressed = false

      break
    case 's':
      keysPac.s.pressed = false

      break
    case 'd':
      keysPac.d.pressed = false

      break
  }
})

document.querySelector('#pacMan').addEventListener('click', () => {
    // audio.pacmanMusic.play()
  
    document.querySelector('#startScreen').style.display = 'none'
    // document.querySelector('#pacScoreContainer').style.display = 'block'


    animatePac() // starts game

  })
  
document.querySelector('#restartButton').addEventListener('click', () => {
    audio.select.play()
    document.querySelector('#restartScreen').style.display = 'none'
    animatePac() // starts game
  })