// Пароль 789456qwerty1
let form = document.forms[0];
let input = form.elements["search"];
let countrySelect = form.elements["country"];
let categorySelect = form.elements["category"];
let newsCont = document.querySelector(".grid");
let favourite = document.querySelector(".favourite");
let favourNewsCont = document.querySelector(".modal-content");
let indicator = document.querySelector(".indicator");
let numberOfFavour = 0;
import { myHTTP } from "./api.js";
document.addEventListener("DOMContentLoaded", function () {
  let selects = document.querySelectorAll("select");
  let selectInit = M.FormSelect.init(selects);
  let modal = document.querySelector(".modal");
  let modalInit = M.Modal.init(modal);
  loadFavouriteNews();
  checkFavouriteNews();
});
let http = myHTTP();
let service = () => {
  let apiKey = "00b2f94f90ff4a2d9357784255ec66e0";
  let baseUrl = "https://newsapi.org/v2";
  return {
    everything(query, cb) {
      http.get(`${baseUrl}/everything?q=${query}&apiKey=${apiKey}`, cb);
    },
    topHeadlines(country = "ru", cb) {
      http.get(
        `${baseUrl}/top-headlines?country=${country}&apiKey=${apiKey}`,
        cb
      );
    },
    topHeadlinesCategory(country = "ru", category = "general", cb) {
      http.get(
        `${baseUrl}/top-headlines?country=${country}&category=${category}&apiKey=${apiKey}`,
        cb
      );
    },
  };
};
//вызывает метод get, используя параметры(URL, cb)
let newService = service();
form.addEventListener("submit", (event) => {
  event.preventDefault();
  loadNews();
});
// вызывается функция loadNews() при submit формы
function loadNews() {
  newsCont.innerHTML = "";
  cleanTolltipArray();
  showPreloader();
  if (!input.value) {
    newService.topHeadlinesCategory(
      countrySelect.value,
      categorySelect.value,
      onGetResponse
    );
    return;
  } else {
    newService.everything(input.value, onGetResponse);
  }
}
//очищает newsCont, вызывает функции cleanTolltipArray(), showPreloader(), отправляет запрос по ссылке из метотов newService
function onGetResponse(err, res) {
  deletePreloader();
  if (err) {
    showAlert(err);
    return;
  }
  if (!res.articles.length) {
    showAlert("Found nothing. Try again");
    return;
  }
  renderNews(res.articles);
}
//вызывает функцию deletePreloader(), при возникновении ошибки или отсутствия новостей по запросу вызывается функция showAlert с текстом ошибки. В обратном случае вызывается функция renderNews
function renderNews(news) {
  let fragment = "";
  news.forEach((el, num) => {
    fragment += newsTemplate(el, num);
  });
  newsCont.insertAdjacentHTML("afterbegin", fragment);
  let toolTips = document.querySelectorAll(".tooltipped");
  let toolTipsInit = M.Tooltip.init(toolTips, {
    inDuration: 100,
    outDuration: 100,
  });
}
//рендерятся новости из HTML фрагментов, возвращаемых функцией newsTemplate
function newsTemplate({ title, description, url, urlToImage }, num) {
  return `<div class="col s12">
    <div class="card">
      <div class="card-image">
        <img alt="No access" src="${urlToImage || "news.jpg"}">
      </div>
      <span class="card-title">${title}</span>
      <div class="card-content">
        <p>${description || "More info in the source"}</p>
      </div>
      <div class="card-action">
          <a href="${url}" class="newUrl" target="_blank">Learn more</a>
          <img src="plus.png" class="tooltipped" data-number="${num}" data-position="left" data-tooltip="Add to favourite"alt="">
          <img src="tick.png" class="tick" alt="">
        </div>       
    </div>
  </div>`;
}
//возвращает HTML фрагмент с новостью

