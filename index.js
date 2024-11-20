//Scroll Trigger Plugin

gsap.registerPlugin(ScrollTrigger);

const containerEl = document.querySelector(".container");
const canvasEl = document.querySelector("canvas#neuro");
const devicePixelRatio = Math.min(window.devicePixelRatio, 2);


const pointer = {
    x: 0,
    y: 0,
    tX: 0,
    tY: 0,
};


let uniforms;
const gl = initShader();

setupEvents();

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

render();

function initShader() {
    const vsSource = document.getElementById("vertShader").innerHTML;
    const fsSource = document.getElementById("fragShader").innerHTML;

    const gl = canvasEl.getContext("webgl") || canvasEl.getContext("experimental-webgl");

    if (!gl) {
        alert("WebGL is not supported by your browser.");
    }

    function createShader(gl, sourceCode, type) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, sourceCode);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    const vertexShader = createShader(gl, vsSource, gl.VERTEX_SHADER);
    const fragmentShader = createShader(gl, fsSource, gl.FRAGMENT_SHADER);

    function createShaderProgram(gl, vertexShader, fragmentShader) {
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error("Unable to initialize the shader program: " + gl.getProgramInfoLog(program));
            return null;
        }

        return program;
    }

    const shaderProgram = createShaderProgram(gl, vertexShader, fragmentShader);
    uniforms = getUniforms(shaderProgram);

    function getUniforms(program) {
        let uniforms = [];
        let uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
        for (let i = 0; i < uniformCount; i++) {
            let uniformName = gl.getActiveUniform(program, i).name;
            uniforms[uniformName] = gl.getUniformLocation(program, uniformName);
        }
        return uniforms;
    }

    const vertices = new Float32Array([-1., -1., 1., -1., -1., 1., 1., 1.]);

    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    gl.useProgram(shaderProgram);

    const positionLocation = gl.getAttribLocation(shaderProgram, "a_position");
    gl.enableVertexAttribArray(positionLocation);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    return gl;
}

function render() {
    const currentTime = performance.now();

    pointer.x += (pointer.tX - pointer.x) * .5;
    pointer.y += (pointer.tY - pointer.y) * .5;

    gl.uniform1f(uniforms.u_time, currentTime);
    gl.uniform2f(uniforms.u_pointer_position, pointer.x / window.innerWidth, 1 - pointer.y / window.innerHeight);
    gl.uniform1f(uniforms.u_scroll_progress, window["pageYOffset"] / (2 * window.innerHeight));

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(render);
}

function resizeCanvas() {
    canvasEl.width = window.innerWidth * devicePixelRatio;
    canvasEl.height = window.innerHeight * devicePixelRatio;
    gl.uniform1f(uniforms.u_ratio, canvasEl.width / canvasEl.height);
    gl.viewport(0, 0, canvasEl.width, canvasEl.height);
}

function setupEvents() {
    window.addEventListener("pointermove", e => {
        updateMousePosition(e.clientX, e.clientY);
    });
    window.addEventListener("touchmove", e => {
        updateMousePosition(e.targetTouches[0].clientX, e.targetTouches[0].clientY);
    });
    window.addEventListener("click", e => {
        updateMousePosition(e.clientX, e.clientY);
    });

    function updateMousePosition(eX, eY) {
        pointer.tX = eX;
        pointer.tY = eY;
    }
}
function clampBuilder( minWidthPx, maxWidthPx, minFontSize, maxFontSize ) {
        const root = document.querySelector( "html" );
        const pixelsPerRem = Number( getComputedStyle( root ).fontSize.slice( 0,-2 ) );
      
        const minWidth = minWidthPx / pixelsPerRem;
        const maxWidth = maxWidthPx / pixelsPerRem;
      
        const slope = ( maxFontSize - minFontSize ) / ( maxWidth - minWidth );
        const yAxisIntersection = -minWidth * slope + minFontSize
      
        return `clamp( ${ minFontSize }rem, ${ yAxisIntersection }rem + ${ slope * 100 }vw, ${ maxFontSize }rem )`;
      }

const intro = document.querySelector(".intro > div:first-child");
const outro = document.querySelector(".intro > div:nth-child(2)");


intro.style.fontSize = clampBuilder( 320, 1440, 2.5, 4 );
outro.style.fontSize = clampBuilder( 320, 1440, 2, 2.5 );

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

let interval = null;

document.querySelector(".hyper p").onmouseover = event => {  
  let iteration = 0;
  
  clearInterval(interval);
  
  interval = setInterval(() => {
    event.target.innerText = event.target.innerText
      .split("")
      .map((letter, index) => {
        if(index < iteration) {
          return event.target.dataset.value[index];
        }
      
        return letters[Math.floor(Math.random() * 26)]
      })
      .join("");
    
    if(iteration >= event.target.dataset.value.length){ 
      clearInterval(interval);
    }
    
    iteration += 1 / 3;
  }, 30);
}

