//  menu
const IMG_URL = "https://image.tmdb.org/t/p/w185_and_h278_bestv2";
const API_KEY = "ea6272f7c914cdfc32f8bb841af041c4";
const SERVER = "https://api.themoviedb.org/3";

const leftMenu = document.querySelector(".left-menu"),
  hamburger = document.querySelector(".hamburger"),
  tvShowsList = document.querySelector(".tv-shows__list"),
  modal = document.querySelector(".modal"),
  tvShows = document.querySelector(".tv-shows"),
  tvCardImg = document.querySelector(".tv-card__img"),
  modalTitle = document.querySelector(".modal__title"),
  genresList = document.querySelector(".genres-list"),
  rating = document.querySelector(".rating"),
  description = document.querySelector(".description"),
  modalLink = document.querySelector(".modal__link"),
  searchForm = document.querySelector(".search__form"),
  searchFormInput = document.querySelector(".search__form-input"),
  preloader = document.querySelector(".preloader"),
  dropdown = document.querySelectorAll(".dropdown"),
  tvShowsHead = document.querySelector(".tv-shows__head"),
  posterWrapper = document.querySelector('.poster__wrapper'),
  modalContent = document.querySelector('.modal__content');

const loading = document.createElement("div");
loading.className = "loading";

const DBService = class {
  
  getData = async (url) => {
    const res = await fetch(url);
    if (res.ok) {
      return res.json();
    } else {
      throw new Error(`Не удалось получить данные по адресу ${url}`);
    }
  };

  getTestData = () => {
    return this.getData("test.json");
  };

  getTestCard = () => {
    return this.getData("card.json");
  };

  getSearchResult = (query) => {
    return this.getData(
      `${SERVER}/search/tv?api_key=${API_KEY}&query=${query}&language=ru-RU`,
    );
  };

  getTvShow = (id) => {
    return this.getData(`${SERVER}/tv/${id}?api_key=${API_KEY}&language=ru-RU`);
  };

  getTopRated = () => this.getData(`${SERVER}/tv/top_rated?api_key=${API_KEY}&language=ru-RU`);
 
  getPopular = () => this.getData(`${SERVER}/tv/popular?api_key=${API_KEY}&language=ru-RU`);

  getToday = () => this.getData(`${SERVER}/tv/airing_today?api_key=${API_KEY}&language=ru-RU`);
 
  getWeek = () => this.getData(`${SERVER}/tv/on_the_air?api_key=${API_KEY}&language=ru-RU`);
};

const dbService = new DBService();

const renderCard = (response , target) => {
  tvShowsList.textContent = "";

  if (!response.total_results) { 
    loading.remove();
    tvShowsHead.textContent = 'К сожалению по вашему запросу ничего не найдено...';
    tvShowsHead.style.cssText = ' color : red  ' ; 
    return;
  }


  tvShowsHead.textContent = target ? target.textContent :'Результат поиска';
  tvShowsHead.style.cssText = ' color : green '; 

  response.results.forEach((item) => {
    const {
      backdrop_path: backdrop,
      name: title,
      poster_path: poster,
      vote_average: vote,
      id,
    } = item;

    const posterIMG = poster ? IMG_URL + poster : "img/no-poster.jpg";
    const backdropIMG = backdrop ? IMG_URL + backdrop : "";
    const voteElem = vote ? `<span class="tv-card__vote">${vote}</span>` : "";

    const card = document.createElement("li");
    card.idTV = id;
    card.className = "tv-shows__item";
    card.innerHTML = `
      <a href="#" id="${id}" class="tv-card">
        ${voteElem}
        <img class="tv-card__img"
           src="${posterIMG}"
           data-backdrop="${backdropIMG}"
           alt="${title}">
        <h4 class="tv-card__head">${title}</h4>
      </a>
      `;
    loading.remove();
    tvShowsList.append(card);
  });
};

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const value = searchFormInput.value.trim();
  if (value) {
    tvShows.append(loading);
    dbService.getSearchResult(value).then(renderCard);
  }
  searchFormInput.value = "";
});

