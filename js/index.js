     //let vertexShader = glslify('./frag.glsl')

      let mouseDown = false
      let running = true

      const width = 256
      const height = 256
      const windowWidth = window.innerWidth
      const windowHeight = window.innerHeight
      const widthPerCell = windowWidth / width
      const heightPerCell = windowHeight / height

      let grid = []
      let temp = []

      let ctx, canvas, textureCanvas, gl
      let buffer, texture

      let colors = ["red","green","blue","yellow","orange"]//,"white","cyan","magenta","CornflowerBlue","Indigo"]
      let currentColor = 8

    window.addEventListener( 'load', function() {
        console.log('Opened Window'); 

        canvas = document.getElementById('gl')
        canvas.width = canvas.height = height
        gl = canvas.getContext('webgl')

        textureCanvas = document.getElementById('texture')
        textureCanvas.width = textureCanvas.height = height
        ctx = textureCanvas.getContext( '2d' )

        textureCanvas.style.display = 'none'
        
        // define drawing are of canvas. bottom corner. width / height
        gl.viewport(0,0, gl.drawingBufferWidth * 2, gl.drawingBufferHeight * 2)

        // create a buffer object to store verticies
        buffer = gl.createBuffer()

        // point buffer at graphic context's ARRAY_BUFFER
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer)

        var triangles = new Float32Array([
            -1,-1,
            1,-1,
            -1,1,
            -1,1,
            1,-1,
            1,1
          ])

        //initialize memory for buffer and populate it. Give
        //WebGL hint contents will not change dynamically
        gl.bufferData(gl.ARRAY_BUFFER, triangles, gl.STATIC_DRAW)

        // create vertex shader
        let vertexSource = document.getElementById('vertex').text
        let vertexShader = gl.createShader(gl.VERTEX_SHADER)
        gl.shaderSource(vertexShader,vertexSource)
        gl.compileShader(vertexShader)

        // create fragment shader
        let fragmentSource = document.getElementById('fragment').text
        let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
        gl.shaderSource(fragmentShader,fragmentSource)
        gl.compileShader(fragmentShader)

        // create shader program
        let program = gl.createProgram()
        gl.attachShader(program, vertexShader)
        gl.attachShader(program, fragmentShader)
        gl.linkProgram(program)
        gl.useProgram(program)

        var position = gl.getAttribLocation(program, 'aPosition')
        gl.enableVertexAttribArray(position)
        gl.vertexAttribPointer(position, 2 , gl.FLOAT, false, 0, 0)

        program.textureCoordAttribute = gl.getAttribLocation(program, 'aTextureCoord')
        gl.enableVertexAttribArray(program.textureCoordAttribute)
        gl.vertexAttribPointer(program.textureCoordAttribute, 2, gl.FLOAT, false, 0, 0)

        // the sampler will automatically pass in the bound texture
        program.sampleUniform = gl.getUniformLocation(program, 'uSampler')
        gl.uniform1i(program.sampleUniform, 0)

        // Create webGL texture 
        texture = gl.createTexture()

        for( let y = 0; y < height; y++ ) {
          grid[ y ] = []
          temp[ y ] = [] /* ADDED AFTER CLASS */

          for( let x = 0; x < width; x++ ) {
            //grid[ y ][ x ] = Math.round( Math.random() )
            grid[ y ][ x ] = 0
            temp[ y ][ x ] = 0 /* ADDED AFTER CLASS */
          }
        }


        let count = 0 
        ctx.fillStyle = 'black'
        ctx.fillRect( 0,0,width,height )

        canvas.onmousedown = function(e){
        //console.log(e);
        //addCell(e.clientX, e.clientY)
        mouseDown = true
        currentColor = Math.floor(Math.random()*colors.length)
        }

        canvas.onmousemove = function(e){
          //console.log(e);
          if(mouseDown)
            addCell(e.clientX, e.clientY)
        }

        canvas.onmouseup = function(e){
          //console.log(e);
          //addCell(e.clientX, e.clientY)
          mouseDown = false
        }

        document.body.onkeyup = function(e){
          if(e.keyCode == 32){
              running = !running
          }
        }


        render();
       //window.requestAnimationFrame( draw )
      })
    


      let numLiveNeighboors = function(y , x) {
        //Loop through and get the number of live neighbors
        let numNeighbors = 0

        for( let i = y - 1; i <= y + 1; i++){
          for(let j = x - 1; j <= x + 1; j++){
            if(i >= 0 && i <= height - 1 ){
              if(j >= 0 && j <= width - 1){
                numNeighbors += grid[i][j]
              }
            }
          }
        }

        if(grid[y][x] == 1)
          numNeighbors--;

        return numNeighbors;
      }

      //console.log(numLiveNeighboors(1,1))

      let addCell = function(x,y){
        //console.log("Creating a live cell at: " + x + "," + y)
        let cellX = x / widthPerCell
        let cellY = y / heightPerCell
        cellX = Math.trunc(cellX)
        cellY = Math.trunc(cellY)
        //console.log("Creating a live cell at: " + cellX + "," + cellY)
        grid[cellY][cellX] = 1
        grid[cellY - 2][cellX] = 1
        grid[cellY + 2][cellX] = 1
        grid[cellY][cellX - 2] = 1
        grid[cellY][cellX + 2] = 1
        //console.log("test " + grid[cellX][cellY])
      }

      let runAutomata = function() {
        // loop through every cell
        // look at cell neighbors and count the live ones
        // determine next cell state based on neighbor count
        // set temp[y][x] -> new cell state
        

        let n = 0; //Num neighbors
        for( let y = 0; y < height; y++ ) {
          for( let x = 0; x < width; x++ ) {
            n = numLiveNeighboors(y,x)

            if(grid[y][x] == 1) //If its alive
            {
              if(n < 2 || n > 3)
                temp[y][x] = 0
              else
                temp[y][x] = 1
            }
            else
            {
              if(n == 3)
                temp[y][x] = 1
              else
                temp[y][x] = 0
            }
          }
        }

        // after for loop, swap grid and temp arrays
        let swap = grid
        grid = temp
        temp = swap
      }


      let draw = function() {
        if(running){
          runAutomata()
        }
        /* ADDED AFTER CLASS */
        // ctx.fillStyle = 'black'
        // ctx.fillRect( 0,0,width,height )
        ctx.fillStyle = colors[currentColor]
        /*********************/

        for( let y = 0; y < height; y++ ) {
          for( let x = 0; x < width; x++ ) {
            if( grid[ y ][ x ] === 1 ) {
              ctx.fillRect( x,y,1,1 ) 
            } 
          }
        }

        //setTimeout(alert("4 seconds"),40000);

        //window.requestAnimationFrame( draw )
      }

      // WEB GL Stuff
      let getTexture = function(){
        //canvas draws with the upper-left hand corner as {0,0}, while WebGL draws with the lower-left corner at {0,0}.
        //Therefore we need to flip the y-axis when we read in our canvas pixel data
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)

        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureCanvas)

        // use linear interpolation to generate sub-pixel data
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      }

      let webglSetup = function() {
        //sets default background color
        gl.clearColor(1.0,1.0,1.0,1.0)

        // clear color buffer
        gl.clear(gl.COLOR_BUFFER_BIT)

        gl.activeTexture(gl.TEXTURE0)
      }

      let render = function(){
        window.requestAnimationFrame(render, canvas)

        webglSetup()

        draw()

        getTexture()
        //console.log("hey")

        gl.drawArrays(gl.TRIANGLES, 0, 6)
      }