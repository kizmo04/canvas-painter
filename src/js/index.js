import _ from 'lodash';

(function() {

  var canvas = document.querySelector('#canvas');
  var drawingCanvas = document.querySelector('#cached');
  // var background = document.querySelector('#background-cached');
  var canvasConatinerWidth;
  var canvasConatinerHeight;

  var image = document.querySelector('#source');
  image.crossOrigin = "Anonymous";
  // image.setAttribute('crossOrigin', '')
  var c = canvas.getContext('2d');
  var d = drawingCanvas.getContext('2d');
  // var bg = background.getContext('2d');
  var imageData;
  var data;
  var drawings = {};
  var colorMenu = document.querySelector('#menu-container');
  var strokeColor;
  var lineWidth;
  var saveButton = document.querySelector('#save');
  var styleMenu = document.querySelector('#stroke-style-menu-container');
  var styleCanvas = document.querySelector('#stroke-style-view');
  var s = styleCanvas.getContext('2d');
  var styleValue = document.querySelector('#stroke-style-value');
  var deleteAll = document.querySelector('#delete-all');

  deleteAll.addEventListener('pointerdown', async function(e) {
    e.preventDefault();
    // e.stopPropagation();
    var canvasData = await canvasDataRef.child('path').once('value');
    canvasData = canvasData.val();
    console.log(canvasData)
    for (var key in canvasData) {
      canvasDataRef.child(`path/${key}`).remove();
    }
  });
  // saveButton.setAttribute('href', dataUrl);
  // console.log(dataUrl)
  // saveButton.setAttribute('download', 'ddd.png');
  var style = {
    r: 0,
    g: 0,
    b: 0,
    a: 1,
    width: 5
  };

  s.beginPath();
  s.strokeStyle = `rgba(${style.r}, ${style.g}, ${style.b}, ${style.a})`;
  styleValue.textContent = `rgba(${style.r}, ${style.g}, ${style.b}, ${style.a}), line-width: ${style.width}`;
  strokeColor = `rgba(${style.r}, ${style.g}, ${style.b}, ${style.a})`;
  s.lineWidth = style.width;
  lineWidth = style.width;
  s.moveTo(50, 50);
  s.lineTo(150, 50);
  s.stroke();
  s.closePath();

  styleMenu.addEventListener('pointermove', function(e) {
    if (Array.prototype.includes.call(e.target.classList, 'slider') && e.buttons === 1) {
      if (e.x < 256 && e.x > 0) {
        e.target.style.left = (e.x - 10) + 'px';
        if (e.target.classList[1] === 'a') {
          style[e.target.classList[1]] = (e.x / 255).toFixed(2);
        } else {
          style[e.target.classList[1]] = e.x.toFixed(0);
        }
        s.clearRect(0, 0, canvas.width, canvas.height);
        s.beginPath();
        s.strokeStyle = `rgba(${style.r}, ${style.g}, ${style.b}, ${style.a})`;
        styleValue.textContent = `rgba(${style.r}, ${style.g}, ${style.b}, ${style.a}), line-width: ${style.width}`;
        strokeColor = `rgba(${style.r}, ${style.g}, ${style.b}, ${style.a})`;
        s.lineWidth = style.width;
        lineWidth = style.width;
        s.moveTo(50, 50);
        s.lineTo(150, 50);
        s.stroke();
        s.closePath();
      } else {
        return;
      }
    }
  });

  saveButton.addEventListener('pointerdown', async function(e) {
    var dataUrl = canvas.toDataURL();
    e.preventDefault();
    e.currentTarget.setAttribute('href', dataUrl);
    e.currentTarget.setAttribute('download', 'untitled.png');
    e.currentTarget.click();
  });

  colorMenu.addEventListener('pointerdown', function(e) {
    strokeColor = e.target.classList[1];
    mode = 1;
  });


  // Initialize Firebase
  var firebase = require("firebase");
  var config = {
    apiKey: "AIzaSyCzXH4QBu0xFYgwrgChoWBIeAIKiQESsw8",
    authDomain: "canvas-painter-95627.firebaseapp.com",
    databaseURL: "https://canvas-painter-95627.firebaseio.com",
    projectId: "canvas-painter-95627",
    storageBucket: "canvas-painter-95627.appspot.com",
  };
  firebase.initializeApp(config);
  // var config = {
  //   apiKey: keys.apiKey,
  //   authDomain: keys.authDomain,
  //   databaseURL: keys.databaseURL,
  //   projectId: keys.projectId,
  //   storageBucket: keys.storageBucket,
  //   messagingSenderId: keys.messagingSenderId
  // };


  var database = firebase.database();

  var userDataRef;
  var canvasDataRef;
  var canvasData;

  function LinePath (context, offsets) {
    this.offsets = offsets || [];
    this.context = context;
    this.id = userId;
  }

  function setPath (pathObj, obj) {
    var offsets = obj.offsets;
    c.strokeStyle = obj.context.strokeStyle;
    c.lineWidth = obj.context.lineWidth;
    for (var i = 0; i < offsets.length - 1; i++) {
      pathObj.moveTo(offsets[i].x, offsets[i].y);
      pathObj.lineTo(offsets[i + 1].x, offsets[i + 1].y);
    }
    return pathObj;
  }

  function pushOffsets(obj, x, y) {
    obj.offsets.push({x: x, y: y});
    return obj;
  }

  var userId;
  canvasDataRef = database.ref('canvas');
  userDataRef = database.ref('user');
  userDataRef.once('value')
  .then(snapshot => {
    var idList = snapshot.val() || [];
    idList = Object.values(idList);
    userId = idList.length ? idList[idList.length - 1] + 1 : 1;
    console.log(idList[idList.length - 1])
    var key = userDataRef.push().key;
    var updates = {};
    updates[`${key}`] = userId;
    userDataRef.update(updates);
  })
  .catch()

  canvasDataRef.once('value')
  .then(snapshot => {
    canvasData = snapshot.val();
    image.src = canvasData.img;
    // c.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight, 0, 0, canvas.width, canvas.height);
    loadImage()
    .then(e => {
      canvas.width = e.target.naturalWidth;
      canvas.height = e.target.naturalHeight;
      canvas.width = e.target.naturalWidth;
      canvas.height = e.target.naturalHeight;
      c.drawImage(e.target, 0, 0, e.target.naturalWidth, e.target.naturalHeight, 0, 0, canvas.width, canvas.height);
      canvasConatinerHeight = Math.min(400, canvas.height);
      canvasConatinerWidth = parseInt(canvasConatinerHeight * e.target.naturalWidth / e.target.naturalHeight);
    })
    .then(() => {
      // c.clearRect(0, 0, canvas.width, canvas.height);
      for (var key in canvasData.path) {
        var path = new Path2D();
        c.beginPath();
        newLinePath = JSON.parse(canvasData.path[key]);
        path = setPath(path, newLinePath);
        c.stroke(path);
        drawings[key] = path;
        c.closePath();
      }
    })
    .catch(err => {
      console.log(err);
    });
  })
  .catch(err => {
    console.log(err);
  });

  canvasDataRef.child('path').on('value', snapshot => {
    console.log('database on')
    canvasData = snapshot.val();
    // image.src = canvasData.img;
    c.clearRect(0, 0, canvas.width, canvas.height);
    c.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight, 0, 0, canvas.width, canvas.height);
    drawings = {};
    for (var key in canvasData) {
      // console.log(typeof JSON.parse(canvasData.path[key]));
      // var path = new Path2D(canvasData.path[key]);
      var path = new Path2D();
      c.beginPath();
      newLinePath = JSON.parse(canvasData[key]);
      path = setPath(path, newLinePath);
      c.stroke(path);
      drawings[key] = path;
      c.closePath();
    }
    console.log('pathon done')
  });

  canvasDataRef.child('img').on('value', snapshot => {
    console.log('database img on')
    canvasData = snapshot.val();
    image.src = canvasData;
    // c.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight, 0, 0, canvas.width, canvas.height);
    loadImage()
    .then(e => {
      canvas.width = e.target.naturalWidth;
      canvas.height = e.target.naturalHeight;
      canvas.width = e.target.naturalWidth;
      canvas.height = e.target.naturalHeight;
      c.drawImage(e.target, 0, 0, e.target.naturalWidth, e.target.naturalHeight, 0, 0, canvas.width, canvas.height);
      canvasConatinerHeight = Math.min(400, canvas.height);
      canvasConatinerWidth = parseInt(canvasConatinerHeight * e.target.naturalWidth / e.target.naturalHeight);
    })
    .then(() => {
      canvasDataRef.child('path').once('value')
      .then(snapshot => {
        canvasData = snapshot.val();
        for (var key in canvasData) {
          var path = new Path2D();
          c.beginPath();
          newLinePath = JSON.parse(canvasData[key]);
          path = setPath(path, newLinePath);
          c.stroke(drawings[key]);
          c.closePath();
          drawings[key] = path;
        }
      })
      // d.clearRect(0, 0, canvas.width, canvas.height);
    })
    .catch(err => {
      console.log(err);
    });
  });

  function loadImage () {
    return new Promise((resolve, reject) => {
      image.onload = resolve;
    });
  }

  canvas.addEventListener('dragover', function(e) {
    e.preventDefault();
    // e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
  });

  var pushImgData;
  var newLinePath;
  canvas.addEventListener('drop', function(e) {
    e.preventDefault();
    // e.stopPropagation();
    var reader = new FileReader();
    reader.addEventListener("load", function () {
      // canvasDataRef.set({img: reader.result});
      image.src = reader.result;
      canvasDataRef.update({ 'img': reader.result });
      // c.clearRect(0, 0, canvas.width, canvas.height);
      // cachedtx.clearRect(0, 0, canvas.width, canvas.height);

      // c.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight, 0, 0, canvas.width, canvas.height);
      // cachedtx.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight, 0, 0, canvas.width, canvas.height);
      // prevImageData = c.getImageData(0, 0, canvas.width, canvas.height);
    }, false);

    reader.readAsDataURL(e.dataTransfer.files[0]);
  });

  // canvas.addEventListener('wheel', _.throttle(scrollHandler, 100));

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
  var offsets = [];


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
  var newPathKey;

  canvas.addEventListener('pointermove', function(e) {
    console.log('move')
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
      // _.forEach(drawings, path => {
      //   c.stroke(path);
      // });
      // prevImageData = c.getImageData(0, 0, canvas.width, canvas.height);
    } else if (mode === 1 && drawStart && e.buttons === 1) {
      // currentOffsetX = (parseInt(e.offsetX) / canvasConatinerWidth) * canvas.width;
      // currentOffsetY = (parseInt(e.offsetY) / canvasConatinerHeight) * canvas.height;

      prevOffsetX = (parseInt(e.offsetX) / canvasConatinerWidth) * canvas.width;
      prevOffsetY = (parseInt(e.offsetY) / canvasConatinerHeight) * canvas.height;

      // newDrawing.moveTo(prevOffsetX,prevOffsetY);
      // newDrawing.lineTo(currentOffsetX, currentOffsetY);
      if (newLinePath.id === userId) pushOffsets(newLinePath, prevOffsetX, prevOffsetY);
      // console.log(newLinePath)
      var updates = {};
      updates[`/path/${newPathKey}`] = JSON.stringify(newLinePath);
      canvasDataRef.update(updates, function(err) {
        if (err) {

        } else {
          console.log('update success!');
        }
      });
      // drawings[newPathKey] = newDrawing;
      // console.log(currentOffsetX)
      // d.stroke(newDrawing);
      // var dataUrl = canvas.toDataURL('image/gif');
      // canvas.toDataUrl();
      // cachedtx.stroke(newDrawing);

      // newDrawing.moveTo(prevOffsetX * width / image.naturalWidth, prevOffsetY * height / image.naturalHeight);
      // newDrawing.lineTo(currentOffsetX * width / image.naturalWidth, currentOffsetY * height / image.naturalHeight);
      // imageData = c.getImageData(0, 0, canvas.width, canvas.height);
      // imageData.crossOrigin = 'Anonymous';
      // cachedtx.putImageData(imageData, 0, 0);
      // cachedtx.stroke(newDrawing);
      // prevOffsetX = currentOffsetX;
      // prevOffsetY = currentOffsetY;

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

  canvas.addEventListener('pointerdown', function(e) {
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
      // c.strokeStyle = 'green';
      // c.lineWidth = 5;
      newLinePath = new LinePath({
        strokeStyle: strokeColor,
        lineWidth: lineWidth
      });
      newLinePath.id = userId;
      newPathKey = canvasDataRef.child('path').push().key;
      // cachedtx.beginPath();
      // cachedtx.strokeStyle = 'green';
      // cachedtx.lineWidth = 10;
      prevOffsetX = (parseInt(e.offsetX) / canvasConatinerWidth) * canvas.width;
      prevOffsetY = (parseInt(e.offsetY) / canvasConatinerHeight) * canvas.height;
      // newDrawing.moveTo(prevOffsetX,prevOffsetY);
      pushOffsets(newLinePath, prevOffsetX, prevOffsetY);

      // drawings[newPathKey] = newDrawing;
      // console.log('canvas', e.offsetX, canvasConatinerWidth, canvas.width, image.width, image.naturalWidth)
      // console.log(canvas.getAttribute('width'))
    }

  });


  canvas.addEventListener('pointerup', function(e) {
    if (mode === 1 && e.button === 0) {
      console.log('mouseup drawing', e.target);
      // c.stroke(newDrawing);
      // c.save();
      c.closePath();
      // cachedtx.closePath();
      // newPathKey = canvasDataRef.child('path').push().key;
      // var updates = {};
      // updates[`/path/${newPathKey}`] = JSON.stringify(newLinePath);
      // canvasDataRef.update(updates, function(err) {
      //   if (err) {

      //   } else {
      //     console.log('update success!')
      //   }
      // });
      // console.log(updates);
      // console.log(drawings)

      drawStart = false;
    } else if (mode === 2 && e.button === 0) {
      // drawings = await canvasDataRef.child('path').once('value');
      // drawings = drawings.val();

      for (var key in drawings) {
        if (c.isPointInStroke(drawings[key], (parseInt(e.offsetX) / canvasConatinerWidth) * canvas.width, (parseInt(e.offsetY) / canvasConatinerHeight) * canvas.height)) {
          canvasDataRef.child(`path/${key}`).remove();
        }
      }
      // console.log(drawings)

      // drawings = _.filter(drawings, path => !c.isPointInStroke(path, (parseInt(e.offsetX) / canvasConatinerWidth) * canvas.width, (parseInt(e.offsetY) / canvasConatinerHeight) * canvas.height)
      // );

      // c.clearRect(0, 0, canvas.width, canvas.height);
      // if (wasZoomIn === 1) {
      //   c.drawImage(image, sourceX - moveX, sourceY - moveY, width, height, 0, 0, canvas.width, canvas.height);
      // } else if (wasZoomIn === 2) {
      //   c.drawImage(image, -sourceX - moveX, -sourceY - moveY, width, height, moveX, moveY, canvas.width, canvas.height);
      // } else {
      //   c.drawImage(image, -moveX, -moveY, image.naturalWidth, image.naturalHeight, 0, 0, canvas.width, canvas.height);
      // }
      // c.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight, 0, 0, canvas.width, canvas.height);
      // _.forEach(drawings, path => {
      //   c.stroke(path);
      // });
      // imageData = c.getImageData(0, 0, canvas.width, canvas.heigth);
      // cachedtx.putImageData(imageData, 0, 0);
    }
  });

  function isPointInPath(path, x, y) {
    path = JSON.parse(path);
    for (var i = 0; i < path.offsets.length; i++) {
      if (path.offsets[i].x === x && path.offsets[i].y === y) {
        return true;
      }
    }
    return false;
  }

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
