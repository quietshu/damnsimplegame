var canvas = document.getElementsByTagName('canvas')[0]
var context = canvas.getContext('2d')

context.globalCompositeOperation = 'screen'

// canvas
var width = (canvas.width = window.innerWidth * 0.8) // canvas width
var height = (canvas.height = window.innerHeight * 0.8) // canvas height
var deltax = 0 // canvas shake-x
var deltay = 0 // canvas shake-y

// cube
var size = 20 // cube size
var shadowBlur = 0 // cube glow effect, the radius
var x = width / 2 // cube x-coordinate
var y = height / 2 // cube y-coordinate
var vx = 0 // cube x-velocity
var vy = 0 // cube y-velocity
var fx = 0 // cube x-force
var fy = 0 // cube y-force
var ex = 0 // cube expand-x (the dragging effect)
var ey = 0 // cube expand-y
var xscale = 1 // cube scale in x-direction (the elastic effect)
var yscale = 1 // cube scale in y-direction
var dxs = 0 // change rate of xscale (the elastic effect, or the elastic "force")
var dys = 0 // change rate of yscale

// control
var commands = {
  left: false,
  right: false,
  jump: false,
  jumpLock: false
}
var speed = 2

// the expand rate constant
var EXPAND = size / 10

function drawShadow(x1, y1, x2, y2) {
  // draw the shadow of a segment
  // point light at coordinate (width / 2, -10)
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

// fps control
var lastUpdateAt = 0
var fps = 70
var idle = 1000 / fps

// brick ([x1, x2, y, speed-x])
var bricks = [
  [width / 6, width / 3, height / 3, 0.8],
  [width / 3, width * 2 / 3, height * 2 / 3, -0.5]
]
setInterval(() => {
  // move bricks
  bricks.forEach(brick => {
    brick[0] += brick[3]
    brick[1] += brick[3]
    if (brick[0] <= 20 || brick[1] >= width - 20) {
      // wall hit, inverse the direction
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

  // max velocity
  vx = Math.min(Math.max(vx, -20), 20)
  vy = Math.min(Math.max(vy, -20), 20)

  x += vx
  y += vy

  // reset the force
  fy = 1
  fx = 0

  // reduce the screen shaking smoothly
  deltax *= 0.8
  deltay *= 0.8

  // reduce the glow smoothly
  shadowBlur *= 0.95
  if (shadowBlur < 1) shadowBlur = 0

  // change xy-scale
  xscale = Math.min(Math.max(xscale + dxs, 0.4), 1.6)
  yscale = Math.min(Math.max(yscale + dys, 0.4), 1.6)

  // always try to "drag" xy-scale to 1
  dxs = (1 - xscale) * 0.1
  dys = (1 - yscale) * 0.1

  var hitY = false
  var hitX = false
  var newx = x
  var newy = y

  // hit borders
  if (y >= height - 20 - size || y <= 20 + size) {
    newy = Math.min(Math.max(newy, 20 + size), height - 20 - size)
    hitY = true
  }
  if (x >= width - 20 - size || x <= 20 + size) {
    newx = Math.min(Math.max(newx, 20 + size), width - 20 - size)
    hitX = true
  }

  // hit bricks
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

    // hit
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
    deltay = vy * 0.8 // shake the screen, y direction
    dxs += 0.002 * vy * vy // elastic: hit and expand x
    dys += -0.002 * vy * vy // elastic: shrink y
    if (Math.abs(vy) > 10) {
      // add glow when in high speed
      shadowBlur = 20
    }
    vy *= -0.8 // inverse the velocity and reduce a little bit
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
    vx *= 0.9 // friction: reduce vx smoothly
  }

  x = newx
  y = newy

  if (needDraw) {
    context.fillStyle = 'rgba(30, 30, 30, 1)'
    context.fillRect(0, 0, width, height) // draw background
    context.translate(deltax, deltay) // shake the screen
  }

  let v = vx * vx + vy * vy // combine vx and vy

  let px, wx, py, wy // new position and width of the cube

  // smoothly expand the cube, decided by the velocity (the dragging effect)
  ex = ex * 0.8 + vx * EXPAND * 0.2
  ey = ey * 0.8 + vy * EXPAND * 0.2

  if (needDraw) {
    // set position and width/height
    if (ex <= 0) {
      // drag left
      px = x - size
      wx = 2 * size - ex
    } else {
      // drag right
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

    // elastic scale
    px -= (xscale - 1) * wx / 2
    wx *= xscale
    py -= (yscale - 1) * wy / 2
    wy *= yscale

    // draw cube shadow
    drawShadow(px - 1, py, px + wx + 1, py)
    drawShadow(px - 1, py, px - 1, py + wy)
    drawShadow(px + wx + 1, py, px + wx + 1, py + wy)

    // drag brick shadow
    bricks.forEach(brick => {
      drawShadow(brick[0], brick[2], brick[1], brick[2])
      drawShadow(brick[0], brick[2], brick[0], brick[2] + brickHeight)
      drawShadow(brick[1], brick[2], brick[1], brick[2] + brickHeight)
      drawBrick(...brick)
    })

    // draw the cube
    context.fillStyle = 'rgb(239, 131, 84)'
    context.shadowColor = 'rgb(239, 100, 84)'
    context.shadowBlur = shadowBlur
    context.beginPath()
    context.moveTo(px, py)
    var eps = 0.1
    var rx = 10 * (xscale - 1) // the bezier params, decided by the elastic rate
    var ry = 10 * (yscale - 1)
    rx *= vy > eps ? 1 : vy < -eps ? -1 : 0 // inner or outer curve, decided by the velocity direction
    ry *= vx > eps ? 1 : vx < -eps ? -1 : 0
    context.bezierCurveTo(px, py + rx, px + wx, py + rx, px + wx, py) // top
    context.bezierCurveTo(
      px + wx + ry,
      py,
      px + wx + ry,
      py + wy,
      px + wx,
      py + wy
    ) // right
    context.bezierCurveTo(px + wx, py + wy + rx, px, py + wy + rx, px, py + wy) // bottom
    context.bezierCurveTo(px + ry, py + wy, px + ry, py, px, py) // left
    context.fill()
    context.shadowBlur = 0

    // context.fillStyle = 'white'
    // context.font = '30px Arial'
    // context.fillText('💩', x - 20, y + 10) // draw face

    context.strokeStyle = '#111'
    context.lineWidth = 20
    context.strokeRect(10, 10, width - 20, height - 20) // draw border

    context.translate(-deltax, -deltay) // reset shaking
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
window.addEventListener('deviceorientation', function(event) {
  // for more details,
  // https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Orientation_and_motion_data_explained
  commands.left = false
  commands.right = false
  if (event.gamma < -10) {
    commands.left = true
  } else if (event.gamma > 10) {
    commands.right = true
  }
})
canvas.addEventListener('touchstart', function() {
  commands.jump = true
})

draw()
