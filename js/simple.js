var canvas = document.getElementsByTagName('canvas')[0]
var context = canvas.getContext('2d')

context.globalCompositeOperation = 'multiply'

var width = (canvas.width = window.innerWidth)
var height = (canvas.height = window.innerHeight)

var x = width / 2
var y = height / 2
var vx = 0
var vy = 0
var fx = 0
var fy = 0

var commands = {
  left: false,
  right: false,
  jump: false
}

var speed = 5

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
  
  if (y >= height - 10 || y <= 10) {
    vy *= -0.8
  }
  if (x >= width - 10 || x <= 10) {
    vx *= -0.8
  } else {
    vx *= 0.5
  }
  x = Math.min(Math.max(x, 10), width - 10) // borders
  y = Math.min(Math.max(y, 10), height - 10) // borders

  context.fillStyle = 'rgba(45, 49, 66, 0.7)'
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
