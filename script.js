const searchButton = document.getElementById('searchButton');
const categoryButtonsContainer = document.getElementById('categoryButtons');
const difficultySelect = document.getElementById('difficultySelect');
const questionContainer = document.getElementById('questionContainer');
const scoreContainer = document.getElementById('scoreContainer');
const favoritesButton = document.getElementById('favoritesButton');
const searchInput = document.getElementById('searchInput');

// Datos de ejemplo para categorías (esto puede provenir de la API)
const selectedCategories = [
  { id: 9, name: 'General Knowledge' },
  { id: 21, name: 'Sports' },
  { id: 23, name: 'History' },
  { id: 11, name: 'Entertainment: Film' },
  { id: 17, name: 'Science: Computers' },
  { id: 18, name: 'Science: Gadgets' }
];

let score = 0;
let currentCategoryId = null; // Para rastrear la categoría seleccionada

// Mostrar las categorías iniciales
createCategoryButtons(selectedCategories);

// Mostrar preguntas favoritas cuando el botón es clickeado
favoritesButton.addEventListener('click', () => {
  showFavorites();
});

// Función para mostrar las categorías
function createCategoryButtons(categories) {
  categoryButtonsContainer.innerHTML = '';  // Limpiar los botones previos

  categories.forEach(category => {
    const button = document.createElement('button');
    button.textContent = category.name;
    button.addEventListener('click', () => {
      currentCategoryId = category.id; // Almacenar la categoría seleccionada
      startTrivia(currentCategoryId);
    });
    categoryButtonsContainer.appendChild(button);
  });
}

// Función para manejar la trivia
function startTrivia(categoryId) {
  const selectedDifficulty = difficultySelect.value;

  // Aquí va el código para hacer la solicitud a la API, pasando tanto la categoría como la dificultad seleccionada
  const API_URL = 'https://opentdb.com/api.php?amount=1&type=multiple';
  let url = `${API_URL}&category=${categoryId}`;
  
  if (selectedDifficulty !== '') {
    url += `&difficulty=${selectedDifficulty}`;
  }

  // Mostrar mensaje de "cargando" mientras se obtiene la pregunta
  questionContainer.innerHTML = 'Cargando pregunta...';
  
  fetch(url)
    .then(response => response.json())
    .then(data => {
      const question = data.results[0].question;
      const answers = data.results[0].incorrect_answers;
      const correctAnswer = data.results[0].correct_answer;

      // Mostrar la pregunta y opciones
      questionContainer.innerHTML = `<h2>${question}</h2>`;

      const options = [...answers, correctAnswer];
      options.forEach(option => {
        const button = document.createElement('button');
        button.innerHTML = option;
        button.addEventListener('click', () => checkAnswer(button, correctAnswer));
        questionContainer.appendChild(button);
      });
    })
    .catch(error => {
      console.error('Error al obtener la pregunta:', error);
      questionContainer.innerHTML = 'Ocurrió un error al cargar la pregunta.';
    });
}

// Función para comprobar la respuesta
function checkAnswer(button, correctAnswer) {
  const selectedAnswer = button.innerHTML;
  
  // Verificar si la respuesta seleccionada es correcta
  if (selectedAnswer === correctAnswer) {
    score++;
    scoreContainer.textContent = 'Puntaje: ' + score;
    questionContainer.innerHTML = `¡Correcto! 🎉`;
  } else {
    score = 0; // Puedes resetear la puntuación si deseas
    scoreContainer.textContent = 'Puntaje: ' + score;
    questionContainer.innerHTML = `Incorrecto. La respuesta correcta era: ${correctAnswer}`;
  }

  // Después de un breve retraso, mostrar la siguiente pregunta
  setTimeout(() => {
    startTrivia(currentCategoryId); // Nueva pregunta con la misma categoría
  }, 1500); // Retardo de 1.5 segundos antes de mostrar la nueva pregunta
}

// Función para agregar la pregunta a los favoritos
function addFavorite(question, options, correctAnswer) {
  const favoriteQuestion = {
    question: question,
    options: options,
    correctAnswer: correctAnswer
  };

  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  favorites.push(favoriteQuestion);
  localStorage.setItem('favorites', JSON.stringify(favorites));

  alert('Pregunta marcada como favorita!');
}

// Función para mostrar las preguntas favoritas
function showFavorites() {
  const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  
  if (favorites.length === 0) {
    questionContainer.innerHTML = 'No tienes preguntas favoritas aún.';
    return;
  }

  questionContainer.innerHTML = '<h2>Preguntas Favoritas</h2>';
  
  favorites.forEach((favorite, index) => {
    const questionText = document.createElement('p');
    questionText.textContent = `${index + 1}. ${favorite.question}`;

    const optionsText = document.createElement('p');
    optionsText.textContent = `Opciones: ${favorite.options.join(', ')}`;

    const correctAnswerText = document.createElement('p');
    correctAnswerText.textContent = `Respuesta correcta: ${favorite.correctAnswer}`;

    questionContainer.appendChild(questionText);
    questionContainer.appendChild(optionsText);
    questionContainer.appendChild(correctAnswerText);
    questionContainer.appendChild(document.createElement('hr')); // Línea separadora
  });
}

// Función para buscar categorías
searchButton.addEventListener('click', () => {
  const searchTerm = searchInput.value.toLowerCase();
  
  const filteredCategories = selectedCategories.filter(category => 
    category.name.toLowerCase().includes(searchTerm)
  );
  
  createCategoryButtons(filteredCategories);  // Mostrar las categorías filtradas
  searchInput.style.display = 'none';  // Ocultar la barra de búsqueda después de buscar
});

// Mostrar la barra de búsqueda al hacer clic en el botón
searchButton.addEventListener('click', () => {
  searchInput.style.display = 'block';  // Mostrar barra de búsqueda
  searchInput.focus();  // Focar el input para que el usuario pueda escribir directamente
});
