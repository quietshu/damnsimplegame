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

var ex = 0,
  ey = 0 // expand

var commands = {
  left: false,
  right: false,
  jump: false
}

var speed = 2

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

  if (y >= height - 20 - size || y <= 20 + size) {
    vy *= -0.8
  }
  if (x >= width - 20 - size || x <= 20 + size) {
    vx *= -0.8
  } else {
    vx *= 0.9
  }
  x = Math.min(Math.max(x, 20 + size), width - 20 - size) // borders
  y = Math.min(Math.max(y, 20 + size), height - 20 - size) // borders

  // context.shadowBlur = 0
  context.fillStyle = 'rgba(45, 49, 66, 1)'
  context.fillRect(0, 0, width, height) // draw background

  context.strokeStyle = '#4f5d75'
  context.lineWidth = 20
  context.strokeRect(10, 10, width - 20, height - 20) // draw border

  let v = vx * vx + vy * vy

  // context.shadowBlur = 5
  // context.shadowColor = 'black'
  context.fillStyle = 'rgb(239, 131, 84)'

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
  context.fillRect(px, py, wx, wy) // draw player

  // context.fillStyle = 'white'
  // context.font = '30px Arial'
  // context.fillText('💩', x - 20, y + 10) // draw face

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