//прелоадер-промежуточный компонент на время загрузки
function showPreloader() {
  document.querySelector(".formCont").insertAdjacentHTML(
    "afterend",
    `<div class="preloader-wrapper big active">
    <div class="spinner-layer spinner-blue-only">
      <div class="circle-clipper left">
        <div class="circle"></div>
      </div><div class="gap-patch">
        <div class="circle"></div>
      </div><div class="circle-clipper right">
        <div class="circle"></div>
      </div>
    </div>
  </div>`
  );
}
//рендерит preloader
function deletePreloader() {
  document.querySelector(".preloader-wrapper").remove();
}
//удаляет preloader
function showAlert(err) {
  M.toast({ html: err, classes: "customToast" });
}
//инициализирует alert
document.addEventListener("click", (event) => {
  if (!event.target.classList.contains("tooltipped")) {
    return;
  }
  let number = +event.target.dataset.number;
  let card = event.target.parentElement.parentElement;
  event.target.remove();
  document.querySelectorAll(".material-tooltip")[number].style.display = "none";
  card.querySelector(".tick").style.display = "block";
  let favourite = {
    title: card.querySelector(".card-title").textContent,
    link: card.querySelector(".newUrl").href,
  };
  if (checkAddedFavouriteNews(favourite.title)) {
    showAlert("This news has already added");
    return;
  }
  favourNewsCont.insertAdjacentHTML("afterbegin", newFavouriteNew(favourite));
  setStorage(favourite, true);
  checkFavouriteNews();
  favouriteIndicator(1);
});
// при клике на плюс удаляет плюс, tooltip, поятвляется галочка. Если новость ещё не добавлена, рендериться избранная новость из HTML фрагмента, возвращаемого функцией newFavouriteNew и вызываются функции checkFavouriteNews и favouriteIndicator
function newFavouriteNew({ title, link }) {
  return `<div class="favourNew">
  <h4 class="newsTitle">
    ${title}
  </h4>
  <div class="favourLink">
    <a href="${link}" class="favouriteUrl" target="_blank">Learn more</a>
    <i class="material-icons">delete</i>
  </div>
</div>`;
}
//возвращает HTML фрагмент с избранной новостью
function cleanTolltipArray() {
  document.querySelectorAll(".material-tooltip").forEach((el) => {
    el.remove();
  });
}
//удаляет все tooltip
function checkFavouriteNews() {
  if (!favourNewsCont.children.length) {
    favourNewsCont.insertAdjacentHTML(
      "afterbegin",
      `<p class="empty">There're no favourite news</p>`
    );
    return;
  }
  if (document.querySelector(".empty")) {
    document.querySelector(".empty").remove();
  }
}
//Если массив с избранными новостями пуст, рендерит тег p с надписью и выходит из функции. Если надпись уже существует, удаляет её
favourNewsCont.addEventListener("click", (event) => {
  if (event.target.classList.contains("material-icons")) {
    if (confirm("Do you really want to delete that news?")) {
      let favourNews = event.target.closest(".favourNew"); //возвращает ближайший родительский HTML элемент по селектору
      favourNews.remove();
      let favourite = {
        title: favourNews.querySelector(".newsTitle").textContent,
        link: favourNews.querySelector(".favouriteUrl").href,
      };
      setStorage(favourite, false);
      checkFavouriteNews();
      favouriteIndicator(-1);
    }
  }
});
//при клике на урну, вызывается confirm. Если ответ пользователя положительный, избранная новость удаляется. Вызываются функции checkFavouriteNews(), favouriteIndicator
function favouriteIndicator(number) {
  numberOfFavour += number;
  if (numberOfFavour > 0) {
    indicator.style.display = "flex";
    indicator.textContent = numberOfFavour;
  } else {
    indicator.style.display = "none";
  }
}
//Если избранных новостей больше 0, появляется индикатор. Если избранных новостей нет, индикатор удаляется
function checkAddedFavouriteNews(header) {
  let newsTitle = document.querySelectorAll(".newsTitle");
  let headers = [];
  newsTitle.forEach((el) => {
    headers.push(el.textContent);
  });
  // headers.some((el) => {
  //   //ищет хотя бы одно совпадение
  //   return el.includes(header); //проверяет наличие подстроки внутри строки
  // })
  return headers.some((el) => {
    //ищет хотя бы одно совпадение
    return el.includes(header); //проверяет наличие подстроки внутри строки
  });
}
// проверяет на совпадение заголовок выбранной новости с заголовками ранее добавленных избранных новостей
function setStorage(obj, add) {
  if (add) {
    if (!localStorage.getItem("favourite")) {
      localStorage.setItem("favourite", JSON.stringify([obj]));
    } else {
      let array = JSON.parse(localStorage.getItem("favourite"));
      array.push(obj);
      localStorage.setItem("favourite", JSON.stringify(array));
    }
  } else {
    let array = JSON.parse(localStorage.getItem("favourite"));
    if (array.length === 1) {
      localStorage.removeItem("favourite");
    } else {
      let filteredArray = array.filter((el) => {
        return el.title !== obj.title.trim(); //trim() удаляет пробелы слева и справа
      });
      localStorage.setItem("favourite", JSON.stringify(filteredArray));
    }
  }
}
function loadFavouriteNews() {
  let array = JSON.parse(localStorage.getItem("favourite"));
  if (array) {
    array.forEach((el) => {
      favourNewsCont.insertAdjacentHTML("afterbegin", newFavouriteNew(el));
      favouriteIndicator(1);
    });
  }
}
