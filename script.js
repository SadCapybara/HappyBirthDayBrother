document.addEventListener("DOMContentLoaded", () => {
  const startButton = document.getElementById("start-button");
  const startScreen = document.getElementById("start-screen");
  const gameScreen = document.getElementById("game-screen");
// читаем из localStorage список уже открытых индексов (или пустой массив)
const obtained = new Set(JSON.parse(localStorage.getItem("obtainedWishes") || "[]"));

  const canvas = document.getElementById("wheel");
  const ctx = canvas.getContext("2d");
  const resultDiv = document.getElementById("result");

const soundWin = document.getElementById("wheel-sound-win");
	 const sound = document.getElementById("wheel-sound");
  const music = document.getElementById("bg-music");
  const soundAgain = document.getElementById("wheel-sound-again");

const winGif = document.getElementById("win-gif");
const wishes = [
  {
    label: "🐉",
    wish: "🐉Капибарье поздравление! 🐉 (это капибара). В этот день тебе не надо делать того, что может сжечь твои калории. Лежи и наслаждайся жизнью. Балдёжного тебе настроения.",
    weight: 0.3
  },
  {
    label: "🐸",
    wish: "🐸Лягушачье  ̶с̶р̶е̶д̶а̶ поздравление 🐸. Это твой день, мой чувак! Пусть каждый день будет для тебя так же хорош и прекрасен как любая среда!",
    weight: 0.2
  },
  {
    label: "🐻",
    wish: "🐻Медвежья поздравительная услуга🐻. Пусть в жизни будет побольше мёда и больше мягких объятий!",
    weight: 0.2
  },
  {
    label: "🦔",
    wish: "🦔Ёжик абсурда 🦔. Желаю что бы твой путь каждый день освещала светлая луна, а муравьи уступали дорогу! ",
    weight: 0.15
  },
  {
    label: "🐱",
    wish: "🐱Кошачий мем 🐱.Желаю тебе видеть больше картинок и мемов с котиками!",
    weight: 0.1
  },
  {
    label: "🦝",
    wish: "🦝Енот украл это поздравление 🦝! Желаю тебе найти украденное енотом поздравление!",
    weight: 0.05
  }
];

const textureImg = new Image();
textureImg.src = "wheel.png";
let texturePattern = null;

textureImg.onload = () => {
  //texturePattern = ctx.createPattern(textureImg, 'repeat');
  resizeCanvas(); // перерисовать после загрузки
};


  const totalWeight = wishes.reduce((sum, w) => sum + w.weight, 0);

  let angle = 0;        // текущее смещение в градусах
  let isSpinning = false;
  let devicePR = window.devicePixelRatio || 1;

  function resizeCanvas() {
    // Размер под квадрат, ориентируясь на окно
    const size = Math.min(window.innerWidth, window.innerHeight * 0.8);
    canvas.width = size * devicePR;
    canvas.height = size * devicePR;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(devicePR, devicePR);
    // Если игра уже запущена (startScreen скрыт), рисуем текущее положение
    if (!startScreen.classList.contains("hidden")) return;
    drawWheel(angle * Math.PI / 180);
  }
  window.addEventListener("resize", resizeCanvas);

  function drawWheel(angleOffset = 0) {
  const cw = canvas.width / devicePR;
  const ch = canvas.height / devicePR;
  const cx = cw / 2;
  const cy = ch / 2;
  const radius = Math.min(cw, ch) / 2 - 10;
  if (radius <= 0) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angleOffset);

  // Рисуем сектора
  let startAng = 0;
  wishes.forEach((wish, index) => {
    const slice = (wish.weight / totalWeight) * 2 * Math.PI;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, startAng, startAng + slice);
    ctx.closePath();
    ctx.fillStyle = `hsl(${index * 60}, 40%, 86%)`; // немного бледнее
    ctx.fill();
    ctx.stroke();

    startAng += slice;
  });

  // Теперь — рисуем торт НАД секторами
  if (textureImg.complete && textureImg.naturalWidth > 0) {
    ctx.save();
    ctx.globalAlpha = 0.8;
    ctx.globalCompositeOperation = "multiply";
    const imgSize = radius * 2;
    ctx.drawImage(textureImg, -radius, -radius, imgSize, imgSize);
    ctx.restore();
  }

  ctx.restore(); // выйти из трансформации

  // Надписи — поверх всего
  let startAngle = 0;
  wishes.forEach((wish, index) => {
    const slice = (wish.weight / totalWeight) * 2 * Math.PI;
    const mid = startAngle + slice / 2;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(mid + angleOffset);
    ctx.textAlign = "right";
    ctx.fillStyle = "#000";
    ctx.font = "bold 14px sans-serif";
    ctx.fillText(wish.label, radius - 10, 0);
    ctx.restore();

    startAngle += slice;
  });

  // Стрелка
  ctx.beginPath();
  ctx.moveTo(cx, cy - radius + 5);
  ctx.lineTo(cx - 10, cy - radius - 10);
  ctx.lineTo(cx + 10, cy - radius - 10);
  ctx.closePath();
  ctx.fillStyle = "#d63031";
  ctx.fill();
}



  function spinWheel() {
    if (isSpinning) return;
    isSpinning = true;
  sound.currentTime = 0;
  sound.loop = true;
  sound.play();
  music.pause();
    // 1. Выбираем индекс заранее по весам
    let r = Math.random() * totalWeight;
    let selectedIndex = 0;
    let startAng = 0; // в радианах
    for (let i = 0; i < wishes.length; i++) {
      const slice = (wishes[i].weight / totalWeight) * 2 * Math.PI;
      if (r < wishes[i].weight) {
        selectedIndex = i;
        break;
      }
      r -= wishes[i].weight;
      startAng += slice;
    }
    const sliceAngle = (wishes[selectedIndex].weight / totalWeight) * 2 * Math.PI;
    // Центр сектора в радианах (от 0 по правому направлению, против часовой оси canvas.arc рисует по часовой, но здесь важно только относительное смещение)
    const midAng = startAng + sliceAngle / 2;

    // 2. Вычисляем целевой угол так, чтобы midAng оказался у стрелки сверху (-π/2)
    // Текущий угол angle в градусах; переводим в радианы:
    const currentRad = (angle % 360) * Math.PI / 180;
    // Желаемая абсолютная финальная позиция angleOffset = targetRad (в радианах).
    // Пусть стрелка указывает вверх, то есть направление -π/2 в системе canvas. Нужно вращение так,
    // чтобы midAng + angleOffset ≡ -π/2 (mod 2π)  → angleOffset ≡ -π/2 - midAng (mod 2π).
    let targetOffset = -Math.PI/2 - midAng;
    // Нормализуем в [0, 2π)
    targetOffset = ((targetOffset % (2*Math.PI)) + 2*Math.PI) % (2*Math.PI);

    // Чтобы было несколько вращений перед остановкой, прибавляем k*2π
    const rotations = 3 + Math.floor(Math.random() * 3); // 3..5 полных оборотов
    const fullRotation = rotations * 2 * Math.PI;
    const finalOffset = fullRotation + targetOffset; // в радианах, смещение от 0

    // 3. Анимация: от текущего angle (degree) до целевого в градусах
    const startAngleDeg = angle % 360;
    const targetAngleDeg = (finalOffset * 180 / Math.PI) % 360 + 360 * rotations; 
    // Здесь проще анимировать абсолютную дельту: deltaDeg = finalOffset*180/π - currentRad*180/π + 360*rotations
    // Но поскольку мы используем ease, просто отсчитываем от 0 до finalOffset в анимации, игнорируя текущее angle,
    // и в конце запишем angle = (angle + finalOffset*180/π) % 360.
    const duration = 3000;
    const startTime = performance.now();

    function animate(time) {
      const elapsed = time - startTime;
      const t = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      // текущий offset в радианах от 0: ease * finalOffset
      const offsetRad = ease * finalOffset;
      angle = (offsetRad * 180 / Math.PI) % 360;
      drawWheel(offsetRad);
      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        // По завершении показываем заранее выбранный текст
		sound.pause();
		music.play();
      sound.currentTime = 0;
  const soundToPlay = obtained.has(selectedIndex) ? soundAgain : soundWin;
  if (!obtained.has(selectedIndex)) {
	  
	   winGif.classList.remove("hidden");
  winGif.src = ""; // сброс src
  setTimeout(() => {
    winGif.src = "win.gif";
  }, 0);
	  
    obtained.add(selectedIndex);
    localStorage.setItem("obtainedWishes", JSON.stringify([...obtained]));
  }
  soundToPlay.currentTime = 0;
  soundToPlay.play();
        showResultFixed(selectedIndex);
		
        isSpinning = false;
      }
    }
    requestAnimationFrame(animate);
  }

  function showResultFixed(index) {
  const overlay = document.getElementById("overlay");
  const wishText = document.getElementById("wish-text");
  const spinAgainButton = document.getElementById("spin-again");

  wishText.textContent = wishes[index].wish;
  overlay.classList.add("show");

  function hideOverlay() {
	      overlay.classList.remove("show");

    overlay.classList.remove("show");
	 winGif.classList.add("hidden");
    spinAgainButton.removeEventListener("click", hideOverlay);
  }

  spinAgainButton.addEventListener("click", hideOverlay);
}
// кнопки и оверлей для списка открытых пожеланий
const openWishesBtn = document.getElementById("open-wishes");
const closeWishesBtn = document.getElementById("close-wishes");
const wishesListOverlay = document.getElementById("wishes-list-overlay");
const wishesListUl = document.getElementById("wishes-list");

openWishesBtn.addEventListener("click", () => {
  wishesListUl.innerHTML = "";
  [...obtained].forEach(i => {
    const li = document.createElement("li");
    const percent = (wishes[i].weight / totalWeight * 100).toFixed(1);
    li.textContent = `${wishes[i].label} — редкость ${percent}%`;
    wishesListUl.append(li);
  });
  wishesListOverlay.classList.add("show");
});

closeWishesBtn.addEventListener("click", () => {
  wishesListOverlay.classList.remove("show");
});


  canvas.addEventListener("click", spinWheel);
  canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    spinWheel();
  });

  // Стартовый экран
  startButton.addEventListener("click", () => {
    console.log("Нажали Приступить");
    startScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");
    // После появления экрана находим размер canvas
    resizeCanvas();
    music.play().catch(err => console.warn("Не удалось запустить музыку:", err));
  });
});