// Gsap Timeline

const tl = gsap.timeline({defaults: {ease: "power1.out"}});
const icon = document.querySelector(".icon");
const sections = document.querySelectorAll(".section");
let currentIndex = 0;

icon.addEventListener("click", () => {
    const currentSection = sections[currentIndex];
    const currentSectionChildren = currentSection.children;

    console.log(currentSectionChildren);

    // Create a timeline for animating each child of the current section
    const childTl = gsap.timeline();

    // Animate each child one by one to fade out and slide up
    Array.from(currentSectionChildren).forEach(child => {
        childTl.to(child, {yPercent: -100, opacity: 0, duration: 0.5, stagger: 0.2});
    });

    // After the children animations are done, hide the current section
    childTl.add(() => {
        tl.set(currentSection, {display: 'none'});
        
        // Move to the next section
        currentIndex = (currentIndex + 1) % sections.length;

        // Set display to 'flex' for the first section, otherwise 'block'
        const displayStyle = currentIndex === 0 ? 'flex' : 'block';
        // Display Opacity
        const displayOpacity = currentIndex === 0 ? 1 : 0;
        // Display Off
        const displayOff = currentIndex === 0 ? 'block' : 'none';

        // Show the next section with the appropriate display style
        tl.set(sections[currentIndex], {display: displayStyle})
          .to(canvasEl, {opacity: displayOpacity, duration: 0.5})
          .set(canvasEl, {display: displayOff})
          .to(sections[currentIndex].children, {yPercent: 0, opacity: 1, duration: 0.5, stagger: 0.2});
    });
});

const images = document.querySelectorAll('.images > div'); // Select all image divs

// Set the first image to visible
images[0].style.display = 'block';

// Set all other images to hidden
images.forEach((image, index) => {
    if (index !== 0) {
        image.style.display = 'none';
    }
});

// Add click event listeners to each image
images.forEach((image, index) => {
    image.addEventListener('click', () => {
        // Hide the current image
        gsap.to(images[index], { opacity: 0, duration: 0.5, onComplete: () => {
            images[index].style.display = 'none'; // Ensure the current image is hidden after animation
        }});

        // Calculate the next image index
        let nextImageIndex = (index + 1) % images.length;

        if (nextImageIndex === 0) {
            // Hide the entire container after the last image
            gsap.to('.images', { opacity: 0, duration: 0.5, delay: 0.5 });
            gsap.set('.images', { display: 'none', delay: 1 });
        } else {
            // Show the next image
            gsap.set(images[nextImageIndex], { display: 'block', delay: 0.5 });
            gsap.fromTo(images[nextImageIndex], { opacity: 0 }, { opacity: 1, duration: 0.5, delay: 0.5 });
        }
    });
});

function animateSmokeEffect(containerSelector) {
    const container = containerSelector;
    const spans = container.querySelectorAll('span');

    // GSAP Animation for each span
    spans.forEach((span, index) => {
        const delay = 3 + (index * 0.1); // Delay increases incrementally for each span

        gsap.fromTo(
            span,
            { 
                opacity: 1, 
                textShadow: "0 0 0 whitesmoke", 
                scale: 1, 
                x: 0, 
                y: 0, 
                skewX: 0, 
                rotate: 0 
            }, 
            { 
                opacity: 0, 
                textShadow: "0 0 20px whitesmoke", 
                scale: index % 2 === 0 ? 1.5 : 2, 
                x: index % 2 === 0 ? '15rem' : '18rem', 
                y: '-8rem', 
                skewX: index % 2 === 0 ? 70 : -70, 
                rotate: -40, 
                duration: 5, 
                delay: delay,
                ease: "power3.out"
            }
        );
    });
}


let smokeScreens = document.querySelectorAll('.smoke');
console.log(smokeScreens);

smokeScreens.forEach(smokeScreen => {

    smokeScreen.addEventListener('click', () => {
        animateSmokeEffect(smokeScreen);

        gsap.to(smokeScreen, { opacity: 0, duration: 3, delay: 3 });

        gsap.set(smokeScreen, { display: 'none', delay: 6 });
    });
}
);