//     Open/close menu
const closeDropdown = () => {
  dropdown.forEach((item) => {
    item.classList.remove("active");
  });
};

hamburger.addEventListener("click", () => {
  leftMenu.classList.toggle("openMenu");
  hamburger.classList.toggle("open");
  closeDropdown();
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".left-menu")) {
    leftMenu.classList.remove("openMenu");
    hamburger.classList.remove("open");
    closeDropdown();
  }
});

leftMenu.addEventListener("click", (event) => {
  event.preventDefault();
  const target = event.target;
  const dropdown = target.closest(".dropdown");

  if (dropdown) {
    dropdown.classList.toggle("active");
    leftMenu.classList.add("openMenu");
    hamburger.classList.add("open");
  }

  if (target.closest('#top-rated')) {
        tvShows.append(loading);
    dbService.getTopRated().then((response) => renderCard(response, target));
  }

  if (target.closest('#popular')) {
        tvShows.append(loading);
    dbService.getPopular().then((response) => renderCard(response, target));
  }

  if (target.closest('#week')) {
        tvShows.append(loading);
    dbService.getWeek().then((response) => renderCard(response, target));
  }

  if (target.closest('#today')) {
        tvShows.append(loading);
    dbService.getToday().then((response) => renderCard(response, target));
  }

  if(target.closest('#search')) {
    tvShowsList.textContent = '';
    tvShowsHead.textContent ='';
  }
});



// Modal open

tvShowsList.addEventListener("click", (event) => {
  event.preventDefault();
  const target = event.target;
  const card = target.closest(".tv-card");

  if (card) {
    preloader.style.display = "block";
    new DBService()
      .getTvShow(card.id)
      .then((data) => {

        if (data.poster_path) {
          tvCardImg.src = IMG_URL + data.poster_path;
          tvCardImg.alt = data.name;
          posterWrapper.style.display = '';
          modalContent.style.paddingLeft = '';
        }
        else {
          posterWrapper.style.display = 'none';
          modalContent.style.paddingLeft = '25px';
        }

        
        modalTitle.textContent = data.name;
        // genresList.innerHTML = data.genres.reduce((acc, item) => `${acc}<li>${item.name}</li>`, '')
        genresList.textContent = "";
        for (const item of data.genres) {
          genresList.innerHTML += `<li>${item.name}</li>`;
        }
        rating.textContent = data.vote;
        description.textContent = data.overview;
        modalLink.href = data.homepage;
      })
      .then(() => {
        document.body.style.overflow = "hidden";
        modal.classList.remove("hide");
      })
      .finally(() => {
        preloader.style.display = "";
      });
  }
});

// modal close

modal.addEventListener("click", (event) => {
  if (
    event.target.closest(".cross") ||
    event.target.classList.contains("modal")
  ) {
    document.body.style.overflow = "";
    modal.classList.add("hide");
  }
});

//  TV-Card

// const tvCard = document.querySelector(".tv-shows__item");
// console.log(tvCard)

// tvCard.addEventListener("mouseover", (event) => {
// const tvCardBackdrop = document.querySelector("tv-card__img");
//   console.log(tvCard);
//   console.log(tvCardBackdrop);

// if (tv - card__img.hasAttribute("data-backdrop")) {
//    0 
//        0
//        0
//        0                        
//        0 });
// elem.getAttribute("data-backdrop");

const changeImage = (event) => {
  const card = event.target.closest(".tv-shows__item");

  if (card) {
    const img = card.querySelector(".tv-card__img");

    if (img.dataset.backdrop) {
      [img.src, img.dataset.backdrop] = [img.dataset.backdrop, img.src];
    }
  }
};
tvShowsList.addEventListener("mouseover", changeImage);
tvShowsList.addEventListener("mouseout", changeImage);
