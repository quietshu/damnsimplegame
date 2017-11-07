var canvas = document.getElementsByTagName('canvas')[0]
var context = canvas.getContext('2d')

context.globalCompositeOperation = 'hard-light'

var width = (canvas.width = window.innerWidth)
var height = (canvas.height = window.innerHeight)

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
  jump: false
}

var speed = 2

var dxs = 0
var dys = 0

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

function draw() {
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
  x += vx
  y += vy

  fy = 1
  fx = 0

  deltax *= 0.8
  deltay *= 0.8

  xscale = Math.min(Math.max(xscale + dxs, 0.4), 1.6)
  yscale = Math.min(Math.max(yscale + dys, 0.4), 1.6)

  dxs = (1 - xscale) * 0.1
  dys = (1 - yscale) * 0.1

  if (y >= height - 20 - size || y <= 20 + size) {
    deltay = vy
    dxs += 0.002 * vy * vy
    dys += -0.002 * vy * vy
    vy *= -0.8
  }
  if (x >= width - 20 - size || x <= 20 + size) {
    deltax = vx
    dxs += -0.002 * vx * vx
    dys += 0.002 * vx * vx
    vx *= -0.8
  } else {
    vx *= 0.9
  }

  x = Math.min(Math.max(x, 20 + size), width - 20 - size) // borders
  y = Math.min(Math.max(y, 20 + size), height - 20 - size) // borders

  context.fillStyle = 'rgba(45, 49, 66, 1)'
  context.fillRect(0, 0, width, height) // draw background

  context.translate(deltax, deltay) // shake

  let v = vx * vx + vy * vy

  let px, wx, py, wy // position and width
  let expand = size / 10
  ex = ex * 0.8 + vx * expand * 0.2
  ey = ey * 0.8 + vy * expand * 0.2
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

  // draw player
  context.shadowBlur = 50
  context.shadowColor = 'rgba(239, 131, 84, 0.3)'
  context.fillStyle = 'rgb(239, 131, 84)'
  context.beginPath()
  context.moveTo(px, py)
  var rx = 5 * (xscale - 1) + Math.sqrt(ex * ex / 80)
  var ry = 5 * (yscale - 1) + Math.sqrt(ey * ey / 80)
  context.bezierCurveTo(px, py + rx, px + wx, py + rx, px + wx, py)
  context.bezierCurveTo(
    px + wx - ry,
    py,
    px + wx - ry,
    py + wy,
    px + wx,
    py + wy
  )
  context.bezierCurveTo(px + wx, py + wy - rx, px, py + wy - rx, px, py + wy)
  context.bezierCurveTo(px + ry, py + wy, px + ry, py, px, py)
  context.fill()
  // context.fillRect(px, py, wx, wy)

  // context.fillStyle = 'white'
  // context.font = '30px Arial'
  // context.fillText('💩', x - 20, y + 10) // draw face

  context.shadowBlur = 0
  context.strokeStyle = '#4f5d75'
  context.lineWidth = 20
  context.strokeRect(10, 10, width - 20, height - 20) // draw border

  context.translate(-deltax, -deltay)

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
      commands.jump = true
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
