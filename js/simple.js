var canvas = document.getElementsByTagName('canvas')[0]
var context = canvas.getContext('2d')

context.globalCompositeOperation = 'screen'

var width = (canvas.width = window.innerWidth * 0.8)
var height = (canvas.height = window.innerHeight * 0.8)

var x = width / 2
var y = height / 2
var vx = 0
var vy = 0
var fx = 0
var fy = 0
var size = 20

var xscale = 1
var yscale = 1

var deltax = 0,
  deltay = 0 // canvas shift

var ex = 0,
  ey = 0 // expand

var commands = {
  left: false,
  right: false,
  jump: false,
  jumpLock: false,
}

var speed = 2

var dxs = 0
var dys = 0

var expand = size / 10

function drawShadow(x1, y1, x2, y2) {
  // draw the shadow of a segment
  context.fillStyle = '#111'
  context.beginPath()
  context.moveTo(x1, y1)
  context.lineTo(x2, y2)
  let r = (height - y2 + 10) / (y2 + 10)
  context.lineTo(x2 + (x2 - width / 2) * r, height + 10)
  r = (height - y1 + 10) / (y1 + 10)
  context.lineTo(x1 + (x1 - width / 2) * r, height + 10)
  context.closePath()
  context.fill()
}

var brickHeight = size
function drawBrick(x1, x2, y) {
  context.fillStyle = '#fff'
  context.fillRect(x1, y, x2 - x1, brickHeight)
}

var lastUpdateAt = 0
var fps = 70
var idle = 1000 / fps
var shadowBlur = 0

var bricks = [
  [width / 6, width / 3, height / 3, 0.8],
  [width / 3, width * 2 / 3, height * 2 / 3, -0.5],
]
setInterval(() => {
  bricks.forEach(brick => {
    brick[0] += brick[3]
    brick[1] += brick[3]
    if (brick[0] <= 20 || brick[1] >= width - 20) {
      brick[3] *= -1
    }
  })
}, 16)

