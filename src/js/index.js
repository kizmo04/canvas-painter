import _ from 'lodash';

(function() {
  var socket = new WebSocket('ws://localhost:8080/');

  socket.addEventListener('open', function (event) {
    socket.send('Hello Server!');
    console.log(event)
  });

  socket.addEventListener('message', function (event) {
    console.log('Message from server ', event.data);
  });

  var canvas = document.querySelector('#canvas');
  var cached = document.querySelector('#cached');
  // var background = document.querySelector('#background-cached');
  var canvasConatinerWidth;
  var canvasConatinerHeight;

  var image = document.querySelector('#source');
  image.crossOrigin = "Anonymous";
  // image.setAttribute('crossOrigin', '')
  var c = canvas.getContext('2d');
  var cachedtx = cached.getContext('2d');
  // var bg = background.getContext('2d');
  var imageData;
  var data;

  image.addEventListener('load', imageLoadHandler);

  function imageLoadHandler (e) {
    canvas.width = e.target.naturalWidth;
    canvas.height = e.target.naturalHeight;
    cached.width = e.target.naturalWidth;
    cached.height = e.target.naturalHeight;
    // bg.width = e.target.naturalWidth;
    // bg.height = e.target.naturalHeight;

    c.drawImage(e.target, 0, 0, e.target.naturalWidth, e.target.naturalHeight, 0, 0, canvas.width, canvas.height);
    // cachedtx.drawImage(e.target, 0, 0, e.target.naturalWidth, e.target.naturalHeight, 0, 0, canvas.width, canvas.height);


    // imageData = c.getImageData(0, 0, canvas.width, canvas.height);
    // data = imageData.data;
    // for (var i = 0; i < data.length; i += 4) {
    //   data[i + 3] = 100;
    // }
    // console.log(imageData)
    // cachedtx.drawImage(e.target, 0, 0, e.target.naturalWidth, e.target.naturalHeight, 0, 0, canvas.width, canvas.height);
    // cachedtx.putImageData(imageData, 0, 0);

    canvasConatinerHeight = Math.min(400, canvas.height);
    // canvasConatinerWidth = canvas.width > 800 ? 800 : canvas.width;
    canvasConatinerWidth = parseInt(canvasConatinerHeight * e.target.naturalWidth / e.target.naturalHeight);
  }

  canvas.addEventListener('dragover', function(e) {
    e.preventDefault();
    // e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
  });

  canvas.addEventListener('drop', function(e) {
    e.preventDefault();
    // e.stopPropagation();
    var reader = new FileReader();
    reader.addEventListener("load", function () {
      image.src = reader.result;
      c.clearRect(0, 0, canvas.width, canvas.height);
      // cachedtx.clearRect(0, 0, canvas.width, canvas.height);

      c.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight, 0, 0, canvas.width, canvas.height);
      // cachedtx.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight, 0, 0, canvas.width, canvas.height);
      // prevImageData = c.getImageData(0, 0, canvas.width, canvas.height);
    }, false);

    reader.readAsDataURL(e.dataTransfer.files[0]);
  });

  canvas.addEventListener('wheel', _.throttle(scrollHandler, 100));

  var zoomIn = 0.9;
  var zoomOut = 1.1;
  var width = image.naturalWidth;
  var height = image.naturalHeight;
  var offsetX, offsetY, sourceX, sourceY;
  var wasZoomIn = 0;
  var moveX = 0;
  var moveY = 0;
  var mode = 0;
  var prevImageData;
  var inScale = 1.1;
  var outScale = 0.9;


  function scrollHandler(e) {
    e.stopPropagation();
    if (mode === 0 && e.deltaY > 0) {
      // width = Math.floor(width * inScale);
      width = Math.floor(width * zoomIn);
      // height = Math.floor(height * inScale);
      height = Math.floor(height * zoomIn);
      sourceX = (image.naturalWidth - width) * 0.5;
      sourceY = (image.naturalHeight - height) * 0.5;
      c.clearRect(0, 0, canvas.width, canvas.height);
      // c.scale(inScale, inScale);
      // inScale += 0.01;
      // c.setTransform(1, 0, 0, 1, 0, 0);
      // c.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight, 0, 0, canvas.width, canvas.height);
      c.drawImage(image, sourceX - moveX, sourceY - moveY, width, height, 0, 0, canvas.width, canvas.height);
      // c.drawImage(image, 0, 0, width, height, 0, 0, canvas.width, canvas.height);
      // prevImageData = c.getImageData(0, 0, canvas.width, canvas.height);
      wasZoomIn = 1;
      // _.forEach(drawings, path => {
      //   c.stroke(path);
      // });
    } else if (mode === 0 && e.deltaY < 0) {
      width = Math.floor(width * zoomOut);
      // width = Math.floor(width * outScale);
      height = Math.floor(height * zoomOut);
      // height = Math.floor(height * outScale);
      sourceX = (width - image.naturalWidth) * 0.5;
      sourceY = (height - image.naturalHeight) * 0.5;
      c.clearRect(0, 0, canvas.width, canvas.height);
      // c.scale(outScale, outScale);
      // outScale -= 0.01;
      // if (outScale <= 0) outScale = 0.01;
      // c.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight, 0, 0, canvas.width, canvas.height);
      c.drawImage(image, -sourceX - moveX, -sourceY - moveY, width, height, 0, 0, canvas.width, canvas.height);
      // prevImageData = c.getImageData(0, 0, canvas.width, canvas.height);
      wasZoomIn = 2;
      // _.forEach(drawings, path => {
      //   c.stroke(path);
      // });
    }
  }

  var prevOffsetX, prevOffsetY;
  var currentOffsetX, currentOffsetY;

  canvas.addEventListener('mousemove', function(e) {
    if (mode === 0 && e.buttons === 1) {
      c.clearRect(0, 0, canvas.width, canvas.height);
      moveX += e.movementX * Math.floor(1 * canvas.width / canvasConatinerWidth);
      moveY += e.movementY * Math.floor(1 * canvas.height / canvasConatinerHeight);
      if (wasZoomIn === 1) {
        c.drawImage(image, sourceX - moveX, sourceY - moveY, width, height, 0, 0, canvas.width, canvas.height);
      } else if (wasZoomIn === 2) {
        c.drawImage(image, -sourceX - moveX, -sourceY - moveY, width, height, moveX, moveY, canvas.width, canvas.height);
      } else {
        c.drawImage(image, -moveX, -moveY, image.naturalWidth, image.naturalHeight, 0, 0, canvas.width, canvas.height);
      }
      _.forEach(drawings, path => {
        c.stroke(path);
      });
      // prevImageData = c.getImageData(0, 0, canvas.width, canvas.height);
    } else if (mode === 1 && drawStart && e.buttons === 1) {
      currentOffsetX = (parseInt(e.offsetX) / canvasConatinerWidth) * canvas.width;
      currentOffsetY = (parseInt(e.offsetY) / canvasConatinerHeight) * canvas.height;

      newDrawing.moveTo(prevOffsetX,prevOffsetY);
      newDrawing.lineTo(currentOffsetX, currentOffsetY);
      // console.log(currentOffsetX)
      c.stroke(newDrawing);
      // cachedtx.stroke(newDrawing);

      // newDrawing.moveTo(prevOffsetX * width / image.naturalWidth, prevOffsetY * height / image.naturalHeight);
      // newDrawing.lineTo(currentOffsetX * width / image.naturalWidth, currentOffsetY * height / image.naturalHeight);
      // imageData = c.getImageData(0, 0, canvas.width, canvas.height);
      // imageData.crossOrigin = 'Anonymous';
      // cachedtx.putImageData(imageData, 0, 0);
      // cachedtx.stroke(newDrawing);
      prevOffsetX = currentOffsetX;
      prevOffsetY = currentOffsetY;

    } else if (mode === 1 && e.buttons === 2) {
      imageData = c.getImageData(0, 0, canvas.width, canvas.height);
      data = imageData.data;
      // imageData.crossOrigin = 'Anonymous'; // trick으로 해결함..
      // console.log(imageData)
      if (e.movementY > 0) {
        for (var i = 0; i < data.length; i += 4) {
          data[i]--;
          data[i + 1]--;
          data[i + 2]--;
        }
        c.putImageData(imageData, 0, 0);
        // cachedtx.putImageData(imageData, 0, 0);
        // console.log('down')

      } else if (e.movementY < 0) {
        console.log('up')
        for (var i = 0; i < data.length; i += 4) {
          data[i]++;
          data[i + 1]++;
          data[i + 2]++;
        }
        c.putImageData(imageData, 0, 0);
        // cachedtx.putImageData(imageData, 0, 0);

      }

    } else {
      return;
    }
  });
  var imageData;
  var newDrawing;
  var drawStart = false;

  canvas.addEventListener('mousedown', function(e) {
    if (mode === 1 && e.buttons === 1) {
      console.log('mousedown drawing')
      // cachedtx.save();
      // c.save();
      // cachedtx.globalCompositeOperation = "destination-out";
      newDrawing = new Path2D();
      drawStart = true;
      // console.log(newDrawing);
      // c.save();
      c.beginPath();
      c.strokeStyle = 'green';
      c.lineWidth = 10;
      // cachedtx.beginPath();
      // cachedtx.strokeStyle = 'green';
      // cachedtx.lineWidth = 10;
      prevOffsetX = (parseInt(e.offsetX) / canvasConatinerWidth) * canvas.width;
      prevOffsetY = (parseInt(e.offsetY) / canvasConatinerHeight) * canvas.height;
      // console.log('canvas', e.offsetX, canvasConatinerWidth, canvas.width, image.width, image.naturalWidth)
      // console.log(canvas.getAttribute('width'))
    }

  });

  var drawings = [];

  canvas.addEventListener('mouseup', function(e) {
    if (mode === 1 && e.button === 0) {
      console.log('mouseup drawing');
      // c.stroke(newDrawing);
      // c.save();
      c.closePath();
      // cachedtx.closePath();
      drawings.push(newDrawing);
      // console.log(drawings)

      drawStart = false;
    } else if (mode === 2 && e.button === 0) {
      drawings = _.filter(drawings, path => !c.isPointInStroke(path, (parseInt(e.offsetX) / canvasConatinerWidth) * canvas.width, (parseInt(e.offsetY) / canvasConatinerHeight) * canvas.height)
      );

      c.clearRect(0, 0, canvas.width, canvas.height);
      if (wasZoomIn === 1) {
        c.drawImage(cached, sourceX - moveX, sourceY - moveY, width, height, 0, 0, canvas.width, canvas.height);
      } else if (wasZoomIn === 2) {
        c.drawImage(cached, -sourceX - moveX, -sourceY - moveY, width, height, moveX, moveY, canvas.width, canvas.height);
      } else {
        c.drawImage(cached, -moveX, -moveY, image.naturalWidth, image.naturalHeight, 0, 0, canvas.width, canvas.height);
      }
      // c.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight, 0, 0, canvas.width, canvas.height);
      _.forEach(drawings, path => {
        c.stroke(path);
      });
      imageData = c.getImageData(0, 0, canvas.width, canvas.heigth);
      cachedtx.putImageData(imageData, 0, 0);
    }
  });

  window.addEventListener('contextmenu', function (e) {
    e.preventDefault();
  }, false);

  var modeDisplay = document.querySelector('#mode');
  var modeInfo = document.querySelector('#mode-info');

  window.addEventListener('keydown', function(e) {
    if (e.key === 'd') {
      mode = 1;
      modeDisplay.textContent = 'drawing Mode';
      modeInfo.textContent = 'draw line: left click and move, brighthness: right click and move, visual Mode: press "v"key, delete Mode: press "x"key'
    } else if (e.key === 'v') {
      modeDisplay.textContent = 'visual Mode';
      modeInfo.textContent = 'zoom In/Out : mouse wheel, move : left click and move, drawing Mode: press "d"key, delete Mode: press "x"key';
      mode = 0;
    } else if (e.key === 'x') {
      modeDisplay.textContent = 'delete Mode';
      modeInfo.textContent = 'delete specific object: left click, visual Mode: press "v"key, delete Mode: press "x"key';
      mode = 2;
      // c.restore();
    } else {
      return;
    }
  });

})();
