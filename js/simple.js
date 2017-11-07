var canvas = document.getElementsByTagName('canvas')[0]
var context = canvas.getContext('2d')

var width = (canvas.width = window.innerWidth)
var height = (canvas.height = window.innerHeight)

var x = width / 2
var y = height / 2
var v = 0
var f = 0

var commands = {
  left: false,
  right: false,
  jump: false
}

var speed = 10

function draw() {
  if (commands.left) {
    x -= speed
  }
  if (commands.right) {
    x += speed
  }
  if (commands.jump) {
    commands.jump = false
    f = -20
  }
  v += f
  y += v
  
  f = 1
  
  if (y >= height - 10 || y <= 10) {
    v = 0
  }
  x = Math.min(Math.max(x, 10), width - 10) // borders
  y = Math.min(Math.max(y, 10), height - 10) // borders

  context.fillStyle = 'rgba(45, 49, 66, 0.5)'
  context.fillRect(0, 0, width, height) // draw background

  context.strokeStyle = '#4f5d75'
  context.lineWidth = 20
  context.strokeRect(10, 10, width - 20, height - 20) // draw border

  context.strokeStyle = '#ef8354'
  context.lineWidth = 10
  context.strokeRect(x - 5, y - 5, 10, 10) // draw player

  requestAnimationFrame(draw) // set next frame
}

window.addEventListener('keydown', function(event) {
  switch (event.key) {
    case 'a':
    case 'ArrowLeft':
      commands.left = true
      break
    case ' ':
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
canvas.addEventListener('touchstart', function () {
  commands.jump = true
})

draw()
