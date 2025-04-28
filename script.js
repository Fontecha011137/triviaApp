// Inicializar Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCKjpyepJDlMv28Pxn99zQcKfYaBMPsf3g",
  authDomain: "triviaapp-bcb65.firebaseapp.com",
  projectId: "triviaapp-bcb65",
  storageBucket: "triviaapp-bcb65.firebasestorage.app",
  messagingSenderId: "4687712821",
  appId: "1:4687712821:web:fbe889dc743c551fde177c"
};
firebase.initializeApp(firebaseConfig);

// Variables globales
const API_URL = 'https://opentdb.com/api.php?amount=1&type=multiple&encode=url3986';
const categoryButtonsContainer = document.getElementById('categoryButtons');
const difficultySelect = document.getElementById('difficultySelect');
const questionContainer = document.getElementById('questionContainer');
const scoreContainer = document.getElementById('scoreContainer');
const searchButton = document.getElementById('searchButton');
const favoritesButton = document.getElementById('favoritesButton');
const usersButton = document.getElementById('usersButton');
const usersModal = document.getElementById('usersModal');
const usersList = document.getElementById('usersList');
const closeUsersModal = document.getElementById('closeUsersModal');

// Variables para el registro
const registerButton = document.getElementById('registerButton');
const registerModal = document.getElementById('registerModal');
const closeRegisterModal = document.getElementById('closeRegisterModal');
const submitRegister = document.getElementById('submitRegister');

let currentCategory = null;
let score = 0;
let favorites = [];

// Cargar categorías manuales
const categories = [
  { id: 9, name: "Conocimiento General" },
  { id: 17, name: "Ciencia y Naturaleza" },
  { id: 18, name: "Computación" },
  { id: 23, name: "Historia" },
  { id: 21, name: "Deportes" },
  { id: 22, name: "Geografía" }
];

categories.forEach(category => {
  const button = document.createElement('button');
  button.textContent = category.name;
  button.addEventListener('click', () => {
    currentCategory = category.id;
    startTrivia();
  });
  categoryButtonsContainer.appendChild(button);
});

// Función para mezclar respuestas
function secureShuffleArray(array) {
  const cryptoArray = new Uint32Array(array.length);
  crypto.getRandomValues(cryptoArray);
  let currentIndex = array.length;
  let temporaryValue;
  let randomIndex;
  while (currentIndex !== 0) {
    randomIndex = cryptoArray[currentIndex - 1] % currentIndex;
    currentIndex--;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
}

// Función para comenzar el juego
function startTrivia() {
  questionContainer.innerHTML = 'Cargando pregunta...';
  scoreContainer.textContent = 'Puntaje: ' + score;

  let url = `${API_URL}&category=${currentCategory}`;
  const difficulty = difficultySelect.value;
  if (difficulty) {
    url += `&difficulty=${difficulty}`;
  }

  fetch(url)
    .then(response => response.json())
    .then(data => {
      const question = decodeURIComponent(data.results[0].question);
      const correctAnswer = decodeURIComponent(data.results[0].correct_answer);
      const incorrectAnswers = data.results[0].incorrect_answers.map(ans => decodeURIComponent(ans));

      questionContainer.innerHTML = '';
      questionContainer.innerHTML += `<h2>${question}</h2>`;

      const options = [...incorrectAnswers, correctAnswer];
      secureShuffleArray(options);

      options.forEach(option => {
        const button = document.createElement('button');
        button.innerHTML = option;
        button.addEventListener('click', () => checkAnswer(button, correctAnswer));
        questionContainer.appendChild(button);
      });
    })
    .catch(error => {
      console.error('Error al cargar pregunta:', error);
      questionContainer.innerHTML = 'Error al cargar la pregunta.';
    });
}

// Función para revisar respuesta
function checkAnswer(button, correctAnswer) {
  const selectedAnswer = button.innerHTML;

  if (selectedAnswer === correctAnswer) {
    score++;
    scoreContainer.textContent = 'Puntaje: ' + score;
    questionContainer.innerHTML = `
      <span>🤩</span>
      <div class="alert alert-success" role="alert"><strong>¡Respuesta Correcta!</strong></div>
    `;
  } else {
    questionContainer.innerHTML = `
      <span>😞</span>
      <div class="alert alert-danger" role="alert">Respuesta incorrecta, la correcta era: <strong>${correctAnswer}</strong></div>
    `;
    score = 0;
  }

  setTimeout(() => {
    startTrivia();
  }, 1500);
}

// Botón favoritos
favoritesButton.addEventListener('click', () => {
  if (favorites.length === 0) {
    alert('No hay favoritos aún.');
  } else {
    alert('Favoritos:\n' + favorites.join('\n'));
  }
});

// Botón buscar categoría
searchButton.addEventListener('click', () => {
  const searchTerm = prompt('¿Qué categoría buscas?');
  if (searchTerm) {
    const found = categories.find(cat => cat.name.toLowerCase().includes(searchTerm.toLowerCase()));
    if (found) {
      currentCategory = found.id;
      startTrivia();
    } else {
      alert('Categoría no encontrada.');
    }
  }
});

// ---------- Registro con Firebase ----------
registerButton.addEventListener('click', () => {
  registerModal.style.display = 'flex';
});

// Cerrar modal de registro
closeRegisterModal.addEventListener('click', () => {
  registerModal.style.display = 'none';
});

// Registrar usuario
submitRegister.addEventListener('click', () => {
  const name = document.getElementById('registerName').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value.trim();

  if (email && password) {
    firebase.auth().createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        alert('Usuario registrado correctamente.');
        registerModal.style.display = 'none';
      })
      .catch((error) => {
        alert('Error: ' + error.message);
      });
  } else {
    alert('Completa todos los campos.');
  }
});

// Abrir modal de usuarios
usersButton.addEventListener("click", async () => {
  usersModal.style.display = "flex";
  usersList.innerHTML = "<li>Cargando...</li>";

  try {
    const snapshot = await firebase.firestore().collection("usuarios").get();
    if (snapshot.empty) {
      usersList.innerHTML = "<li>No hay usuarios registrados.</li>";
    } else {
      usersList.innerHTML = "";
      snapshot.forEach(doc => {
        const data = doc.data();
        const li = document.createElement("li");
        li.textContent = `${data.nombre} (${data.email})`;
        usersList.appendChild(li);
      });
    }
  } catch (error) {
    usersList.innerHTML = "<li>Error al cargar usuarios.</li>";
  }
});

// Cerrar modal de usuarios
closeUsersModal.addEventListener("click", () => {
  usersModal.style.display = "none";
});