function draw() {
  // let needDraw = Date.now() - lastUpdateAt >= idle
  // if (needDraw) {
  //   lastUpdateAt = Date.now()
  // }
  let needDraw = true

  if (commands.left) {
    fx = -speed
  }
  if (commands.right) {
    fx = speed
  }
  if (commands.jump) {
    commands.jump = false
    fy = -20
  }
  vx += fx
  vy += fy

  vx = Math.min(Math.max(vx, -20), 20)
  vy = Math.min(Math.max(vy, -20), 20)

  x += vx
  y += vy

  fy = 1
  fx = 0

  deltax *= 0.8
  deltay *= 0.8

  shadowBlur *= 0.95
  if (shadowBlur < 1) shadowBlur = 0

  xscale = Math.min(Math.max(xscale + dxs, 0.4), 1.6)
  yscale = Math.min(Math.max(yscale + dys, 0.4), 1.6)

  dxs = (1 - xscale) * 0.1
  dys = (1 - yscale) * 0.1

  var hitY = false
  var hitX = false
  var newx = x
  var newy = y

  if (y >= height - 20 - size || y <= 20 + size) {
    newy = Math.min(Math.max(newy, 20 + size), height - 20 - size) // borders
    hitY = true
  }
  if (x >= width - 20 - size || x <= 20 + size) {
    newx = Math.min(Math.max(newx, 20 + size), width - 20 - size) // borders
    hitX = true
  }

  bricks.forEach(brick => {
    if (x + size < brick[0]) {
      return
    }
    if (x - size > brick[1]) {
      return
    }
    if (y + size < brick[2]) {
      return
    }
    if (y - size > brick[2] + brickHeight) {
      return
    }

    if (y - size < brick[2]) {
      newy = Math.min(newy, brick[2] - size)
      if (Math.abs(vx - brick[3]) < 0.1) {
        // kinetic friction
        fx = brick[3] * 0.2
      } else {
        // dry friction
        fx = brick[3] * 0.05
      }
      hitY = true
    } else if (y + size >= brick[2] + brickHeight) {
      newy = Math.max(newy, brick[2] + brickHeight + size)
      hitY = true
    } else {
      hitX = true
    }
  })

  if (hitY) {
    deltay = vy * 0.8
    dxs += 0.002 * vy * vy
    dys += -0.002 * vy * vy
    if (Math.abs(vy) > 10) {
      shadowBlur = 20
    }
    vy *= -0.8
  }
  if (hitX) {
    deltax = vx * 0.8
    dxs += -0.002 * vx * vx
    dys += 0.002 * vx * vx
    vx *= -0.8
    if (Math.abs(vx) > 10) {
      shadowBlur = 20
    }
  } else {
    vx *= 0.9
  }

  x = newx
  y = newy

  if (needDraw) {
    context.fillStyle = 'rgba(30, 30, 30, 1)'
    context.fillRect(0, 0, width, height) // draw background
    context.translate(deltax, deltay) // shake
  }

  let v = vx * vx + vy * vy

  let px, wx, py, wy // position and width

  ex = ex * 0.8 + vx * expand * 0.2
  ey = ey * 0.8 + vy * expand * 0.2

  if (needDraw) {
    if (ex <= 0) {
      px = x - size
      wx = 2 * size - ex
    } else {
      px = x - size - ex
      wx = 2 * size + ex
    }
    if (ey <= 0) {
      py = y - size
      wy = 2 * size - ey
    } else {
      py = y - size - ey
      wy = 2 * size + ey
    }

    px -= (xscale - 1) * wx / 2
    wx *= xscale
    py -= (yscale - 1) * wy / 2
    wy *= yscale

    // draw shadow
    drawShadow(px - 1, py, px + wx + 1, py)
    drawShadow(px - 1, py, px - 1, py + wy)
    drawShadow(px + wx + 1, py, px + wx + 1, py + wy)

    bricks.forEach(brick => {
      drawShadow(brick[0], brick[2], brick[1], brick[2])
      drawShadow(brick[0], brick[2], brick[0], brick[2] + brickHeight)
      drawShadow(brick[1], brick[2], brick[1], brick[2] + brickHeight)
      drawBrick(...brick)
    })

    // draw player
    context.fillStyle = 'rgb(239, 131, 84)'
    context.shadowColor = 'rgb(239, 100, 84)'
    context.shadowBlur = shadowBlur
    context.beginPath()
    context.moveTo(px, py)
    var eps = 0.1
    var rx = 10 * (xscale - 1) //+ Math.sqrt(ex * ex / 80)
    var ry = 10 * (yscale - 1) //+ Math.sqrt(ey * ey / 80)
    rx *= vy > eps ? 1 : vy < -eps ? -1 : 0
    ry *= vx > eps ? 1 : vx < -eps ? -1 : 0
    context.bezierCurveTo(px, py + rx, px + wx, py + rx, px + wx, py)
    context.bezierCurveTo(
      px + wx + ry,
      py,
      px + wx + ry,
      py + wy,
      px + wx,
      py + wy
    )
    context.bezierCurveTo(px + wx, py + wy + rx, px, py + wy + rx, px, py + wy)
    context.bezierCurveTo(px + ry, py + wy, px + ry, py, px, py)
    context.fill()
    context.shadowBlur = 0
    // context.fillRect(px, py, wx, wy)

    // context.fillStyle = 'white'
    // context.font = '30px Arial'
    // context.fillText('💩', x - 20, y + 10) // draw face

    context.strokeStyle = '#111'
    context.lineWidth = 20
    context.strokeRect(10, 10, width - 20, height - 20) // draw border

    context.translate(-deltax, -deltay)
  }

  requestAnimationFrame(draw) // set next frame
}

window.addEventListener('keydown', function(event) {
  switch (event.key) {
    case 'a':
    case 'ArrowLeft':
      commands.left = true
      break
    case ' ':
    case 'w':
    case 'ArrowUp':
      if (!commands.jumpLock) {
        commands.jump = true
        commands.jumpLock = true
        setTimeout(() => {
          commands.jumpLock = false
        }, 50)
      }
      break
    case 'd':
    case 'ArrowRight':
      commands.right = true
      break
  }
})
window.addEventListener('keyup', function(event) {
  switch (event.key) {
    case 'a':
    case 'ArrowLeft':
      commands.left = false
      break
    case 'd':
    case 'ArrowRight':
      commands.right = false
      break
  }
})
canvas.addEventListener('touchstart', function() {
  commands.jump = true
})

draw()
