// Пароль 789456qwerty1
let form = document.forms[0];
let input = form.elements["search"];
let countrySelect = form.elements["country"];
let categorySelect = form.elements["category"];
let newsCont = document.querySelector(".grid");
let favourite = document.querySelector(".favourite");
import { myHTTP } from "./api.js";
document.addEventListener("DOMContentLoaded", function () {
  let selects = document.querySelectorAll("select");
  let selectInit = M.FormSelect.init(selects);
  let modal = document.querySelector(".modal");
  let modalInit = M.Modal.init(modal);
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
let newService = service();
form.addEventListener("submit", (event) => {
  event.preventDefault();
  loadNews();
});
function loadNews() {
  newsCont.innerHTML = "";
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
function renderNews(news) {
  let fragment = "";
  news.forEach((el) => {
    fragment += newsTemplate(el);
  });
  newsCont.insertAdjacentHTML("afterbegin", fragment);
  let toolTips = document.querySelectorAll(".tooltipped");
  let toolTipsInit = M.Tooltip.init(toolTips, {
    inDuration: 100,
    outDuration: 100,
  });
}
function newsTemplate({ title, description, url, urlToImage }) {
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
          <a href="${url}" target="_blank">Learn more</a>
          <img src="plus.png" class="tooltipped" data-position="left" data-tooltip="Add to favourite"alt="">
          <img src="tick.png" class="tick" alt="">
        </div>       
    </div>
  </div>`;
}
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
function deletePreloader() {
  document.querySelector(".preloader-wrapper").remove();
}
function showAlert(err) {
  M.toast({ html: err, classes: "customToast" });
}
// let modal = document.querySelector(".modal");
// favourite.addEventListener("click", () => {
//   modal.style.display = "block";
// });
// document.querySelector(".modal-close").addEventListener("click", () => {
//   modal.style.display = "none";
// });