document.addEventListener("DOMContentLoaded", () => {
    // Select containers with either .cont-back2 or .cont-back3 classes
    const containers = document.querySelectorAll(".cont-back2, .cont-back3, .cont-back02, .cont-back3-5, .cont-back3-6");
    
    containers.forEach((container) => {
        const headings = container.querySelectorAll("ul > li > strong");
        
        headings.forEach((heading) => {
            // Hide all list items under each heading
            const sublist = heading.parentElement.querySelector("ul");
            if (sublist) {
                sublist.style.display = "none";
            }

            // Add click event listener to toggle visibility
            heading.addEventListener("click", () => {
                if (sublist) {
                    sublist.style.display = sublist.style.display === "none" ? "block" : "none";
                }
            });
        });
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const items = document.querySelectorAll(".list-item");
    const background = document.querySelector(".cont-back5");
    const imagesTrump = {
      "trump1": "https://images.unsplash.com/photo-1496483353456-90997957cf99?q=80&w=3085&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "trump2": "https://plus.unsplash.com/premium_photo-1694967307058-5a6f62b22003?q=80&w=2864&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "trump3": "https://images.unsplash.com/photo-1553465528-5a213ccc0c7b?q=80&w=2798&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "trump4": "https://images.unsplash.com/photo-1591065411478-97722a82fe81?q=80&w=2826&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "trump5": "https://images.unsplash.com/photo-1468866576576-de8a9bf61f92?q=80&w=2869&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "trump6": "https://images.unsplash.com/photo-1552764217-6d34d9795ab9?q=80&w=3087&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "trump7": "https://images.unsplash.com/photo-1501139083538-0139583c060f?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "trump8": "https://images.unsplash.com/photo-1566312922674-e02730f7b912?q=80&w=2874&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    };

    const imageKeys = Object.keys(imagesTrump);
    let currentIndex = 0;

    function showItem(index) {
      items.forEach((item, i) => {
        if (i === index) {
          gsap.fromTo(
            item,
            { autoAlpha: 0, y: 50 },
            { autoAlpha: 1, y: 0, duration: 0.8, ease: "power2.out" }
          );
          item.style.display = "block";
        } else {
          gsap.to(item, { autoAlpha: 0, y: -50, duration: 0.8, ease: "power2.in" });
          setTimeout(() => (item.style.display = "none"), 800);
        }
      });

      updateBackground(index);
    }

    function updateBackground(index) {
      const imageKey = imageKeys[index % imageKeys.length];
      const imageUrl = imagesTrump[imageKey];
      gsap.to(background, {
        backgroundImage: `url(${imageUrl})`,
        duration: 1,
        ease: "power2.inOut"
      });
    }

    function nextItem() {
      currentIndex = (currentIndex + 1) % items.length;
      showItem(currentIndex);
    }

    showItem(currentIndex);

    document.querySelector(".container").addEventListener("click", nextItem);
  });

  const img3Div = document.querySelector('.img3');
  const [img1, img2] = img3Div.querySelectorAll('img');

  img1.addEventListener('click', () => {
    // Fade out the first image
    gsap.to(img1, {
      opacity: 0,
      duration: 0.5,
      onComplete: () => {
        img1.style.display = 'none'; // Hide the first image after fading out

        // Show and fade in the second image
        let tl_img = gsap.timeline(); 
        tl_img.set(img2, { display: 'block' })
        .fromTo(img2, { opacity: 0, scale:0}, { opacity: 1,scale:1 ,duration: 0.5 });
      }
    });
  });


//   <li>
//   <div class="img2" style="background-color: rgba(255, 255, 255, 0.49);">
//     <img src="img6.png" alt="">
//   </div>
// </li>

const patternElement = document.getElementById("pattern");

const countY = Math.ceil(patternElement.clientHeight / 40) + 1;
const countX = Math.ceil(patternElement.clientWidth / 48) + 1;
const gap = 2;

for (let i = 0; i < countY; i++) {
  for (let j = 0; j < countX; j++) {
    const hexagon = document.createElement("div");
    hexagon.style = `
      background: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODciIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgODcgMTAwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBkPSJNMi4xOTg3MyAyNi4xNTQ3TDQzLjUgMi4zMDk0TDg0LjgwMTMgMjYuMTU0N1Y3My44NDUzTDQzLjUgOTcuNjkwNkwyLjE5ODczIDczLjg0NTNWMjYuMTU0N1oiIGZpbGw9IiMxMzEyMTciIHN0cm9rZT0iIzEzMTIxNyIgc3Ryb2tlLXdpZHRoPSI0Ii8+Cjwvc3ZnPgo=') no-repeat;
      width: 44px;
      height: 50px;
      background-size: contain;
      position: absolute;
      top: ${i * 40}px;
      left: ${j * 48 + ((i * 24) % 48)}px;
    `;

    patternElement.appendChild(hexagon);
  }
}

let mousePosition = {
  x: 0,
  y: 0
};

document.addEventListener("mousemove", (mouse) => {
  mousePosition = {
    x: mouse.clientX,
    y: mouse.clientY
  };
});

const loop = () => {
  const gradientElement = document.getElementById("gradient");

  gradientElement.style.transform = `translate(${mousePosition.x}px, ${mousePosition.y}px)`;

  // Request the next animation frame
  window.requestAnimationFrame(loop);
};

// Start the animation loop
window.requestAnimationFrame(loop);
